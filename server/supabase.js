import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: new URL('.env', import.meta.url) })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    })
  : null

function toCardRow(card) {
  return {
    id: card.id,
    name: card.name,
    card_set: card.set || card.card_set || 'Set inconnu',
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

export async function listCards() {
  if (!supabase) return []
  const { data, error } = await supabase.from('cards').select('*').order('created_at', { ascending: true })
  if (error) throw error
  return data.map(fromCardRow)
}

export async function saveCards(cards) {
  if (!supabase) return { saved: false }
  const { error } = await supabase.from('cards').upsert(cards.map(toCardRow))
  if (error) throw error
  return { saved: true }
}

export async function saveCard(card) {
  if (!supabase) return { saved: false }
  const { error } = await supabase.from('cards').upsert(toCardRow(card))
  if (error) throw error
  return { saved: true }
}

export async function deleteCard(id) {
  if (!supabase) return { deleted: false }
  const { error } = await supabase.from('cards').delete().eq('id', id)
  if (error) throw error
  return { deleted: true }
}

export async function listReservations() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('reservations')
    .select('*, reservation_items(*, cards(*))')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(fromReservationRow)
}

export async function updateReservation(id, patch) {
  if (!supabase) return { saved: false }
  const row = {}
  if (patch.status !== undefined) row.status = patch.status
  if (patch.privateNote !== undefined) row.private_note = patch.privateNote
  if (patch.emailSent !== undefined) row.email_sent = Boolean(patch.emailSent)
  const { error } = await supabase.from('reservations').update(row).eq('id', id)
  if (error) throw error
  return { saved: true }
}

export async function saveReservation(reservation) {
  if (!supabase) return { saved: false, message: 'Supabase is not configured.' }

  const { error: reservationError } = await supabase.from('reservations').upsert({
    id: reservation.id,
    customer_name: reservation.customer,
    customer_email: reservation.email,
    customer_phone: reservation.phone || null,
    customer_message: reservation.message,
    total: Number(reservation.total) || 0,
    items_count: Number(reservation.items) || reservation.lines.length,
    status: reservation.status || 'Nouvelle réservation',
    reserved_until: reservation.reservedUntil || null,
    private_note: reservation.privateNote || null,
    email_sent: Boolean(reservation.emailSent),
  })

  if (reservationError) throw reservationError

  const cardRows = reservation.lines.map((line) => ({
    ...toCardRow(line),
    stock: 0,
    status: 'reserved',
    reserved_until: reservation.reservedUntil || null,
  }))

  if (cardRows.length > 0) {
    const { error: cardsError } = await supabase.from('cards').upsert(cardRows)
    if (cardsError) throw cardsError
  }

  const itemRows = reservation.lines.map((line) => ({
    reservation_id: reservation.id,
    card_id: line.id,
    quantity: Number(line.qty) || 1,
    unit_price: Number(line.price) || 0,
  }))

  if (itemRows.length > 0) {
    const { error: itemsError } = await supabase.from('reservation_items').insert(itemRows)
    if (itemsError) throw itemsError
  }

  return { saved: true, message: 'Réservation enregistrée dans Supabase.' }
}
