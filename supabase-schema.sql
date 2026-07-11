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
  image_urls jsonb not null default '[]'::jsonb,
  description text,
  flaws text,
  private_note text,
  negotiable boolean not null default false,
  featured boolean not null default false,
  is_japanese boolean not null default false,
  is_vintage boolean not null default false,
  is_graded boolean not null default false,
  is_promo boolean not null default false,
  badge text,
  tags text,
  added_at date,
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
  status text not null default 'Nouvelle',
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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('card-images', 'card-images', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.cards add column if not exists status text not null default 'available';
alter table public.cards add column if not exists reserved_until timestamptz;
alter table public.cards add column if not exists image_url text;
alter table public.cards add column if not exists image_urls jsonb not null default '[]'::jsonb;
alter table public.cards add column if not exists description text;
alter table public.cards add column if not exists flaws text;
alter table public.cards add column if not exists private_note text;
alter table public.cards add column if not exists negotiable boolean not null default false;
alter table public.cards add column if not exists is_japanese boolean not null default false;
alter table public.cards add column if not exists is_vintage boolean not null default false;
alter table public.cards add column if not exists is_graded boolean not null default false;
alter table public.cards add column if not exists is_promo boolean not null default false;
alter table public.cards add column if not exists badge text;
alter table public.cards add column if not exists tags text;
alter table public.cards add column if not exists added_at date;

alter table public.reservations add column if not exists reserved_until timestamptz;
alter table public.reservations add column if not exists private_note text;
alter table public.reservations add column if not exists email_sent boolean not null default false;
alter table public.reservations alter column status set default 'Nouvelle';

update public.cards
set image_urls = jsonb_build_array(image_url)
where image_url is not null
  and image_url <> ''
  and image_urls = '[]'::jsonb;

update public.reservations
set status = case status
  when 'Nouvelle réservation' then 'Nouvelle'
  when 'Archivée' then 'Annulée'
  else status
end
where status in ('Nouvelle réservation', 'Archivée');

drop policy if exists "Public can read available cards" on public.cards;
drop policy if exists "Public can read cards" on public.cards;
drop policy if exists "Public can upsert cards" on public.cards;
drop policy if exists "Public can update cards" on public.cards;
drop policy if exists "Public can delete cards" on public.cards;
drop policy if exists "Authenticated can upsert cards" on public.cards;
drop policy if exists "Authenticated can update cards" on public.cards;
drop policy if exists "Authenticated can delete cards" on public.cards;
drop policy if exists "Public can read reservations" on public.reservations;
drop policy if exists "Public can create reservations" on public.reservations;
drop policy if exists "Public can update reservations" on public.reservations;
drop policy if exists "Authenticated can read reservations" on public.reservations;
drop policy if exists "Authenticated can update reservations" on public.reservations;
drop policy if exists "Public can read reservation items" on public.reservation_items;
drop policy if exists "Public can create reservation items" on public.reservation_items;
drop policy if exists "Authenticated can read reservation items" on public.reservation_items;
drop policy if exists "Public can create sell requests" on public.sell_requests;
drop policy if exists "Authenticated can read sell requests" on public.sell_requests;
drop policy if exists "Authenticated can update sell requests" on public.sell_requests;
drop policy if exists "Public can read card images" on storage.objects;
drop policy if exists "Authenticated can upload card images" on storage.objects;
drop policy if exists "Authenticated can update card images" on storage.objects;
drop policy if exists "Authenticated can delete card images" on storage.objects;

create policy "Public can read cards"
on public.cards for select
using (true);

create policy "Authenticated can upsert cards"
on public.cards for insert
to authenticated
with check (true);

create policy "Authenticated can update cards"
on public.cards for update
to authenticated
using (true)
with check (true);

create policy "Authenticated can delete cards"
on public.cards for delete
to authenticated
using (true);

create policy "Authenticated can read reservations"
on public.reservations for select
to authenticated
using (true);

create policy "Public can create reservations"
on public.reservations for insert
with check (true);

create policy "Authenticated can update reservations"
on public.reservations for update
to authenticated
using (true)
with check (true);

create policy "Authenticated can read reservation items"
on public.reservation_items for select
to authenticated
using (true);

create policy "Public can create reservation items"
on public.reservation_items for insert
with check (true);

create policy "Public can create sell requests"
on public.sell_requests for insert
with check (true);

create policy "Authenticated can read sell requests"
on public.sell_requests for select
to authenticated
using (true);

create policy "Authenticated can update sell requests"
on public.sell_requests for update
to authenticated
using (true)
with check (true);

create policy "Public can read card images"
on storage.objects for select
using (bucket_id = 'card-images');

create policy "Authenticated can upload card images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'card-images');

create policy "Authenticated can update card images"
on storage.objects for update
to authenticated
using (bucket_id = 'card-images')
with check (bucket_id = 'card-images');

create policy "Authenticated can delete card images"
on storage.objects for delete
to authenticated
using (bucket_id = 'card-images');

create or replace function public.reserve_card_from_item()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  reservation_deadline timestamptz;
  updated_cards integer;
begin
  select reserved_until into reservation_deadline
  from public.reservations
  where id = new.reservation_id;

  update public.cards
  set
    status = 'reserved',
    reserved_until = reservation_deadline,
    stock = greatest(stock - new.quantity, 0)
  where id = new.card_id
    and status = 'available'
    and stock >= new.quantity;

  get diagnostics updated_cards = row_count;

  if updated_cards = 0 then
    raise exception 'Card % is no longer available for reservation', new.card_id;
  end if;

  return new;
end;
$$;

drop trigger if exists reserve_card_after_reservation_item on public.reservation_items;

create trigger reserve_card_after_reservation_item
after insert on public.reservation_items
for each row
execute function public.reserve_card_from_item();

create or replace function public.create_reservation(
  reservation_payload jsonb,
  reservation_items_payload jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
begin
  insert into public.reservations (
    id,
    customer_name,
    customer_email,
    customer_phone,
    customer_message,
    total,
    items_count,
    status,
    reserved_until,
    private_note,
    email_sent
  )
  values (
    reservation_payload->>'id',
    reservation_payload->>'customer_name',
    reservation_payload->>'customer_email',
    nullif(reservation_payload->>'customer_phone', ''),
    reservation_payload->>'customer_message',
    (reservation_payload->>'total')::numeric,
    (reservation_payload->>'items_count')::integer,
    coalesce(reservation_payload->>'status', 'Nouvelle'),
    nullif(reservation_payload->>'reserved_until', '')::timestamptz,
    nullif(reservation_payload->>'private_note', ''),
    coalesce((reservation_payload->>'email_sent')::boolean, false)
  );

  for item in
    select *
    from jsonb_to_recordset(reservation_items_payload) as x(
      card_id text,
      quantity integer,
      unit_price numeric
    )
  loop
    insert into public.reservation_items (
      reservation_id,
      card_id,
      quantity,
      unit_price
    )
    values (
      reservation_payload->>'id',
      item.card_id,
      item.quantity,
      item.unit_price
    );
  end loop;
end;
$$;

grant execute on function public.create_reservation(jsonb, jsonb) to anon, authenticated;
