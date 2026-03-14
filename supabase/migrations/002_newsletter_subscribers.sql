-- Newsletter subscribers table
-- Replaces the hack of storing subscribers in the leads table

create table if not exists public.newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  subscribed_at timestamptz not null default now(),
  constraint newsletter_subscribers_email_unique unique (email)
);

alter table public.newsletter_subscribers enable row level security;
