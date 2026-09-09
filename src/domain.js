// Shared validation for persisted public settings and reservation forms.
export function publicSettings(site) {
  const keys = ['brandName', 'brandMark', 'contactEmail', 'supportPhone',
    'freeShippingFrom', 'shippingFee', 'lowStockLimit', 'reservationHours',
    'language', 'colorMode', 'theme', 'copy']
  return Object.fromEntries(keys.filter((key) => site[key] !== undefined).map((key) => [key, site[key]]))
}

export function validateSettings(site) {
  if (!site.brandName?.trim() || !validEmail(site.contactEmail)) return 'Indique un nom et un e-mail de contact valides.'
  if (!['fr', 'en'].includes(site.language)) return 'Langue invalide.'
  if (!Number.isInteger(Number(site.reservationHours)) || Number(site.reservationHours) < 1 || Number(site.reservationHours) > 168) return 'La durée de réservation doit être comprise entre 1 et 168 heures.'
  if (!Number.isInteger(Number(site.lowStockLimit)) || Number(site.lowStockLimit) < 0) return 'Le seuil de stock doit être un entier positif ou nul.'
  return ''
}

export function validEmail(value) {
  return typeof value === 'string' && value.trim().length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function validCustomer(draft) {
  const length = draft.fullName?.trim().length || 0
  return length >= 2 && length <= 120 && validEmail(draft.email) && (draft.phone?.length || 0) <= 40
}

export function validCart(cart, cards) {
  return Array.isArray(cart) && cart.length > 0 && cart.length <= 20 &&
    new Set(cart.map((line) => line.id)).size === cart.length && cart.every((line) => {
      const card = cards.find((item) => item.id === line.id)
      return card && card.status === 'available' && Number.isInteger(line.qty) && line.qty > 0 && line.qty <= 20 && line.qty <= Number(card.stock)
    })
}

export function safeDecode(value) {
  try { return decodeURIComponent(value) } catch { return '' }
}

// Only a submission receipt belongs on the visitor's device, never admin data.
export function reservationReceipt(order) {
  return {
    id: order.id, total: order.total, items: order.items, date: order.date,
    reservedUntil: order.reservedUntil,
    lines: (Array.isArray(order.lines) ? order.lines.filter(Boolean) : []).map(({ id, name, qty, price }) => ({ id, name, qty, price })),
  }
}
