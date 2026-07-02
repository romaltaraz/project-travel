import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { askClaude, assertApiKey } from '../services/anthropic.service.js';
import { tripPlanCache } from '../services/tripPlannerCache.js';
import { pool } from '../config/db.js';

// ---------------------------------------------------------------------------
// AI Quick Tip  —  POST /api/ai/recommend
// ---------------------------------------------------------------------------
const recommendSchema = z.object({ destination: z.string().min(1).max(200) });

export async function recommend(req: AuthRequest, res: Response): Promise<void> {
  assertApiKey();
  const parsed = recommendSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'destination is required' });
    return;
  }

  const { destination } = parsed.data;
  const tip = await askClaude(
    `Give me one short, compelling travel tip for visiting ${destination}. ` +
    `1-3 sentences max. Be specific and practical. No intro phrases like "Sure!" or "Great choice!"`,
    'You are a knowledgeable travel expert. Respond with only the tip text.',
    256,
  );

  res.json({ destination, tip: tip.trim() });
}

// ---------------------------------------------------------------------------
// AI Trip Planner  —  POST /api/ai/trip-plan
// Accepts either a vacationId (look up dates from DB) OR a free-text
// destination with an optional number of days (defaults to 7).
// ---------------------------------------------------------------------------
const tripPlanSchema = z.union([
  z.object({ vacationId: z.number().int().positive() }),
  z.object({
    destination: z.string().min(1).max(300),
    days: z.number().int().min(1).max(30).optional(),
    pace: z.enum(['slow', 'fast']).optional(),
    startDate: z.string().optional(),
    endDate:   z.string().optional(),
  }),
]);

interface TripPlanDay {
  day: number;
  theme: string;
  activities: string[];
  restaurant: string;
  tip: string;
}

async function generatePlan(destination: string, startDate: string, endDate: string, pace: 'slow' | 'fast' = 'slow'): Promise<TripPlanDay[]> {
  const start = new Date(startDate);
  const end   = new Date(endDate);
  const days  = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);

  const activityCount = pace === 'fast' ? '5–6' : '2–3';
  const paceNote = pace === 'fast'
    ? 'This is a FAST-PACED trip — pack in as many verified attractions as possible each day. Include morning, mid-morning, afternoon, and evening activities.'
    : 'This is a RELAXED trip — keep each day light and leisurely, with time to breathe between activities.';

  const prompt =
    `Create a ${days}-day travel itinerary for ${destination} ` +
    `(${startDate} to ${endDate}).\n\n` +
    `TRIP PACE: ${paceNote}\n\n` +
    `CRITICAL QUALITY RULES — apply before choosing any place:\n` +
    `1. EXISTENCE CHECK: Only recommend attractions, landmarks, and restaurants that you are CONFIDENT still exist and are open to the public. Do NOT recommend places that have permanently closed, been demolished, or are widely reported as no longer operating.\n` +
    `2. STABILITY PREFERENCE: Favour well-established venues (10+ years of operation) over trendy pop-ups, temporary installations, or newly opened spots whose longevity is uncertain.\n` +
    `3. RESTAURANT VERIFICATION: For every restaurant you recommend, ask yourself: "Is this restaurant still operating as of my knowledge cutoff?" If there is any doubt — permanent closure, bankruptcy, or major renovation — replace it with a safe, well-known alternative in the same area.\n` +
    `4. ATTRACTION VERIFICATION: Do the same for every activity/attraction. If a museum is undergoing indefinite closure, a heritage site is off-limits, or a park has been replaced — substitute a verified alternative nearby.\n` +
    `5. HONEST TIP: If you substituted a venue due to uncertainty, briefly mention it in the "tip" field (e.g. "Note: verify opening hours locally as schedules can change").\n\n` +
    `Return ONLY a valid JSON array with exactly ${days} objects. Each object must have:\n` +
    `- "day": integer (1-${days})\n` +
    `- "theme": string — a short title for the day (e.g. "Old City & Culture")\n` +
    `- "activities": array of ${activityCount} strings — specific, verified attractions/experiences\n` +
    `- "restaurant": string — one verified restaurant recommendation with a brief note\n` +
    `- "tip": string — one practical travel tip for that day (include a verification note if needed)\n\n` +
    `Output the JSON array only — no markdown fences, no explanatory text.`;

  const system =
    `You are a meticulous travel expert. Before recommending any place, ` +
    `you mentally verify it still exists and is operational. ` +
    `You never recommend permanently closed venues. Respond with valid JSON only.`;

  // Parse with one retry on JSON failure
  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await askClaude(prompt, system, 4096);
    try {
      const parsed = JSON.parse(raw.trim());
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as TripPlanDay[];
    } catch {
      if (attempt === 1) throw new AppError('Could not parse AI itinerary — please try again', 502);
    }
  }
  throw new AppError('AI returned an unexpected format — please try again', 502);
}

export async function tripPlan(req: AuthRequest, res: Response): Promise<void> {
  assertApiKey();
  const parsed = tripPlanSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Provide either vacationId or destination (+ optional days/startDate/endDate)' });
    return;
  }

  let destination: string;
  let startDate: string;
  let endDate: string;
  let cacheKey: string;

  const pace = ('pace' in parsed.data ? parsed.data.pace : undefined) ?? 'slow';

  if ('vacationId' in parsed.data) {
    // Look up from DB
    const { vacationId } = parsed.data;
    cacheKey = `trip:vac:${vacationId}:${pace}`;
    const cached = tripPlanCache.get(cacheKey);
    if (cached) { res.json(cached); return; }

    const [rows] = await pool.query(
      'SELECT destination, startDate, endDate FROM vacations WHERE id = ?',
      [vacationId],
    ) as [{ destination: string; startDate: string; endDate: string }[], unknown];
    if (!rows.length) throw new AppError('Vacation not found', 404);
    destination = String(rows[0].destination);
    startDate   = String(rows[0].startDate).split('T')[0];
    endDate     = String(rows[0].endDate).split('T')[0];
  } else {
    // Free-text destination
    destination = parsed.data.destination.trim();
    const numDays = parsed.data.days ?? 7;
    if (parsed.data.startDate && parsed.data.endDate) {
      startDate = parsed.data.startDate;
      endDate   = parsed.data.endDate;
    } else {
      const today = new Date();
      startDate = today.toISOString().split('T')[0];
      const end = new Date(today);
      end.setDate(today.getDate() + numDays - 1);
      endDate = end.toISOString().split('T')[0];
    }
    cacheKey = `trip:free:${destination.toLowerCase()}:${startDate}:${endDate}:${pace}`;
    const cached = tripPlanCache.get(cacheKey);
    if (cached) { res.json(cached); return; }
  }

  const days = await generatePlan(destination, startDate, endDate, pace as 'slow' | 'fast');
  const result = { destination, startDate, endDate, days };
  tripPlanCache.set(cacheKey, result);
  res.json(result);
}

// ---------------------------------------------------------------------------
// Semantic Search  —  POST /api/ai/semantic-search
// ---------------------------------------------------------------------------
const semanticSchema = z.object({ query: z.string().min(1).max(500) });

interface SemanticFilters {
  matchingIds?: number[] | null;
  maxPrice?: number | null;
  minPrice?: number | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}

// The model is told to return JSON only, but frequently wraps it in ```json ... ``` fences
// anyway (or adds a stray leading/trailing sentence). Strip those before JSON.parse instead
// of letting a cosmetic formatting slip nuke the whole search.
function extractJsonObject(raw: string): string {
  let text = raw.trim();
  const fenced = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenced) text = fenced[1].trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) text = text.slice(start, end + 1);
  return text;
}

export async function semanticSearch(req: AuthRequest, res: Response): Promise<void> {
  assertApiKey();
  const parsed = semanticSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'query is required' });
    return;
  }

  const { query } = parsed.data;

  // Give Claude the actual catalog so it can reason about which vacations fit the
  // requested vibe/theme (e.g. "beach trip") using its own travel knowledge — a plain
  // keyword LIKE match misses destinations that never literally use words like "beach".
  const [catalogRows] = await pool.query(
    'SELECT id, destination, price, startDate, endDate, description FROM vacations ORDER BY id',
  ) as [{ id: number; destination: string; price: number; startDate: string; endDate: string; description: string }[], unknown];

  const catalog = catalogRows
    .map(v => `#${v.id} | ${v.destination} | $${v.price} | ${v.startDate} to ${v.endDate} | ${v.description}`)
    .join('\n');

  // Ask Claude to translate intent into structured filter parameters.
  // Claude NEVER queries the DB directly — only picks from/reasons over the catalog it's given.
  const today = new Date().toISOString().split('T')[0];
  const filterPrompt =
    `Today's date is ${today}. A user wants to find vacations with this request: "${query}"\n\n` +
    `Here is the full catalog of available vacations (id | destination | price | dates | description):\n${catalog}\n\n` +
    `Think about what the user is really looking for — the vibe, activity, or theme behind the request ` +
    `(e.g. "beach trip" means coastal/tropical/ocean destinations, even if the word "beach" never literally ` +
    `appears in the description). Use your own knowledge of these destinations, not just keyword matching.\n\n` +
    `Return ONLY a JSON object with these fields:\n` +
    `- "matchingIds": number[] — ids from the catalog above that fit the theme/vibe of the request ` +
    `(destination/activity match), ranked best-first. Base this ONLY on theme/destination fit — ` +
    `do NOT pre-filter by price or date here, those are applied separately below ` +
    `(empty array only if truly nothing in the catalog fits the theme)\n` +
    `- "maxPrice": number | null — maximum price per person, extracted directly from the user's wording if they mentioned one (e.g. "under $1000" → 1000), else null\n` +
    `- "minPrice": number | null — minimum price per person, extracted directly from the user's wording if they mentioned one, else null\n` +
    `- "dateFrom": "YYYY-MM-DD" | null — earliest startDate, extracted directly from the user's wording if they mentioned one, else null\n` +
    `- "dateTo": "YYYY-MM-DD" | null — latest startDate, extracted directly from the user's wording if they mentioned one, else null\n\n` +
    `Return valid JSON only. Use null for any field the user did not specify.`;

  const raw = await askClaude(
    filterPrompt,
    'You are an expert, creative travel search assistant with deep knowledge of world destinations. Respond with valid JSON only.',
    1024,
  );

  let filters: SemanticFilters = {};
  try {
    filters = JSON.parse(extractJsonObject(raw));
  } catch {
    // Model didn't return parseable JSON even after stripping markdown fences. A literal
    // substring search on the raw natural-language query would almost never match anything
    // (e.g. no description contains "adventure trip in europe next summer" verbatim) — that's
    // strictly worse than just showing the unfiltered catalog, so leave filters empty instead.
    filters = {};
  }

  // Clamp values to sane bounds (never trust model output directly)
  const minPrice = filters.minPrice != null ? Math.max(0, Math.min(10000, Number(filters.minPrice))) : null;
  const maxPrice = filters.maxPrice != null ? Math.max(0, Math.min(10000, Number(filters.maxPrice))) : null;
  const matchingIds = Array.isArray(filters.matchingIds)
    ? filters.matchingIds.map(Number).filter(id => Number.isInteger(id) && id > 0)
    : null;

  // Build SQL from sanitised filter params
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (matchingIds) {
    clauses.push(matchingIds.length ? `v.id IN (${matchingIds.map(() => '?').join(',')})` : 'FALSE');
    params.push(...matchingIds);
  }
  if (minPrice != null) { clauses.push('v.price >= ?'); params.push(minPrice); }
  if (maxPrice != null) { clauses.push('v.price <= ?'); params.push(maxPrice); }
  if (filters.dateFrom) { clauses.push('v.startDate >= ?'); params.push(filters.dateFrom); }
  if (filters.dateTo)   { clauses.push('v.startDate <= ?'); params.push(filters.dateTo); }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const userId = req.user?.id ?? 0;
  // Preserve Claude's relevance ranking when it picked specific matches; otherwise chronological.
  const orderBy = matchingIds?.length
    ? `FIELD(v.id, ${matchingIds.map(() => '?').join(',')})`
    : 'v.startDate ASC';
  const orderParams = matchingIds?.length ? matchingIds : [];

  const [rows] = await pool.query(`
    SELECT
      v.*,
      COUNT(DISTINCT l.userId)    AS likesCount,
      IF(SUM(l.userId = ?), 1, 0) AS likedByMe,
      COALESCE(AVG(r.rating), 0)  AS averageRating,
      COUNT(DISTINCT r.id)        AS reviewsCount
    FROM vacations v
    LEFT JOIN likes   l ON l.vacationId = v.id
    LEFT JOIN reviews r ON r.vacationId = v.id
    ${where}
    GROUP BY v.id
    ORDER BY ${orderBy}
  `, [userId, ...params, ...orderParams]) as [Record<string, unknown>[], unknown];

  const data = rows.map(v => ({
    id:            Number(v.id),
    destination:   String(v.destination),
    description:   String(v.description),
    startDate:     String(v.startDate),
    endDate:       String(v.endDate),
    price:         Number(v.price),
    imageFileName: String(v.imageFileName),
    likesCount:    Number(v.likesCount),
    likedByMe:     Boolean(v.likedByMe),
    averageRating: Number(Number(v.averageRating).toFixed(1)),
    reviewsCount:  Number(v.reviewsCount),
  }));

  res.json({ query, filters, data, total: data.length });
}
