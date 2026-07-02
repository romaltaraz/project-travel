import 'dotenv/config';
import { askClaude } from './dist/services/anthropic.service.js';
import mysql from 'mysql2/promise';
const pool = mysql.createPool({ host:'localhost', port:3306, database:'vacations_db', user:'vacations_user', password:'vacations_pass', dateStrings:['DATE'] });

const [catalogRows] = await pool.query('SELECT id, destination, price, startDate, endDate, description FROM vacations ORDER BY id');
const catalog = catalogRows.map(v => `#${v.id} | ${v.destination} | $${v.price} | ${v.startDate} to ${v.endDate} | ${v.description}`).join('\n');

const queries = [
  'Adventure trip in Europe next summer',
  'Family-friendly resort with warm weather',
  'Budget city break in Asia',
];

for (const query of queries) {
  console.log('\n=== QUERY:', query, '===');
  for (let attempt = 1; attempt <= 3; attempt++) {
    const filterPrompt =
      `A user wants to find vacations with this request: "${query}"\n\n` +
      `Here is the full catalog of available vacations (id | destination | price | dates | description):\n${catalog}\n\n` +
      `Think about what the user is really looking for — the vibe, activity, or theme behind the request ` +
      `(e.g. "beach trip" means coastal/tropical/ocean destinations, even if the word "beach" never literally ` +
      `appears in the description). Use your own knowledge of these destinations, not just keyword matching.\n\n` +
      `Return ONLY a JSON object with these fields:\n` +
      `- "matchingIds": number[] — ids from the catalog above that fit the theme/vibe of the request ` +
      `(destination/activity match), ranked best-first. Base this ONLY on theme/destination fit — ` +
      `do NOT pre-filter by price or date here, those are applied separately below ` +
      `(empty array only if truly nothing in the catalog fits the theme)\n` +
      `- "maxPrice": number | null — maximum price per person, extracted directly from the user's wording if they mentioned one (e.g. "under $1000" -> 1000), else null\n` +
      `- "minPrice": number | null — minimum price per person, extracted directly from the user's wording if they mentioned one, else null\n` +
      `- "dateFrom": "YYYY-MM-DD" | null — earliest startDate, extracted directly from the user's wording if they mentioned one, else null\n` +
      `- "dateTo": "YYYY-MM-DD" | null — latest startDate, extracted directly from the user's wording if they mentioned one, else null\n\n` +
      `Return valid JSON only. Use null for any field the user did not specify.`;

    const raw = await askClaude(filterPrompt, 'You are an expert, creative travel search assistant with deep knowledge of world destinations. Respond with valid JSON only.', 1024);
    try {
      const parsed = JSON.parse(raw.trim());
      console.log(`  attempt ${attempt}: OK matchingIds=${JSON.stringify(parsed.matchingIds)}`);
    } catch (e) {
      console.log(`  attempt ${attempt}: PARSE FAIL — raw (first 300 chars):`, raw.slice(0, 300));
    }
  }
}
process.exit(0);
