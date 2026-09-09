import { writeFile } from 'node:fs/promises'
import { loadEnv } from 'vite'

const env = { ...loadEnv('production', process.cwd(), 'VITE_'), ...process.env }

const siteUrl = (env.VITE_SITE_URL || 'https://holokira.oklmcrypto.workers.dev').replace(/\/$/, '')
const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY

const staticPages = [
  ['/', '1.0'],
  ['/cartes-pokemon-japonaises-vintage', '0.9'],
  ['/cartes-pokemon-promo-japonaises', '0.9'],
  ['/cartes-pokemon-vending-series', '0.9'],
  ['/cartes-pokemon-dracaufeu', '0.9'],
  ['/cartes-pokemon-pikachu', '0.9'],
  ['/cartes-pokemon-mew', '0.9'],
  ['/cartes-pokemon-starters', '0.9'],
]

function slugify(value) {
  return `${value || ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function cardPath(card) {
  const slug = slugify(`${card.name}-${card.card_set}`) || 'carte'
  return `/carte/${encodeURIComponent(card.id)}/${slug}`
}

async function fetchCards() {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project')) return []

  try {
  const response = await fetch(`${supabaseUrl}/rest/v1/cards?select=id,name,card_set,created_at&order=created_at.desc`, {
    signal: AbortSignal.timeout(10000),
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  })

  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return await response.json()
  } catch {
    console.warn('Sitemap : catalogue distant inaccessible, seules les pages publiques sont incluses.')
    return []
  }
}

const cards = await fetchCards()
const urls = [
  ...staticPages.map(([path, priority]) => ({ loc: `${siteUrl}${path}`, priority })),
  ...cards.map((card) => ({
    loc: `${siteUrl}${cardPath(card)}`,
    priority: '0.8',
    lastmod: card.created_at || '',
  })),
]

const escapeXml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
${url.lastmod ? `    <lastmod>${new Date(url.lastmod).toISOString().slice(0, 10)}</lastmod>\n` : ''}    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>
`

await writeFile('public/sitemap.xml', xml)

await writeFile('public/robots.txt', `User-agent: *\nAllow: /\nDisallow: /recherche-japon/\n\nSitemap: ${siteUrl}/sitemap.xml\n`)
