import { writeFile } from 'node:fs/promises'
import 'dotenv/config'

const siteUrl = 'https://holokira2.contactholokira.workers.dev'
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const staticPages = [
  ['/', '1.0'],
  ['/#shop', '0.9'],
  ['/#cards', '0.9'],
  ['/#arrivals', '0.9'],
  ['/#vintageJapanese', '0.9'],
  ['/#japanese', '0.8'],
  ['/#highlights', '0.8'],
  ['/#graded', '0.8'],
  ['/#sell', '0.7'],
  ['/#about', '0.6'],
  ['/#contact', '0.6'],
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

  const response = await fetch(`${supabaseUrl}/rest/v1/cards?select=id,name,card_set,created_at&order=created_at.desc`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  })

  if (!response.ok) return []
  return response.json()
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

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>
    <loc>${url.loc}</loc>
${url.lastmod ? `    <lastmod>${new Date(url.lastmod).toISOString().slice(0, 10)}</lastmod>\n` : ''}    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>
`

await writeFile('public/sitemap.xml', xml)
