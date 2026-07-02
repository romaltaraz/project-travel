import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import {
  callWithTools, assistantTurn, toolResultTurn,
  assertApiKey, NvTool, NvMessage,
} from '../services/anthropic.service.js';
import { pool } from '../config/db.js';
import * as analyticsRepo from '../repositories/analytics.repository.js';
import * as vacationRepo from '../repositories/vacation.repository.js';
import * as bookingsRepo from '../repositories/bookings.repository.js';

// ---------------------------------------------------------------------------
// MCP Tool definitions — OpenAI function-calling format
// ---------------------------------------------------------------------------
const MCP_TOOLS: NvTool[] = [
  {
    type: 'function',
    function: {
      name: 'getActiveVacationsCount',
      description: 'Returns the number of currently active vacations (started but not ended).',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getAveragePrice',
      description: 'Returns the average price across all vacations.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getFutureVacationsByRegion',
      description: 'Returns future vacations grouped by region keyword.',
      parameters: {
        type: 'object',
        properties: { keyword: { type: 'string', description: 'Region or country keyword' } },
        required: ['keyword'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getAverageRating',
      description: 'Returns the average rating, optionally for a specific vacation.',
      parameters: {
        type: 'object',
        properties: { vacationId: { type: 'number', description: 'Vacation ID (omit for global average)' } },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getTopRatedVacations',
      description: 'Returns the top-rated vacations.',
      parameters: {
        type: 'object',
        properties: { limit: { type: 'number', description: 'Number of results (default 5)' } },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getBookingStats',
      description: 'Returns total bookings and revenue, optionally filtered by date range.',
      parameters: {
        type: 'object',
        properties: {
          dateFrom: { type: 'string', description: 'YYYY-MM-DD' },
          dateTo:   { type: 'string', description: 'YYYY-MM-DD' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getRevenue',
      description: 'Returns total confirmed revenue, optionally filtered by date range.',
      parameters: {
        type: 'object',
        properties: {
          dateFrom: { type: 'string' },
          dateTo:   { type: 'string' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getMostBookedVacations',
      description: 'Returns the most booked vacations.',
      parameters: {
        type: 'object',
        properties: { limit: { type: 'number', description: 'Number of results (default 5)' } },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getVacationsByMonth',
      description:
        'Returns all vacations whose date range overlaps with a given month and year. ' +
        'Use this when the user asks about trips in a specific month (e.g. "trips in July", "vacations in August 2026").',
      parameters: {
        type: 'object',
        properties: {
          month: { type: 'number', description: 'Month number (1=January … 12=December)' },
          year:  { type: 'number', description: 'Four-digit year, e.g. 2026' },
        },
        required: ['month', 'year'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'searchVacations',
      description:
        'Searches vacations by keyword (destination or description). ' +
        'Use this for general queries like "show me all vacations" or "find trips to Asia".',
      parameters: {
        type: 'object',
        properties: {
          keyword: { type: 'string', description: 'Search keyword (leave empty to return all vacations)' },
          limit:   { type: 'number', description: 'Max results to return (default 10)' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getMyLikedVacations',
      description:
        'Returns the vacations the current user has liked (favorited), and how many. ' +
        'Use this for questions like "how many vacations have I liked", "what are my likes", or "my favorites".',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getMyBookings',
      description:
        'Returns the current user\'s own bookings — how many they have and which vacations. ' +
        'Use this for questions like "how many trips have I booked", "what are my bookings", or "which vacations did I book".',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'prepareBooking',
      description:
        'Prepares a booking proposal when the user clearly wants to book a vacation. ' +
        'Returns a confirmation request — does NOT create the booking directly. ' +
        'Use this only when the user has expressed clear intent with a specific vacation and traveler count.',
      parameters: {
        type: 'object',
        properties: {
          destination:  { type: 'string', description: 'Destination name or keyword to search for' },
          numTravelers: { type: 'number', description: 'Number of travelers' },
        },
        required: ['destination', 'numTravelers'],
      },
    },
  },
];

// ---------------------------------------------------------------------------
// Tool execution
// ---------------------------------------------------------------------------

// Format a DB date value the same way the frontend does:
// MySQL DATETIME columns return JS Date objects; take the UTC date portion
// so it matches what the VacationCard displays (split on 'T', take [0]).
function fmtDate(d: unknown): string {
  if (!d) return '';
  if (d instanceof Date) return d.toISOString().split('T')[0];
  return String(d).split('T')[0];
}

// The tool-calling model sometimes sends numeric arguments as strings (e.g. limit: "5").
// Coerce defensively — a raw string bound to a SQL LIMIT/numeric clause causes a syntax error.
function toNum(v: unknown, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

async function executeTool(name: string, input: Record<string, unknown>, userId: number): Promise<string> {
  switch (name) {
    case 'getActiveVacationsCount': {
      const today = new Date().toISOString().split('T')[0];
      const [[row]] = await pool.query(
        'SELECT COUNT(*) AS cnt FROM vacations WHERE startDate <= ? AND endDate >= ?',
        [today, today],
      ) as [[{ cnt: number }], unknown];
      return String(row.cnt);
    }

    case 'getAveragePrice': {
      const [[row]] = await pool.query(
        'SELECT COALESCE(AVG(price), 0) AS avg FROM vacations',
      ) as [[{ avg: number }], unknown];
      return `$${Number(row.avg).toFixed(2)}`;
    }

    case 'getFutureVacationsByRegion': {
      const today = new Date().toISOString().split('T')[0];
      const [rows] = await pool.query(
        'SELECT destination, price, startDate FROM vacations WHERE startDate > ? AND (destination LIKE ? OR description LIKE ?) ORDER BY startDate LIMIT 5',
        [today, `%${input.keyword}%`, `%${input.keyword}%`],
      ) as [{ destination: string; price: number; startDate: unknown }[], unknown];
      if (!rows.length) return `No future vacations found for keyword "${input.keyword}".`;
      return rows.map(r => `${r.destination} — $${r.price} (starts ${fmtDate(r.startDate)})`).join('\n');
    }

    case 'getAverageRating': {
      const vacationId = input.vacationId != null ? toNum(input.vacationId, 0) || undefined : undefined;
      const avg = await analyticsRepo.getAverageRating(vacationId);
      return `${avg} / 5`;
    }

    case 'getTopRatedVacations': {
      const list = await analyticsRepo.getTopRatedVacations(toNum(input.limit, 5));
      return list.map((v, i) => `${i + 1}. ${v.destination} — ${v.averageRating}/5 (${v.reviewsCount} reviews)`).join('\n');
    }

    case 'getBookingStats': {
      const s = await analyticsRepo.getBookingStats(input.dateFrom as string, input.dateTo as string);
      return `${s.totalBookings} confirmed bookings, $${s.totalRevenue.toLocaleString()} revenue`;
    }

    case 'getRevenue': {
      const s = await analyticsRepo.getBookingStats(input.dateFrom as string, input.dateTo as string);
      return `$${s.totalRevenue.toLocaleString()}`;
    }

    case 'getMostBookedVacations': {
      const list = await analyticsRepo.getMostBookedVacations(toNum(input.limit, 5));
      return list.map((v, i) => `${i + 1}. ${v.destination} — ${v.bookings} bookings`).join('\n');
    }

    case 'getVacationsByMonth': {
      const month = toNum(input.month, new Date().getMonth() + 1);
      const year  = toNum(input.year, new Date().getFullYear());
      const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay  = new Date(year, month, 0).toISOString().split('T')[0];
      const [rows] = await pool.query(
        `SELECT destination, price, startDate, endDate
         FROM vacations
         WHERE startDate <= ? AND endDate >= ?
         ORDER BY startDate ASC`,
        [lastDay, firstDay],
      ) as [{ destination: string; price: number; startDate: unknown; endDate: unknown }[], unknown];
      if (!rows.length) return `No vacations found that overlap with ${new Date(year, month - 1).toLocaleString('en', { month: 'long' })} ${year}.`;
      return rows.map(r => `• ${r.destination} — $${r.price} (${fmtDate(r.startDate)} to ${fmtDate(r.endDate)})`).join('\n');
    }

    case 'searchVacations': {
      const keyword = (input.keyword as string | undefined) ?? '';
      const limit   = toNum(input.limit, 10);
      const [rows] = await pool.query(
        `SELECT destination, price, startDate, endDate
         FROM vacations
         WHERE destination LIKE ? OR description LIKE ?
         ORDER BY startDate ASC
         LIMIT ?`,
        [`%${keyword}%`, `%${keyword}%`, limit],
      ) as [{ destination: string; price: number; startDate: unknown; endDate: unknown }[], unknown];
      if (!rows.length) return `No vacations found${keyword ? ` matching "${keyword}"` : ''}.`;
      return rows.map(r => `• ${r.destination} — $${r.price} (${fmtDate(r.startDate)} to ${fmtDate(r.endDate)})`).join('\n');
    }

    case 'getMyLikedVacations': {
      const { vacations } = await vacationRepo.findAll({ likedOnly: true, userId }, 1, 50);
      if (!vacations.length) return 'You have not liked any vacations yet.';
      return `You have liked ${vacations.length} vacation(s):\n` +
        vacations.map(v => `• ${v.destination} — $${v.price} (${fmtDate(v.startDate)} to ${fmtDate(v.endDate)})`).join('\n');
    }

    case 'getMyBookings': {
      const bookings = await bookingsRepo.findByUser(userId);
      if (!bookings.length) return 'You have no bookings yet.';
      const confirmed = bookings.filter(b => b.status === 'confirmed');
      return `You have ${bookings.length} booking(s), ${confirmed.length} confirmed:\n` +
        bookings.map(b =>
          `• ${b.vacation?.destination} — ${b.numTravelers} traveler(s), $${b.totalPrice} [${b.status}] ` +
          `(${fmtDate(b.vacation?.startDate)} to ${fmtDate(b.vacation?.endDate)}) Ref: ${b.bookingReference}`,
        ).join('\n');
    }

    case 'prepareBooking': {
      // ASSUMPTION: MCP booking uses deep-link approach.
      // The assistant prepares a proposal and the frontend navigates to the real checkout.
      // No booking is created without the user completing the mock payment form.
      const numTravelers = toNum(input.numTravelers, 1);
      const today = new Date().toISOString().split('T')[0];
      const [rows] = await pool.query(
        `SELECT id, destination, price, startDate, endDate
         FROM vacations
         WHERE startDate >= ? AND (destination LIKE ? OR description LIKE ?)
         ORDER BY startDate ASC LIMIT 1`,
        [today, `%${input.destination}%`, `%${input.destination}%`],
      ) as [{ id: number; destination: string; price: number; startDate: string; endDate: string }[], unknown];

      if (!rows.length) {
        // Nothing bookable for that destination (e.g. it only has past dates) — surface
        // real alternatives instead of a dead end, so the assistant can offer something else.
        const [alternatives] = await pool.query(
          `SELECT destination, price, startDate, endDate FROM vacations WHERE startDate >= ? ORDER BY startDate ASC LIMIT 3`,
          [today],
        ) as [{ destination: string; price: number; startDate: unknown; endDate: unknown }[], unknown];
        return JSON.stringify({
          error: `No upcoming (bookable) vacation found for "${input.destination}".`,
          alternatives: alternatives.map(a => ({
            destination: a.destination,
            price:       a.price,
            startDate:   fmtDate(a.startDate),
            endDate:     fmtDate(a.endDate),
          })),
        });
      }

      const vac = rows[0];
      const total = vac.price * numTravelers;
      return JSON.stringify({
        requiresConfirmation: true,
        pendingBooking: {
          vacationId:   vac.id,
          numTravelers,
          totalPrice:   total,
          destination:  vac.destination,
          startDate:    vac.startDate,
          endDate:      vac.endDate,
          deepLink:     `/vacations/${vac.id}?travelers=${numTravelers}`,
        },
      });
    }

    default:
      return 'Unknown tool.';
  }
}

// ---------------------------------------------------------------------------
// POST /api/mcp/ask
// ---------------------------------------------------------------------------
const askSchema = z.object({
  question: z.string().min(1).max(2000),
  history:  z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })).optional(),
});

export async function ask(req: AuthRequest, res: Response): Promise<void> {
  assertApiKey();
  const parsed = askSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'question is required' });
    return;
  }

  const { question, history = [] } = parsed.data;
  const user = req.user!;

  // Build message history (last 10 turns for context)
  const messages: NvMessage[] = [
    ...history.slice(-10).map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    } as NvMessage)),
    { role: 'user' as const, content: question },
  ];

  const today = new Date().toISOString().split('T')[0];
  const system =
    `You are a helpful travel assistant for the Vacations booking platform. ` +
    `Today's date is ${today}. ` +
    `You can look up vacation data, ratings, bookings, and revenue using the tools provided. ` +
    `When the user asks about trips in a specific month (e.g. "trips in July", "vacations in August"), ` +
    `always use the getVacationsByMonth tool with the correct month number and year — ` +
    `assume the current year (${new Date().getFullYear()}) unless the user specifies otherwise. ` +
    `When a user clearly wants to book a vacation with a specific destination and traveler count, ` +
    `use the prepareBooking tool to propose it — the user will confirm in the UI before any booking is created. ` +
    `When the user asks about their own likes/favorites or their own bookings/trips (e.g. "how many vacations have I liked", ` +
    `"what are my bookings", "which trips did I book"), always use the getMyLikedVacations or getMyBookings tools — ` +
    `these are already scoped to the current user, so never ask for their user ID or use another tool for this. ` +
    `If a tool result is empty, has an "error" field, or otherwise can't fully satisfy the request (e.g. no upcoming ` +
    `trip exists for the destination someone wants to book), never just say "not found" and stop — look for an ` +
    `"alternatives" list in the tool result and offer those, or call another tool (e.g. searchVacations) to find and ` +
    `suggest a genuinely close, relevant option instead. Always leave the user with something useful. ` +
    `The current user ID is ${user.id}. Be concise and helpful.`;

  // Tool-use loop — run until the model stops calling tools
  let currentMessages = [...messages];
  let answer = '';
  let pendingBooking: Record<string, unknown> | null = null;

  for (let turn = 0; turn < 5; turn++) {
    const result = await callWithTools(currentMessages, MCP_TOOLS, system);

    if (result.finishReason === 'stop' || result.toolCalls.length === 0) {
      answer = result.text ?? '';
      break;
    }

    if (result.finishReason === 'tool_calls') {
      // Append assistant message with tool_calls
      currentMessages.push(assistantTurn(result.text, result.toolCalls));

      // Execute each tool and append results
      for (const tc of result.toolCalls) {
        const toolResult = await executeTool(tc.name, tc.arguments, user.id);

        // Detect booking confirmation payload
        if (tc.name === 'prepareBooking') {
          try {
            const p = JSON.parse(toolResult);
            if (p.requiresConfirmation) pendingBooking = p.pendingBooking;
          } catch { /* not JSON */ }
        }

        currentMessages.push(toolResultTurn(tc.id, toolResult));
      }
    }
  }

  res.json({
    answer,
    ...(pendingBooking ? { requiresConfirmation: true, pendingBooking } : {}),
  });
}

