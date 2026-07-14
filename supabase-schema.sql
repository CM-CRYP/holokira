begin;

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

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.card_private_notes (
  card_id text primary key references public.cards(id) on delete cascade,
  note text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.cards add column if not exists status text not null default 'available';
alter table public.cards add column if not exists reserved_until timestamptz;
alter table public.cards add column if not exists image_url text;
alter table public.cards add column if not exists image_urls jsonb not null default '[]'::jsonb;
alter table public.cards add column if not exists description text;
alter table public.cards add column if not exists flaws text;
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

-- Keep existing private notes, then remove them from the publicly readable table.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'cards'
      and column_name = 'private_note'
  ) then
    execute $migration$
      insert into public.card_private_notes (card_id, note)
      select id, private_note
      from public.cards
      where private_note is not null and private_note <> ''
      on conflict (card_id) do update
      set note = excluded.note, updated_at = now()
    $migration$;
    execute 'alter table public.cards drop column private_note';
  end if;
end
$$;

-- Only this Supabase Auth account is promoted. Re-run the script after creating it.
insert into public.admin_users (user_id)
select id
from auth.users
where lower(email) = lower('holokira@gmail.com')
on conflict (user_id) do nothing;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_admin();
$$;

revoke all on function public.is_current_user_admin() from public, anon;
grant execute on function public.is_current_user_admin() to authenticated;

alter table public.cards enable row level security;
alter table public.reservations enable row level security;
alter table public.reservation_items enable row level security;
alter table public.sell_requests enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_users enable row level security;
alter table public.card_private_notes enable row level security;

-- Remove every previous policy on application-owned tables to avoid stale access.
do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'cards',
        'reservations',
        'reservation_items',
        'sell_requests',
        'site_settings',
        'admin_users',
        'card_private_notes'
      )
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  end loop;
end
$$;

create policy "Public can read cards"
on public.cards for select
to anon, authenticated
using (true);

create policy "Admins can insert cards"
on public.cards for insert
to authenticated
with check ((select private.is_admin()));

create policy "Admins can update cards"
on public.cards for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins can delete cards"
on public.cards for delete
to authenticated
using ((select private.is_admin()));

create policy "Admins can read reservations"
on public.reservations for select
to authenticated
using ((select private.is_admin()));

create policy "Admins can update reservations"
on public.reservations for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins can delete reservations"
on public.reservations for delete
to authenticated
using ((select private.is_admin()));

create policy "Admins can read reservation items"
on public.reservation_items for select
to authenticated
using ((select private.is_admin()));

create policy "Public can create sell requests"
on public.sell_requests for insert
to anon, authenticated
with check (
  status = 'Nouvelle'
  and char_length(id) between 6 and 100
  and char_length(trim(full_name)) between 2 and 120
  and char_length(trim(email)) between 5 and 254
  and position('@' in email) > 1
  and char_length(card_list) between 3 and 5000
  and coalesce(char_length(phone), 0) <= 40
  and coalesce(char_length(condition), 0) <= 500
  and coalesce(char_length(expected_price), 0) <= 200
);

create policy "Admins can read sell requests"
on public.sell_requests for select
to authenticated
using ((select private.is_admin()));

create policy "Admins can update sell requests"
on public.sell_requests for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins can delete sell requests"
on public.sell_requests for delete
to authenticated
using ((select private.is_admin()));

create policy "Admins can manage site settings"
on public.site_settings for all
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins can read private card notes"
on public.card_private_notes for select
to authenticated
using ((select private.is_admin()));

create policy "Admins can insert private card notes"
on public.card_private_notes for insert
to authenticated
with check ((select private.is_admin()));

create policy "Admins can update private card notes"
on public.card_private_notes for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins can delete private card notes"
on public.card_private_notes for delete
to authenticated
using ((select private.is_admin()));

revoke all on public.cards from anon, authenticated;
grant select on public.cards to anon, authenticated;
grant insert, update, delete on public.cards to authenticated;

revoke all on public.reservations from anon, authenticated;
grant select, update, delete on public.reservations to authenticated;

revoke all on public.reservation_items from anon, authenticated;
grant select on public.reservation_items to authenticated;

revoke all on public.sell_requests from anon, authenticated;
grant insert on public.sell_requests to anon, authenticated;
grant select, update, delete on public.sell_requests to authenticated;

revoke all on public.site_settings from anon, authenticated;
grant select, insert, update, delete on public.site_settings to authenticated;

revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to service_role;

revoke all on public.card_private_notes from anon, authenticated;
grant select, insert, update, delete on public.card_private_notes to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('card-images', 'card-images', true, 5242880, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read card images" on storage.objects;
drop policy if exists "Authenticated can upload card images" on storage.objects;
drop policy if exists "Authenticated can update card images" on storage.objects;
drop policy if exists "Authenticated can delete card images" on storage.objects;
drop policy if exists "Admins can read card images" on storage.objects;
drop policy if exists "Admins can upload card images" on storage.objects;
drop policy if exists "Admins can update card images" on storage.objects;
drop policy if exists "Admins can delete card images" on storage.objects;

create policy "Admins can read card images"
on storage.objects for select
to authenticated
using (bucket_id = 'card-images' and (select private.is_admin()));

create policy "Admins can upload card images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'card-images'
  and (storage.foldername(name))[1] = 'cards'
  and (select private.is_admin())
);

create policy "Admins can update card images"
on storage.objects for update
to authenticated
using (bucket_id = 'card-images' and (select private.is_admin()))
with check (
  bucket_id = 'card-images'
  and (storage.foldername(name))[1] = 'cards'
  and (select private.is_admin())
);

create policy "Admins can delete card images"
on storage.objects for delete
to authenticated
using (bucket_id = 'card-images' and (select private.is_admin()));

drop trigger if exists reserve_card_after_reservation_item on public.reservation_items;
drop function if exists public.reserve_card_from_item();

create or replace function public.create_reservation(
  reservation_payload jsonb,
  reservation_items_payload jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  reservation_id text := trim(reservation_payload->>'id');
  customer_name text := trim(reservation_payload->>'customer_name');
  customer_email text := lower(trim(reservation_payload->>'customer_email'));
  customer_phone text := nullif(trim(reservation_payload->>'customer_phone'), '');
  customer_message text := trim(reservation_payload->>'customer_message');
  reservation_deadline timestamptz;
  item record;
  current_price numeric(10, 2);
  current_stock integer;
  current_status text;
  calculated_total numeric(10, 2) := 0;
  calculated_items integer := 0;
begin
  if reservation_payload is null or reservation_items_payload is null then
    raise exception 'Reservation incomplete';
  end if;

  if reservation_id !~ '^[A-Za-z0-9_-]{6,100}$' then
    raise exception 'Identifiant de reservation invalide';
  end if;

  if char_length(customer_name) not between 2 and 120 then
    raise exception 'Nom client invalide';
  end if;

  if char_length(customer_email) not between 5 and 254 or position('@' in customer_email) <= 1 then
    raise exception 'Adresse e-mail invalide';
  end if;

  if customer_phone is not null and char_length(customer_phone) > 40 then
    raise exception 'Numero de telephone invalide';
  end if;

  if char_length(customer_message) not between 1 and 2000 then
    raise exception 'Message invalide';
  end if;

  if jsonb_typeof(reservation_items_payload) <> 'array'
    or jsonb_array_length(reservation_items_payload) not between 1 and 20 then
    raise exception 'Liste de cartes invalide';
  end if;

  begin
    reservation_deadline := nullif(reservation_payload->>'reserved_until', '')::timestamptz;
  exception when others then
    reservation_deadline := null;
  end;

  if reservation_deadline is null or reservation_deadline <= now() then
    reservation_deadline := now() + interval '48 hours';
  end if;
  reservation_deadline := least(reservation_deadline, now() + interval '7 days');

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
  ) values (
    reservation_id,
    customer_name,
    customer_email,
    customer_phone,
    customer_message,
    0,
    0,
    'Nouvelle',
    reservation_deadline,
    null,
    false
  );

  for item in
    select card_id, sum(quantity)::integer as quantity
    from jsonb_to_recordset(reservation_items_payload) as x(
      card_id text,
      quantity integer,
      unit_price numeric
    )
    group by card_id
  loop
    if item.card_id is null or item.quantity is null or item.quantity < 1 or item.quantity > 20 then
      raise exception 'Ligne de reservation invalide';
    end if;

    select price, stock, status
    into current_price, current_stock, current_status
    from public.cards
    where id = item.card_id
    for update;

    if not found then
      raise exception 'Carte introuvable';
    end if;

    if current_status <> 'available' or current_stock < item.quantity then
      raise exception 'Cette carte n est plus disponible';
    end if;

    update public.cards
    set
      status = 'reserved',
      reserved_until = reservation_deadline,
      stock = stock - item.quantity
    where id = item.card_id;

    insert into public.reservation_items (
      reservation_id,
      card_id,
      quantity,
      unit_price
    ) values (
      reservation_id,
      item.card_id,
      item.quantity,
      current_price
    );

    calculated_total := calculated_total + (current_price * item.quantity);
    calculated_items := calculated_items + item.quantity;
  end loop;

  update public.reservations
  set total = calculated_total, items_count = calculated_items
  where id = reservation_id;
end;
$$;

revoke all on function public.create_reservation(jsonb, jsonb) from public;
grant execute on function public.create_reservation(jsonb, jsonb) to anon, authenticated;

commit;
