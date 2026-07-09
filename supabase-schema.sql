create table if not exists public.cards (
  id text primary key,
  name text not null,
  card_set text not null,
  rarity text not null,
  type text not null,
  condition text not null,
  language text not null,
  grade text not null,
  price numeric(10, 2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  status text not null default 'available',
  reserved_until timestamptz,
  image_url text,
  flaws text,
  private_note text,
  featured boolean not null default false,
  color text not null default '#db2a2a',
  created_at timestamptz not null default now()
);

create table if not exists public.reservations (
  id text primary key,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  customer_message text not null,
  total numeric(10, 2) not null check (total >= 0),
  items_count integer not null check (items_count >= 0),
  status text not null default 'Nouvelle réservation',
  reserved_until timestamptz,
  private_note text,
  email_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.reservation_items (
  id bigint generated always as identity primary key,
  reservation_id text not null references public.reservations(id) on delete cascade,
  card_id text not null references public.cards(id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0)
);

create table if not exists public.sell_requests (
  id text primary key,
  full_name text not null,
  email text not null,
  phone text,
  card_list text not null,
  condition text,
  expected_price text,
  status text not null default 'Nouvelle',
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id text primary key default 'default',
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.cards enable row level security;
alter table public.reservations enable row level security;
alter table public.reservation_items enable row level security;
alter table public.sell_requests enable row level security;
alter table public.site_settings enable row level security;

alter table public.cards add column if not exists status text not null default 'available';
alter table public.cards add column if not exists reserved_until timestamptz;
alter table public.cards add column if not exists image_url text;
alter table public.cards add column if not exists flaws text;
alter table public.cards add column if not exists private_note text;

alter table public.reservations add column if not exists reserved_until timestamptz;
alter table public.reservations add column if not exists private_note text;
alter table public.reservations add column if not exists email_sent boolean not null default false;

drop policy if exists "Public can read available cards" on public.cards;
drop policy if exists "Public can read cards" on public.cards;
drop policy if exists "Public can upsert cards" on public.cards;
drop policy if exists "Public can update cards" on public.cards;
drop policy if exists "Public can delete cards" on public.cards;
drop policy if exists "Public can read reservations" on public.reservations;
drop policy if exists "Public can create reservations" on public.reservations;
drop policy if exists "Public can update reservations" on public.reservations;
drop policy if exists "Public can read reservation items" on public.reservation_items;
drop policy if exists "Public can create reservation items" on public.reservation_items;
drop policy if exists "Public can create sell requests" on public.sell_requests;

create policy "Public can read cards"
on public.cards for select
using (true);

create policy "Public can upsert cards"
on public.cards for insert
with check (true);

create policy "Public can update cards"
on public.cards for update
using (true)
with check (true);

create policy "Public can delete cards"
on public.cards for delete
using (true);

create policy "Public can read reservations"
on public.reservations for select
using (true);

create policy "Public can create reservations"
on public.reservations for insert
with check (true);

create policy "Public can update reservations"
on public.reservations for update
using (true)
with check (true);

create policy "Public can read reservation items"
on public.reservation_items for select
using (true);

create policy "Public can create reservation items"
on public.reservation_items for insert
with check (true);

create policy "Public can create sell requests"
on public.sell_requests for insert
with check (true);
