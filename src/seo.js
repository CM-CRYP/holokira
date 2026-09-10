export const publicRoutes = {
  home: '/', shop: '/boutique', cards: '/cartes-pokemon', arrivals: '/arrivages',
  highlights: '/pepites', japanese: '/cartes-pokemon-japonaises', graded: '/cartes-pokemon-gradees',
  vintageJapanese: '/cartes-pokemon-japonaises-vintage',
  seoVintage: '/cartes-pokemon-japonaises-vintage', seoPromo: '/cartes-pokemon-promo-japonaises',
  seoVending: '/cartes-pokemon-vending-series', seoDracaufeu: '/cartes-pokemon-dracaufeu',
  seoPikachu: '/cartes-pokemon-pikachu', seoMew: '/cartes-pokemon-mew', seoStarters: '/cartes-pokemon-starters',
  japanSourcing: '/recherche-japon', sell: '/vendre-cartes-pokemon', about: '/a-propos',
  contact: '/contact', legal: '/mentions-legales', admin: '/admin',
}
const titles = {
  home: 'Cartes Pokémon japonaises, vintage et rares', shop: 'Boutique de cartes Pokémon',
  cards: 'Toutes les cartes Pokémon', arrivals: 'Nouveaux arrivages de cartes Pokémon', highlights: 'Pépites Pokémon',
  japanese: 'Cartes Pokémon japonaises', graded: 'Cartes Pokémon gradées',
  vintageJapanese: 'Cartes Pokémon japonaises vintage', seoVintage: 'Cartes Pokémon japonaises vintage',
  seoPromo: 'Cartes Pokémon promo japonaises', seoVending: 'Cartes Pokémon Vending Series',
  seoDracaufeu: 'Cartes Pokémon Dracaufeu', seoPikachu: 'Cartes Pokémon Pikachu',
  seoMew: 'Cartes Pokémon Mew', seoStarters: 'Cartes Pokémon starters et évolutions',
  japanSourcing: 'Recherche de cartes Pokémon au Japon', sell: 'Proposer ses cartes Pokémon à la vente',
  about: 'À propos de HoloKira', contact: 'Contacter HoloKira', legal: 'Mentions légales', admin: 'Administration',
}
export const compact = (value, max = 165) => String(value || '').replace(/\s+/g, ' ').trim().slice(0, max)
export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
export function cardPath(card) {
  const slug = `${card.name}-${card.set || card.card_set || ''}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') || 'carte'
  return `/carte/${encodeURIComponent(card.id)}/${slug}`
}
export function cardImages(card) {
  return [...new Set([...(card.imageUrls || card.image_urls || []), card.imageUrl || card.image_url].filter(url => typeof url === 'string' && /^https:\/\//.test(url)))]
}
export function productData(card, origin) {
  return {
    '@context': 'https://schema.org', '@type': 'Product', name: card.name,
    description: compact(card.description || `${card.name}, ${card.set || card.card_set}, état ${card.condition}. Réservation sans paiement en ligne.`, 5000),
    sku: card.id, category: 'Cartes Pokémon', image: cardImages(card),
    additionalProperty: ['condition','language','grade','rarity'].filter(key => card[key]).map(key => ({'@type':'PropertyValue', name: {condition:'État',language:'Langue',grade:'Grade',rarity:'Rareté'}[key], value:card[key]})),
    offers: {'@type':'Offer', url: origin + cardPath(card), priceCurrency:'EUR', price:Number(card.price).toFixed(2),
      availability: Number(card.stock) > 0 && card.status === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {'@type':'Organization',name:'HoloKira',url:origin}},
  }
}
export function pageMeta(view, card, origin) {
  const title = card ? `${compact(card.name, 70)} — ${compact(card.set || card.card_set, 60)} | HoloKira` : `${titles[view] || 'Page introuvable'} | HoloKira`
  const description = card
    ? compact(`${card.name}, ${card.set || card.card_set}. ${card.language}, état ${card.condition}${card.grade && card.grade !== 'Raw' ? `, ${card.grade}` : ''}. ${card.description || 'Photos réelles et réservation sans paiement en ligne.'}`)
    : compact({home:'Découvrez les cartes Pokémon japonaises, vintage et rares de HoloKira. Photos réelles, état détaillé et réservation sans paiement en ligne depuis la France.',
      japanSourcing:'Vous recherchez une carte Pokémon au Japon ? Décrivez votre recherche à HoloKira. Budget minimum de 100 €, proposition détaillée avant validation.',
      sell:'Proposez vos cartes Pokémon à HoloKira : décrivez votre collection, son état et le prix souhaité pour être recontacté.',
      contact:'Une question sur une carte Pokémon, une réservation ou une expédition ? Contactez HoloKira pour obtenir les détails avant de réserver.',
      about:'Découvrez HoloKira et son catalogue de cartes Pokémon : photos réelles, état détaillé, réservation puis validation avec le vendeur.',
      legal:'Informations légales et coordonnées de contact de HoloKira.'}[view] || `${titles[view] || 'HoloKira'} : consultez les photos, le prix et l’état des cartes du catalogue. Réservation sans paiement en ligne, expédition depuis la France.`)
  return {title, description, canonical: origin + (card ? cardPath(card) : publicRoutes[view] || '/'), image: card ? cardImages(card)[0] || origin+'/og-image.svg' : origin+'/og-image.svg'}
}
const normalized = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
export function collectionCards(view, cards) {
  return cards.filter(card => {
    const name = normalized(card.name)
    const text = normalized([card.name,card.card_set,card.set,card.description,card.rarity,card.tags,card.badge].join(' '))
    const japanese = card.is_japanese || card.isJapanese || /jp|japonais|japanese/i.test(card.language)
    const vintage = card.is_vintage || card.isVintage || /base set|fossil|jungle|neo|premium file|expansion sheet|vending|old back|carddass|topsun|southern islands|gym|rocket|e-series|ex era|delta|archive|vault|promo|old|vintage|ancienne/.test(text)
    if (view === 'japanese') return japanese
    if (view === 'graded') return card.is_graded || card.isGraded || (card.grade && card.grade.toLowerCase() !== 'raw')
    if (view === 'seoVintage' || view === 'vintageJapanese') return japanese && vintage
    if (view === 'seoPromo') return japanese && (card.is_promo || card.isPromo || /promo|quick starter|coro|s-p|illustration grand prix/.test(text))
    if (view === 'seoVending') return /vending|expansion sheet/.test(text)
    if (view === 'seoDracaufeu') return /dracaufeu|charizard/.test(text)
    if (view === 'seoPikachu') return name.includes('pikachu')
    if (view === 'seoMew') return name.split(/\s+/).includes('mew')
    if (view === 'seoStarters') return /bulbizarre|herbizarre|florizarre|salameche|reptincel|dracaufeu|carapuce|carabaffe|tortank|bulbasaur|ivysaur|venusaur|charmander|charmeleon|charizard|squirtle|wartortle|blastoise/.test(name)
    if (view === 'highlights') return card.featured || Number(card.stock) <= 3
    return true
  }).slice(0, view === 'arrivals' ? 24 : undefined)
}
export function sitemapXml(cards, origin) {
  const excluded = ['admin','legal']
  const paths = [...new Set(Object.entries(publicRoutes).filter(([view]) => !excluded.includes(view) && (!isCollection(view) || collectionCards(view,cards).length)).map(([,path]) => path))]
  const urls = paths.map(path => `<url><loc>${escapeHtml(origin+path)}</loc></url>`)
  for (const card of cards) {
    const date = new Date(card.updated_at || card.updatedAt || card.created_at)
    urls.push(`<url><loc>${escapeHtml(origin+cardPath(card))}</loc>${Number.isFinite(date.getTime()) ? `<lastmod>${date.toISOString()}</lastmod>` : ''}</url>`)
  }
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`
}
export function isCollection(view) { return !['home','about','contact','legal','sell','japanSourcing','admin','notFound','japanProposal','cardDetail'].includes(view) }
export function initialContent(view, card, cards, meta) {
  const link = (href,label) => `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`
  const image = c => cardImages(c)[0] ? `<img src="${escapeHtml(cardImages(c)[0])}" alt="${escapeHtml(`${c.name} — ${c.card_set || c.set || ''}`)}" width="300" height="420" style="object-fit:contain;max-width:100%" />` : ''
  const item = c => `<article>${link(cardPath(c),c.name)}${image(c)}<p>${escapeHtml(c.card_set || c.set)} · ${escapeHtml(c.language)} · ${escapeHtml(c.condition)} · ${escapeHtml(Number(c.price).toFixed(2))} €</p></article>`
  const heading = card ? card.name : titles[view] || 'Page introuvable'
  return `<header>${link('/','HoloKira')} <nav>${link('/boutique','Boutique')} · ${link('/arrivages','Arrivages')} · ${link('/recherche-japon','Recherche Japon')} · ${link('/contact','Contact')}</nav></header><main class="simple-page"><h1>${escapeHtml(heading)}</h1><p>${escapeHtml(meta.description)}</p>${card ? `${item(card)}<p>${escapeHtml(card.description)}</p>${card.flaws ? `<p>Défauts : ${escapeHtml(card.flaws)}</p>` : ''}<p>${Number(card.stock)>0 && card.status==='available' ? 'Disponible à la réservation' : 'Indisponible à la réservation'}</p>` : view==='home' || isCollection(view) ? `<section>${cards.length ? cards.map(item).join('') : '<p>Aucune carte dans cette collection pour le moment.</p>'}</section>` : ''}<p>Réservation sans paiement en ligne. Le vendeur confirme les détails et les frais de livraison avant validation.</p>${link('/cartes-pokemon','Consulter toutes les cartes')}</main>`
}
