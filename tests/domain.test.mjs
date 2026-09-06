import test from 'node:test'
import assert from 'node:assert/strict'
import { validCart, validCustomer, validEmail, publicSettings, reservationReceipt, safeDecode, validateSettings } from '../src/domain.js'
import { starterSite } from '../src/data.js'

test('forms reject whitespace, invalid contact details and malformed quantities', () => {
  assert.equal(validCustomer({ fullName: '  ', email: 'a@b.fr' }), false)
  assert.equal(validEmail('a@b'), false)
  assert.equal(validCustomer({ fullName: 'Client Test', email: ' test@example.com ' }), true)
  const cards = [{ id: 'a', stock: 2, status: 'available' }]
  assert.equal(validCart([{ id: 'a', qty: 2 }], cards), true)
  for (const qty of [-1, 0, 1.2, 3, NaN, '1']) assert.equal(validCart([{ id: 'a', qty }], cards), false)
  assert.equal(validCart([{ id: 'missing', qty: 1 }], cards), false)
  assert.equal(validCart([{ id: 'a', qty: 1 }, { id: 'a', qty: 1 }], cards), false)
  assert.equal(validCart([{ id: 'a', qty: 1 }], [{ ...cards[0], status: 'reserved' }]), false)
})

test('visitor receipts never retain customer records or private admin notes', () => {
  const receipt = reservationReceipt({ id: 'RESA-test', customer: 'Private', email: 'private@example.com', phone: '123', privateNote: 'secret', history: ['secret'], lines: [{ id: 'a', name: 'Carte', qty: 1, price: 10, privateNote: 'secret' }] })
  assert.equal(JSON.stringify(receipt).includes('secret'), false)
  assert.equal('email' in receipt, false)
  assert.equal('customer' in receipt, false)
  assert.deepEqual(receipt.lines, [{ id: 'a', name: 'Carte', qty: 1, price: 10 }])
})

test('settings are whitelisted and bounded; malformed deep links are harmless', () => {
  assert.equal('secret' in publicSettings({ ...starterSite, secret: 'private' }), false)
  assert.equal(validateSettings(starterSite), '')
  assert.ok(validateSettings({ ...starterSite, reservationHours: 0 }))
  assert.ok(validateSettings({ ...starterSite, reservationHours: 169 }))
  assert.ok(validateSettings({ ...starterSite, lowStockLimit: -1 }))
  assert.equal(safeDecode('%E0%A4%A'), '')
  assert.equal(safeDecode('kc%20test'), 'kc test')
})
