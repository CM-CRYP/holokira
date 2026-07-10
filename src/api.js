import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

function toCardRow(card) {
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
    image_url: card.imageUrl || null,
    flaws: card.flaws || null,
    private_note: card.privateNote || null,
    featured: Boolean(card.featured),
    badge: card.badge || null,
    tags: card.tags || null,
    added_at: card.addedAt || null,
    color: card.color || '#db2a2a',
  }
}

function fromCardRow(row) {
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
    imageUrl: row.image_url || '',
    flaws: row.flaws || '',
    privateNote: row.private_note || '',
    featured: Boolean(row.featured),
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
    status: request.status || 'Nouvelle',
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
  return data.session
}

export async function signInAdmin({ email, password }) {
  if (!supabase) {
    return { session: null, error: { message: 'Supabase is not configured.' } }
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { session: data.session, error }
}

export async function signOutAdmin() {
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function fetchCards() {
  if (!supabase) return []
  const { data, error } = await supabase.from('cards').select('*').order('created_at')
  if (error) return []
  return data.map(fromCardRow)
}

export async function syncCards(cards) {
  if (!supabase) return { saved: false }
  const { error } = await supabase.from('cards').upsert(cards.map(toCardRow))
  return { saved: !error, error }
}

export async function deleteRemoteCard(id) {
  if (!supabase) return { deleted: false }
  const { error } = await supabase.from('cards').delete().eq('id', id)
  return { deleted: !error, error }
}

export async function fetchReservations() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('reservations')
    .select('*, reservation_items(*, cards(*))')
    .order('created_at', { ascending: false })
  if (error) return []
  return data.map(fromReservationRow)
}

export async function fetchSellRequests() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('sell_requests')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return []
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

  if (rpcError.code !== 'PGRST202') {
    return {
      databaseSaved: false,
      emailSent: false,
      message: `Erreur Supabase : ${rpcError.message}`,
    }
  }

  const { error: reservationError } = await supabase.from('reservations').insert(reservationRow)

  if (reservationError) {
    return {
      databaseSaved: false,
      emailSent: false,
      message: `Erreur Supabase : ${reservationError.message}`,
    }
  }

  const { error: itemsError } = await supabase.from('reservation_items').insert(itemRows)
  if (itemsError) {
    return {
      databaseSaved: false,
      emailSent: false,
      message: `Erreur lignes Supabase : ${itemsError.message}`,
    }
  }

  return {
    databaseSaved: true,
    emailSent: false,
    message: 'Réservation enregistrée dans Supabase.',
  }
}
