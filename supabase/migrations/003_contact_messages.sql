create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  subject     text not null default 'other',
  message     text not null,
  created_at  timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Allow service role to insert/read (used by server-side API)
-- No public read access
