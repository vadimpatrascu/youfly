-- Payments collected via Duffel Payments (card → PaymentIntent → Balance → order)
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  payment_intent_id text not null unique,
  offer_id text not null,
  amount numeric not null,
  currency text not null,
  -- confirmed | order_created | refunded | refund_required
  status text not null default 'confirmed',
  booking_id uuid references bookings(id),
  duffel_order_id text,
  created_at timestamptz not null default now()
);

create index if not exists payments_status_idx on payments (status);

-- Service-role access only (same model as the other tables)
alter table payments enable row level security;
