// Free, keyless real-photo fallback via Openverse (openverse.org) — used when
// both Magnific and Wikimedia are unavailable or have no results. Openverse
// aggregates openly-licensed photos from Flickr, museums, and other sources.
export interface FoundPhoto {
  imageUrl: string;
  source: 'openverse';
}

interface OpenverseResult {
  url?: string;
  width?: number;
  height?: number;
  mature?: boolean;
}

interface OpenverseSearchResponse {
  results?: OpenverseResult[];
}

/** Searches Openverse for a real photo. `page` cycles through further results. */
export async function searchOpenversePhoto(query: string, page: number): Promise<FoundPhoto | null> {
  const url = new URL('https://api.openverse.org/v1/images/');
  url.searchParams.set('q', query);
  url.searchParams.set('page', String(Math.max(1, page)));
  url.searchParams.set('page_size', '10');
  url.searchParams.set('mature', 'false');

  let res: Response;
  try {
    res = await fetch(url, { headers: { 'User-Agent': 'VacationsApp/1.0 (admin photo search feature)' } });
  } catch {
    return null;
  }
  if (!res.ok) return null;

  let json: OpenverseSearchResponse;
  try {
    json = await res.json() as OpenverseSearchResponse;
  } catch {
    return null;
  }

  const candidates = (json.results ?? [])
    .filter((r): r is OpenverseResult & { url: string } => !!r.url && !r.mature && (r.width ?? 0) >= 800);

  if (!candidates.length) return null;

  // Prefer landscape orientation for the vacation card's wide crop
  const best = candidates.sort((a, b) => (b.width! / b.height!) - (a.width! / a.height!))[0];
  return { imageUrl: best.url, source: 'openverse' };
}
