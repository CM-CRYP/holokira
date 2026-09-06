import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

const adminId = '00000000-0000-0000-0000-000000000001'
const otherId = '00000000-0000-0000-0000-000000000002'

test('database migration and reservation workflows in isolated PostgreSQL', async (t) => {
  const db = new PGlite()
  t.after(() => db.close())
  // Only Supabase platform scaffolding is emulated. Application SQL runs unchanged.
  await db.exec(`
    create role anon; create role authenticated; create role service_role;
    create schema auth;
    create table auth.users(id uuid primary key, email text);
    create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated;
    insert into auth.users values ('${adminId}', 'holokira@gmail.com'), ('${otherId}', 'other@example.com');
    create schema storage;
    create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects(id uuid, bucket_id text, name text);
    alter table storage.objects enable row level security;
    create function storage.foldername(text) returns text[] language sql as $$ select string_to_array($1, '/') $$;
  `)
  const schema = await readFile(new URL('../supabase-schema.sql', import.meta.url), 'utf8')
  await db.exec(schema)
  const role = async (name, uid = '') => {
    await db.exec('reset role')
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [uid])
    await db.exec(`set role ${name}`)
  }
  const owner = () => db.exec('reset role')
  const read = async (sql, params = []) => (await db.query(sql, params)).rows
  const card = async (id) => (await read('select * from public.cards where id=$1', [id]))[0]
  const draft = (id, stock = 1) => ({ id, name: id, card_set: 'Test', rarity: 'Rare', type: 'Feu', condition: 'Excellent', language: 'Japonais', grade: 'Raw', price: 10, stock, status: 'available', image_urls: [], thumbnail_urls: [], negotiable: false, featured: false, is_japanese: true, is_vintage: false, is_graded: false, is_promo: false, color: '#db2a2a', private_note: 'admin secret' })
  const save = async (cards) => (await read('select public.admin_save_cards($1::jsonb) as cards', [JSON.stringify(cards)]))[0].cards
  const reserve = async (id, lines, override = {}) => (await read('select public.create_reservation($1::jsonb,$2::jsonb) as receipt', [JSON.stringify({ id, customer_name: 'Test Client', customer_email: 'client@example.com', customer_message: 'Please reserve.', reserved_until: '2099-01-01', ...override }), JSON.stringify(lines.map(([card_id, quantity]) => ({ card_id, quantity, unit_price: 0.01 })))]))[0].receipt
  const transition = (id, status) => db.query('select public.admin_transition_reservation($1,$2)', [id, status])

  await t.test('schema reruns without deleting inventory or private notes', async () => {
    await role('authenticated', adminId)
    await save([draft('multi', 3), draft('single'), draft('expire'), draft('atomic-a')])
    await owner(); await db.exec(schema)
    assert.equal((await card('multi')).stock, 3)
    assert.equal((await read('select note from public.card_private_notes where card_id=$1', ['multi']))[0].note, 'admin secret')
  })
  await t.test('public visitors cannot read customer records or change inventory', async () => {
    await role('anon')
    assert.ok((await card('multi')).updated_at)
    assert.equal('private_note' in await card('multi'), false)
    await assert.rejects(read('select * from public.reservations'))
    await assert.rejects(read('select * from public.card_private_notes'))
    await assert.rejects(read('select * from public.site_settings'))
    await assert.rejects(save([draft('intruder')]))
    await role('authenticated', otherId)
    assert.deepEqual(await read('select * from public.reservations'), [])
    await assert.rejects(save([draft('intruder')]))
    await assert.rejects(db.query("select private.release_reservation_stock('anything')"))
  })
  await t.test('public settings expose only shop fields', async () => {
    await owner()
    await db.query("insert into public.site_settings(id,payload) values ('default',$1)", [JSON.stringify({ brandName: 'HoloKira', reservationHours: 24, secret: 'never-public' })])
    await role('anon')
    const result = (await read('select public.get_public_site_settings() as settings'))[0].settings
    assert.deepEqual(result, { brandName: 'HoloKira', reservationHours: 24 })
  })
  let stale
  await t.test('server sets price and expiry and leaves remaining copies available', async () => {
    stale = await card('multi')
    const receipt = await reserve('RESA-first', [['multi', 1]])
    assert.equal(receipt.total, 10)
    assert.equal(receipt.lines[0].price, 10)
    assert.ok(Date.parse(receipt.reservedUntil) - Date.now() < 25 * 3600000)
    assert.equal((await card('multi')).stock, 2)
    assert.equal((await card('multi')).status, 'available')
    await reserve('RESA-second', [['multi', 2]])
    assert.equal((await card('multi')).stock, 0)
    assert.equal((await card('multi')).status, 'reserved')
    await assert.rejects(reserve('RESA-third', [['multi', 1]]))
  })
  await t.test('stale admin saves roll back the entire batch', async () => {
    await role('authenticated', adminId)
    await assert.rejects(save([draft('aaa-new'), { ...draft('multi', 3), expected_updated_at: stale.updated_at, price: 99 }]))
    assert.equal(await card('aaa-new'), undefined)
    assert.equal((await card('multi')).stock, 0)
    const current = await card('multi')
    await assert.rejects(save([{ ...current, stock: 9, expected_updated_at: current.updated_at }]))
  })
  await t.test('cancellation releases only reserved quantities once', async () => {
    await transition('RESA-first', 'Annulée')
    assert.equal((await card('multi')).stock, 1)
    await transition('RESA-first', 'Annulée')
    assert.equal((await card('multi')).stock, 1)
    await transition('RESA-second', 'Terminée')
    assert.equal((await card('multi')).stock, 1)
    assert.equal((await card('multi')).status, 'available')
    await assert.rejects(transition('RESA-second', 'Annulée'))
  })
  await t.test('completed sales do not expire or re-enter stock', async () => {
    await role('anon'); await reserve('RESA-completed', [['single', 1]])
    await role('authenticated', adminId); await transition('RESA-completed', 'Terminée')
    assert.equal((await card('single')).status, 'sold')
    await owner(); await db.exec("update public.reservations set reserved_until=now()-interval '1 hour' where id='RESA-completed'")
    await role('anon'); await db.query('select public.release_expired_reservations()')
    assert.equal((await card('single')).stock, 0)
    await owner()
    assert.equal((await read("select status from public.reservations where id='RESA-completed'"))[0].status, 'Terminée')
  })
  await t.test('expiry releases stock once and cancelled requests can be reactivated', async () => {
    await role('anon'); await reserve('RESA-expire', [['expire', 1]])
    await owner(); await db.exec("update public.reservations set reserved_until=now()-interval '1 hour' where id='RESA-expire'")
    await role('anon'); await db.query('select public.release_expired_reservations()'); await db.query('select public.release_expired_reservations()')
    assert.equal((await card('expire')).stock, 1)
    await role('authenticated', adminId); await transition('RESA-expire', 'Contactée')
    assert.equal((await card('expire')).stock, 0)
  })
  await t.test('invalid or unavailable lines leave no partial reservation', async () => {
    await role('anon')
    await assert.rejects(reserve('RESA-atomic', [['atomic-a', 1], ['missing', 1]]))
    assert.equal((await card('atomic-a')).stock, 1)
    await assert.rejects(reserve('RESA-empty', [['atomic-a', 1]], { customer_name: null }))
    await owner(); assert.deepEqual(await read("select id from public.reservations where id in ('RESA-atomic','RESA-empty')"), [])
  })
  await t.test('private requests are capability-scoped and hide internal notes', async () => {
    await role('anon')
    const request = (await read('select public.create_japan_request($1) as request', [JSON.stringify({ customer_name: 'Test Client', customer_email: 'test@example.com', card_list: 'Pikachu promo', budget: 100 })]))[0].request
    const result = (await read('select public.get_japan_request_by_token($1) as request', [request.token]))[0].request
    assert.equal(result.cardList, 'Pikachu promo')
    assert.equal('internal_note' in result, false)
    assert.equal('customerEmail' in result, false)
    assert.equal((await read("select public.get_japan_request_by_token('00000000-0000-0000-0000-000000000099') as request"))[0].request, null)
  })
})
