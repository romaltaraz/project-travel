// Free, keyless real-photo fallback via Wikimedia Commons — used when Magnific
// is unavailable or has no results. Same source already used for hotel photos
// elsewhere in this app (see frontend seed data), just via the real search API
// here instead of hardcoded filenames.
export interface FoundPhoto {
  imageUrl: string;
  source: 'wikimedia';
}

interface CommonsImageInfo {
  url: string;
  mime: string;
  width: number;
  height: number;
}

interface CommonsPage {
  imageinfo?: CommonsImageInfo[];
}

interface CommonsSearchResponse {
  query?: { pages?: Record<string, CommonsPage> };
}

/** Searches Wikimedia Commons for a real photo. `page` cycles through further results. */
export async function searchWikimediaPhoto(query: string, page: number): Promise<FoundPhoto | null> {
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('generator', 'search');
  url.searchParams.set('gsrsearch', `${query} filetype:bitmap`);
  url.searchParams.set('gsrnamespace', '6');
  url.searchParams.set('gsrlimit', '10');
  url.searchParams.set('gsroffset', String(Math.max(0, (page - 1) * 10)));
  url.searchParams.set('prop', 'imageinfo');
  url.searchParams.set('iiprop', 'url|size|mime');
  url.searchParams.set('format', 'json');

  let res: Response;
  try {
    res = await fetch(url, { headers: { 'User-Agent': 'VacationsApp/1.0 (admin photo search feature)' } });
  } catch {
    return null;
  }
  if (!res.ok) return null;

  let json: CommonsSearchResponse;
  try {
    json = await res.json() as CommonsSearchResponse;
  } catch {
    return null;
  }

  const pages = Object.values(json.query?.pages ?? {});
  const candidates = pages
    .map(p => p.imageinfo?.[0])
    .filter((info): info is CommonsImageInfo =>
      !!info && (info.mime === 'image/jpeg' || info.mime === 'image/png') && info.width >= 800);

  if (!candidates.length) return null;

  // Prefer landscape orientation for the vacation card's wide crop
  const best = candidates.sort((a, b) => (b.width / b.height) - (a.width / a.height))[0];
  return { imageUrl: best.url, source: 'wikimedia' };
}
