import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { cardPath, pageMeta, productData, sitemapXml } from '../src/seo.js'
import { createWorker } from '../worker-server.js'

const origin = 'https://holokira.oklmcrypto.workers.dev'
const card = {id:'test/1',name:'Dracaufeu <rare>',card_set:'Promo & JP',language:'Japonais',condition:'Excellent',grade:'Raw',price:175,stock:1,status:'available',image_urls:['https://example.com/card.webp'],description:'Photo réelle </script><script>alert(1)</script>',is_japanese:true,is_promo:true,updated_at:'2026-09-10T10:00:00Z'}

test('product metadata uses real stock and canonical paths without inventing a brand', () => {
  assert.match(cardPath(card), /^\/carte\/test%2F1\/dracaufeu-rare-promo-jp$/)
  const data=productData(card,origin)
  assert.equal(data.offers.price,'175.00')
  assert.equal(data.offers.availability,'https://schema.org/InStock')
  assert.equal(productData({...card,stock:0},origin).offers.availability,'https://schema.org/OutOfStock')
  assert.equal(data.brand,undefined)
  assert.ok(pageMeta('cardDetail',card,origin).description.length<=165)
})
test('sitemap uses modification dates and excludes private routes and empty collections', () => {
  const xml=sitemapXml([card],origin)
  assert.ok(xml.includes(cardPath(card)))
  assert.ok(xml.includes('2026-09-10T10:00:00.000Z'))
  assert.ok(!xml.includes('/admin'))
  assert.ok(!xml.includes('/cartes-pokemon-mew'))
  assert.ok(!xml.includes('#'))
})
test('server responses are crawlable, escaped, secure and preserve private-page isolation', async t => {
  const headerText=await readFile(new URL('../public/_headers',import.meta.url),'utf8')
  const headers=Object.fromEntries(headerText.split('\n').filter(line=>/^\s+\S.*:/.test(line)).map(line=>{const i=line.indexOf(':');return [line.slice(0,i).trim(),line.slice(i+1).trim()]}))
  const worker=createWorker({origin,supabaseUrl:'https://example.supabase.co',key:'sb_publishable_test',headers})
  const originalFetch=globalThis.fetch
  const originalCaches=globalThis.caches
  const cache=new Map()
  globalThis.caches={default:{match:async req => cache.get(req.url)?.clone(),put:async(req,res)=>cache.set(req.url,res)}}
  let reads=0
  globalThis.fetch=async (url,options) => {
    reads++
    assert.ok(String(url).includes('/rest/v1/cards?select='))
    assert.equal(options.headers.Authorization,undefined)
    return Response.json([card])
  }
  t.after(()=>{globalThis.fetch=originalFetch;globalThis.caches=originalCaches})
  const template=await readFile(new URL('../index.html',import.meta.url),'utf8')
  const env={ASSETS:{fetch:async()=>new Response(template)}}
  const ctx={waitUntil: promise => promise.catch(()=>{})}
  const call=path => worker.fetch(new Request(origin+path),env,ctx)
  const response=await call(cardPath(card))
  const html=await response.text()
  assert.equal(response.status,200)
  assert.equal(response.headers.get('X-Frame-Options'),'DENY')
  assert.match(response.headers.get('Content-Security-Policy'),/script-src 'self'/)
  assert.equal((html.match(/rel="canonical"/g)||[]).length,1)
  assert.match(html,/<h1>Dracaufeu &lt;rare&gt;<\/h1>/)
  assert.ok(!html.includes('</script><script>alert(1)</script>'))
  const json=html.match(/id="holokira-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]
  assert.equal(JSON.parse(json)[0].name,card.name)
  const old=await call('/carte/test%2F1/ancien-nom')
  assert.equal(old.status,301)
  assert.equal(old.headers.get('Location'),cardPath(card))
  const missing=await call('/carte/missing/inconnue')
  assert.equal(missing.status,404)
  assert.match(missing.headers.get('X-Robots-Tag'),/noindex/)
  const privatePage=await call('/recherche-japon/private-token')
  assert.match(privatePage.headers.get('X-Robots-Tag'),/noindex/)
  assert.ok(!(await privatePage.text()).includes(card.name))
  const sitemap=await call('/sitemap.xml')
  assert.match(sitemap.headers.get('Content-Type'),/xml/)
  assert.ok((await sitemap.text()).includes(cardPath(card)))
  assert.equal(reads,1)
  cache.clear()
  globalThis.fetch=async()=>new Response('unavailable',{status:503})
  const failure=await call('/boutique')
  assert.equal(failure.status,503)
  assert.equal(failure.headers.get('Retry-After'),'60')
})
