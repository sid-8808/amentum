// GET /api/rankings          -> cached for 6 h at Vercel's edge (stale-while-revalidate 1 day)
// GET /api/rankings?refresh=1 -> fresh read, cached 10 min so repeated clicks don't hit AFI each time
//
// Sources: AFI national ranking list (Men/Women), AFI National Junior Championships
// (U20/U18), and Google News headlines that may carry newer senior marks.
// Each source fails independently; the page keeps its last good list for any missing part.
import {
  AFI, NEWS_FEED, findLatestRanklistUrl, pdfLines, parseRanklist,
  findLatestJuniorUrl, parseJunior, newsMarks, mergeTop
} from './_lib/afi.js';

const UA = { 'user-agent': 'Mozilla/5.0 (compatible; AmentumSportsRankings/1.0; +https://amentums.com)' };

async function get(url, as = 'text', ms = 15000) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { headers: UA, signal: ctl.signal, redirect: 'follow' });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return as === 'bytes' ? new Uint8Array(await r.arrayBuffer()) : await r.text();
  } finally { clearTimeout(t); }
}

async function senior() {
  const link = findLatestRanklistUrl(await get(AFI + '/'));
  if (!link) throw new Error('ranking list link not found on AFI home page');
  const list = parseRanklist(await pdfLines(await get(link.url, 'bytes', 20000)));
  if (list.men.length < 5 || list.women.length < 5) throw new Error('javelin section not found in ranking PDF');
  return { source: { name: `AFI National Rankings ${link.year}`, url: link.url, asOf: list.asOf }, pool: { men: list.men, women: list.women } };
}

async function junior() {
  const link = findLatestJuniorUrl(await get(AFI + '/results/'));
  if (!link) throw new Error('National Junior Championships results not found');
  const r = parseJunior(await get(link.url, 'text', 20000));
  if (!r.u20Boys || !r.u20Girls || !r.u18Boys || !r.u18Girls) throw new Error('javelin finals not found in junior results');
  const { event, dates, ...lists } = r;
  return { source: { name: event || `National Junior Athletics Championships ${link.year}`, url: link.url, dates }, ...lists };
}

export default async function handler(req, res) {
  const refresh = 'refresh' in (req.query || {});
  const errors = [];
  const [s, j, rss] = await Promise.allSettled([senior(), junior(), get(NEWS_FEED, 'text', 8000)]);

  let seniorOut = null, newsApplied = [];
  if (s.status === 'fulfilled') {
    if (rss.status === 'fulfilled') newsApplied = newsMarks(rss.value, s.value.pool);
    else errors.push('news: ' + rss.reason.message);
    seniorOut = { source: s.value.source, ...mergeTop(s.value.pool, newsApplied) };
  } else errors.push('senior: ' + s.reason.message);

  const juniorOut = j.status === 'fulfilled' ? j.value : (errors.push('junior: ' + j.reason.message), null);

  if (!seniorOut && !juniorOut) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ ok: false, errors });
  }
  res.setHeader('Cache-Control', refresh
    ? 'public, s-maxage=600'
    : 'public, s-maxage=21600, stale-while-revalidate=86400');
  return res.status(200).json({
    ok: true, fetchedAt: new Date().toISOString(),
    senior: seniorOut, junior: juniorOut,
    news: { applied: newsApplied, feed: rss.status === 'fulfilled' },
    errors
  });
}
