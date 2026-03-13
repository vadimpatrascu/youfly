create table if not exists public.bookings (
  id              uuid primary key default gen_random_uuid(),
  duffel_order_id text unique not null,
  reference       text unique not null,
  status          text not null default 'confirmed' check (status in ('confirmed','cancelled','pending')),
  total_amount    numeric(10,2) not null,
  currency        char(3) not null default 'EUR',
  raw_offer       jsonb,
  raw_order       jsonb,
  created_at      timestamptz not null default now()
);

create table if not exists public.passengers (
  id           uuid primary key default gen_random_uuid(),
  booking_id   uuid not null references public.bookings(id) on delete cascade,
  type         text not null default 'adult' check (type in ('adult','child','infant_without_seat')),
  first_name   text not null,
  last_name    text not null,
  email        text,
  phone        text,
  dob          date,
  passport_no  text,
  nationality  char(2),
  gender       char(1) check (gender in ('m','f')),
  created_at   timestamptz not null default now()
);

create table if not exists public.leads (
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

create index if not exists bookings_reference_idx on public.bookings (reference);
create index if not exists passengers_booking_id_idx on public.passengers (booking_id);

alter table public.bookings enable row level security;
alter table public.passengers enable row level security;
alter table public.leads enable row level security;
