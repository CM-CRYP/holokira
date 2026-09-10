-- Limits successful public submissions; not a replacement for a CAPTCHA or edge WAF.
-- Triggers cover both RPC calls and direct sell_requests inserts, including upserts.
create table if not exists private.submission_limits (
  scope text not null,
  subject text not null,
  period text not null check (period in ('hour', 'day')),
  window_start timestamptz not null,
  submissions integer not null check (submissions > 0),
  primary key (scope, subject, period)
);
alter table private.submission_limits enable row level security;
revoke all on private.submission_limits from public, anon, authenticated;

create or replace function private.limit_public_submission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  email_value text;
  subject_key text;
  period_name text;
  bucket_start timestamptz;
  submitted integer;
  maximum integer;
begin
  if private.is_admin() then return new; end if;
  email_value := lower(trim(case when TG_TABLE_NAME = 'sell_requests'
    then to_jsonb(new)->>'email' else to_jsonb(new)->>'customer_email' end));
  if email_value is null or char_length(email_value) not between 5 and 254
    or email_value !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'Adresse e-mail invalide' using errcode = '22023';
  end if;
  -- Fixed order and atomic upserts serialize concurrent submissions without races.
  -- Server timestamps prevent backdating. Global ceilings also bound rotating emails.
  foreach subject_key in array array['global', 'email:' || md5(email_value)] loop
    foreach period_name in array array['hour', 'day'] loop
      bucket_start := date_trunc(period_name, statement_timestamp(), 'UTC');
      maximum := case
        when subject_key = 'global' and period_name = 'hour' then 200
        when subject_key = 'global' then 1000
        when TG_TABLE_NAME = 'stock_alerts' and period_name = 'hour' then 20
        when TG_TABLE_NAME = 'stock_alerts' then 50
        when period_name = 'hour' then 5
        else 15 end;
      insert into private.submission_limits as counters
        (scope, subject, period, window_start, submissions)
      values (TG_TABLE_NAME, subject_key, period_name, bucket_start, 1)
      on conflict (scope, subject, period) do update
      set window_start = excluded.window_start,
          submissions = case when counters.window_start = excluded.window_start
            then counters.submissions + 1 else 1 end
      returning submissions into submitted;
      if submitted > maximum then
        raise exception 'Trop de demandes. Réessaie plus tard ou contacte la boutique.'
          using errcode = 'P0001';
      end if;
    end loop;
  end loop;
  -- Keep only recent counters; no raw email or IP address is stored here.
  delete from private.submission_limits
    where window_start < statement_timestamp() - interval '2 days';
  return new;
end;
$$;
revoke all on function private.limit_public_submission() from public, anon, authenticated;

drop trigger if exists limit_public_submission on public.reservations;
create trigger limit_public_submission before insert on public.reservations
for each row execute function private.limit_public_submission();
drop trigger if exists limit_public_submission on public.sell_requests;
create trigger limit_public_submission before insert on public.sell_requests
for each row execute function private.limit_public_submission();
drop trigger if exists limit_public_submission on public.japan_requests;
create trigger limit_public_submission before insert on public.japan_requests
for each row execute function private.limit_public_submission();
drop trigger if exists limit_public_submission on public.stock_alerts;
create trigger limit_public_submission before insert on public.stock_alerts
for each row execute function private.limit_public_submission();
