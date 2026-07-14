import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

function getCardImages(card) {
  const images = Array.isArray(card.imageUrls) ? card.imageUrls : []
  return [...images, card.imageUrl].filter(Boolean).filter((image, index, list) => list.indexOf(image) === index)
}

function toCardRow(card) {
  const images = getCardImages(card)

  return {
    id: card.id,
    name: card.name,
    card_set: card.set || 'Set inconnu',
    rarity: card.rarity || 'Non renseignée',
    type: card.type || 'Non renseigné',
    condition: card.condition || 'Non renseigné',
    language: card.language || 'FR',
    grade: card.grade || 'Raw',
    price: Number(card.price) || 0,
    stock: Number(card.stock) || 0,
    status: card.status || (card.reserved ? 'reserved' : 'available'),
    reserved_until: card.reservedUntil || null,
    image_url: images[0] || null,
    image_urls: images,
    description: card.description || null,
    flaws: card.flaws || null,
    negotiable: Boolean(card.negotiable),
    featured: Boolean(card.featured),
    is_japanese: Boolean(card.isJapanese),
    is_vintage: Boolean(card.isVintage),
    is_graded: Boolean(card.isGraded),
    is_promo: Boolean(card.isPromo),
    badge: card.badge || null,
    tags: card.tags || null,
    added_at: card.addedAt || null,
    color: card.color || '#db2a2a',
  }
}

function fromCardRow(row) {
  const imageUrls = Array.isArray(row.image_urls)
    ? row.image_urls
    : [row.image_url].filter(Boolean)

  return {
    id: row.id,
    name: row.name,
    set: row.card_set,
    rarity: row.rarity,
    type: row.type,
    condition: row.condition,
    language: row.language,
    grade: row.grade,
    price: Number(row.price),
    stock: Number(row.stock),
    status: row.status,
    reserved: row.status === 'reserved',
    reservedUntil: row.reserved_until || '',
    imageUrl: imageUrls[0] || row.image_url || '',
    imageUrls,
    description: row.description || '',
    flaws: row.flaws || '',
    privateNote: '',
    negotiable: Boolean(row.negotiable),
    featured: Boolean(row.featured),
    isJapanese: Boolean(row.is_japanese),
    isVintage: Boolean(row.is_vintage),
    isGraded: Boolean(row.is_graded),
    isPromo: Boolean(row.is_promo),
    badge: row.badge || '',
    tags: row.tags || '',
    addedAt: row.added_at || row.created_at || '',
    color: row.color,
  }
}

function fromReservationRow(row) {
  return {
    id: row.id,
    customer: row.customer_name,
    email: row.customer_email,
    phone: row.customer_phone || '',
    message: row.customer_message,
    total: Number(row.total),
    items: Number(row.items_count),
    status: row.status,
    reservedUntil: row.reserved_until || '',
    privateNote: row.private_note || '',
    emailSent: Boolean(row.email_sent),
    date: row.created_at?.slice(0, 10) || '',
    lines: (row.reservation_items || []).map((item) => ({
      id: item.card_id,
      qty: Number(item.quantity),
      price: Number(item.unit_price),
      name: item.cards?.name || item.card_id,
      set: item.cards?.card_set || '',
      rarity: item.cards?.rarity || '',
      type: item.cards?.type || '',
      condition: item.cards?.condition || '',
      language: item.cards?.language || '',
      grade: item.cards?.grade || '',
      color: item.cards?.color || '#db2a2a',
    })),
  }
}

function toSellRequestRow(request) {
  return {
    id: request.id,
    full_name: request.fullName,
    email: request.email,
    phone: request.phone || null,
    card_list: request.cardList,
    condition: request.condition || null,
    expected_price: request.expectedPrice || null,
    status: 'Nouvelle',
  }
}

function fromSellRequestRow(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone || '',
    cardList: row.card_list,
    condition: row.condition || '',
    expectedPrice: row.expected_price || '',
    status: row.status,
    date: row.created_at?.slice(0, 10) || '',
  }
}

export async function getBackendConfig() {
  return {
    emailEnabled: false,
    databaseEnabled: Boolean(supabase),
  }
}

export async function getAdminSession() {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  if (!data.session) return null

  const { data: isAdmin, error } = await supabase.rpc('is_current_user_admin')
  if (error || isAdmin !== true) {
    await supabase.auth.signOut()
    return null
  }

  return data.session
}

export async function signInAdmin({ email, password }) {
  if (!supabase) {
    return { session: null, error: { message: 'Supabase is not configured.' } }
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.session) return { session: null, error }

  const { data: isAdmin, error: accessError } = await supabase.rpc('is_current_user_admin')
  if (accessError || isAdmin !== true) {
    await supabase.auth.signOut()
    return {
      session: null,
      error: {
        message: accessError
          ? 'Sécurité Supabase non installée. Relance le fichier supabase-schema.sql.'
          : "Ce compte n'est pas autorisé à ouvrir l'administration.",
      },
    }
  }

  return { session: data.session, error: null }
}

export async function signOutAdmin() {
  if (!supabase) return
  await supabase.auth.signOut()
}

export function onAdminAuthStateChange(callback) {
  if (!supabase) return () => {}

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!session) callback(null)
  })

  return () => data.subscription.unsubscribe()
}

export async function fetchCards({ includePrivateNotes = false } = {}) {
  if (!supabase) return null
  const { data, error } = await supabase.from('cards').select('*').order('created_at')
  if (error) return null

  const cards = data.map(fromCardRow)
  if (!includePrivateNotes || cards.length === 0) return cards

  const { data: notes, error: notesError } = await supabase
    .from('card_private_notes')
    .select('card_id, note')

  if (notesError) return cards

  const noteByCard = new Map(notes.map((row) => [row.card_id, row.note]))
  return cards.map((card) => ({ ...card, privateNote: noteByCard.get(card.id) || '' }))
}

export async function syncCards(cards) {
  if (!supabase) return { saved: false }
  if (cards.length === 0) return { saved: true }

  const { error } = await supabase.from('cards').upsert(cards.map(toCardRow))
  if (error) return { saved: false, error }

  const noteRows = cards.map((card) => ({
    card_id: card.id,
    note: card.privateNote || '',
    updated_at: new Date().toISOString(),
  }))
  const { error: notesError } = await supabase.from('card_private_notes').upsert(noteRows)
  return { saved: !notesError, error: notesError }
}

export async function deleteRemoteCard(id) {
  if (!supabase) return { deleted: false }
  const { error } = await supabase.from('cards').delete().eq('id', id)
  return { deleted: !error, error }
}

export async function uploadCardImage(blob, fileName = 'card') {
  if (!supabase) return { url: '', storageEnabled: false }
  if (!blob) return { url: '', error: { message: 'Image vide.' } }

  const safeName = fileName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'card'

  const path = `cards/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}.webp`
  const { error } = await supabase.storage
    .from('card-images')
    .upload(path, blob, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: false,
    })

  if (error) return { url: '', error, storageEnabled: true }

  const { data } = supabase.storage.from('card-images').getPublicUrl(path)
  return { url: data.publicUrl, path, storageEnabled: true }
}

export async function fetchReservations() {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('reservations')
    .select('*, reservation_items(*, cards(*))')
    .order('created_at', { ascending: false })
  if (error) return null
  return data.map(fromReservationRow)
}

export async function fetchSellRequests() {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('sell_requests')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return null
  return data.map(fromSellRequestRow)
}

export async function updateRemoteReservation(id, patch) {
  if (!supabase) return { saved: false }
  const row = {}
  if (patch.status !== undefined) row.status = patch.status
  if (patch.privateNote !== undefined) row.private_note = patch.privateNote
  const { error } = await supabase.from('reservations').update(row).eq('id', id)
  return { saved: !error, error }
}

export async function updateRemoteSellRequest(id, patch) {
  if (!supabase) return { saved: false }
  const row = {}
  if (patch.status !== undefined) row.status = patch.status
  const { error } = await supabase.from('sell_requests').update(row).eq('id', id)
  return { saved: !error, error }
}

export async function submitSellRequest(request) {
  if (!supabase) {
    return {
      databaseSaved: false,
      message: 'Demande enregistrée localement. Configure Supabase pour la synchroniser.',
    }
  }
  const { error } = await supabase.from('sell_requests').insert(toSellRequestRow(request))
  return {
    databaseSaved: !error,
    message: error ? `Erreur Supabase : ${error.message}` : 'Demande enregistrée dans Supabase.',
    error,
  }
}

export async function submitReservation({ reservation }) {
  if (!supabase) {
    return {
      databaseSaved: false,
      emailSent: false,
      message: 'Réservation enregistrée localement. Configure Supabase pour la synchroniser.',
    }
  }

  const reservationRow = {
    id: reservation.id,
    customer_name: reservation.customer,
    customer_email: reservation.email,
    customer_phone: reservation.phone || null,
    customer_message: reservation.message,
    total: Number(reservation.total) || 0,
    items_count: Number(reservation.items) || reservation.lines.length,
    status: reservation.status || 'Nouvelle',
    reserved_until: reservation.reservedUntil || null,
    private_note: reservation.privateNote || null,
    email_sent: false,
  }

  const itemRows = reservation.lines.map((line) => ({
    reservation_id: reservation.id,
    card_id: line.id,
    quantity: Number(line.qty) || 1,
    unit_price: Number(line.price) || 0,
  }))

  const { error: rpcError } = await supabase.rpc('create_reservation', {
    reservation_payload: reservationRow,
    reservation_items_payload: itemRows,
  })

  if (!rpcError) {
    return {
      databaseSaved: true,
      emailSent: false,
      message: 'Réservation enregistrée dans Supabase.',
    }
  }

  return {
    databaseSaved: false,
    emailSent: false,
    message: rpcError.code === 'PGRST202'
      ? 'Sécurité Supabase non installée. Relance le fichier supabase-schema.sql.'
      : `Erreur Supabase : ${rpcError.message}`,
    error: rpcError,
  }
}
