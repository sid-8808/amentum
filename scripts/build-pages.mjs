// Generates a real HTML file for every page so search engines see each page on its own:
//   /index.html, /shop/index.html, /arena/index.html, /insights/index.html
// plus /sitemap.xml and /robots.txt.
//
// Source of truth is index.html (edit that; never edit the generated folders).
// Runs on every Vercel deploy (vercel.json buildCommand) and can be run locally:
//   node scripts/build-pages.mjs
// Set SITE_URL when the site moves to its final domain, e.g. https://www.amentums.com
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SITE = (process.env.SITE_URL || 'https://amentum-website.vercel.app').replace(/\/$/, '');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const abs = u => (u.startsWith('http') ? u : SITE + (u.startsWith('/') ? u : '/' + u));
const text = h => h.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

const PAGES = {
  home: {
    path: '/', title: 'Amentum Sports | Largest Javelin Store in Asia',
    description: 'Amentum Sports, the largest javelin store in Asia. World Athletics certified javelins made for Indian athletes, from ₹1,180 to ₹26,000, with pan-India delivery.',
    image: '/images/amentum_logo.png'
  },
  shop: {
    path: '/shop/', title: 'Buy Javelins Online in India | Amentum Sports Shop',
    description: 'Buy javelins online in India: competition, training, youth and mini javelins from ₹1,180 to ₹26,000, including World Athletics certified models, with pan-India delivery.',
    image: '/images/amentum-chhatrapati.jpg', crumb: 'Shop'
  },
  arena: {
    path: '/arena/', title: 'Athlete Arena: AFI Javelin Rankings & Leaderboard | Amentum Sports',
    description: "India's javelin Athlete Arena: live AFI national rankings for men, women, U20 and U18, the Amentum leaderboard and athlete profiles. Enroll to get listed.",
    image: '/images/amentum_logo.png', crumb: 'Athlete Arena'
  },
  insights: {
    path: '/insights/', title: 'Javelin News & Insights | Amentum Sports',
    description: 'Javelin news and insights from India and the world: Neeraj Chopra, AFI results, technique, injury prevention and how to choose the right javelin.',
    image: '/images/neeraj_chopra.jpg', crumb: 'Insights'
  }
};

const src = read('index.html');
if (!src.includes('<!--SEO-->') || !src.includes('<!--/SEO-->')) throw new Error('index.html is missing the <!--SEO--> markers');

// ---------- cache-busting versions for CSS/JS ----------
const ver = f => crypto.createHash('sha1').update(read(f)).digest('hex').slice(0, 8);
const versions = { '/css/style.css': ver('css/style.css'), '/js/main.js': ver('js/main.js') };
const withVersions = html => html.replace(/(\/css\/style\.css|\/js\/main\.js)(\?v=[0-9a-f]+)?/g, (_, f) => `${f}?v=${versions[f]}`);

// ---------- structured data ----------
const social = [...new Set([...src.matchAll(/href="(https:\/\/www\.(?:instagram|facebook|youtube)\.com\/[^"]+)"/g)].map(m => m[1]))];
const phone = (src.match(/href="tel:([^"]+)"/) || [])[1];
const organization = {
  '@context': 'https://schema.org', '@type': 'Organization', name: 'Amentum Sports', url: SITE + '/',
  logo: abs('/images/amentum_logo.png'), sameAs: social,
  ...(phone ? { contactPoint: { '@type': 'ContactPoint', telephone: phone, contactType: 'sales', areaServed: 'IN', availableLanguage: ['en', 'hi'] } } : {})
};
const website = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Amentum Sports', url: SITE + '/' };

function products() {
  const shop = src.slice(src.indexOf('<div id="page-shop"'), src.indexOf('<!-- /page-shop -->'));
  const cards = shop.split('<div class="prod-card"').slice(1);
  return cards.map(c => {
    const name = text((c.match(/class="prod-name">([\s\S]*?)<\/div>/) || [])[1] || '');
    const img = (c.match(/<img class="prod-img" src="([^"]+)"/) || [])[1];
    const desc = text((c.match(/class="prod-desc">([\s\S]*?)<\/div>/) || [])[1] || '');
    const series = text((c.match(/class="prod-series">([\s\S]*?)<\/div>/) || [])[1] || '');
    const sku = (series.match(/\bAM-[A-Z0-9]+\b/) || [])[0];
    let prices = [...c.matchAll(/<option value="(\d+)"/g)].map(m => +m[1]);
    if (!prices.length) prices = [+(((c.match(/class="prod-price"[^>]*>([^<]*)</) || [])[1] || '').replace(/[^\d]/g, ''))].filter(Boolean);
    if (!name || !prices.length) return null;
    const lo = Math.min(...prices), hi = Math.max(...prices);
    const offer = lo === hi
      ? { '@type': 'Offer', price: lo, priceCurrency: 'INR', availability: 'https://schema.org/InStock', url: SITE + '/shop/' }
      : { '@type': 'AggregateOffer', lowPrice: lo, highPrice: hi, offerCount: prices.length, priceCurrency: 'INR', availability: 'https://schema.org/InStock', url: SITE + '/shop/' };
    return { '@type': 'Product', name, ...(img && !img.includes('wixstatic') ? { image: abs(img) } : img ? { image: img } : {}), description: desc, ...(sku ? { sku } : {}), brand: { '@type': 'Brand', name: 'Amentum Sports' }, offers: offer };
  }).filter(Boolean);
}

const breadcrumb = p => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' }, { '@type': 'ListItem', position: 2, name: p.crumb, item: SITE + p.path }]
});

function jsonLd(key) {
  const p = PAGES[key];
  const blocks = key === 'home' ? [organization, website] : [breadcrumb(p)];
  if (key === 'shop') {
    const items = products();
    if (items.length < 5) throw new Error(`only ${items.length} products found in the shop section`);
    blocks.push({ '@context': 'https://schema.org', '@type': 'ItemList', name: 'Amentum javelins', itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, item: it })) });
  }
  return blocks.map(b => `<script type="application/ld+json">${JSON.stringify(b).replace(/</g, '\\u003c')}</script>`).join('\n');
}

function seoHead(key) {
  const p = PAGES[key]; const url = SITE + p.path;
  return `<!--SEO-->
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}"/>
<link rel="canonical" href="${url}"/>
<meta name="robots" content="index,follow,max-image-preview:large"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="Amentum Sports"/>
<meta property="og:locale" content="en_IN"/>
<meta property="og:title" content="${esc(p.title)}"/>
<meta property="og:description" content="${esc(p.description)}"/>
<meta property="og:url" content="${url}"/>
<meta property="og:image" content="${abs(p.image)}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${esc(p.title)}"/>
<meta name="twitter:description" content="${esc(p.description)}"/>
<meta name="twitter:image" content="${abs(p.image)}"/>
${jsonLd(key)}
<!--/SEO-->`;
}

// ---------- page variants ----------
function sectionBounds(html, key) {
  const a = html.indexOf(`<div id="page-${key}"`); const b = html.indexOf(`<!-- /page-${key} -->`);
  if (a < 0 || b < 0) throw new Error(`page-${key} section not found`);
  return [a, b];
}

function build(key) {
  let html = src.replace(/<!--SEO-->[\s\S]*?<!--\/SEO-->/, seoHead(key));
  // active page visible in the HTML itself (no JavaScript needed to see it)
  html = html.replace(/<div id="page-(home|shop|arena|insights)" class="page(?: on)?">/g, (_, k) => `<div id="page-${k}" class="page${k === key ? ' on' : ''}">`);
  // nav highlight
  html = html.replace(/<a id="nl-(home|shop|arena|insights)"(?: class="active")?/g, (_, k) => `<a id="nl-${k}"${k === key ? ' class="active"' : ''}`);
  // exactly one <h1>: the active page's title; other pages' titles become <h2>
  html = html.replace(/<(h[12]) data-h1([^>]*)>([\s\S]*?)<\/\1>/g, '<h2 data-h1$2>$3</h2>');
  const [a, b] = sectionBounds(html, key);
  const section = html.slice(a, b).replace(/<h2 data-h1([^>]*)>([\s\S]*?)<\/h2>/, '<h1 data-h1$1>$2</h1>');
  html = html.slice(0, a) + section + html.slice(b);
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) throw new Error(`${key}: expected exactly one <h1>`);
  return withVersions(html);
}

const today = new Date().toISOString().slice(0, 10);
for (const [key, p] of Object.entries(PAGES)) {
  const out = path.join(ROOT, p.path === '/' ? 'index.html' : p.path.slice(1) + 'index.html');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, build(key));
}
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  Object.values(PAGES).map(p => `  <url><loc>${SITE}${p.path}</loc><lastmod>${today}</lastmod><changefreq>${p.path === '/arena/' ? 'daily' : 'weekly'}</changefreq><priority>${p.path === '/' ? '1.0' : '0.8'}</priority></url>`).join('\n') +
  `\n</urlset>\n`);
fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`built ${Object.keys(PAGES).length} pages for ${SITE} · css ${versions['/css/style.css']} · js ${versions['/js/main.js']}`);
