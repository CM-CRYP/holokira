import { publicRoutes, pageMeta, productData, cardPath, collectionCards, isCollection, sitemapXml, initialContent, escapeHtml } from './src/seo.js'

export function createWorker(config) {
const columns = 'id,name,card_set,language,grade,condition,rarity,price,stock,status,image_urls,image_url,description,flaws,is_japanese,is_vintage,is_promo,is_graded,featured,tags,badge,created_at,updated_at'
async function publicCatalog(ctx) {
  if (!config.supabaseUrl || !config.key) throw new Error('Missing public configuration')
  const cacheKey = new Request(`${config.origin}/__catalog-seo-v1`)
  const cached = await caches.default.match(cacheKey)
  if (cached) return cached.json()
  const cards = []
  // Explicit public columns and public role; never forward visitor cookies or tokens.
  for (let offset = 0; ; offset += 1000) {
    const response = await fetch(`${config.supabaseUrl}/rest/v1/cards?select=${columns}&order=id.asc&limit=1000&offset=${offset}`, {
      headers: {apikey: config.key}, signal: AbortSignal.timeout(7000),
    })
    if (!response.ok) throw new Error('Catalogue unavailable')
    const batch = await response.json()
    if (!Array.isArray(batch)) throw new Error('Invalid catalogue')
    cards.push(...batch)
    if (batch.length < 1000) break
    if (offset >= 49000) throw new Error('Sitemap pagination required')
  }
  cards.sort((a,b) => new Date(b.created_at)-new Date(a.created_at))
  ctx.waitUntil(caches.default.put(cacheKey, new Response(JSON.stringify(cards), {headers:{'Content-Type':'application/json','Cache-Control':'public, max-age=60'}})))
  return cards
}
return {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const headers = new Headers(config.headers)
    headers.set('Cache-Control','no-store')
    const respond = (body,status=200,type='text/html; charset=utf-8') => {
      headers.set('Content-Type',type)
      return new Response(request.method==='HEAD' ? null : body,{status,headers})
    }
    if (!['GET','HEAD'].includes(request.method)) { headers.set('Allow','GET, HEAD'); return respond('Method not allowed',405,'text/plain') }
    if (url.pathname === '/robots.txt') return respond(`User-agent: *\nAllow: /\n\nSitemap: ${config.origin}/sitemap.xml\n`,200,'text/plain; charset=utf-8')
    const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/,'') : '/'
    if (path === '/index.html' || path !== url.pathname) { headers.set('Location',path==='/index.html' ? '/' : path); return respond('',301) }
    const cardMatch = path.match(/^\/carte\/([^/]+)(?:\/[^/]+)?$/)
    let view = Object.entries(publicRoutes).find(([,route]) => route===path)?.[0]
    const privatePage = path.startsWith('/recherche-japon/') || path==='/admin'
    if (privatePage) view = 'admin'
    let cards = [], card
    const needsCatalog = path==='/sitemap.xml' || cardMatch || view==='home' || (view && isCollection(view))
    if (needsCatalog) {
      try { cards = await publicCatalog(ctx) }
      catch {
        headers.set('Retry-After','60')
        return respond('<!doctype html><html lang="fr"><title>HoloKira — indisponibilité temporaire</title><h1>Le catalogue est momentanément indisponible</h1><p>Réessaie dans quelques instants.</p></html>',503)
      }
    }
    if (path==='/sitemap.xml') return respond(sitemapXml(cards,config.origin),200,'application/xml; charset=utf-8')
    if (cardMatch) {
      let id
      try { id=decodeURIComponent(cardMatch[1]) } catch { /* invalid path returns 404 */ }
      card=cards.find(item => item.id===id)
      view=card ? 'cardDetail' : 'notFound'
      if (card && cardPath(card)!==path) { headers.set('Location',cardPath(card)); return respond('',301) }
    }
    view ||= 'notFound'
    const shown = collectionCards(view,cards)
    const noindex = privatePage || view==='notFound' || (isCollection(view) && !shown.length)
    headers.set('X-Robots-Tag',noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large')
    const meta=pageMeta(view,card,config.origin)
    const schema = card ? [productData(card,config.origin), {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[
      {'@type':'ListItem',position:1,name:'HoloKira',item:config.origin+'/'},
      {'@type':'ListItem',position:2,name:'Boutique',item:config.origin+'/boutique'},
      {'@type':'ListItem',position:3,name:card.name,item:meta.canonical},
    ]}] : [{ '@context':'https://schema.org','@type':'Organization',name:'HoloKira',url:config.origin },
      ...(shown.length && (view==='home'||isCollection(view)) ? [{'@context':'https://schema.org','@type':'ItemList',itemListElement:shown.map((c,i)=>({'@type':'ListItem',position:i+1,url:config.origin+cardPath(c),name:c.name}))}] : [])]
    const templateResponse = await env.ASSETS.fetch(new Request(new URL('/',url)))
    if (!templateResponse.ok) return respond('Service temporairement indisponible',503,'text/plain')
    let html=await templateResponse.text()
    html=html.replace(/<title>[\s\S]*?<\/title>/i,'').replace(/<meta\s+(?:name|property)="(?:description|keywords|robots|og:[^"]*|twitter:[^"]*)"[^>]*>/gi,'').replace(/<link\s+rel="canonical"[^>]*>/gi,'')
    const tags=`<title>${escapeHtml(meta.title)}</title><meta name="description" content="${escapeHtml(meta.description)}"><meta name="robots" content="${noindex ? 'noindex,follow':'index,follow,max-image-preview:large'}"><link rel="canonical" href="${escapeHtml(meta.canonical)}"><meta property="og:title" content="${escapeHtml(meta.title)}"><meta property="og:description" content="${escapeHtml(meta.description)}"><meta property="og:url" content="${escapeHtml(meta.canonical)}"><meta property="og:type" content="${card?'product':'website'}"><meta property="og:image" content="${escapeHtml(meta.image)}"><meta property="og:locale" content="fr_FR"><meta property="og:site_name" content="HoloKira"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(meta.title)}"><meta name="twitter:description" content="${escapeHtml(meta.description)}"><meta name="twitter:image" content="${escapeHtml(meta.image)}">${!noindex ? `<script id="holokira-structured-data" type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script>` : ''}`
    html=html.replace('</head>',`${tags}</head>`)
    if (!privatePage) html=html.replace('<div id="root"></div>',`<div id="root">${initialContent(view,card,shown,meta)}</div>`)
    return respond(html,view==='notFound'?404:200)
  },
}

}
