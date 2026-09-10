import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { loadEnv } from 'vite'
import { sitemapXml } from '../src/seo.js'

const env = { ...loadEnv('production', process.cwd(), 'VITE_'), ...process.env }
const origin = new URL(env.VITE_SITE_URL || 'https://holokira.oklmcrypto.workers.dev').origin
const supabaseUrl = env.VITE_SUPABASE_URL || ''
const key = env.VITE_SUPABASE_ANON_KEY || ''
// Only the same PUBLIC credential used by the browser. Never accept a service key.
if (key && !key.startsWith('sb_publishable_')) {
  let role
  try { role = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role } catch { /* invalid key */ }
  if (role !== 'anon') throw new Error('SEO requires a public Supabase key, never a secret/service_role key.')
}
const headers = Object.fromEntries((await readFile('public/_headers','utf8')).split('\n').filter(line => /^\s+\S.*:/.test(line)).map(line => {
  const split = line.indexOf(':'); return [line.slice(0,split).trim(),line.slice(split+1).trim()]
}))
await mkdir('.generated', {recursive:true})
await writeFile('.generated/seo-config.js', `export default ${JSON.stringify({origin,supabaseUrl,key,headers})}\n`)
let cards = []
if (supabaseUrl && key) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/cards?select=id,name,card_set,language,grade,is_japanese,is_vintage,is_promo,is_graded,description,tags,badge,featured,stock,updated_at&order=created_at.desc`, {headers:{apikey:key},signal:AbortSignal.timeout(10000)})
    if (!response.ok) throw new Error('Catalogue indisponible')
    cards = await response.json()
  } catch { console.warn('Sitemap statique limité ; le sitemap Cloudflare utilisera le catalogue en direct.') }
}
await writeFile('public/sitemap.xml', sitemapXml(cards,origin))
await writeFile('public/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`)
