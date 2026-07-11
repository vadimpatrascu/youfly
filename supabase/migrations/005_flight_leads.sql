-- The production Supabase project is shared with another app whose own
-- 'leads' table (CRM schema) collides with youfly's. Flight search leads
-- therefore live in flight_leads. Code writes/reads flight_leads as of this
-- migration. Also adds bookings.confirmation_email_sent, which the
-- send-confirmation endpoint updates.

create table if not exists public.flight_leads (
  id           uuid primary key default gen_random_uuid(),
  from_iata    char(3) not null,
  to_iata      char(3) not null,
  depart_date  date not null,
  return_date  date,
  adults       smallint not null default 1,
  children     smallint not null default 0,
  infants      smallint not null default 0,
  cabin_class  text default 'economy',
  email        text,
  phone        text,
  created_at   timestamptz not null default now()
);

alter table public.flight_leads enable row level security;

alter table public.bookings add column if not exists confirmation_email_sent timestamptz;
