import { useEffect, useMemo, useState } from 'react'
import {
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
} from 'lucide-react'
import { starterCards, starterOrders, starterSellRequests, starterSite } from './data'
import {
  deleteRemoteCard,
  fetchCards,
  fetchReservations,
  getBackendConfig,
  submitReservation,
  syncCards,
  updateRemoteReservation,
} from './api'
import './App.css'

const adminTabs = [
  ['overview', "Vue d'ensemble", LayoutDashboard],
  ['content', 'Contenu', Edit3],
  ['products', 'Produits', Boxes],
  ['orders', 'Réservations', PackageCheck],
  ['sellRequests', 'Rachats', FileText],
  ['appearance', 'Apparence', Palette],
  ['settings', 'Paramètres', Settings],
]

const cardStatuses = {
  available: 'Disponible',
  reserved: 'Réservée',
  sold: 'Vendue',
}

const labels = {
  fr: {
    shop: 'Boutique',
    sell: 'Vendre',
    cards: 'Cartes',
    about: 'À propos',
    contact: 'Contact',
    legal: 'Mentions légales',
    japanese: 'Japonaises',
    graded: 'Gradées',
    orders: 'Réservations',
    admin: 'Admin',
    all: 'Tous',
    allFeminine: 'Toutes',
    buy: 'Je réserve',
    add: 'Ajouter',
    addToCart: 'Ajouter aux réservations',
    cart: 'Réservations',
    checkout: 'Envoyer ma demande',
    remove: 'Retirer',
    subtotal: 'Sous-total',
    shipping: 'Livraison',
    free: 'Offerte',
    total: 'Total',
    rarity: 'Rareté',
    condition: 'État',
    language: 'Langue',
    grade: 'Grade',
    stock: 'Stock',
    lowStock: 'Stock bas',
    sales: 'Montant réservé',
    status: 'Statut',
    customer: 'Client',
    date: 'Date',
    items: 'Articles',
    reset: 'Réinitialiser',
    save: 'Enregistrer',
    productAdded: 'Carte ajoutée à tes réservations.',
    lowStockWarning: 'Cette carte est indisponible ou déjà réservée.',
    orderCreated: 'Réservation envoyée.',
    emptyOrders: 'Aucune réservation pour le moment.',
    loginTitle: 'Accès admin',
    loginIntro: 'Entre le code admin pour gérer la boutique.',
    loginError: 'Code incorrect.',
    logout: 'Déconnexion',
    customerInfo: 'Informations client',
    fullName: 'Nom complet',
    email: 'E-mail',
    phone: 'Téléphone',
    address: 'Adresse',
    city: 'Ville',
    postalCode: 'Code postal',
    country: 'Pays',
    sellerMessage: 'Message pour le vendeur',
    reserved: 'Réservée',
    sold: 'Vendue',
    available: 'Disponible',
    reservedUntil: 'Réservée jusqu’au',
    release: 'Remettre en vente',
    privateNote: 'Note privée',
    reply: 'Répondre',
    copyEmail: 'Copier e-mail',
    darkMode: 'Mode sombre',
    lightMode: 'Mode clair',
    reservationPending: 'Nouvelle réservation',
    paymentPending: 'Réservée',
    sellRequests: 'Demandes de rachat',
    emptySellRequests: 'Aucune demande de rachat pour le moment.',
    requestSent: 'Demande envoyée.',
    integrations: 'Intégrations',
    stripeStatus: 'Envoi e-mail',
    databaseStatus: 'Base de données',
    active: 'Actif',
    inactive: 'À configurer',
    adminTitle: 'Panel admin',
    adminSubtitle:
      'Contrôle le contenu, les produits, les réservations, la langue, les couleurs et les paramètres de la boutique.',
  },
  en: {
    shop: 'Shop',
    sell: 'Sell',
    cards: 'Cards',
    about: 'About',
    contact: 'Contact',
    legal: 'Legal',
    japanese: 'Japanese',
    graded: 'Graded',
    orders: 'Orders',
    admin: 'Admin',
    all: 'All',
    allFeminine: 'All',
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
    emptyOrders: 'No reservations yet.',
    loginTitle: 'Admin access',
    loginIntro: 'Enter the admin code to manage the shop.',
    loginError: 'Wrong code.',
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

const statusOptions = ['Nouvelle réservation', 'Contacté', 'Confirmée', 'Annulée', 'Archivée']

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
  localStorage.setItem(key, JSON.stringify(value))
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

function mergeCards(localCards, remoteCards) {
  const byId = new Map(localCards.map((card) => [card.id, card]))
  remoteCards.forEach((card) => {
    byId.set(card.id, { ...byId.get(card.id), ...card })
  })
  return [...byId.values()]
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
    Payée: 'Confirmée',
    Préparée: 'Contacté',
    Expédiée: 'Confirmée',
  }
  return replacements[status] ?? status
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

function CardArt({ card, large = false }) {
  return (
    <div
      className={large ? 'card-art card-art-large' : 'card-art'}
      style={{ '--card-accent': card.color }}
    >
      {card.imageUrl && <img src={card.imageUrl} alt={card.name} />}
      <div className="card-art-top">
        <span>{card.language}</span>
        <strong>{card.grade}</strong>
      </div>
      <div className="card-orbit">
        <Sparkles size={large ? 42 : 30} strokeWidth={1.7} />
      </div>
      <div className="card-art-name">{card.name.split(' ')[0]}</div>
      <div className="card-art-lines">
        <i />
        <i />
        <i />
      </div>
    </div>
  )
}

function Header({ view, setView, cartCount, site, setLanguage, toggleColorMode }) {
  const t = labels[site.language]
  const nav = [
    ['shop', t.shop],
    ['japanese', t.japanese],
    ['graded', t.graded],
    ['sell', t.sell],
    ['cards', t.cards],
    ['about', t.about],
    ['contact', t.contact],
    ['legal', t.legal],
    ['admin', t.admin],
  ]

  return (
    <header className="topbar">
      <button className="brand" type="button" onClick={() => setView('shop')}>
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

function ProductCard({ card, selected, onSelect, onAdd, t }) {
  const reservable = isReservable(card)
  const status = getCardStatus(card)
  const unavailable = !reservable

  return (
    <article className={`${selected ? 'product-card selected' : 'product-card'} ${unavailable ? 'reserved' : ''}`}>
      <button className="product-open" type="button" onClick={() => onSelect(card)}>
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
          onClick={() => onAdd(card.id)}
          disabled={!reservable}
          title={t.addToCart}
        >
          <Plus size={18} />
        </button>
      </div>
    </article>
  )
}

function Filters({ query, setQuery, type, setType, rarity, setRarity, cards, site, t }) {
  const types = [t.all, ...new Set(cards.map((card) => card.type))]
  const rarities = [t.allFeminine, ...new Set(cards.map((card) => card.rarity))]

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
          <strong>Défauts visibles</strong>
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
          <button type="button" onClick={() => props.setView('admin')}>
            <LayoutDashboard size={18} />
            {copy.adminCta}
          </button>
        </div>
        <Filters {...props.filters} cards={props.cards} site={props.site} t={props.t} />
        <div className="product-grid">
          {props.filteredCards.map((card) => (
            <ProductCard
              key={card.id}
              card={card}
              selected={props.selected?.id === card.id}
              onSelect={props.setSelected}
              onAdd={props.addToCart}
              t={props.t}
            />
          ))}
        </div>
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

function CardsView({ cards, setSelected, addToCart, setView, site, t }) {
  return (
    <main className="simple-page">
      <div className="page-heading">
        <h1>{t.cards}</h1>
        <p>{site.copy[site.language].cardsIntro}</p>
      </div>
      <div className="inventory-list">
        {cards.map((card) => (
          <button
            className={!isReservable(card) ? 'inventory-row reserved' : 'inventory-row'}
            key={card.id}
            type="button"
            onClick={() => {
              setSelected(card)
              setView('shop')
            }}
          >
            <CardArt card={card} />
            <span>
              <strong>{card.name}</strong>
              <small>{card.set} - {card.rarity}</small>
            </span>
            <b>{formatMoney(card.price)}</b>
            <em>{isReservable(card) ? `${card.stock} en stock` : getCardStatusLabel(card, t)}</em>
            <i
              aria-disabled={!isReservable(card)}
              onClick={(event) => {
                event.stopPropagation()
                if (!isReservable(card)) return
                addToCart(card.id)
              }}
            >
              <Plus size={16} />
            </i>
          </button>
        ))}
      </div>
    </main>
  )
}

function CollectionPage({ title, intro, cards, setSelected, addToCart, setView, site, t }) {
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
            onSelect={(nextCard) => {
              setSelected(nextCard)
              setView('shop')
            }}
            onAdd={addToCart}
            t={t}
          />
        ))}
      </div>
      {cards.length === 0 && <p className="empty">{site.copy[site.language].emptyCart}</p>}
    </main>
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
      <Field label="Cartes proposées">
        <textarea
          value={draft.cardList}
          onChange={(event) => setDraft({ ...draft, cardList: event.target.value })}
          placeholder="Dracaufeu, Noctali, cartes gradées, langue, état..."
        />
      </Field>
      <div className="form-pair">
        <Field label="État général">
          <TextInput value={draft.condition} onChange={(value) => setDraft({ ...draft, condition: value })} />
        </Field>
        <Field label="Prix souhaité">
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
      points: [site.contactEmail, site.supportPhone, copy.footerNote],
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

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
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
                    {statusOptions.map((status) => (
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
                    <a href={`mailto:${order.email}?subject=Votre réservation ${order.id}`}>
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
            <th>Prix souhaité</th>
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
                  <option>Estimation envoyée</option>
                  <option>Acceptée</option>
                  <option>Refusée</option>
                  <option>Archivée</option>
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
    flaws: '',
    privateNote: '',
    reserved: false,
  })

  function persist(next) {
    persistCards(next)
  }

  function updateCard(id, field, value) {
    const numeric = ['price', 'stock'].includes(field)
    persist(cards.map((card) => (card.id === id ? { ...card, [field]: numeric ? Number(value) : value } : card)))
  }

  function addCard(event) {
    event.preventDefault()
    if (!draft.name.trim() || !draft.set.trim()) return
    const nextCard = {
      ...draft,
      id: `kc-${Date.now()}`,
      price: Number(draft.price),
      stock: Number(draft.stock),
      status: 'available',
      reserved: false,
      featured: false,
    }
    persist([nextCard, ...cards])
    setDraft((current) => ({ ...current, name: '', set: '', price: '39.90', stock: '1' }))
  }

  function removeCard(id) {
    removeCardById(id)
  }

  return (
    <section className="admin-panel">
      <div className="panel-title admin-panel-title">
        <h2>Produits</h2>
        <span>Modifie toutes les informations visibles sur les cartes.</span>
      </div>
      <form className="admin-form wide-form" onSubmit={addCard}>
        <Field label="Nom">
          <TextInput value={draft.name} onChange={(value) => setDraft({ ...draft, name: value })} />
        </Field>
        <Field label="Set">
          <TextInput value={draft.set} onChange={(value) => setDraft({ ...draft, set: value })} />
        </Field>
        <Field label="Rareté">
          <TextInput value={draft.rarity} onChange={(value) => setDraft({ ...draft, rarity: value })} />
        </Field>
        <Field label="Type">
          <TextInput value={draft.type} onChange={(value) => setDraft({ ...draft, type: value })} />
        </Field>
        <Field label="État">
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
        <button type="submit">
          <Plus size={18} />
          {t.add}
        </button>
      </form>
      <div className="product-editor-list">
        {cards.map((card) => (
          <article className="editable-product" key={card.id}>
            <CardArt card={card} />
            <div className="editable-grid">
              {[
                ['name', 'Nom'],
                ['set', 'Set'],
                ['rarity', 'Rareté'],
                ['type', 'Type'],
                ['condition', 'État'],
                ['language', 'Langue'],
                ['grade', 'Grade'],
                ['imageUrl', 'Image URL'],
                ['flaws', 'Défauts visibles'],
                ['privateNote', 'Note privée'],
              ].map(([field, label]) => (
                <Field label={label} key={field}>
                  <TextInput value={card[field]} onChange={(value) => updateCard(card.id, field, value)} />
                </Field>
              ))}
              <Field label="Statut">
                <select value={getCardStatus(card)} onChange={(event) => {
                  const status = event.target.value
                  persist(cards.map((item) =>
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
              <Field label="Réservée">
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
        <span>Change les textes français et anglais sans toucher au code.</span>
      </div>
      <div className="translation-grid">
        {['fr', 'en'].map((language) => (
          <div className="translation-card" key={language}>
            <h3>{language === 'fr' ? 'Français' : 'English'}</h3>
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
        <h2>Paramètres</h2>
        <span>Configure la langue par défaut, le contact et la livraison.</span>
      </div>
      <div className="settings-grid">
        <Field label="Code admin">
          <TextInput value={site.adminPin} onChange={(value) => updateSite('adminPin', value)} />
        </Field>
        <Field label="Langue du site">
          <select value={site.language} onChange={(event) => updateSite('language', event.target.value)}>
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </Field>
        <Field label="E-mail de contact">
          <TextInput value={site.contactEmail} onChange={(value) => updateSite('contactEmail', value)} />
        </Field>
        <Field label="Téléphone">
          <TextInput value={site.supportPhone} onChange={(value) => updateSite('supportPhone', value)} />
        </Field>
        <Field label="Alerte stock bas">
          <TextInput type="number" min="0" value={site.lowStockLimit} onChange={(value) => updateSite('lowStockLimit', value)} />
        </Field>
        <Field label="Durée réservation (heures)">
          <TextInput type="number" min="1" value={site.reservationHours} onChange={(value) => updateSite('reservationHours', value)} />
        </Field>
      </div>
    </section>
  )
}

function AdminLogin({ site, t, loginAdmin }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  function submitLogin(event) {
    event.preventDefault()
    if (pin === site.adminPin) {
      setError('')
      loginAdmin()
    } else {
      setError(t.loginError)
    }
  }

  return (
    <main className="simple-page login-page">
      <form className="login-card" onSubmit={submitLogin}>
        <Lock size={34} />
        <h1>{t.loginTitle}</h1>
        <p>{t.loginIntro}</p>
        <Field label="Code">
          <TextInput value={pin} onChange={setPin} />
        </Field>
        {error && <p className="form-error">{error}</p>}
        <button className="checkout" type="submit">
          <Lock size={18} />
          Admin
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
  const revenue = orders.reduce((sum, order) => sum + Number(order.total), 0)
  const stock = cards.reduce((sum, card) => sum + Number(card.stock), 0)
  const lowStock = cards.filter((card) => Number(card.stock) <= Number(site.lowStockLimit)).length

  function updateOrderStatus(id, status) {
    const next = orders.map((order) => (order.id === id ? { ...order, status } : order))
    const order = orders.find((item) => item.id === id)
    if (order?.lines?.length) {
      const nextCards = cards.map((card) => {
        const line = order.lines.find((item) => item.id === card.id)
        if (!line) return card
        if (status === 'Annulée') {
          return {
            ...card,
            status: 'available',
            reserved: false,
            reservedUntil: '',
            stock: Number(card.stock) + Number(line.qty),
          }
        }
        if (status === 'Confirmée') {
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
      item.id === id ? { ...item, status: 'Annulée', privateNote: `${item.privateNote || ''}`.trim() } : item,
    )
    persistCards(nextCards)
    setOrders(nextOrders)
    saveLocal('kc-orders', nextOrders)
    updateRemoteReservation(id, { status: 'Annulée' })
  }

  function updateSellRequestStatus(id, status) {
    const next = sellRequests.map((request) =>
      request.id === id ? { ...request, status } : request,
    )
    setSellRequests(next)
    saveLocal('kc-sell-requests', next)
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
                  <h2>Aperçu boutique</h2>
                  <p>{site.copy[site.language].heroTitle}</p>
                </div>
                <Eye size={28} />
              </section>
              <section className="admin-panel integration-panel">
                <div className="panel-title admin-panel-title">
                  <h2>{t.integrations}</h2>
                  <span>État des connexions nécessaires pour la production.</span>
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
                <h2>Réservations</h2>
                <span>Lis les messages clients et change le statut des réservations.</span>
              </div>
              <OrderTable
                orders={orders}
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
                <span>Demandes envoyées depuis la page Vendre.</span>
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
  const [selected, setSelected] = useState(() => cards[0])
  const [view, setView] = useState('shop')
  const [query, setQuery] = useState('')
  const [type, setType] = useState(labels[site.language].all)
  const [rarity, setRarity] = useState(labels[site.language].allFeminine)
  const [toast, setToast] = useState('')
  const t = labels[site.language]

  useEffect(() => {
    async function loadRemoteData() {
      const config = await getBackendConfig()
      setBackendConfig(config)
      if (!config.databaseEnabled) return

      const [remoteCards, remoteReservations] = await Promise.all([
        fetchCards(),
        fetchReservations(),
      ])

      if (remoteCards.length > 0) {
        const mergedCards = mergeCards(starterCards, remoteCards)
        setCards(mergedCards)
        setSelected(mergedCards[0])
        saveLocal('kc-cards', mergedCards)
      } else {
        syncCards(starterCards)
      }

      if (remoteReservations.length > 0) {
        setOrders(remoteReservations)
        saveLocal('kc-orders', remoteReservations)
      }
    }

    loadRemoteData()
  }, [])

  function persistCards(next) {
    setCards(next)
    saveLocal('kc-cards', next)
    if (backendConfig.databaseEnabled) {
      syncCards(next)
    }
  }

  function removeCardById(id) {
    const next = cards.filter((card) => card.id !== id)
    setCards(next)
    saveLocal('kc-cards', next)
    if (backendConfig.databaseEnabled) {
      deleteRemoteCard(id)
    }
  }

  const filteredCards = useMemo(() => {
    const normalized = query.toLowerCase().trim()
    return cards.filter((card) => {
      const matchQuery = [card.name, card.set, card.rarity, card.type]
        .join(' ')
        .toLowerCase()
        .includes(normalized)
      const matchType = [labels.fr.all, labels.en.all].includes(type) || card.type === type
      const matchRarity =
        [labels.fr.allFeminine, labels.en.allFeminine].includes(rarity) || card.rarity === rarity
      return matchQuery && matchType && matchRarity
    })
  }, [cards, query, rarity, type])

  const japaneseCards = useMemo(
    () => cards.filter((card) => card.language?.toUpperCase() === 'JP'),
    [cards],
  )
  const gradedCards = useMemo(
    () => cards.filter((card) => card.grade && card.grade.toLowerCase() !== 'raw'),
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

  function submitSellRequest(event) {
    event.preventDefault()
    const request = {
      ...sellDraft,
      id: `RACHAT-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Nouvelle',
      date: new Date().toISOString().slice(0, 10),
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
      status: 'Nouvelle réservation',
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
    const nextOrder = {
      ...order,
      emailSent: Boolean(reservationResult.emailSent),
      notificationNote: reservationResult.message,
    }
    const nextCards = cards.map((card) => {
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
    const nextOrders = [nextOrder, ...orders]
    persistCards(nextCards)
    setOrders(nextOrders)
    setCart([])
    setCheckoutDraft(defaultCheckout)
    saveLocal('kc-orders', nextOrders)
    saveLocal('kc-cart', [])
    flash(`${t.orderCreated} ${nextOrder.id}`)
    setView('orders')
  }

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)

  return (
    <div
      className="app-shell"
      data-theme={site.colorMode}
      style={{
        '--red': site.theme.red,
        '--ink': site.theme.ink,
        '--paper': site.theme.paper,
      }}
    >
      <Header
        view={view}
        setView={setView}
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
          addToCart={addToCart}
          cart={cart}
          updateQty={updateQty}
          removeItem={removeItem}
          checkout={checkout}
          checkoutDraft={checkoutDraft}
          setCheckoutDraft={setCheckoutDraft}
          setView={setView}
          filters={{ query, setQuery, type, setType, rarity, setRarity }}
          site={site}
          t={t}
        />
      )}
      {view === 'cards' && (
        <CardsView
          cards={cards}
          setSelected={setSelected}
          addToCart={addToCart}
          setView={setView}
          site={site}
          t={t}
        />
      )}
      {view === 'japanese' && (
        <CollectionPage
          title={site.copy[site.language].japaneseTitle}
          intro={site.copy[site.language].japaneseIntro}
          cards={japaneseCards}
          setSelected={setSelected}
          addToCart={addToCart}
          setView={setView}
          site={site}
          t={t}
        />
      )}
      {view === 'graded' && (
        <CollectionPage
          title={site.copy[site.language].gradedTitle}
          intro={site.copy[site.language].gradedIntro}
          cards={gradedCards}
          setSelected={setSelected}
          addToCart={addToCart}
          setView={setView}
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
          loginAdmin={() => {
            setIsAdminUnlocked(true)
          }}
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
          logoutAdmin={() => {
            setIsAdminUnlocked(false)
          }}
          backendConfig={backendConfig}
        />
      )}
      <Toast toast={toast} />
    </div>
  )
}

export default App
