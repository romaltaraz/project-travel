// Real stock-photo search via Magnific (https://www.magnific.com/photos)
// API key comes exclusively from env — never reaches the client.
const apiKey = process.env.MAGNIFIC_API_KEY;
if (!apiKey || apiKey === 'your_magnific_api_key_here') {
  console.warn('⚠️  MAGNIFIC_API_KEY is not set — Magnific photo search will be skipped (Wikimedia fallback only)');
}

interface MagnificResource {
  image?: { type: string; orientation: string; source?: { url: string } };
  stats?: { downloads: number; likes: number };
}

interface MagnificSearchResponse {
  data: MagnificResource[];
}

export interface FoundPhoto {
  imageUrl: string;
  source: 'magnific';
}

/**
 * Searches Magnific's real stock-photo catalog and picks the most "attractive"
 * result (landscape orientation + highest likes/downloads) among the
 * relevance-ranked matches. `page` lets the caller cycle through further
 * results for a "search again" action. Returns null on any failure/no
 * results so the caller can fall back to another source.
 */
export async function searchMagnificPhoto(query: string, page: number): Promise<FoundPhoto | null> {
  if (!apiKey || apiKey === 'your_magnific_api_key_here') return null;

  const url = new URL('https://api.magnific.com/v1/resources');
  url.searchParams.set('term', query);
  url.searchParams.set('filters[content_type][photo]', '1');
  url.searchParams.set('order', 'relevance');
  url.searchParams.set('limit', '10');
  url.searchParams.set('page', String(Math.max(1, page)));

  let res: Response;
  try {
    res = await fetch(url, { headers: { 'x-magnific-api-key': apiKey } });
  } catch {
    return null;
  }
  if (!res.ok) return null;

  let json: MagnificSearchResponse;
  try {
    json = await res.json() as MagnificSearchResponse;
  } catch {
    return null;
  }

  const photos = (json.data ?? []).filter(r => r.image?.type === 'photo' && r.image.source?.url);
  if (!photos.length) return null;

  const score = (r: MagnificResource) =>
    (r.image!.orientation === 'horizontal' ? 500 : 0) +
    (r.stats?.likes ?? 0) * 2 +
    Math.min(r.stats?.downloads ?? 0, 5000) * 0.01;

  const best = photos.reduce((top, r) => (score(r) > score(top) ? r : top));
  return { imageUrl: best.image!.source!.url, source: 'magnific' };
}
