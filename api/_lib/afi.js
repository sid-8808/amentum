// Parsers for Athletics Federation of India (AFI) pages and the news feed.
// Pure functions: given raw HTML / PDF bytes / RSS text, return clean rows.
// Kept separate from the HTTP handler so they can be tested against saved pages.

export const AFI = 'https://indianathletics.in';

const STATES = {
  HAR: 'Haryana', UP: 'Uttar Pradesh', RAJ: 'Rajasthan', MAH: 'Maharashtra', KAN: 'Karnataka',
  ORI: 'Odisha', ODI: 'Odisha', UTK: 'Uttarakhand', AP: 'Andhra Pradesh', MP: 'Madhya Pradesh',
  BIH: 'Bihar', TN: 'Tamil Nadu', KER: 'Kerala', PUN: 'Punjab', DEL: 'Delhi', GUJ: 'Gujarat',
  WB: 'West Bengal', ASM: 'Assam', CTG: 'Chhattisgarh', TEL: 'Telangana', TG: 'Telangana',
  JHK: 'Jharkhand', JHA: 'Jharkhand', HP: 'Himachal Pradesh', JK: 'Jammu & Kashmir', GOA: 'Goa',
  CHD: 'Chandigarh', MAN: 'Manipur', MIZ: 'Mizoram', SER: 'Services', RLY: 'Railways'
};

const COMPS = [
  [/^DL\b/, 'Diamond League'], [/^WCh\b/, 'World Championships'], [/^AsiCh\b/, 'Asian Championships'],
  [/^ISAC\b/, 'Inter-State Championships'], [/^NatG\b/, 'National Games'],
  [/^IndOpn-(\d+)/, 'Indian Open $1'], [/^Fed ?Cup\b/, 'Federation Cup'],
  [/^ONAC\b/, 'Open National Championships'], [/^NC-U23\b/, 'National U23 Championships'],
  [/^NJC-U20\b/, 'National Junior Championships'], [/^JFC\b/, 'Junior Federation Cup'],
  [/^Open Throws\b/, 'Indian Open Throws']
];

export const titleCase = s => s.replace(/\s*\.\s*$/, '').replace(/\s+\.\s+/g, ' ').trim()
  .toLowerCase().replace(/\b\p{L}/gu, c => c.toUpperCase());

function prettyComp(raw) {
  // "DL Doha, QAT" -> "Diamond League, Doha" ; unknown codes pass through
  const noCountry = raw.replace(/,\s*[A-Z]{3}$/, '').trim();
  for (const [re, name] of COMPS) {
    const m = noCountry.match(re);
    if (m) {
      const label = name.replace('$1', m[1] || '');
      const place = noCountry.slice(m[0].length).trim();
      return place ? `${label}, ${place}` : label;
    }
  }
  return noCountry;
}

// ---------- Senior national ranking list (PDF) ----------

/** Latest "Athletes Ranking YYYY" PDF linked from the AFI home page. */
export function findLatestRanklistUrl(homeHtml) {
  const links = [...homeHtml.matchAll(/<a[^>]*href="([^"]+\.pdf)"[^>]*>\s*Athletes? Ranking (\d{4})\s*<\/a>/gi)]
    .map(m => ({ url: m[1], year: +m[2] }));
  if (!links.length) return null;
  links.sort((a, b) => b.year - a.year);
  return links[0];
}

/** PDF bytes -> array of text lines in reading order (needs pdfjs-dist). */
export async function pdfLines(bytes) {
  // Load the worker module ourselves: it registers globalThis.pdfjsWorker, so pdf.js
  // runs in-process instead of import()-ing the worker file at run time (which Vercel's
  // bundler does not see, and so does not ship).
  await import('pdfjs-dist/legacy/build/pdf.worker.mjs');
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes), isEvalSupported: false, useSystemFonts: false }).promise;
  const lines = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const tc = await (await doc.getPage(i)).getTextContent();
    const rows = {};
    for (const it of tc.items) {
      const y = Math.round(it.transform[5]);
      (rows[y] = rows[y] || []).push([it.transform[4], it.str]);
    }
    Object.keys(rows).sort((a, b) => b - a).forEach(y => {
      const t = rows[y].sort((a, b) => a[0] - b[0]).map(x => x[1]).join(' ').replace(/\s+/g, ' ').trim();
      if (t) lines.push(t);
    });
  }
  return lines;
}

const RANK_ROW = /^(\d{2}\.\d{2})( NR)? \S+ (.+?) ([A-Z]{2,4}) (\d{2})\.(\d{2})\.(\d{4}) (.+?) (\d{1,2} [A-Z][a-z]{2} \d{4})$/;

/** Ranking-list text lines -> { asOf, men:[...20], women:[...20] } for javelin. */
export function parseRanklist(lines) {
  const asOf = (lines.join(' ').match(/as of (\d{2})\.(\d{2})\.(\d{4})/) || []).slice(1);
  let gender = null;
  const out = { asOf: asOf.length ? `${asOf[2]}-${asOf[1]}-${asOf[0]}` : null, men: [], women: [] };
  for (let i = 0; i < lines.length; i++) {
    if (/^MEN$/.test(lines[i])) gender = 'men';
    if (/^WOMEN$/.test(lines[i])) gender = 'women';
    if (!/^javelin throw$/i.test(lines[i]) || !gender) continue;
    for (let j = i + 1; j < lines.length; j++) {
      const m = lines[j].match(RANK_ROW);
      if (!m) break;
      out[gender].push({
        name: m[3], state: STATES[m[4]] || m[4], mark: +m[1], nr: !!m[2],
        born: +m[7], comp: prettyComp(m[8]), date: m[9]
      });
    }
  }
  return out;
}

// ---------- National Junior Championships (HTML results) ----------

/** Most recent "Nth National Junior Athletics Championships YYYY" results page. */
export function findLatestJuniorUrl(resultsHtml) {
  const seen = new Map();
  for (const m of resultsHtml.matchAll(/href="([^"]*\/afi_result\/(\d+)(?:st|nd|rd|th)-national-junior-athletics-championships-(\d{4})\/?)"/g)) {
    seen.set(m[1], { url: m[1].startsWith('http') ? m[1] : AFI + m[1], edition: +m[2], year: +m[3] });
  }
  const all = [...seen.values()].sort((a, b) => b.year - a.year || b.edition - a.edition);
  return all[0] || null;
}

const entities = s => s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&rsquo;/g, "'").replace(/&middot;/g, '·');
const strip = s => entities(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

/** Junior results HTML -> top 5 per javelin age group, taken from each event's Final. */
export function parseJunior(html, top = 5) {
  const title = strip((html.match(/<title>([^<]*)<\/title>/) || ['', ''])[1]).replace(/\s*[«|].*$/, '');
  // the page also carries menu links with other dates (e.g. "1-10 Oct 2021"); take the first
  // date range in the championship's own year
  const year = (title.match(/\b(20\d{2})\b/) || [])[1];
  const dates = [...strip(html).matchAll(/\b(\d{1,2}\s*[–-]\s*\d{1,2}\s+[A-Z][a-z]+\s+(\d{4}))/g)]
    .find(m => !year || m[2] === year)?.[1] || null;
  const want = { 'men:u20': 'u20Boys', 'women:u20': 'u20Girls', 'men:u18': 'u18Boys', 'women:u18': 'u18Girls' };
  const out = { event: title || null, dates };
  for (const sec of html.matchAll(/<section class="afi-event"[^>]*data-group="(men|women)"[^>]*data-age="(u\d+)"[^>]*>([\s\S]*?)<\/section>/g)) {
    const [, group, age, body] = sec;
    const key = want[`${group}:${age}`];
    if (!key || !/<h2>[^<]*Javelin Throw/i.test(body) || /approach|kids/i.test((body.match(/<h2>([^<]*)/) || [])[1])) continue;
    const finalPane = (body.match(/<div class="afi-pane[^"]*" data-p="0">([\s\S]*?)(?=<div class="afi-pane|$)/) || [])[1] || body;
    const rows = [];
    for (const tr of finalPane.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)) {
      const cell = cls => strip((tr[1].match(new RegExp(`<td class="${cls}">([\\s\\S]*?)</td>`)) || ['', ''])[1]);
      const place = cell('pl'); const mark = cell('tm').replace(/m$/, '');
      if (!/^\d+\.?$/.test(place) || !/^\d{2}\.\d{2}$/.test(mark)) continue;
      rows.push({ name: titleCase(cell('name')), state: titleCase(cell('st')), mark: +mark, born: +(cell('dob').match(/\d{4}$/) || [0])[0] });
      if (rows.length === top) break;
    }
    if (rows.length) out[key] = rows;
  }
  return out;
}

// ---------- News (Google News RSS) ----------

export const NEWS_FEED = 'https://news.google.com/rss/search?q=javelin+India+when:60d&hl=en-IN&gl=IN&ceid=IN:en';

const decode = s => s.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

/**
 * Scan headlines for "<known athlete> ... <mark>m" in the current season.
 * Only athletes already in the AFI senior pool are matched (full name, word-bounded),
 * and only marks that beat their AFI mark and are physically plausible are kept.
 */
export function newsMarks(rssXml, pool, { year = new Date().getUTCFullYear() } = {}) {
  const hits = [];
  for (const item of rssXml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const get = tag => decode((item[1].match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`)) || ['', ''])[1]).trim();
    const title = get('title'); const link = get('link'); const pub = new Date(get('pubDate'));
    // feed is already a javelin search; full-name match against AFI's javelin list does the rest
    if (isNaN(pub) || pub.getUTCFullYear() !== year) continue;
    const marks = [...title.matchAll(/(\d{2}\.\d{2})\s?m\b/g)].map(m => +m[1]);
    if (marks.length !== 1) continue;                       // ambiguous headline: skip
    for (const [gender, list] of Object.entries(pool)) {
      const max = gender === 'men' ? 98.48 : 72.28;          // world records
      for (const a of list) {
        const re = new RegExp(`\\b${a.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        if (a.name.split(' ').length < 2 || !re.test(title)) continue;
        if (marks[0] > a.mark && marks[0] <= max) {
          hits.push({ gender, name: a.name, mark: marks[0], url: link, title: title.replace(/\s+-\s+[^-]+$/, ''), date: pub.toISOString().slice(0, 10) });
        }
      }
    }
  }
  // keep each athlete's best news mark
  const best = new Map();
  for (const h of hits) { const k = h.gender + h.name; if (!best.has(k) || best.get(k).mark < h.mark) best.set(k, h); }
  return [...best.values()];
}

/** Apply news marks to the senior pool and return the new top N per gender. */
export function mergeTop(pool, news, top = 5) {
  const out = {};
  for (const gender of ['men', 'women']) {
    const rows = (pool[gender] || []).map(a => {
      const n = news.find(h => h.gender === gender && h.name === a.name);
      return n ? { ...a, mark: n.mark, nr: false, comp: null, date: n.date, news: { url: n.url, title: n.title } } : { ...a };
    });
    rows.sort((a, b) => b.mark - a.mark);
    out[gender] = rows.slice(0, top);
  }
  return out;
}
