import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Boxes,
  Check,
  CircleDollarSign,
  Copy,
  Edit3,
  Eye,
  FileText,
  Globe2,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Minus,
  Moon,
  PackageCheck,
  Palette,
  Plus,
  Save,
  Search,
  Send,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react'
import { starterCards, starterOrders, starterSellRequests, starterSite } from './data'
import {
  deleteRemoteCard,
  fetchCards,
  fetchReservations,
  fetchSellRequests,
  getBackendConfig,
  getAdminSession,
  signInAdmin,
  signOutAdmin,
  submitReservation,
  submitSellRequest as submitRemoteSellRequest,
  syncCards,
  updateRemoteReservation,
  updateRemoteSellRequest,
  uploadCardImage,
} from './api'
import './App.css'

const adminTabs = [
  ['overview', "Vue d'ensemble", LayoutDashboard],
  ['content', 'Contenu', Edit3],
  ['products', 'Produits', Boxes],
  ['orders', 'RÃ©servations', PackageCheck],
  ['sellRequests', 'Rachats', FileText],
  ['appearance', 'Apparence', Palette],
  ['settings', 'ParamÃ¨tres', Settings],
]

const cardStatuses = {
  available: 'Disponible',
  reserved: 'RÃ©servÃ©e',
  sold: 'Vendue',
}

const labels = {
  fr: {
    home: 'Accueil',
    shop: 'Boutique',
    highlights: 'PÃ©pites',
    sell: 'Vendre',
    cards: 'Toutes les cartes',
    arrivals: 'Arrivages',
    about: 'Ã€ propos',
    contact: 'Contact',
    legal: 'Mentions lÃ©gales',
    japanese: 'Japonaises',
    vintageJapanese: 'Anciennes JP',
    graded: 'GradÃ©es',
    orders: 'RÃ©servations',
    admin: 'Admin',
    all: 'Tous',
    allFeminine: 'Toutes',
    sort: 'Tri',
    sortFeatured: 'PÃ©pites',
    sortNewest: 'NouveautÃ©s',
    sortPriceAsc: 'Prix croissant',
    sortPriceDesc: 'Prix dÃ©croissant',
    sortRarity: 'RaretÃ©',
    buy: 'Je rÃ©serve',
    add: 'Ajouter',
    addToCart: 'Ajouter aux rÃ©servations',
    cart: 'RÃ©servations',
    checkout: 'Envoyer ma demande',
    remove: 'Retirer',
    subtotal: 'Sous-total',
    shipping: 'Livraison',
    free: 'Offerte',
    total: 'Total',
    rarity: 'RaretÃ©',
    condition: 'Ã‰tat',
    language: 'Langue',
    grade: 'Grade',
    stock: 'Stock',
    lowStock: 'Stock bas',
    sales: 'Montant rÃ©servÃ©',
    status: 'Statut',
    customer: 'Client',
    date: 'Date',
    items: 'Articles',
    reset: 'RÃ©initialiser',
    save: 'Enregistrer',
    productAdded: 'Carte ajoutÃ©e Ã  tes rÃ©servations.',
    lowStockWarning: 'Cette carte est indisponible ou dÃ©jÃ  rÃ©servÃ©e.',
    orderCreated: 'RÃ©servation envoyÃ©e.',
    reservationError: 'La rÃ©servation nâ€™a pas pu Ãªtre enregistrÃ©e. RÃ©essaie dans un instant.',
    reservationSuccessTitle: 'RÃ©servation reÃ§ue',
    reservationSuccessIntro: 'Ta demande est enregistrÃ©e. Garde cette rÃ©fÃ©rence pour nos Ã©changes.',
    continueShopping: 'Continuer la visite',
    viewReservations: 'Voir mes rÃ©servations',
    shareCard: 'Copier le lien',
    linkCopied: 'Lien copiÃ©.',
    enterShop: 'Entrer dans la boutique',
    discoverCards: 'Voir les cartes',
    emptyOrders: 'Aucune rÃ©servation pour le moment.',
    loginTitle: 'AccÃ¨s admin',
    loginIntro: 'Connecte-toi avec ton compte administrateur Supabase.',
    loginError: 'Connexion impossible.',
    logout: 'DÃ©connexion',
    customerInfo: 'Informations client',
    fullName: 'Nom complet',
    email: 'E-mail',
    phone: 'TÃ©lÃ©phone',
    address: 'Adresse',
    city: 'Ville',
    postalCode: 'Code postal',
    country: 'Pays',
    sellerMessage: 'Message pour le vendeur',
    reserved: 'RÃ©servÃ©e',
    sold: 'Vendue',
    available: 'Disponible',
    reservedUntil: 'RÃ©servÃ©e jusquâ€™au',
    release: 'Remettre en vente',
    privateNote: 'Note privÃ©e',
    reply: 'RÃ©pondre',
    copyEmail: 'Copier e-mail',
    darkMode: 'Mode sombre',
    lightMode: 'Mode clair',
    reservationPending: 'Nouvelle rÃ©servation',
    paymentPending: 'RÃ©servÃ©e',
    sellRequests: 'Demandes de rachat',
    emptySellRequests: 'Aucune demande de rachat pour le moment.',
    requestSent: 'Demande envoyÃ©e.',
    integrations: 'IntÃ©grations',
    stripeStatus: 'Envoi e-mail',
    databaseStatus: 'Base de donnÃ©es',
    active: 'Actif',
    inactive: 'Ã€ configurer',
    adminTitle: 'Panel admin',
    adminSubtitle:
      'ContrÃ´le le contenu, les produits, les rÃ©servations, la langue, les couleurs et les paramÃ¨tres de la boutique.',
  },
  en: {
    home: 'Home',
    shop: 'Shop',
    highlights: 'Highlights',
    sell: 'Sell',
    cards: 'All cards',
    arrivals: 'New arrivals',
    about: 'About',
    contact: 'Contact',
    legal: 'Legal',
    japanese: 'Japanese',
    vintageJapanese: 'Vintage JP',
    graded: 'Graded',
    orders: 'Orders',
    admin: 'Admin',
    all: 'All',
    allFeminine: 'All',
    sort: 'Sort',
    sortFeatured: 'Highlights',
    sortNewest: 'Newest',
    sortPriceAsc: 'Price low to high',
    sortPriceDesc: 'Price high to low',
    sortRarity: 'Rarity',
    buy: 'Reserve',
    add: 'Add',
    addToCart: 'Add to reservations',
    cart: 'Reservations',
    checkout: 'Send request',
    remove: 'Remove',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    free: 'Free',
    total: 'Total',
    rarity: 'Rarity',
    condition: 'Condition',
    language: 'Language',
    grade: 'Grade',
    stock: 'Stock',
    lowStock: 'Low stock',
    sales: 'Reserved value',
    status: 'Status',
    customer: 'Customer',
    date: 'Date',
    items: 'Items',
    reset: 'Reset',
    save: 'Save',
    productAdded: 'Card added to your reservations.',
    lowStockWarning: 'This card is unavailable or already reserved.',
    orderCreated: 'Reservation sent.',
    reservationError: 'The reservation could not be saved. Please try again in a moment.',
    reservationSuccessTitle: 'Reservation received',
    reservationSuccessIntro: 'Your request is saved. Keep this reference for our conversation.',
    continueShopping: 'Continue browsing',
    viewReservations: 'View reservations',
    shareCard: 'Copy link',
    linkCopied: 'Link copied.',
    enterShop: 'Enter the shop',
    discoverCards: 'View cards',
    emptyOrders: 'No reservations yet.',
    loginTitle: 'Admin access',
    loginIntro: 'Sign in with your Supabase administrator account.',
    loginError: 'Unable to sign in.',
    logout: 'Log out',
    customerInfo: 'Customer details',
    fullName: 'Full name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    city: 'City',
    postalCode: 'Postal code',
    country: 'Country',
    sellerMessage: 'Message for the seller',
    reserved: 'Reserved',
    sold: 'Sold',
    available: 'Available',
    reservedUntil: 'Reserved until',
    release: 'Release',
    privateNote: 'Private note',
    reply: 'Reply',
    copyEmail: 'Copy email',
    darkMode: 'Dark mode',
    lightMode: 'Light mode',
    reservationPending: 'New reservation',
    paymentPending: 'Reserved',
    sellRequests: 'Buylist requests',
    emptySellRequests: 'No buylist requests yet.',
    requestSent: 'Request sent.',
    integrations: 'Integrations',
    stripeStatus: 'Email delivery',
    databaseStatus: 'Database',
    active: 'Active',
    inactive: 'To configure',
    adminTitle: 'Admin panel',
    adminSubtitle:
      'Control content, products, reservations, language, colors, and shop settings.',
  },
}

const reservationStatusOptions = ['Nouvelle', 'ContactÃ©', 'ConfirmÃ©e', 'AnnulÃ©e']
const defaultCheckout = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'France',
  message: '',
}

const defaultSellRequest = {
  fullName: '',
  email: '',
  phone: '',
  cardList: '',
  condition: '',
  expectedPrice: '',
}

function loadLocal(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

function saveLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return { saved: true }
  } catch (error) {
    console.warn(`Local save failed for ${key}`, error)
    return { saved: false, error }
  }
}

function mergeSite(saved) {
  if (!saved || saved.dataVersion !== starterSite.dataVersion) return starterSite
  return {
    ...starterSite,
    ...saved,
    theme: { ...starterSite.theme, ...saved.theme },
    copy: {
      fr: { ...starterSite.copy.fr, ...saved.copy?.fr },
      en: { ...starterSite.copy.en, ...saved.copy?.en },
    },
  }
}

function loadOrders() {
  const savedSite = loadLocal('kc-site', null)
  if (!savedSite || savedSite.dataVersion !== starterSite.dataVersion) {
    return starterOrders
  }
  return loadLocal('kc-orders', starterOrders).map((order) => ({
    ...order,
    status: normalizeStatus(order.status),
  }))
}

function loadSellRequests() {
  const savedSite = loadLocal('kc-site', null)
  if (!savedSite || savedSite.dataVersion !== starterSite.dataVersion) {
    return starterSellRequests
  }
  return loadLocal('kc-sell-requests', starterSellRequests)
}

function formatMoney(value) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(value) || 0)
}

function normalizeStatus(status) {
  const replacements = {
    Payee: 'Payée',
    Preparee: 'Préparée',
    Expediee: 'Expédiée',
    Archivee: 'Archivée',
    'Paiement à activer': 'Nouvelle réservation',
    'Payée': 'Confirmée',
    'Préparée': 'Contacté',
    'Expédiée': 'Confirmée',
    'Nouvelle réservation': 'Nouvelle',
    'Archivée': 'Annulée',
  }
  return replacements[status] ?? status
}

function getCardSearchText(card) {
  return [
    card.name,
    card.set,
    card.description,
    card.rarity,
    card.type,
    card.condition,
    card.language,
    card.grade,
    card.tags,
    card.badge,
  ].join(' ').toLowerCase()
}

function getCollectionSignals(card) {
  const haystack = getCardSearchText(card)
  const grade = `${card.grade || ''}`.toLowerCase()
  return {
    japanese: Boolean(card.isJapanese || card.language?.toUpperCase() === 'JP'),
    graded: Boolean(card.isGraded || (grade && grade !== 'raw')),
    vintage: Boolean(card.isVintage || /base set|fossil|jungle|neo|premium file|expansion sheet|vending|old back|carddass|topsun|southern islands|gym|rocket|e-series|ex era|delta species|delta|archive|vault|promo|old|vintage|ancienne/i.test(haystack)),
    promo: Boolean(card.isPromo || /promo/i.test(haystack)),
    favorite: Boolean(card.featured || card.badge),
  }
}

function getInventorySeo(cards) {
  const availableCards = cards.filter((card) => getCardStatus(card) !== 'sold')
  const vintageCards = availableCards.filter((card) => getCollectionSignals(card).vintage)
  const setNames = [...new Set(availableCards.map((card) => card.set).filter(Boolean))].slice(0, 6)
  const cardNames = availableCards.map((card) => card.name).filter(Boolean).slice(0, 6)
  const vintageSets = [...new Set(vintageCards.map((card) => card.set).filter(Boolean))].slice(0, 5)
  const keywords = [
    'cartes Pokemon japonaises vintage',
    'cartes Pokemon anciennes japonaises',
    'Pokemon Expansion Sheet',
    'Pokemon Fossil japonais',
    'Pokemon Neo Premium File',
    'cartes Pokemon reservation France',
    ...setNames,
    ...cardNames,
  ].filter(Boolean)

  return {
    vintageSets,
    cardNames,
    keywords: [...new Set(keywords)].join(', '),
  }
}

function getPageSeo({ view, selected, site, t, cards }) {
  const copy = site.copy[site.language]
  const inventory = getInventorySeo(cards)
  const isFr = site.language === 'fr'
  const pageTitles = {
    home: isFr ? 'Cartes Pok\u00e9mon japonaises vintage et rares' : 'Vintage Japanese and rare Pokemon cards',
    shop: isFr ? 'Boutique de cartes Pok\u00e9mon japonaises vintage' : 'Vintage Japanese Pokemon card shop',
    arrivals: isFr ? 'Arrivages cartes Pok\u00e9mon japonaises' : 'Japanese Pokemon card arrivals',
    cards: t.cards,
    highlights: copy.highlightsTitle,
    japanese: copy.japaneseTitle,
    vintageJapanese: copy.vintageJapaneseTitle,
    graded: copy.gradedTitle,
    sell: copy.sellTitle,
    about: copy.aboutTitle,
    contact: copy.contactTitle,
    legal: copy.legalTitle,
    orders: t.orders,
  }

  if (view === 'cardDetail' && selected) {
    const signals = getCollectionSignals(selected)
    return {
      title: `${selected.name} ${selected.set} | ${site.brandName}`,
      description: selected.description || `${selected.name} ${selected.set}, carte Pok\u00e9mon ${signals.japanese ? 'japonaise' : selected.language} ${signals.vintage ? 'vintage' : ''}, \u00e9tat ${selected.condition}, grade ${selected.grade}. R\u00e9servation sans paiement direct depuis la France.`,
      keywords: `${selected.name}, ${selected.set}, ${selected.rarity}, ${selected.condition}, ${selected.language}, ${inventory.keywords}`,
    }
  }

  const vintageSets = inventory.vintageSets.length ? inventory.vintageSets.join(', ') : 'Expansion Sheet, Fossil, Neo, Vending'
  const cardExamples = inventory.cardNames.length ? inventory.cardNames.join(', ') : 'Salam\u00e8che, Mew, Aligatueur, Mentali'
  const description = isFr
    ? `HoloKira s\u00e9lectionne des cartes Pok\u00e9mon japonaises vintage et rares : ${vintageSets}. Photos r\u00e9elles, \u00e9tat d\u00e9taill\u00e9, r\u00e9servation sans paiement direct et exp\u00e9dition suivie depuis la France. Exemples du stock : ${cardExamples}.`
    : `HoloKira curates vintage and rare Japanese Pokemon cards: ${vintageSets}. Real photos, clear condition notes, reservation without direct payment, tracked shipping from France. Current examples: ${cardExamples}.`

  return {
    title: `${pageTitles[view] || site.brandName} | ${site.brandName}`,
    description,
    keywords: inventory.keywords,
  }
}

function slugify(value) {
  return `${value || ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getCardPath(card) {
  if (!card) return '/#shop'
  const slug = slugify(`${card.name}-${card.set}`) || 'carte'
  return `/carte/${encodeURIComponent(card.id)}/${slug}`
}

function readPathTarget() {
  const match = window.location.pathname.match(/^\/carte\/([^/]+)/)
  if (!match) return null
  return { view: 'cardDetail', cardId: decodeURIComponent(match[1]) }
}

function readHashTarget() {
  const hash = window.location.hash.replace(/^#/, '')
  if (!hash) return { view: 'home' }
  if (hash.startsWith('card/')) {
    return { view: 'cardDetail', cardId: decodeURIComponent(hash.slice(5)) }
  }
  return { view: hash }
}

function getCardStatus(card) {
  if (card.status) return card.status
  if (card.sold) return 'sold'
  if (card.reserved || Number(card.stock) === 0) return 'reserved'
  return 'available'
}

function getCardStatusLabel(card, t) {
  const status = getCardStatus(card)
  if (status === 'sold') return t.sold
  if (status === 'reserved') return t.reserved
  return t.available
}

function isReservable(card) {
  return getCardStatus(card) === 'available' && Number(card.stock) > 0
}

function getCardImages(card) {
  const images = Array.isArray(card.imageUrls) ? card.imageUrls : []
  return [...images, card.imageUrl].filter(Boolean).filter((image, index, list) => list.indexOf(image) === index)
}

function formatDateTime(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function addHours(date, hours) {
  return new Date(date.getTime() + Number(hours || 48) * 60 * 60 * 1000).toISOString()
}

function setMetaTag(selector, attributes) {
  let tag = document.head.querySelector(selector)
  if (!tag) {
    tag = document.createElement('meta')
    document.head.appendChild(tag)
  }
  Object.entries(attributes).forEach(([key, value]) => tag.setAttribute(key, value))
}

function setLinkTag(rel, href) {
  let tag = document.head.querySelector(`link[rel="${rel}"]`)
  if (!tag) {
    tag = document.createElement('link')
    tag.setAttribute('rel', rel)
    document.head.appendChild(tag)
  }
  tag.setAttribute('href', href)
}

function setStructuredData(data) {
  const id = 'holokira-structured-data'
  let script = document.getElementById(id)
  if (!script) {
    script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = id
    document.head.appendChild(script)
  }
  script.textContent = JSON.stringify(data)
}

function getCardBadges(card) {
  const status = getCardStatus(card)
  return [
    status === 'reserved' ? 'RÃ©servÃ©e' : '',
    status === 'sold' ? 'Vendue' : '',
    card.badge,
    card.featured ? 'Coup de cÅ“ur' : '',
  ].filter(Boolean).filter((badge, index, list) => list.indexOf(badge) === index)
}

function HoloCardShowcase({ cards, openCardPage }) {
  const showcaseCards = cards.slice(0, 5)

  return (
    <section className="holo-stage" aria-label="Vitrine de cartes holographiques">
      <div className="holo-aura" />
      <div className="holo-particles" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, index) => (
          <i key={index} style={{ '--i': index }} />
        ))}
      </div>
      <div className="holo-deck">
        {showcaseCards.map((card, index) => (
          <button
            className={`holo-card holo-card-${index + 1}`}
            type="button"
            key={card.id}
            onClick={() => openCardPage(card)}
            style={{ '--card-accent': card.color }}
          >
            <span className="holo-card-inner">
              <CardArt card={card} large />
              <span className="holo-card-copy">
                <b>{card.name}</b>
                <small>{card.set}</small>
                <strong>{formatMoney(card.price)}</strong>
              </span>
            </span>
          </button>
        ))}
      </div>
      <div className="holo-panel">
        <span>HoloKira selection</span>
        <strong>{showcaseCards.length} cartes Ã  explorer</strong>
      </div>
    </section>
  )
}

function CardArt({ card, large = false }) {
  const primaryImage = getCardImages(card)[0]
  const hasPhoto = Boolean(primaryImage)

  return (
    <div
      className={[
        'card-art',
        large ? 'card-art-large' : '',
        hasPhoto ? 'card-art-photo' : 'card-art-placeholder',
      ].filter(Boolean).join(' ')}
      style={{ '--card-accent': card.color }}
    >
      {primaryImage && <img src={primaryImage} alt={card.name} loading="lazy" decoding="async" />}
      <div className="card-art-top">
        <span>{card.language}</span>
        <strong>{card.grade}</strong>
      </div>
      {!hasPhoto && (
        <div className="card-orbit">
          <Sparkles size={large ? 42 : 30} strokeWidth={1.7} />
        </div>
      )}
      <div className="card-art-name">{card.name.split(' ')[0]}</div>
      {!hasPhoto && (
        <div className="card-art-lines">
          <i />
          <i />
          <i />
        </div>
      )}
    </div>
  )
}

function Header({ view, setView, cartCount, site, setLanguage, toggleColorMode }) {
  const t = labels[site.language]
  const nav = [
    ['home', t.home],
    ['shop', t.shop],
    ['arrivals', t.arrivals],
    ['highlights', t.highlights],
    ['graded', t.graded],
    ['vintageJapanese', t.vintageJapanese],
    ['sell', t.sell],
    ['cards', t.cards],
  ]

  return (
    <header className="topbar">
      <button className="brand" type="button" onClick={() => setView('home')}>
        <span className="brand-mark">{site.brandMark}</span>
        <span>{site.brandName}</span>
      </button>
      <nav className="nav-tabs" aria-label="Navigation principale">
        {nav.map(([id, label]) => (
          <button
            className={view === id ? 'active' : ''}
            key={id}
            type="button"
            onClick={() => setView(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="top-actions">
        <label className="language-switch">
          <Globe2 size={16} />
          <select value={site.language} onChange={(event) => setLanguage(event.target.value)}>
            <option value="fr">FR</option>
            <option value="en">EN</option>
          </select>
        </label>
        <button className="theme-toggle" type="button" onClick={toggleColorMode}>
          {site.colorMode === 'light' ? <Sun size={17} /> : <Moon size={17} />}
          <span>{site.colorMode === 'light' ? t.lightMode : t.darkMode}</span>
        </button>
        <button className="cart-pill" type="button" onClick={() => setView('shop')}>
          <ShoppingBag size={18} />
          <span>{cartCount}</span>
        </button>
      </div>
    </header>
  )
}

function HomeView({ cards, openCardPage, setView, site, t }) {
  const copy = site.copy[site.language]
  const featuredCards = cards.filter((card) => card.featured).slice(0, 3)
  const previewCards = featuredCards.length ? featuredCards : cards.slice(0, 3)
  const inventory = getInventorySeo(cards)
  const vintageCards = cards.filter((card) => getCollectionSignals(card).vintage).slice(0, 4)

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-copy">
          <span>{copy.homeEyebrow}</span>
          <h1>{copy.homeTitle}</h1>
          <p>{copy.homeIntro}</p>
          <div className="home-actions">
            <button className="checkout" type="button" onClick={() => setView('shop')}>
              <ShoppingBag size={18} />
              {t.enterShop}
            </button>
            <button className="secondary-button" type="button" onClick={() => setView('cards')}>
              <Sparkles size={17} />
              {t.discoverCards}
            </button>
          </div>
        </div>
        <HoloCardShowcase cards={cards} openCardPage={openCardPage} />
      </section>
      <section className="home-focus">
        <div>
          <span>{site.language === 'fr' ? 'Sp\u00e9cialit\u00e9 HoloKira' : 'HoloKira specialty'}</span>
          <h2>{site.language === 'fr' ? 'Cartes Pok\u00e9mon japonaises vintage, photos r\u00e9elles' : 'Vintage Japanese Pokemon cards, real photos'}</h2>
          <p>
            {site.language === 'fr'
              ? `Le stock se concentre sur les pi\u00e8ces japonaises anciennes et recherch\u00e9es : ${inventory.vintageSets.join(', ') || 'Expansion Sheet, Fossil, Neo, Vending'}. Chaque carte est pr\u00e9sent\u00e9e avec ses photos, son \u00e9tat et ses d\u00e9fauts visibles.`
              : `The stock focuses on older and collectible Japanese cards: ${inventory.vintageSets.join(', ') || 'Expansion Sheet, Fossil, Neo, Vending'}. Every card is shown with real photos, condition and visible flaws.`}
          </p>
          <button className="secondary-button" type="button" onClick={() => setView('vintageJapanese')}>
            {t.vintageJapanese}
          </button>
        </div>
        <div className="focus-card-list">
          {vintageCards.map((card) => (
            <button type="button" key={card.id} onClick={() => openCardPage(card)}>
              <CardArt card={card} />
              <strong>{card.name}</strong>
              <span>{card.set}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="home-strip">
        {previewCards.map((card) => (
          <button className="home-card-link" type="button" key={card.id} onClick={() => openCardPage(card)}>
            <CardArt card={card} />
            <span className="home-card-copy">
              <strong>{card.name}</strong>
              <small>{card.set}</small>
            </span>
            <b>{formatMoney(card.price)}</b>
          </button>
        ))}
      </section>
      <TrustSection site={site} />
      <ReservationGuide site={site} />
    </main>
  )
}

function ProductCard({ card, selected, onSelect, onAdd, onShare, t }) {
  const reservable = isReservable(card)
  const status = getCardStatus(card)
  const unavailable = !reservable
  const badges = getCardBadges(card)

  return (
    <article className={`${selected ? 'product-card selected' : 'product-card'} ${unavailable ? 'reserved' : ''}`}>
      <button className="product-open" type="button" onClick={() => onSelect(card)}>
        <span className="badge-row" aria-hidden={badges.length === 0}>
          {badges.map((badge) => <span className="card-badge" key={badge}>{badge}</span>)}
        </span>
        <CardArt card={card} />
        <div className="product-info">
          <div>
            <h3>{card.name}</h3>
            <p>{card.set}</p>
          </div>
          <strong>{formatMoney(card.price)}</strong>
        </div>
        <div className="product-meta">
          <span>{card.rarity}</span>
          <span>{card.condition}</span>
          <span className={unavailable ? 'reserved-badge' : ''}>
            {unavailable ? getCardStatusLabel(card, t) : `${t.stock} ${card.stock}`}
          </span>
          {status === 'reserved' && card.reservedUntil && (
            <span>{t.reservedUntil} {formatDateTime(card.reservedUntil)}</span>
          )}
          {card.negotiable && <span>Prix nÃ©gociable</span>}
          {card.tags && <span>{card.tags}</span>}
        </div>
      </button>
      <div className="product-actions">
        <button
          className="reserve-card-button"
          type="button"
          onClick={() => onAdd(card.id)}
          disabled={!reservable}
        >
          <ShoppingBag size={17} />
          {reservable ? t.buy : getCardStatusLabel(card, t)}
        </button>
        <button
          className="icon-action"
          type="button"
          onClick={() => onShare(card)}
          title={t.shareCard}
        >
          <Copy size={17} />
        </button>
      </div>
    </article>
  )
}

function Filters({
  query,
  setQuery,
  type,
  setType,
  rarity,
  setRarity,
  status,
  setStatus,
  sort,
  setSort,
  language,
  setLanguageFilter,
  grade,
  setGradeFilter,
  collectionTag,
  setCollectionTag,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  stockOnly,
  setStockOnly,
  cards,
  site,
  t,
}) {
  const types = [t.all, ...new Set(cards.map((card) => card.type))]
  const rarities = [t.allFeminine, ...new Set(cards.map((card) => card.rarity))]
  const languages = [t.all, ...new Set(cards.map((card) => card.language).filter(Boolean))]
  const grades = [t.all, ...new Set(cards.map((card) => card.grade).filter(Boolean))]
  const isFr = site.language === 'fr'
  const collectionOptions = [
    ['all', t.all],
    ['japanese', isFr ? 'Japonais' : 'Japanese'],
    ['graded', isFr ? 'GradÃ©e' : 'Graded'],
    ['vintage', 'Vintage'],
    ['promo', 'Promo'],
    ['favorite', isFr ? 'Coup de cÅ“ur' : 'Favorite'],
  ]
  const statuses = [
    [t.all, t.all],
    ['available', t.available],
    ['reserved', t.reserved],
    ['sold', t.sold],
  ]
  const sorts = [
    ['featured', t.sortFeatured],
    ['newest', t.sortNewest],
    ['priceAsc', t.sortPriceAsc],
    ['priceDesc', t.sortPriceDesc],
    ['rarity', t.sortRarity],
  ]

  return (
    <section className="filters" aria-label="Filtres du catalogue">
      <label className="searchbox">
        <Search size={18} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={site.copy[site.language].searchPlaceholder}
        />
      </label>
      <label>
        <SlidersHorizontal size={17} />
        <select value={type} onChange={(event) => setType(event.target.value)}>
          {types.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <label>
        <Sparkles size={17} />
        <select value={rarity} onChange={(event) => setRarity(event.target.value)}>
          {rarities.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <label>
        <PackageCheck size={17} />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          {statuses.map(([value, label]) => (
            <option value={value} key={value}>{label}</option>
          ))}
        </select>
      </label>
      <label>
        <BarChart3 size={17} />
        <select value={sort} onChange={(event) => setSort(event.target.value)}>
          {sorts.map(([value, label]) => (
            <option value={value} key={value}>{label}</option>
          ))}
        </select>
      </label>
      <label>
        <Globe2 size={17} />
        <select value={language} onChange={(event) => setLanguageFilter(event.target.value)}>
          {languages.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <label>
        <PackageCheck size={17} />
        <select value={grade} onChange={(event) => setGradeFilter(event.target.value)}>
          {grades.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <label>
        <Sparkles size={17} />
        <select value={collectionTag} onChange={(event) => setCollectionTag(event.target.value)}>
          {collectionOptions.map(([value, label]) => (
            <option value={value} key={value}>{label}</option>
          ))}
        </select>
      </label>
      <label>
        <CircleDollarSign size={17} />
        <input
          type="number"
          min="0"
          step="1"
          value={minPrice}
          onChange={(event) => setMinPrice(event.target.value)}
          placeholder={isFr ? 'Prix min' : 'Min price'}
        />
      </label>
      <label>
        <CircleDollarSign size={17} />
        <input
          type="number"
          min="0"
          step="1"
          value={maxPrice}
          onChange={(event) => setMaxPrice(event.target.value)}
          placeholder={isFr ? 'Prix max' : 'Max price'}
        />
      </label>
      <label className="toggle-filter">
        <input
          type="checkbox"
          checked={stockOnly}
          onChange={(event) => setStockOnly(event.target.checked)}
        />
        <span>{isFr ? 'Stock disponible' : 'In stock'}</span>
      </label>
    </section>
  )
}

function DetailPanel({ card, onAdd, t }) {
  if (!card) return null
  const reservable = isReservable(card)

  return (
    <aside className="detail-panel">
      <CardArt card={card} large />
      <div className="detail-copy">
        <h2>{card.name}</h2>
        <p>{card.set}</p>
      </div>
      <dl className="spec-grid">
        <div>
          <dt>{t.rarity}</dt>
          <dd>{card.rarity}</dd>
        </div>
        <div>
          <dt>{t.condition}</dt>
          <dd>{card.condition}</dd>
        </div>
        <div>
          <dt>{t.language}</dt>
          <dd>{card.language}</dd>
        </div>
        <div>
          <dt>{t.grade}</dt>
          <dd>{card.grade}</dd>
        </div>
      </dl>
      {card.flaws && (
        <p className="card-flaws">
          <strong>DÃ©fauts visibles</strong>
          {card.flaws}
        </p>
      )}
      <div className="buy-row">
        <strong>{formatMoney(card.price)}</strong>
        <button type="button" onClick={() => onAdd(card.id)} disabled={!reservable}>
          <ShoppingBag size={18} />
          {reservable ? t.buy : getCardStatusLabel(card, t)}
        </button>
      </div>
      {getCardStatus(card) === 'reserved' && card.reservedUntil && (
        <p className="panel-note">{t.reservedUntil} {formatDateTime(card.reservedUntil)}</p>
      )}
    </aside>
  )
}

function CartPanel({
  cart,
  cards,
  updateQty,
  removeItem,
  checkout,
  checkoutDraft,
  setCheckoutDraft,
  site,
  t,
}) {
  const lines = cart
    .map((item) => ({ ...item, card: cards.find((card) => card.id === item.id) }))
    .filter((item) => item.card)
  const subtotal = lines.reduce((sum, item) => sum + item.card.price * item.qty, 0)

  return (
    <aside className="cart-panel">
      <div className="panel-title">
        <h2>{t.cart}</h2>
        <span>{lines.length} ligne(s)</span>
      </div>
      <div className="cart-lines">
        {lines.length === 0 ? (
          <p className="empty">{site.copy[site.language].emptyCart}</p>
        ) : (
          lines.map((item) => (
            <div className="cart-line" key={item.id}>
              <div>
                <strong>{item.card.name}</strong>
                <span>{formatMoney(item.card.price)}</span>
              </div>
              <div className="qty">
                <button type="button" onClick={() => updateQty(item.id, item.qty - 1)}>
                  <Minus size={14} />
                </button>
                <span>{item.qty}</span>
                <button type="button" onClick={() => updateQty(item.id, item.qty + 1)}>
                  <Plus size={14} />
                </button>
                <button type="button" onClick={() => removeItem(item.id)} title={t.remove}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="totals">
        <span>{t.subtotal} <b>{formatMoney(subtotal)}</b></span>
        <strong>{t.total} {formatMoney(subtotal)}</strong>
      </div>
      {lines.length > 0 && (
        <form className="checkout-form" onSubmit={checkout}>
          <div>
            <h3>{site.copy[site.language].checkoutTitle}</h3>
            <p>{site.copy[site.language].checkoutIntro}</p>
          </div>
          <Field label={t.fullName}>
            <TextInput
              value={checkoutDraft.fullName}
              onChange={(value) => setCheckoutDraft({ ...checkoutDraft, fullName: value })}
            />
          </Field>
          <Field label={t.email}>
            <TextInput
              type="email"
              value={checkoutDraft.email}
              onChange={(value) => setCheckoutDraft({ ...checkoutDraft, email: value })}
            />
          </Field>
          <Field label={t.phone}>
            <TextInput
              value={checkoutDraft.phone}
              onChange={(value) => setCheckoutDraft({ ...checkoutDraft, phone: value })}
            />
          </Field>
          <Field label={t.sellerMessage}>
            <textarea
              value={checkoutDraft.message}
              placeholder={site.copy[site.language].reservationMessagePlaceholder}
              onChange={(event) => setCheckoutDraft({ ...checkoutDraft, message: event.target.value })}
            />
          </Field>
          <p className="payment-note">
            <strong>{site.copy[site.language].paymentMode}</strong>
            {site.copy[site.language].paymentNote}
          </p>
          <button
            className="checkout"
            type="submit"
            disabled={
              !checkoutDraft.fullName ||
              !checkoutDraft.email ||
              !checkoutDraft.message
            }
          >
            <Send size={18} />
            {t.checkout}
          </button>
        </form>
      )}
      <p className="panel-note">{site.copy[site.language].footerNote}</p>
    </aside>
  )
}

function ShopView(props) {
  const copy = props.site.copy[props.site.language]
  return (
    <main className="shop-layout">
      <section className="catalog">
        <div className="hero-copy">
          <div>
            <h1>{copy.heroTitle}</h1>
            <p>{copy.heroSubtitle}</p>
          </div>
          <div className="hero-actions">
            <button type="button" onClick={() => props.setView('highlights')}>
              <Sparkles size={18} />
              {props.t.highlights}
            </button>
            <button className="secondary-button" type="button" onClick={() => props.setView('vintageJapanese')}>
              {props.t.vintageJapanese}
            </button>
          </div>
        </div>
        <Filters {...props.filters} cards={props.cards} site={props.site} t={props.t} />
        <div className="product-grid">
          {props.filteredCards.map((card) => (
            <ProductCard
              key={card.id}
              card={card}
              selected={props.selected?.id === card.id}
              onSelect={props.openCardPage}
              onAdd={props.addToCart}
              onShare={props.copyCardLink}
              t={props.t}
            />
          ))}
        </div>
        <TrustSection site={props.site} />
        <ReservationGuide site={props.site} />
      </section>
      <section className="side-stack">
        <DetailPanel card={props.selected} onAdd={props.addToCart} t={props.t} />
        <CartPanel
          cart={props.cart}
          cards={props.cards}
          updateQty={props.updateQty}
          removeItem={props.removeItem}
          checkout={props.checkout}
          checkoutDraft={props.checkoutDraft}
          setCheckoutDraft={props.setCheckoutDraft}
          site={props.site}
          t={props.t}
        />
      </section>
    </main>
  )
}

function CardsView({ cards, allCards, filters, openCardPage, addToCart, copyCardLink, site, t }) {
  return (
    <main className="simple-page">
      <div className="page-heading">
        <h1>{t.cards}</h1>
        <p>{site.copy[site.language].cardsIntro}</p>
      </div>
      <TrustSection site={site} />
      {filters && <Filters {...filters} cards={allCards} site={site} t={t} />}
      <div className="inventory-list">
        {cards.map((card) => {
          const badges = getCardBadges(card)

          return (
            <button
              className={!isReservable(card) ? 'inventory-row reserved' : 'inventory-row'}
              key={card.id}
              type="button"
              onClick={() => openCardPage(card)}
            >
              <CardArt card={card} />
              <span className="inventory-copy">
                {badges.length > 0 && (
                  <span className="inventory-badges">
                    {badges.map((badge) => <span className="card-badge" key={badge}>{badge}</span>)}
                  </span>
                )}
                <strong>{card.name}</strong>
                <small>{card.set} - {card.rarity}</small>
              </span>
              <span className="inventory-price">{formatMoney(card.price)}</span>
              <span className="inventory-stock">
                {isReservable(card) ? `${card.stock} en stock` : getCardStatusLabel(card, t)}
              </span>
              <span
                className="inventory-add"
                aria-disabled={!isReservable(card)}
                onClick={(event) => {
                  event.stopPropagation()
                  if (!isReservable(card)) return
                  addToCart(card.id)
                }}
              >
                <Plus size={16} />
              </span>
              <span
                className="inventory-share"
                onClick={(event) => {
                  event.stopPropagation()
                  copyCardLink(card)
                }}
                title={t.shareCard}
              >
                <Copy size={16} />
              </span>
            </button>
          )
        })}
      </div>
    </main>
  )
}

function CardDetailPage({ card, addToCart, setView, site, t, copyCardLink }) {
  if (!card) {
    return (
      <main className="simple-page">
        <div className="empty-state">
          <PackageCheck size={28} />
          <strong>Carte introuvable</strong>
          <p>Retourne Ã  la boutique pour choisir une carte disponible.</p>
          <button className="checkout" type="button" onClick={() => setView('shop')}>
            Boutique
          </button>
        </div>
      </main>
    )
  }

  const reservable = isReservable(card)
  const badges = getCardBadges(card)
  const images = getCardImages(card)

  return (
    <main className="card-detail-page">
      <section className="card-detail-hero">
        <CardPhotoGallery card={card} images={images} />
        <div className="card-detail-copy">
          <button className="text-button" type="button" onClick={() => setView('shop')}>
            â† Retour boutique
          </button>
          {badges.length > 0 && (
            <span className="badge-row">
              {badges.map((badge) => <span className="card-badge" key={badge}>{badge}</span>)}
            </span>
          )}
          <span className="status">{getCardStatusLabel(card, t)}</span>
          <h1>{card.name}</h1>
          <p>{card.set}</p>
          <strong>{formatMoney(card.price)}</strong>
          <span className="price-mode">{card.negotiable ? 'Prix nÃ©gociable' : 'Prix ferme'}</span>
          <div className="card-detail-actions">
            <button className="checkout" type="button" onClick={() => addToCart(card.id)} disabled={!reservable}>
              <ShoppingBag size={18} />
              {reservable ? t.buy : getCardStatusLabel(card, t)}
            </button>
            <button className="secondary-button" type="button" onClick={() => copyCardLink(card)}>
              <Copy size={17} />
              {t.shareCard}
            </button>
          </div>
        </div>
      </section>
      <section className="card-detail-grid">
        <article>
          <h2>Informations</h2>
          <dl className="spec-grid">
            <div>
              <dt>{t.rarity}</dt>
              <dd>{card.rarity}</dd>
            </div>
            <div>
              <dt>{t.condition}</dt>
              <dd>{card.condition}</dd>
            </div>
            <div>
              <dt>{t.language}</dt>
              <dd>{card.language}</dd>
            </div>
            <div>
              <dt>{t.grade}</dt>
              <dd>{card.grade}</dd>
            </div>
            <div>
              <dt>Date dâ€™ajout</dt>
              <dd>{card.addedAt ? new Date(card.addedAt).toLocaleDateString('fr-FR') : '-'}</dd>
            </div>
            <div>
              <dt>Tags</dt>
              <dd>{card.tags || '-'}</dd>
            </div>
            <div>
              <dt>Prix</dt>
              <dd>{card.negotiable ? 'NÃ©gociable' : 'Ferme'}</dd>
            </div>
          </dl>
        </article>
        <article>
          <h2>Descriptif</h2>
          <p>{card.description || 'Description dÃ©taillÃ©e Ã  complÃ©ter depuis le panel admin.'}</p>
          <p>{card.flaws || 'Aucun dÃ©faut majeur signalÃ©.'}</p>
          <p>{site.copy[site.language].paymentNote}</p>
        </article>
      </section>
      <section className="trust-grid legacy-detail-trust" aria-hidden="true">
        <article>
          <Check size={18} />
          <strong>AuthenticitÃ© vÃ©rifiÃ©e</strong>
          <p>Chaque carte est contrÃ´lÃ©e avant publication, avec grade, langue et Ã©tat indiquÃ©s clairement.</p>
        </article>
        <article>
          <Eye size={18} />
          <strong>Ã‰tat transparent</strong>
          <p>Les dÃ©fauts visibles sont indiquÃ©s sur la fiche pour Ã©viter les mauvaises surprises.</p>
        </article>
        <article>
          <PackageCheck size={18} />
          <strong>ExpÃ©dition protÃ©gÃ©e</strong>
          <p>Envoi suivi depuis la France avec protection rigide adaptÃ©e aux cartes de collection.</p>
        </article>
      </section>
      <TrustSection site={site} />
      <ReservationGuide site={site} />
    </main>
  )
}

function ReservationSuccessPage({ reservation, setView, site, t }) {
  if (!reservation) {
    return (
      <main className="simple-page">
        <div className="empty-state">
          <PackageCheck size={28} />
          <strong>{t.orders}</strong>
          <p>{site.copy[site.language].emptyOrders}</p>
          <button className="checkout" type="button" onClick={() => setView('shop')}>
            {t.continueShopping}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="simple-page">
      <section className="confirmation-panel">
        <PackageCheck size={34} />
        <span>{reservation.id}</span>
        <h1>{t.reservationSuccessTitle}</h1>
        <p>{t.reservationSuccessIntro}</p>
        <dl className="spec-grid">
          <div>
            <dt>{t.customer}</dt>
            <dd>{reservation.customer}</dd>
          </div>
          <div>
            <dt>{t.total}</dt>
            <dd>{formatMoney(reservation.total)}</dd>
          </div>
          <div>
            <dt>{t.items}</dt>
            <dd>{reservation.items}</dd>
          </div>
          <div>
            <dt>{t.reservedUntil}</dt>
            <dd>{formatDateTime(reservation.reservedUntil)}</dd>
          </div>
        </dl>
        <div className="confirmation-actions">
          <button className="checkout" type="button" onClick={() => setView('shop')}>
            {t.continueShopping}
          </button>
          <button className="secondary-button" type="button" onClick={() => setView('orders')}>
            {t.viewReservations}
          </button>
        </div>
      </section>
    </main>
  )
}

function CollectionPage({ title, intro, cards, openCardPage, addToCart, copyCardLink, site, t }) {
  return (
    <main className="simple-page">
      <div className="page-heading">
        <h1>{title}</h1>
        <p>{intro}</p>
      </div>
      <div className="product-grid collection-grid">
        {cards.map((card) => (
          <ProductCard
            key={card.id}
            card={card}
            selected={false}
            onSelect={openCardPage}
            onAdd={addToCart}
            onShare={copyCardLink}
            t={t}
          />
        ))}
      </div>
      {cards.length === 0 && <p className="empty">{site.copy[site.language].emptyCart}</p>}
    </main>
  )
}

function CardPhotoGallery({ card, images }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)
  const activeImage = images[activeIndex]

  if (images.length === 0) {
    return <CardArt card={card} large />
  }

  function selectImage(index) {
    setActiveIndex(index)
  }

  function move(direction) {
    setActiveIndex((current) => (current + direction + images.length) % images.length)
  }

  return (
    <section className="photo-gallery" aria-label="Photos de la carte">
      <button className="photo-main" type="button" onClick={() => setZoomOpen(true)}>
        <img src={activeImage} alt={`${card.name} - photo ${activeIndex + 1}`} />
        <span>Zoomer</span>
      </button>
      {images.length > 1 && (
        <div className="photo-thumbs" aria-label="Choisir une photo">
          {images.map((image, index) => (
            <button
              className={index === activeIndex ? 'active' : ''}
              key={image}
              type="button"
              onClick={() => selectImage(index)}
            >
              <img src={image} alt={`${card.name} miniature ${index + 1}`} loading="lazy" decoding="async" />
              <span>{index === 0 ? 'Principale' : `Photo ${index + 1}`}</span>
            </button>
          ))}
        </div>
      )}
      {zoomOpen && (
        <div className="zoom-modal" role="dialog" aria-modal="true" aria-label="Zoom photo carte">
          <button className="zoom-close" type="button" onClick={() => setZoomOpen(false)}>Fermer</button>
          {images.length > 1 && (
            <button className="zoom-nav previous" type="button" onClick={() => move(-1)} aria-label="Photo prÃ©cÃ©dente">
              <ArrowLeft size={22} />
            </button>
          )}
          <img src={activeImage} alt={`${card.name} zoom ${activeIndex + 1}`} />
          {images.length > 1 && (
            <button className="zoom-nav next" type="button" onClick={() => move(1)} aria-label="Photo suivante">
              <ArrowRight size={22} />
            </button>
          )}
          <span className="zoom-count">{activeIndex + 1} / {images.length}</span>
        </div>
      )}
    </section>
  )
}

function TrustSection({ site }) {
  const isFr = site.language === 'fr'
  const items = isFr
    ? [
        ['Comment fonctionne la rÃ©servation', 'Tu ajoutes les cartes souhaitÃ©es, tu envoies ta demande, puis elles passent en rÃ©servÃ© pendant le dÃ©lai indiquÃ©.'],
        ['Paiement aprÃ¨s validation vendeur', 'Aucun paiement en ligne. Le vendeur vÃ©rifie le stock, lâ€™Ã©tat et les dÃ©tails avant de te recontacter.'],
        ['ExpÃ©dition protÃ©gÃ©e', 'Envoi suivi depuis la France, protection rigide et emballage adaptÃ© aux cartes de collection.'],
        ['Ã‰tat des cartes transparent', 'Langue, grade, raretÃ© et dÃ©fauts visibles sont indiquÃ©s sur chaque fiche carte.'],
      ]
    : [
        ['How reservation works', 'Add the cards you want, submit your request, then the cards are marked as reserved for the displayed period.'],
        ['Payment after seller approval', 'No online payment. The seller checks stock, condition, and details before contacting you.'],
        ['Protected shipping', 'Tracked shipping from France with rigid protection for collectible cards.'],
        ['Transparent card condition', 'Language, grade, rarity, and visible flaws are listed on each card page.'],
      ]

  return (
    <section className="trust-panel">
      <div className="panel-title">
        <h2>{isFr ? 'RÃ©server en confiance' : 'Reserve with confidence'}</h2>
        <span>{site.copy[site.language].paymentMode}</span>
      </div>
      <div className="trust-grid">
        {items.map(([title, text]) => (
          <article key={title}>
            <Check size={18} />
            <strong>{title}</strong>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function ReservationGuide({ site }) {
  const isFr = site.language === 'fr'
  const items = isFr
    ? [
        ['DÃ©lai de rÃ©ponse', 'RÃ©ponse gÃ©nÃ©ralement sous 24 Ã  48 h aprÃ¨s ta demande.'],
        ['Paiement aprÃ¨s validation', 'Aucun paiement direct sur le site. Le moyen de paiement est confirmÃ© avec le vendeur.'],
        ['ExpÃ©dition', 'Envoi suivi depuis la France avec protection rigide adaptÃ©e aux cartes.'],
        ['Assurance', 'Assurance possible selon la valeur et le transporteur choisi.'],
        ['Remise en main propre', 'Possible uniquement aprÃ¨s accord avec le vendeur.'],
      ]
    : [
        ['Response time', 'Usually within 24 to 48 hours after your request.'],
        ['Payment after approval', 'No direct website payment. Payment method is confirmed with the seller.'],
        ['Shipping', 'Tracked shipping from France with rigid card protection.'],
        ['Insurance', 'Insurance available depending on value and selected carrier.'],
        ['Local pickup', 'Available only after seller approval.'],
      ]

  return (
    <section className="reservation-guide">
      <div className="panel-title">
        <h2>{isFr ? 'RÃ©servation claire' : 'Clear reservation'}</h2>
        <span>{site.copy[site.language].paymentMode}</span>
      </div>
      <div className="guide-grid">
        {items.map(([title, text]) => (
          <article key={title}>
            <PackageCheck size={18} />
            <strong>{title}</strong>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function OrdersView({ orders, site, t }) {
  return (
    <main className="simple-page">
      <div className="page-heading">
        <h1>{t.orders}</h1>
        <p>{site.copy[site.language].ordersIntro}</p>
      </div>
      <OrderTable orders={orders} t={t} />
    </main>
  )
}

function SellRequestForm({ draft, setDraft, submitRequest, site, t }) {
  return (
    <form className="sell-form" onSubmit={submitRequest}>
      <h2>{site.copy[site.language].sellTitle}</h2>
      <div className="settings-grid">
        <Field label={t.fullName}>
          <TextInput value={draft.fullName} onChange={(value) => setDraft({ ...draft, fullName: value })} />
        </Field>
        <Field label={t.email}>
          <TextInput type="email" value={draft.email} onChange={(value) => setDraft({ ...draft, email: value })} />
        </Field>
        <Field label={t.phone}>
          <TextInput value={draft.phone} onChange={(value) => setDraft({ ...draft, phone: value })} />
        </Field>
      </div>
      <Field label="Cartes proposÃ©es">
        <textarea
          value={draft.cardList}
          onChange={(event) => setDraft({ ...draft, cardList: event.target.value })}
          placeholder="Dracaufeu, Noctali, cartes gradÃ©es, langue, Ã©tat..."
        />
      </Field>
      <div className="form-pair">
        <Field label="Ã‰tat gÃ©nÃ©ral">
          <TextInput value={draft.condition} onChange={(value) => setDraft({ ...draft, condition: value })} />
        </Field>
        <Field label="Prix souhaitÃ©">
          <TextInput value={draft.expectedPrice} onChange={(value) => setDraft({ ...draft, expectedPrice: value })} />
        </Field>
      </div>
      <button
        className="checkout"
        type="submit"
        disabled={!draft.fullName || !draft.email || !draft.cardList}
      >
        <FileText size={18} />
        Envoyer la demande
      </button>
    </form>
  )
}

function InfoPage({ type, site, t, sellDraft, setSellDraft, submitSellRequest }) {
  const copy = site.copy[site.language]
  const pageMap = {
    sell: {
      title: copy.sellTitle,
      intro: copy.sellIntro,
      points: [copy.sellStepOne, copy.sellStepTwo, copy.sellStepThree],
    },
    about: {
      title: copy.aboutTitle,
      intro: copy.aboutIntro,
      points: [copy.trustTitle, copy.trustIntro, copy.footerNote],
    },
    contact: {
      title: copy.contactTitle,
      intro: copy.contactIntro,
      points: [site.contactEmail, copy.footerNote, copy.privacy],
    },
    legal: {
      title: copy.legalTitle,
      intro: copy.legalIntro,
      points: [copy.legalNotice, copy.terms, copy.privacy, copy.returns],
    },
  }
  const page = pageMap[type]

  return (
    <main className="simple-page info-page">
      <div className="page-heading">
        <h1>{page.title}</h1>
        <p>{page.intro}</p>
      </div>
      <section className="info-grid">
        {page.points.map((point, index) => (
          <article className="info-card" key={point}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <p>{point}</p>
          </article>
        ))}
      </section>
      {type === 'sell' && (
        <SellRequestForm
          draft={sellDraft}
          setDraft={setSellDraft}
          submitRequest={submitSellRequest}
          site={site}
          t={t}
        />
      )}
    </main>
  )
}

function SiteFooter({ site, setView, t }) {
  return (
    <footer className="site-footer">
      <div>
        <strong>{site.brandName}</strong>
        <span>{site.copy[site.language].footerNote}</span>
      </div>
      <nav aria-label="Navigation secondaire">
        <button type="button" onClick={() => setView('about')}>{t.about}</button>
        <button type="button" onClick={() => setView('contact')}>{t.contact}</button>
        <button type="button" onClick={() => setView('legal')}>{t.legal}</button>
        <button type="button" onClick={() => setView('admin')}>{t.admin}</button>
      </nav>
      <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
    </footer>
  )
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="stat-card">
      <span className={tone}>
        <Icon size={20} />
      </span>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  )
}

function Field({ label, children, className = '' }) {
  return (
    <div className={`field ${className}`.trim()}>
      <span>{label}</span>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, type = 'text', step, min, placeholder }) {
  return (
    <input
      type={type}
      step={step}
      min={min}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}

function imageFileToWebpBlob(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null)
      return
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Image impossible Ã  lire.'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('Format image non reconnu.'))
      image.onload = () => {
        const maxSide = 1200
        const ratio = Math.min(1, maxSide / Math.max(image.width, image.height))
        const width = Math.max(1, Math.round(image.width * ratio))
        const height = Math.max(1, Math.round(image.height * ratio))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const context = canvas.getContext('2d')
        context.drawImage(image, 0, 0, width, height)
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Compression image impossible.'))
            return
          }
          resolve(blob)
        }, 'image/webp', 0.82)
      }
      image.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Image impossible Ã  prÃ©parer.'))
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}

function isInlineImage(image) {
  return typeof image === 'string' && image.startsWith('data:image/')
}

async function inlineImageToStoredUrl(image, name) {
  const response = await fetch(image)
  const blob = await response.blob()
  const uploadResult = await uploadCardImage(blob, name)
  if (uploadResult.url) return uploadResult.url
  if (uploadResult.storageEnabled === false) return image
  throw new Error(uploadResult.error?.message || 'Upload Supabase impossible. VÃ©rifie le bucket card-images.')
}

async function prepareCardsForSave(cards) {
  const preparedCards = []
  for (const card of cards) {
    const images = getCardImages(card)
    const preparedImages = []
    for (let index = 0; index < images.length; index += 1) {
      const image = images[index]
      preparedImages.push(
        isInlineImage(image)
          ? await inlineImageToStoredUrl(image, `${card.name || 'carte'}-${index + 1}`)
          : image,
      )
    }
    preparedCards.push({
      ...card,
      imageUrl: preparedImages[0] || '',
      imageUrls: preparedImages,
    })
  }
  return preparedCards
}

function ImageUploader({ value, onChange, name }) {
  const [error, setError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const images = Array.isArray(value) ? value : [value].filter(Boolean)

  async function uploadImage(event) {
    const files = [...(event.target.files || [])]
    event.target.value = ''
    if (files.length === 0) return
    if (files.some((file) => !file.type.startsWith('image/'))) {
      setError('Choisis un fichier image.')
      return
    }
    try {
      setError('')
      setIsUploading(true)
      const uploadedImages = []
      for (const file of files) {
        const blob = await imageFileToWebpBlob(file)
        const uploadResult = await uploadCardImage(blob, `${name || 'carte'}-${file.name}`)
        if (uploadResult.url) {
          uploadedImages.push(uploadResult.url)
        } else if (uploadResult.storageEnabled === false) {
          uploadedImages.push(await blobToDataUrl(blob))
        } else {
          throw new Error(uploadResult.error?.message || 'Upload Supabase impossible. VÃ©rifie le bucket card-images.')
        }
      }
      onChange([...images, ...uploadedImages])
    } catch (uploadError) {
      setError(uploadError.message)
    } finally {
      setIsUploading(false)
    }
  }

  function removeImage(indexToRemove) {
    onChange(images.filter((_, index) => index !== indexToRemove))
  }

  function moveImage(fromIndex, direction) {
    const toIndex = fromIndex + direction
    if (toIndex < 0 || toIndex >= images.length) return
    const nextImages = [...images]
    const [movedImage] = nextImages.splice(fromIndex, 1)
    nextImages.splice(toIndex, 0, movedImage)
    onChange(nextImages)
  }

  return (
    <div className="image-uploader">
      <div className={images.length > 0 ? 'image-uploader-preview has-images' : 'image-uploader-preview'}>
        {images.length > 0 ? (
          images.map((image, index) => (
            <figure key={image}>
              <img src={image} alt={`${name || 'Carte'} ${index + 1}`} />
              <figcaption>{index === 0 ? 'Principale' : `Photo ${index + 1}`}</figcaption>
              <div className="image-order-actions">
                <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} title="DÃ©placer avant">
                  <ArrowLeft size={13} />
                </button>
                <button type="button" onClick={() => moveImage(index, 1)} disabled={index === images.length - 1} title="DÃ©placer aprÃ¨s">
                  <ArrowRight size={13} />
                </button>
                <button type="button" onClick={() => removeImage(index)} title="Retirer cette photo">
                  <Trash2 size={13} />
                </button>
              </div>
            </figure>
          ))
        ) : (
          <span>Aucune image</span>
        )}
      </div>
      <div className="image-uploader-actions">
        <label className="file-button">
          <Upload size={15} />
          {isUploading ? 'Envoi des photos...' : 'Importer une ou plusieurs photos'}
          <input type="file" accept="image/*" multiple onChange={uploadImage} disabled={isUploading} />
        </label>
        {images.length > 0 && (
          <button type="button" onClick={() => onChange([])}>
            <Trash2 size={14} />
            Tout retirer
          </button>
        )}
      </div>
      <small>Photos compressÃ©es automatiquement. La premiÃ¨re photo est utilisÃ©e comme image principale.</small>
      {error && <small className="form-error">{error}</small>}
    </div>
  )
}

function CardClassificationEditor({ card, onChange }) {
  const options = [
    ['isJapanese', 'Carte japonaise'],
    ['isVintage', 'Carte ancienne / vintage'],
    ['isGraded', 'Carte gradÃ©e'],
    ['isPromo', 'Promo'],
  ]

  return (
    <div className="checkbox-grid">
      {options.map(([field, label]) => (
        <label className="check-field" key={field}>
          <input
            type="checkbox"
            checked={Boolean(card[field])}
            onChange={(event) => onChange(field, event.target.checked)}
          />
          <span>{label}</span>
        </label>
      ))}
    </div>
  )
}

function OrderTable({ orders, updateOrderStatus, updateOrderNote, releaseReservation, t }) {
  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <PackageCheck size={28} />
        <strong>{t.orders}</strong>
        <p>{t.emptyOrders}</p>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{t.orders}</th>
            <th>{t.customer}</th>
            <th>{t.date}</th>
            <th>{t.items}</th>
            <th>{t.total}</th>
            <th>{t.sellerMessage}</th>
            <th>Expiration</th>
            <th>{t.status}</th>
            {updateOrderStatus && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>
                <strong>{order.customer}</strong>
                <span>{order.email}</span>
                {order.phone && <span>{order.phone}</span>}
              </td>
              <td>{order.date}</td>
              <td>
                {order.lines?.length ? (
                  <span className="reservation-lines">
                    {order.lines.map((line) => `${line.qty} x ${line.name}`).join(', ')}
                  </span>
                ) : (
                  order.items
                )}
              </td>
              <td>{formatMoney(order.total)}</td>
              <td>
                <span className="reservation-message">{order.message || order.paymentNote || '-'}</span>
                {order.notificationNote && <small>{order.notificationNote}</small>}
              </td>
              <td>{order.reservedUntil ? formatDateTime(order.reservedUntil) : '-'}</td>
              <td>
                {updateOrderStatus ? (
                  <select
                    value={normalizeStatus(order.status)}
                    onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                  >
                    {reservationStatusOptions.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                ) : (
                  <span className="status">{normalizeStatus(order.status)}</span>
                )}
              </td>
              {updateOrderStatus && (
                <td>
                  <div className="admin-row-actions">
                    <button type="button" onClick={() => navigator.clipboard?.writeText(order.email)}>
                      <Copy size={14} />
                      {t.copyEmail}
                    </button>
                    <a href={`mailto:${order.email}?subject=Votre rÃ©servation ${order.id}`}>
                      <Mail size={14} />
                      {t.reply}
                    </a>
                    <button type="button" onClick={() => releaseReservation(order.id)}>
                      <PackageCheck size={14} />
                      {t.release}
                    </button>
                  </div>
                  <Field label={t.privateNote}>
                    <textarea
                      value={order.privateNote || ''}
                      onChange={(event) => updateOrderNote(order.id, event.target.value)}
                    />
                  </Field>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SellRequestsTable({ sellRequests, updateSellRequestStatus, t }) {
  if (sellRequests.length === 0) {
    return (
      <div className="empty-state">
        <FileText size={28} />
        <strong>{t.sellRequests}</strong>
        <p>{t.emptySellRequests}</p>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Demande</th>
            <th>{t.customer}</th>
            <th>Cartes</th>
            <th>Prix souhaitÃ©</th>
            <th>{t.status}</th>
          </tr>
        </thead>
        <tbody>
          {sellRequests.map((request) => (
            <tr key={request.id}>
              <td>{request.id}</td>
              <td>
                <strong>{request.fullName}</strong>
                <span>{request.email}</span>
              </td>
              <td>{request.cardList}</td>
              <td>{request.expectedPrice || '-'}</td>
              <td>
                <select
                  value={request.status}
                  onChange={(event) => updateSellRequestStatus(request.id, event.target.value)}
                >
                  <option>Nouvelle</option>
                  <option>Estimation envoyÃ©e</option>
                  <option>AcceptÃ©e</option>
                  <option>RefusÃ©e</option>
                  <option>ArchivÃ©e</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ProductEditor({ cards, persistCards, removeCardById, t }) {
  const [draftCards, setDraftCards] = useState(cards)
  const [deletedIds, setDeletedIds] = useState([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [productQuery, setProductQuery] = useState('')
  const [productStatus, setProductStatus] = useState('all')
  const [productCategory, setProductCategory] = useState('all')
  const [productSort, setProductSort] = useState('newest')
  const [draft, setDraft] = useState({
    name: '',
    set: '',
    rarity: 'Holo rare',
    type: 'Feu',
    condition: 'Near Mint',
    language: 'FR',
    grade: 'Raw',
    price: '39.90',
    stock: '1',
    color: '#e84842',
    status: 'available',
    imageUrl: '',
    imageUrls: [],
    description: '',
    flaws: '',
    privateNote: '',
    badge: '',
    tags: '',
    addedAt: new Date().toISOString().slice(0, 10),
    featured: false,
    isJapanese: false,
    isVintage: false,
    isGraded: false,
    isPromo: false,
    reserved: false,
    negotiable: false,
  })

  const visibleDraftCards = useMemo(() => {
    const normalized = productQuery.toLowerCase().trim()
    return [...draftCards]
      .filter((card) => {
        const signals = getCollectionSignals(card)
        const matchQuery = !normalized || getCardSearchText(card).includes(normalized)
        const matchStatus = productStatus === 'all' || getCardStatus(card) === productStatus
        const matchCategory = productCategory === 'all' || Boolean(signals[productCategory])
        return matchQuery && matchStatus && matchCategory
      })
      .sort((a, b) => {
        if (productSort === 'priceDesc') return Number(b.price) - Number(a.price)
        if (productSort === 'priceAsc') return Number(a.price) - Number(b.price)
        if (productSort === 'name') return `${a.name}`.localeCompare(`${b.name}`)
        return new Date(b.addedAt || 0) - new Date(a.addedAt || 0)
      })
  }, [draftCards, productCategory, productQuery, productSort, productStatus])

  useEffect(() => {
    if (!hasUnsavedChanges) {
      setDraftCards(cards)
      setDeletedIds([])
    }
  }, [cards, hasUnsavedChanges])

  function markEdited(nextCards) {
    setDraftCards(nextCards)
    setHasUnsavedChanges(true)
    setSaveMessage('')
  }

  function updateCard(id, field, value) {
    const numeric = ['price', 'stock'].includes(field)
    markEdited(draftCards.map((card) => {
      if (card.id !== id) return card
      if (field === 'imageUrls') {
        return { ...card, imageUrls: value, imageUrl: value[0] || '' }
      }
      return { ...card, [field]: numeric ? Number(value) : value }
    }))
  }

  function addCard(event) {
    event.preventDefault()
    if (!draft.name.trim() || !draft.set.trim()) return
    const nextCard = {
      ...draft,
      id: `kc-${Date.now()}`,
      price: Number(draft.price),
      stock: Number(draft.stock),
      imageUrl: getCardImages(draft)[0] || '',
      imageUrls: getCardImages(draft),
      status: 'available',
      reserved: false,
      featured: Boolean(draft.featured),
    }
    markEdited([nextCard, ...draftCards])
    setDraft((current) => ({
      ...current,
      name: '',
      set: '',
      price: '39.90',
      stock: '1',
      imageUrl: '',
      imageUrls: [],
      description: '',
      flaws: '',
      privateNote: '',
      tags: '',
      badge: '',
      negotiable: false,
    }))
  }

  function removeCard(id) {
    markEdited(draftCards.filter((card) => card.id !== id))
    if (cards.some((card) => card.id === id)) {
      setDeletedIds((current) => [...new Set([...current, id])])
    }
  }

  async function saveProducts() {
    setIsSaving(true)
    setSaveMessage('')

    let cardsToSave = draftCards
    try {
      cardsToSave = await prepareCardsForSave(draftCards)
    } catch (error) {
      setIsSaving(false)
      setSaveMessage(`Photos non sauvegardÃ©es : ${error.message}`)
      return
    }

    setDraftCards(cardsToSave)

    const result = await persistCards(cardsToSave)
    if (result?.saved === false) {
      setIsSaving(false)
      setSaveMessage(`Sauvegarde impossible : ${result.error?.message || 'vÃ©rifie Supabase puis rÃ©essaie.'}`)
      return
    }

    const deleteResults = await Promise.all(deletedIds.map((id) => removeCardById(id)))
    const failedDelete = deleteResults.find((result) => result && result.deleted === false && result.error)
    if (failedDelete) {
      setIsSaving(false)
      setSaveMessage(`Suppression impossible : ${failedDelete.error.message}`)
      return
    }

    if (deletedIds.length > 0) {
      await persistCards(cardsToSave)
    }

    setIsSaving(false)
    setDeletedIds([])
    setHasUnsavedChanges(false)
    setSaveMessage('Produits sauvegardÃ©s.')
  }

  function cancelProductChanges() {
    setDraftCards(cards)
    setDeletedIds([])
    setHasUnsavedChanges(false)
    setSaveMessage('')
  }

  return (
    <section className="admin-panel">
      <div className="panel-title admin-panel-title">
        <h2>Produits</h2>
        <span>Modifie toutes les informations visibles sur les cartes.</span>
      </div>
      <div className="admin-save-bar">
        <span>{saveMessage || (hasUnsavedChanges ? 'Modifications non sauvegardÃ©es' : 'Tous les produits sont sauvegardÃ©s')}</span>
        <div>
          <button type="button" onClick={cancelProductChanges} disabled={!hasUnsavedChanges || isSaving}>
            Annuler
          </button>
          <button className="checkout" type="button" onClick={saveProducts} disabled={!hasUnsavedChanges || isSaving}>
            <Save size={16} />
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder les produits'}
          </button>
        </div>
      </div>
      <form className="admin-form wide-form" onSubmit={addCard}>
        <Field label="Nom">
          <TextInput value={draft.name} onChange={(value) => setDraft({ ...draft, name: value })} />
        </Field>
        <Field label="Set">
          <TextInput value={draft.set} onChange={(value) => setDraft({ ...draft, set: value })} />
        </Field>
        <Field label="RaretÃ©">
          <TextInput value={draft.rarity} onChange={(value) => setDraft({ ...draft, rarity: value })} />
        </Field>
        <Field label="Type">
          <TextInput value={draft.type} onChange={(value) => setDraft({ ...draft, type: value })} />
        </Field>
        <Field label="Ã‰tat">
          <TextInput value={draft.condition} onChange={(value) => setDraft({ ...draft, condition: value })} />
        </Field>
        <Field label="Langue">
          <TextInput value={draft.language} onChange={(value) => setDraft({ ...draft, language: value })} />
        </Field>
        <Field label="Grade">
          <TextInput value={draft.grade} onChange={(value) => setDraft({ ...draft, grade: value })} />
        </Field>
        <Field label="Prix">
          <TextInput type="number" step="0.01" value={draft.price} onChange={(value) => setDraft({ ...draft, price: value })} />
        </Field>
        <Field label="Stock">
          <TextInput type="number" min="0" value={draft.stock} onChange={(value) => setDraft({ ...draft, stock: value })} />
        </Field>
        <Field label="Couleur">
          <input type="color" value={draft.color} onChange={(event) => setDraft({ ...draft, color: event.target.value })} />
        </Field>
        <Field label="Badge">
          <select value={draft.badge} onChange={(event) => setDraft({ ...draft, badge: event.target.value })}>
            <option value="">Aucun</option>
            <option>Nouveau</option>
            <option>Coup de cÅ“ur</option>
          </select>
        </Field>
        <Field label="Tags">
          <TextInput value={draft.tags} onChange={(value) => setDraft({ ...draft, tags: value })} />
        </Field>
        <Field label="Date dâ€™ajout">
          <TextInput type="date" value={draft.addedAt} onChange={(value) => setDraft({ ...draft, addedAt: value })} />
        </Field>
        <Field label="Descriptif public" className="field-wide field-tall">
          <textarea
            value={draft.description}
            placeholder="Exemple : Carte japonaise en trÃ¨s bel Ã©tat, idÃ©ale pour collection SalamÃ¨che..."
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
          />
        </Field>
        <Field label="Image">
          <ImageUploader
            value={getCardImages(draft)}
            name={draft.name}
            onChange={(value) => setDraft({ ...draft, imageUrls: value, imageUrl: value[0] || '' })}
          />
        </Field>
        <Field label="Coup de cÅ“ur">
          <input
            type="checkbox"
            checked={Boolean(draft.featured)}
            onChange={(event) => setDraft({ ...draft, featured: event.target.checked })}
          />
        </Field>
        <Field label="Prix nÃ©gociable">
          <input
            type="checkbox"
            checked={Boolean(draft.negotiable)}
            onChange={(event) => setDraft({ ...draft, negotiable: event.target.checked })}
          />
        </Field>
        <Field label="Classement" className="field-wide">
          <CardClassificationEditor
            card={draft}
            onChange={(field, value) => setDraft({ ...draft, [field]: value })}
          />
        </Field>
        <button type="submit">
          <Plus size={18} />
          {t.add}
        </button>
      </form>
      <div className="admin-toolbar product-admin-toolbar">
        <label className="searchbox">
          <Search size={18} />
          <input
            value={productQuery}
            onChange={(event) => setProductQuery(event.target.value)}
            placeholder="Rechercher nom, set, raretÃ©, tag..."
          />
        </label>
        <label>
          <PackageCheck size={17} />
          <select value={productStatus} onChange={(event) => setProductStatus(event.target.value)}>
            <option value="all">Tous les statuts</option>
            {Object.entries(cardStatuses).map(([value, label]) => (
              <option value={value} key={value}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          <Boxes size={17} />
          <select value={productCategory} onChange={(event) => setProductCategory(event.target.value)}>
            <option value="all">Toutes les catÃ©gories</option>
            <option value="japanese">Japonaises</option>
            <option value="graded">GradÃ©es</option>
            <option value="vintage">Anciennes / vintage</option>
            <option value="promo">Promo</option>
            <option value="favorite">Coup de cÅ“ur</option>
          </select>
        </label>
        <label>
          <SlidersHorizontal size={17} />
          <select value={productSort} onChange={(event) => setProductSort(event.target.value)}>
            <option value="newest">Plus rÃ©centes</option>
            <option value="name">Nom A-Z</option>
            <option value="priceDesc">Prix dÃ©croissant</option>
            <option value="priceAsc">Prix croissant</option>
          </select>
        </label>
      </div>
      <div className="admin-product-strip" aria-label="AperÃ§u rapide des produits">
        {visibleDraftCards.slice(0, 12).map((card) => (
          <button type="button" key={card.id} onClick={() => setProductQuery(card.name)}>
            <CardArt card={card} />
            <span>{card.name}</span>
          </button>
        ))}
      </div>
      <div className="product-editor-list">
        {visibleDraftCards.map((card) => (
          <article className="editable-product" key={card.id}>
            <CardArt card={card} />
            <div className="editable-grid">
              {[
                ['name', 'Nom'],
                ['set', 'Set'],
                ['rarity', 'RaretÃ©'],
                ['type', 'Type'],
                ['condition', 'Ã‰tat'],
                ['language', 'Langue'],
                ['grade', 'Grade'],
                ['tags', 'Tags'],
                ['addedAt', 'Date dâ€™ajout'],
              ].map(([field, label]) => (
                <Field label={label} key={field}>
                  <TextInput
                    type={field === 'addedAt' ? 'date' : 'text'}
                    value={card[field] || ''}
                    onChange={(value) => updateCard(card.id, field, value)}
                  />
                </Field>
              ))}
              <Field label="Descriptif public" className="field-wide field-tall">
                <textarea
                  value={card.description || ''}
                  placeholder="Texte visible sur la fiche carte."
                  onChange={(event) => updateCard(card.id, 'description', event.target.value)}
                />
              </Field>
              <Field label="DÃ©fauts visibles" className="field-wide field-tall">
                <textarea
                  value={card.flaws || ''}
                  placeholder="Rayure, coin blanc, centrage, dÃ©faut du boÃ®tier..."
                  onChange={(event) => updateCard(card.id, 'flaws', event.target.value)}
                />
              </Field>
              <Field label="Note privÃ©e" className="field-wide field-tall">
                <textarea
                  value={card.privateNote || ''}
                  placeholder="Visible uniquement dans ton admin."
                  onChange={(event) => updateCard(card.id, 'privateNote', event.target.value)}
                />
              </Field>
              <Field label="Image">
                <ImageUploader
                  value={getCardImages(card)}
                  name={card.name}
                  onChange={(value) => updateCard(card.id, 'imageUrls', value)}
                />
              </Field>
              <Field label="Badge">
                <select value={card.badge || ''} onChange={(event) => updateCard(card.id, 'badge', event.target.value)}>
                  <option value="">Aucun</option>
                  <option>Nouveau</option>
                  <option>Coup de cÅ“ur</option>
                </select>
              </Field>
              <Field label="Coup de cÅ“ur">
                <input
                  type="checkbox"
                  checked={Boolean(card.featured)}
                  onChange={(event) => updateCard(card.id, 'featured', event.target.checked)}
                />
              </Field>
              <Field label="Classement" className="field-wide">
                <CardClassificationEditor
                  card={card}
                  onChange={(field, value) => updateCard(card.id, field, value)}
                />
              </Field>
              <Field label="Prix nÃ©gociable">
                <input
                  type="checkbox"
                  checked={Boolean(card.negotiable)}
                  onChange={(event) => updateCard(card.id, 'negotiable', event.target.checked)}
                />
              </Field>
              <Field label="Statut">
                <select value={getCardStatus(card)} onChange={(event) => {
                  const status = event.target.value
                  markEdited(draftCards.map((item) =>
                    item.id === card.id
                      ? {
                          ...item,
                          status,
                          reserved: status === 'reserved',
                          reservedUntil: status === 'available' ? '' : item.reservedUntil,
                        }
                      : item,
                  ))
                }}>
                  {Object.entries(cardStatuses).map(([value, label]) => (
                    <option value={value} key={value}>{label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Prix">
                <TextInput type="number" step="0.01" value={card.price} onChange={(value) => updateCard(card.id, 'price', value)} />
              </Field>
              <Field label="Stock">
                <TextInput type="number" min="0" value={card.stock} onChange={(value) => updateCard(card.id, 'stock', value)} />
              </Field>
              <Field label="RÃ©servÃ©e">
                <input
                  type="checkbox"
                  checked={Boolean(card.reserved)}
                  onChange={(event) => updateCard(card.id, 'reserved', event.target.checked)}
                />
              </Field>
              <Field label="Couleur">
                <input type="color" value={card.color} onChange={(event) => updateCard(card.id, 'color', event.target.value)} />
              </Field>
            </div>
            <button className="danger-button" type="button" onClick={() => removeCard(card.id)}>
              <Trash2 size={16} />
              Supprimer
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

function ContentEditor({ site, setSite }) {
  function updateCopy(language, field, value) {
    const next = {
      ...site,
      copy: {
        ...site.copy,
        [language]: {
          ...site.copy[language],
          [field]: value,
        },
      },
    }
    setSite(next)
    saveLocal('kc-site', next)
  }

  return (
    <section className="admin-panel">
      <div className="panel-title admin-panel-title">
        <h2>Contenu du site</h2>
        <span>Change les textes franÃ§ais et anglais sans toucher au code.</span>
      </div>
      <div className="translation-grid">
        {['fr', 'en'].map((language) => (
          <div className="translation-card" key={language}>
            <h3>{language === 'fr' ? 'FranÃ§ais' : 'English'}</h3>
            {Object.entries(site.copy[language]).map(([field, value]) => (
              <Field label={field} key={field}>
                <textarea value={value} onChange={(event) => updateCopy(language, field, event.target.value)} />
              </Field>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

function AppearanceEditor({ site, setSite }) {
  function updateTheme(field, value) {
    const next = { ...site, theme: { ...site.theme, [field]: value } }
    setSite(next)
    saveLocal('kc-site', next)
  }

  return (
    <section className="admin-panel">
      <div className="panel-title admin-panel-title">
        <h2>Apparence</h2>
        <span>Modifie le nom, le symbole et les couleurs principales.</span>
      </div>
      <div className="settings-grid">
        <Field label="Nom de la boutique">
          <TextInput value={site.brandName} onChange={(value) => {
            const next = { ...site, brandName: value }
            setSite(next)
            saveLocal('kc-site', next)
          }} />
        </Field>
        <Field label="Symbole">
          <TextInput value={site.brandMark} onChange={(value) => {
            const next = { ...site, brandMark: value }
            setSite(next)
            saveLocal('kc-site', next)
          }} />
        </Field>
        <Field label="Rouge principal">
          <input type="color" value={site.theme.red} onChange={(event) => updateTheme('red', event.target.value)} />
        </Field>
        <Field label="Encre">
          <input type="color" value={site.theme.ink} onChange={(event) => updateTheme('ink', event.target.value)} />
        </Field>
        <Field label="Papier">
          <input type="color" value={site.theme.paper} onChange={(event) => updateTheme('paper', event.target.value)} />
        </Field>
      </div>
    </section>
  )
}

function SettingsEditor({ site, setSite }) {
  function updateSite(field, value) {
    const numeric = ['lowStockLimit', 'reservationHours'].includes(field)
    const next = { ...site, [field]: numeric ? Number(value) : value }
    setSite(next)
    saveLocal('kc-site', next)
  }

  return (
    <section className="admin-panel">
      <div className="panel-title admin-panel-title">
        <h2>ParamÃ¨tres</h2>
        <span>Configure la langue par dÃ©faut, le contact et la livraison.</span>
      </div>
      <div className="settings-grid">
        <Field label="Langue du site">
          <select value={site.language} onChange={(event) => updateSite('language', event.target.value)}>
            <option value="fr">FranÃ§ais</option>
            <option value="en">English</option>
          </select>
        </Field>
        <Field label="E-mail de contact">
          <TextInput value={site.contactEmail} onChange={(value) => updateSite('contactEmail', value)} />
        </Field>
        <Field label="Alerte stock bas">
          <TextInput type="number" min="0" value={site.lowStockLimit} onChange={(value) => updateSite('lowStockLimit', value)} />
        </Field>
        <Field label="DurÃ©e rÃ©servation (heures)">
          <TextInput type="number" min="1" value={site.reservationHours} onChange={(value) => updateSite('reservationHours', value)} />
        </Field>
      </div>
    </section>
  )
}

function AdminLogin({ site, t, loginAdmin }) {
  const [email, setEmail] = useState(site.contactEmail)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function submitLogin(event) {
    event.preventDefault()
    setIsLoading(true)
    const result = await signInAdmin({ email, password })
    setIsLoading(false)
    if (result.session) {
      setError('')
      loginAdmin()
    } else {
      setError(result.error?.message || t.loginError)
    }
  }

  return (
    <main className="simple-page login-page">
      <form className="login-card" onSubmit={submitLogin}>
        <Lock size={34} />
        <h1>{t.loginTitle}</h1>
        <p>{t.loginIntro}</p>
        <Field label={t.email}>
          <TextInput type="email" value={email} onChange={setEmail} />
        </Field>
        <Field label="Mot de passe">
          <TextInput type="password" value={password} onChange={setPassword} />
        </Field>
        {error && <p className="form-error">{error}</p>}
        <button className="checkout" type="submit" disabled={!email || !password || isLoading}>
          <Lock size={18} />
          {isLoading ? 'Connexion...' : 'Admin'}
        </button>
      </form>
    </main>
  )
}

function AdminView({
  cards,
  orders,
  sellRequests,
  setOrders,
  setSellRequests,
  persistCards,
  removeCardById,
  site,
  setSite,
  t,
  logoutAdmin,
  backendConfig,
}) {
  const [activeTab, setActiveTab] = useState('overview')
  const [orderQuery, setOrderQuery] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('Tous')
  const revenue = orders.reduce((sum, order) => sum + Number(order.total), 0)
  const stock = cards.reduce((sum, card) => sum + Number(card.stock), 0)
  const lowStock = cards.filter((card) => Number(card.stock) <= Number(site.lowStockLimit)).length
  const filteredOrders = useMemo(() => {
    const normalized = orderQuery.toLowerCase().trim()
    return orders.filter((order) => {
      const text = [
        order.id,
        order.customer,
        order.email,
        order.phone,
        order.message,
        order.privateNote,
        ...(order.lines || []).map((line) => `${line.name} ${line.set} ${line.rarity}`),
      ].join(' ').toLowerCase()
      const matchQuery = text.includes(normalized)
      const matchStatus = orderStatusFilter === 'Tous' || normalizeStatus(order.status) === orderStatusFilter
      return matchQuery && matchStatus
    })
  }, [orderQuery, orderStatusFilter, orders])

  function updateOrderStatus(id, status) {
    const next = orders.map((order) => (order.id === id ? { ...order, status } : order))
    const order = orders.find((item) => item.id === id)
    if (order?.lines?.length) {
      const nextCards = cards.map((card) => {
        const line = order.lines.find((item) => item.id === card.id)
        if (!line) return card
        if (status === 'AnnulÃ©e') {
          return {
            ...card,
            status: 'available',
            reserved: false,
            reservedUntil: '',
            stock: Number(card.stock) + Number(line.qty),
          }
        }
        if (status === 'ConfirmÃ©e') {
          return { ...card, status: 'sold', reserved: false, reservedUntil: '' }
        }
        return { ...card, status: 'reserved', reserved: true }
      })
      persistCards(nextCards)
    }
    setOrders(next)
    saveLocal('kc-orders', next)
    updateRemoteReservation(id, { status })
  }

  function updateOrderNote(id, privateNote) {
    const next = orders.map((order) => (order.id === id ? { ...order, privateNote } : order))
    setOrders(next)
    saveLocal('kc-orders', next)
    updateRemoteReservation(id, { privateNote })
  }

  function releaseReservation(id) {
    const order = orders.find((item) => item.id === id)
    if (!order?.lines?.length) return
    const nextCards = cards.map((card) => {
      const line = order.lines.find((item) => item.id === card.id)
      return line
        ? {
            ...card,
            status: 'available',
            reserved: false,
            reservedUntil: '',
            stock: Number(card.stock) + Number(line.qty),
          }
        : card
    })
    const nextOrders = orders.map((item) =>
      item.id === id ? { ...item, status: 'AnnulÃ©e', privateNote: `${item.privateNote || ''}`.trim() } : item,
    )
    persistCards(nextCards)
    setOrders(nextOrders)
    saveLocal('kc-orders', nextOrders)
    updateRemoteReservation(id, { status: 'AnnulÃ©e' })
  }

  function updateSellRequestStatus(id, status) {
    const next = sellRequests.map((request) =>
      request.id === id ? { ...request, status } : request,
    )
    setSellRequests(next)
    saveLocal('kc-sell-requests', next)
    updateRemoteSellRequest(id, { status })
  }

  function resetAll() {
    saveLocal('kc-cards', starterCards)
    saveLocal('kc-orders', starterOrders)
    saveLocal('kc-sell-requests', starterSellRequests)
    saveLocal('kc-site', starterSite)
    persistCards(starterCards)
    setOrders(starterOrders)
    setSellRequests(starterSellRequests)
    setSite(starterSite)
  }

  return (
    <main className="admin-page">
      <div className="page-heading admin-heading">
        <div>
          <h1>{t.adminTitle}</h1>
          <p>{t.adminSubtitle}</p>
        </div>
        <button type="button" onClick={resetAll}>
          <Save size={16} />
          {t.reset}
        </button>
        <button type="button" onClick={logoutAdmin}>
          <LogOut size={16} />
          {t.logout}
        </button>
      </div>
      <section className="admin-shell">
        <nav className="admin-sidebar" aria-label="Navigation admin">
          {adminTabs.map(([id, label, Icon]) => (
            <button
              className={activeTab === id ? 'active' : ''}
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
            >
              <Icon size={17} />
              {label}
            </button>
          ))}
        </nav>
        <div className="admin-workspace">
          {activeTab === 'overview' && (
            <>
              <section className="stats">
                <StatCard icon={CircleDollarSign} label={t.sales} value={formatMoney(revenue)} tone="red" />
                <StatCard icon={Boxes} label={t.stock} value={stock} tone="ink" />
                <StatCard icon={PackageCheck} label={t.orders} value={orders.length} tone="blue" />
                <StatCard icon={FileText} label={t.sellRequests} value={sellRequests.length} tone="gold" />
                <StatCard icon={BarChart3} label={t.lowStock} value={lowStock} tone="ink" />
              </section>
              <section className="admin-panel preview-panel">
                <div>
                  <h2>AperÃ§u boutique</h2>
                  <p>{site.copy[site.language].heroTitle}</p>
                </div>
                <Eye size={28} />
              </section>
              <section className="admin-panel integration-panel">
                <div className="panel-title admin-panel-title">
                  <h2>{t.integrations}</h2>
                  <span>Ã‰tat des connexions nÃ©cessaires pour la production.</span>
                </div>
                <div className="integration-grid">
                  <div>
                    <strong>{t.stripeStatus}</strong>
                    <span className={backendConfig.emailEnabled ? 'ok' : 'pending'}>
                      {backendConfig.emailEnabled ? t.active : t.inactive}
                    </span>
                  </div>
                  <div>
                    <strong>{t.databaseStatus}</strong>
                    <span className={backendConfig.databaseEnabled ? 'ok' : 'pending'}>
                      {backendConfig.databaseEnabled ? t.active : t.inactive}
                    </span>
                  </div>
                </div>
              </section>
            </>
          )}
          {activeTab === 'content' && <ContentEditor site={site} setSite={setSite} />}
          {activeTab === 'products' && (
            <ProductEditor
              cards={cards}
              persistCards={persistCards}
              removeCardById={removeCardById}
              t={t}
            />
          )}
          {activeTab === 'orders' && (
            <section className="admin-panel">
              <div className="panel-title admin-panel-title">
                <h2>RÃ©servations</h2>
                <span>Lis les messages clients et change le statut des rÃ©servations.</span>
              </div>
              <div className="admin-toolbar">
                <label className="searchbox">
                  <Search size={18} />
                  <input
                    value={orderQuery}
                    onChange={(event) => setOrderQuery(event.target.value)}
                    placeholder="Rechercher client, carte, message..."
                  />
                </label>
                <label>
                  <PackageCheck size={17} />
                  <select
                    value={orderStatusFilter}
                    onChange={(event) => setOrderStatusFilter(event.target.value)}
                  >
                    <option>Tous</option>
                    {reservationStatusOptions.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>
              </div>
              <OrderTable
                orders={filteredOrders}
                updateOrderStatus={updateOrderStatus}
                updateOrderNote={updateOrderNote}
                releaseReservation={releaseReservation}
                t={t}
              />
            </section>
          )}
          {activeTab === 'sellRequests' && (
            <section className="admin-panel">
              <div className="panel-title admin-panel-title">
                <h2>{t.sellRequests}</h2>
                <span>Demandes envoyÃ©es depuis la page Vendre.</span>
              </div>
              <SellRequestsTable
                sellRequests={sellRequests}
                updateSellRequestStatus={updateSellRequestStatus}
                t={t}
              />
            </section>
          )}
          {activeTab === 'appearance' && <AppearanceEditor site={site} setSite={setSite} />}
          {activeTab === 'settings' && <SettingsEditor site={site} setSite={setSite} />}
        </div>
      </section>
    </main>
  )
}

function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className="toast">
      <Check size={18} />
      {toast}
    </div>
  )
}

function App() {
  const [cards, setCards] = useState(() => loadLocal('kc-cards', starterCards))
  const [orders, setOrders] = useState(loadOrders)
  const [sellRequests, setSellRequests] = useState(loadSellRequests)
  const [site, setSite] = useState(() => mergeSite(loadLocal('kc-site', starterSite)))
  const [cart, setCart] = useState(() => loadLocal('kc-cart', []))
  const [checkoutDraft, setCheckoutDraft] = useState(defaultCheckout)
  const [sellDraft, setSellDraft] = useState(defaultSellRequest)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false)
  const [backendConfig, setBackendConfig] = useState({
    emailEnabled: false,
    databaseEnabled: false,
  })
  const [lastReservation, setLastReservation] = useState(null)
  const [selected, setSelected] = useState(() => cards[0])
  const [view, setView] = useState('home')
  const [query, setQuery] = useState('')
  const [type, setType] = useState(labels[site.language].all)
  const [rarity, setRarity] = useState(labels[site.language].allFeminine)
  const [statusFilter, setStatusFilter] = useState(labels[site.language].all)
  const [sortOrder, setSortOrder] = useState('featured')
  const [languageFilter, setLanguageFilter] = useState(labels[site.language].all)
  const [gradeFilter, setGradeFilter] = useState(labels[site.language].all)
  const [collectionTag, setCollectionTag] = useState('all')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [stockOnly, setStockOnly] = useState(false)
  const [toast, setToast] = useState('')
  const t = labels[site.language]

  useEffect(() => {
    const origin = window.location.origin
    const pageSeo = getPageSeo({ view, selected, site, t, cards })
    const canonical = view === 'cardDetail' && selected
      ? `${origin}${getCardPath(selected)}`
      : `${origin}${view === 'home' ? '/' : `/#${view}`}`
    const title = pageSeo.title
    const description = pageSeo.description
    const shareImage = view === 'cardDetail' && selected && getCardImages(selected)[0]
      ? getCardImages(selected)[0]
      : `${origin}/og-image.svg`

    document.documentElement.lang = site.language
    document.title = title
    setMetaTag('meta[name="description"]', { name: 'description', content: description })
    setMetaTag('meta[name="keywords"]', { name: 'keywords', content: pageSeo.keywords })
    setMetaTag('meta[property="og:title"]', { property: 'og:title', content: title })
    setMetaTag('meta[property="og:description"]', { property: 'og:description', content: description })
    setMetaTag('meta[property="og:type"]', { property: 'og:type', content: view === 'cardDetail' ? 'product' : 'website' })
    setMetaTag('meta[property="og:url"]', { property: 'og:url', content: canonical })
    setMetaTag('meta[property="og:image"]', { property: 'og:image', content: shareImage })
    setMetaTag('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    setMetaTag('meta[name="twitter:image"]', { name: 'twitter:image', content: shareImage })
    setLinkTag('canonical', canonical)

    const structuredData = view === 'cardDetail' && selected
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: selected.name,
          description,
          brand: site.brandName,
          category: 'PokÃ©mon card',
          sku: selected.id,
          image: getCardImages(selected).length ? getCardImages(selected) : `${origin}/favicon.svg`,
          additionalProperty: [
            { '@type': 'PropertyValue', name: 'RaretÃ©', value: selected.rarity },
            { '@type': 'PropertyValue', name: 'Ã‰tat', value: selected.condition },
            { '@type': 'PropertyValue', name: 'Langue', value: selected.language },
            { '@type': 'PropertyValue', name: 'Grade', value: selected.grade },
            { '@type': 'PropertyValue', name: 'Prix nÃ©gociable', value: selected.negotiable ? 'Oui' : 'Non' },
          ],
          offers: {
            '@type': 'Offer',
            priceCurrency: 'EUR',
            price: Number(selected.price).toFixed(2),
            availability: isReservable(selected)
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            url: canonical,
          },
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'Store',
          name: site.brandName,
          url: origin,
          email: site.contactEmail,
          description,
          keywords: pageSeo.keywords,
          areaServed: ['FR', 'EU'],
          makesOffer: cards.slice(0, 12).map((card) => ({
            '@type': 'Offer',
            url: `${origin}${getCardPath(card)}`,
            priceCurrency: 'EUR',
            price: Number(card.price || 0).toFixed(2),
            availability: isReservable(card)
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            itemOffered: {
              '@type': 'Product',
              name: card.name,
              category: 'Pokemon card',
              image: getCardImages(card)[0] || `${origin}/og-image.svg`,
            },
          })),
        }

    setStructuredData(structuredData)
  }, [cards, selected, site, t, view])

  useEffect(() => {
    async function loadRemoteData() {
      const config = await getBackendConfig()
      setBackendConfig(config)
      const session = await getAdminSession()
      if (session) {
        setIsAdminUnlocked(true)
      }
      if (!config.databaseEnabled) return

      const remoteCards = await fetchCards()

      setCards(remoteCards)
      setSelected(remoteCards[0] || null)
      saveLocal('kc-cards', remoteCards)

      if (session) {
        const remoteReservations = await fetchReservations()
        setOrders(remoteReservations)
        saveLocal('kc-orders', remoteReservations)
        const remoteSellRequests = await fetchSellRequests()
        setSellRequests(remoteSellRequests)
        saveLocal('kc-sell-requests', remoteSellRequests)
      }
    }

    loadRemoteData()
  }, [])

  useEffect(() => {
    function applyHashTarget() {
      const target = readPathTarget() || readHashTarget()
      if (target.view === 'cardDetail') {
        const card = cards.find((item) => item.id === target.cardId)
        if (card) {
          setSelected(card)
          setView('cardDetail')
        }
        return
      }
      const allowedViews = new Set([
        'home',
        'shop',
        'arrivals',
        'highlights',
        'japanese',
        'graded',
        'vintageJapanese',
        'sell',
        'cards',
        'about',
        'contact',
        'legal',
        'orders',
        'reservationSuccess',
        'admin',
      ])
      if (allowedViews.has(target.view)) {
        setView(target.view)
      }
    }

    applyHashTarget()
    window.addEventListener('hashchange', applyHashTarget)
    window.addEventListener('popstate', applyHashTarget)
    return () => {
      window.removeEventListener('hashchange', applyHashTarget)
      window.removeEventListener('popstate', applyHashTarget)
    }
  }, [cards])

  async function persistCards(next) {
    setCards(next)
    saveLocal('kc-cards', next)
    if (backendConfig.databaseEnabled) {
      return syncCards(next)
    }
    return { saved: true }
  }

  async function removeCardById(id) {
    const next = cards.filter((card) => card.id !== id)
    setCards(next)
    saveLocal('kc-cards', next)
    if (backendConfig.databaseEnabled) {
      return deleteRemoteCard(id)
    }
    return { deleted: true }
  }

  const filteredCards = useMemo(() => {
    const normalized = query.toLowerCase().trim()
    const min = minPrice === '' ? null : Number(minPrice)
    const max = maxPrice === '' ? null : Number(maxPrice)
    const filtered = cards.filter((card) => {
      const signals = getCollectionSignals(card)
      const matchQuery = getCardSearchText(card).includes(normalized)
      const matchType = [labels.fr.all, labels.en.all].includes(type) || card.type === type
      const matchRarity =
        [labels.fr.allFeminine, labels.en.allFeminine].includes(rarity) || card.rarity === rarity
      const matchStatus =
        [labels.fr.all, labels.en.all].includes(statusFilter) || getCardStatus(card) === statusFilter
      const matchLanguage =
        [labels.fr.all, labels.en.all].includes(languageFilter) || card.language === languageFilter
      const matchGrade =
        [labels.fr.all, labels.en.all].includes(gradeFilter) || card.grade === gradeFilter
      const matchCollection = collectionTag === 'all' || Boolean(signals[collectionTag])
      const matchMin = min === null || Number(card.price) >= min
      const matchMax = max === null || Number(card.price) <= max
      const matchStock = !stockOnly || isReservable(card)
      return (
        matchQuery &&
        matchType &&
        matchRarity &&
        matchStatus &&
        matchLanguage &&
        matchGrade &&
        matchCollection &&
        matchMin &&
        matchMax &&
        matchStock
      )
    })
    return [...filtered].sort((a, b) => {
      if (sortOrder === 'priceAsc') return Number(a.price) - Number(b.price)
      if (sortOrder === 'priceDesc') return Number(b.price) - Number(a.price)
      if (sortOrder === 'newest') return new Date(b.addedAt || 0) - new Date(a.addedAt || 0)
      if (sortOrder === 'rarity') return `${a.rarity} ${a.name}`.localeCompare(`${b.rarity} ${b.name}`)
      return Number(Boolean(b.featured || b.badge)) - Number(Boolean(a.featured || a.badge))
    })
  }, [
    cards,
    collectionTag,
    gradeFilter,
    languageFilter,
    maxPrice,
    minPrice,
    query,
    rarity,
    sortOrder,
    statusFilter,
    stockOnly,
    type,
  ])

  const japaneseCards = useMemo(
    () => cards.filter((card) => getCollectionSignals(card).japanese),
    [cards],
  )
  const highlightCards = useMemo(
    () => cards.filter((card) => card.featured || Number(card.stock) <= Number(site.lowStockLimit) + 1),
    [cards, site.lowStockLimit],
  )
  const vintageJapaneseCards = useMemo(
    () => cards.filter((card) => {
      const signals = getCollectionSignals(card)
      return signals.japanese && signals.vintage
    }),
    [cards],
  )
  const gradedCards = useMemo(
    () => cards.filter((card) => getCollectionSignals(card).graded),
    [cards],
  )
  const arrivalCards = useMemo(
    () => [...cards].sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0)).slice(0, 24),
    [cards],
  )

  function flash(message) {
    setToast(message)
    window.clearTimeout(window.kcToast)
    window.kcToast = window.setTimeout(() => setToast(''), 2600)
  }

  function setLanguage(language) {
    const next = { ...site, language }
    setSite(next)
    setType(labels[language].all)
    setRarity(labels[language].allFeminine)
    setStatusFilter(labels[language].all)
    setLanguageFilter(labels[language].all)
    setGradeFilter(labels[language].all)
    saveLocal('kc-site', next)
  }

  function toggleColorMode() {
    const next = {
      ...site,
      colorMode: site.colorMode === 'light' ? 'dark' : 'light',
    }
    setSite(next)
    saveLocal('kc-site', next)
  }

  function addToCart(id) {
    const card = cards.find((item) => item.id === id)
    const existing = cart.find((item) => item.id === id)
    if (!card || !isReservable(card) || existing?.qty >= card.stock) {
      flash(t.lowStockWarning)
      return
    }
    const next = existing
      ? cart.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item))
      : [...cart, { id, qty: 1 }]
    setCart(next)
    saveLocal('kc-cart', next)
    flash(t.productAdded)
  }

  function navigate(viewName) {
    setView(viewName)
    const target = viewName === 'home' ? '/' : `/#${viewName}`
    window.history.pushState(null, '', target)
  }

  function openCardPage(card) {
    setSelected(card)
    setView('cardDetail')
    window.history.pushState(null, '', getCardPath(card))
  }

  async function copyCardLink(card) {
    const url = `${window.location.origin}${getCardPath(card)}`
    await navigator.clipboard?.writeText(url)
    flash(t.linkCopied)
  }

  async function unlockAdmin() {
    setIsAdminUnlocked(true)
    const remoteReservations = await fetchReservations()
    setOrders(remoteReservations)
    saveLocal('kc-orders', remoteReservations)
    const remoteSellRequests = await fetchSellRequests()
    setSellRequests(remoteSellRequests)
    saveLocal('kc-sell-requests', remoteSellRequests)
  }

  async function logoutAdmin() {
    await signOutAdmin()
    setIsAdminUnlocked(false)
  }

  function updateQty(id, qty) {
    const card = cards.find((item) => item.id === id)
    const next = cart
      .map((item) =>
        item.id === id ? { ...item, qty: Math.max(0, Math.min(qty, card?.stock ?? 0)) } : item,
      )
      .filter((item) => item.qty > 0)
    setCart(next)
    saveLocal('kc-cart', next)
  }

  function removeItem(id) {
    const next = cart.filter((item) => item.id !== id)
    setCart(next)
    saveLocal('kc-cart', next)
  }

  async function submitSellRequest(event) {
    event.preventDefault()
    const request = {
      ...sellDraft,
      id: `RACHAT-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Nouvelle',
      date: new Date().toISOString().slice(0, 10),
    }
    const result = await submitRemoteSellRequest(request)
    if (backendConfig.databaseEnabled && !result.databaseSaved) {
      flash(result.message)
      return
    }
    const next = [request, ...sellRequests]
    setSellRequests(next)
    saveLocal('kc-sell-requests', next)
    setSellDraft(defaultSellRequest)
    flash(t.requestSent)
  }

  async function checkout(event) {
    event.preventDefault()
    const lines = cart
      .map((item) => ({ ...item, card: cards.find((card) => card.id === item.id) }))
      .filter((item) => item.card)
    if (!lines.length) return

    const subtotal = lines.reduce((sum, item) => sum + item.card.price * item.qty, 0)
    const cartItems = lines.map((item) => ({
      id: item.card.id,
      name: item.card.name,
      set: item.card.set,
      rarity: item.card.rarity,
      type: item.card.type,
      condition: item.card.condition,
      language: item.card.language,
      grade: item.card.grade,
      color: item.card.color,
      price: item.card.price,
      qty: item.qty,
    }))
    const draftOrderId = `RESA-${Math.floor(2600 + Math.random() * 8000)}`
    const order = {
      id: draftOrderId,
      customer: checkoutDraft.fullName,
      email: checkoutDraft.email,
      phone: checkoutDraft.phone,
      message: checkoutDraft.message,
      lines: cartItems,
      total: subtotal,
      items: lines.reduce((sum, item) => sum + item.qty, 0),
      status: 'Nouvelle',
      reservedUntil: addHours(new Date(), site.reservationHours),
      paymentProvider: 'reservation',
      paymentNote: site.copy[site.language].paymentNote,
      date: new Date().toISOString().slice(0, 10),
    }
    const reservationResult = await submitReservation({
      reservation: order,
      sellerEmail: site.contactEmail,
      siteName: site.brandName,
    })
    if (backendConfig.databaseEnabled && !reservationResult.databaseSaved) {
      flash(reservationResult.message || t.reservationError)
      return
    }
    const nextOrder = {
      ...order,
      emailSent: Boolean(reservationResult.emailSent),
      notificationNote: reservationResult.message,
    }
    let nextCards = cards.map((card) => {
      const line = lines.find((item) => item.id === card.id)
      return line
        ? {
            ...card,
            status: 'reserved',
            reserved: true,
            reservedUntil: order.reservedUntil,
            stock: Math.max(0, card.stock - line.qty),
          }
        : card
    })
    if (backendConfig.databaseEnabled && reservationResult.databaseSaved) {
      const remoteCards = await fetchCards()
      nextCards = remoteCards
    } else {
      persistCards(nextCards)
    }
    const nextOrders = [nextOrder, ...orders]
    setCards(nextCards)
    saveLocal('kc-cards', nextCards)
    setOrders(nextOrders)
    setLastReservation(nextOrder)
    setCart([])
    setCheckoutDraft(defaultCheckout)
    saveLocal('kc-orders', nextOrders)
    saveLocal('kc-cart', [])
    flash(`${t.orderCreated} ${nextOrder.id}`)
    navigate('reservationSuccess')
  }

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)

  return (
    <div
      className="app-shell"
      data-theme={site.colorMode}
      style={{
        '--red': site.theme.red,
        '--ink': site.colorMode === 'dark' ? '#ded7cd' : site.theme.ink,
        '--paper': site.colorMode === 'dark' ? '#090b10' : site.theme.paper,
      }}
    >
      <Header
        view={view}
        setView={navigate}
        cartCount={cartCount}
        site={site}
        setLanguage={setLanguage}
        toggleColorMode={toggleColorMode}
      />
      {view === 'shop' && (
        <ShopView
          cards={cards}
          filteredCards={filteredCards}
          selected={selected}
          setSelected={setSelected}
          openCardPage={openCardPage}
          addToCart={addToCart}
          copyCardLink={copyCardLink}
          cart={cart}
          updateQty={updateQty}
          removeItem={removeItem}
          checkout={checkout}
          checkoutDraft={checkoutDraft}
          setCheckoutDraft={setCheckoutDraft}
          setView={navigate}
          filters={{
            query,
            setQuery,
            type,
            setType,
            rarity,
            setRarity,
            status: statusFilter,
            setStatus: setStatusFilter,
            sort: sortOrder,
            setSort: setSortOrder,
            language: languageFilter,
            setLanguageFilter,
            grade: gradeFilter,
            setGradeFilter,
            collectionTag,
            setCollectionTag,
            minPrice,
            setMinPrice,
            maxPrice,
            setMaxPrice,
            stockOnly,
            setStockOnly,
          }}
          site={site}
          t={t}
        />
      )}
      {view === 'home' && (
        <HomeView
          cards={cards}
          openCardPage={openCardPage}
          setView={navigate}
          site={site}
          t={t}
        />
      )}
      {view === 'cards' && (
        <CardsView
          cards={filteredCards}
          allCards={cards}
          filters={{
            query,
            setQuery,
            type,
            setType,
            rarity,
            setRarity,
            status: statusFilter,
            setStatus: setStatusFilter,
            sort: sortOrder,
            setSort: setSortOrder,
            language: languageFilter,
            setLanguageFilter,
            grade: gradeFilter,
            setGradeFilter,
            collectionTag,
            setCollectionTag,
            minPrice,
            setMinPrice,
            maxPrice,
            setMaxPrice,
            stockOnly,
            setStockOnly,
          }}
          openCardPage={openCardPage}
          addToCart={addToCart}
          copyCardLink={copyCardLink}
          site={site}
          t={t}
        />
      )}
      {view === 'arrivals' && (
        <CollectionPage
          title={site.language === 'fr' ? 'Arrivages et nouveautÃ©s' : 'New arrivals'}
          intro={site.language === 'fr'
            ? 'Les derniÃ¨res cartes ajoutÃ©es Ã  la vitrine, classÃ©es par date dâ€™arrivÃ©e.'
            : 'Latest cards added to the showcase, sorted by arrival date.'}
          cards={arrivalCards}
          openCardPage={openCardPage}
          addToCart={addToCart}
          copyCardLink={copyCardLink}
          site={site}
          t={t}
        />
      )}
      {view === 'cardDetail' && (
        <CardDetailPage
          card={selected}
          addToCart={addToCart}
          setView={navigate}
          site={site}
          t={t}
          copyCardLink={copyCardLink}
        />
      )}
      {view === 'reservationSuccess' && (
        <ReservationSuccessPage
          reservation={lastReservation}
          setView={navigate}
          site={site}
          t={t}
        />
      )}
      {view === 'japanese' && (
        <CollectionPage
          title={site.copy[site.language].japaneseTitle}
          intro={site.copy[site.language].japaneseIntro}
          cards={japaneseCards}
          openCardPage={openCardPage}
          addToCart={addToCart}
          copyCardLink={copyCardLink}
          site={site}
          t={t}
        />
      )}
      {view === 'highlights' && (
        <CollectionPage
          title={site.copy[site.language].highlightsTitle}
          intro={site.copy[site.language].highlightsIntro}
          cards={highlightCards.length ? highlightCards : cards.slice(0, 6)}
          openCardPage={openCardPage}
          addToCart={addToCart}
          copyCardLink={copyCardLink}
          site={site}
          t={t}
        />
      )}
      {view === 'graded' && (
        <CollectionPage
          title={site.copy[site.language].gradedTitle}
          intro={site.copy[site.language].gradedIntro}
          cards={gradedCards}
          openCardPage={openCardPage}
          addToCart={addToCart}
          copyCardLink={copyCardLink}
          site={site}
          t={t}
        />
      )}
      {view === 'vintageJapanese' && (
        <CollectionPage
          title={site.copy[site.language].vintageJapaneseTitle}
          intro={site.copy[site.language].vintageJapaneseIntro}
          cards={vintageJapaneseCards.length ? vintageJapaneseCards : japaneseCards}
          openCardPage={openCardPage}
          addToCart={addToCart}
          copyCardLink={copyCardLink}
          site={site}
          t={t}
        />
      )}
      {view === 'sell' && (
        <InfoPage
          type="sell"
          site={site}
          t={t}
          sellDraft={sellDraft}
          setSellDraft={setSellDraft}
          submitSellRequest={submitSellRequest}
        />
      )}
      {view === 'about' && <InfoPage type="about" site={site} t={t} />}
      {view === 'contact' && <InfoPage type="contact" site={site} t={t} />}
      {view === 'legal' && <InfoPage type="legal" site={site} t={t} />}
      {view === 'orders' && <OrdersView orders={orders} site={site} t={t} />}
      {view === 'admin' && !isAdminUnlocked && (
        <AdminLogin
          site={site}
          t={t}
          loginAdmin={unlockAdmin}
        />
      )}
      {view === 'admin' && isAdminUnlocked && (
        <AdminView
          cards={cards}
          orders={orders}
          sellRequests={sellRequests}
          setOrders={setOrders}
          setSellRequests={setSellRequests}
          persistCards={persistCards}
          removeCardById={removeCardById}
          site={site}
          setSite={setSite}
          t={t}
          logoutAdmin={logoutAdmin}
          backendConfig={backendConfig}
        />
      )}
      {view !== 'admin' && <SiteFooter site={site} setView={navigate} t={t} />}
      <Toast toast={toast} />
    </div>
  )
}

export default App
