# YouFly

Flight search & booking site for the Moldovan market (RO/RU/EN). Nuxt 3 on Vercel,
flights via the [Duffel API](https://duffel.com), card payments via **Duffel Payments**,
data in Supabase, transactional email via Resend.

## How a booking works

1. `/api/search` creates a Duffel offer request and returns simplified offers.
2. The customer picks a flight, enters passengers, picks seats.
3. `/api/payment/intent` re-prices the offer server-side and creates a Duffel
   PaymentIntent. The charge equals `offer total / (1 − fee rate)` so the Balance
   top-up covers the order; the fee is shown as its own line item.
4. The payment page renders Duffel's `<duffel-payments>` card component
   (Stripe-backed, 3D Secure included).
5. `/api/book` verifies the paid intent (amount, currency, single-use), confirms it
   (tops up the Balance), creates the order, and stores everything in Supabase.
   **If issuance fails after the charge, the payment is refunded automatically.**

## Setup

```sh
npm install --include=dev
npm run dev
```

Environment variables (see `.env.example`):

| Var | Purpose |
|---|---|
| `NUXT_DUFFEL_API_TOKEN` | Duffel access token (`duffel_test_…` or `duffel_live_…`) |
| `NUXT_SUPABASE_URL` / `NUXT_SUPABASE_SERVICE_ROLE_KEY` | Bookings/leads storage |
| `NUXT_ADMIN_SECRET` | Bearer secret for `/api/admin/stats` |
| `NUXT_PAYMENTS_FEE_RATE` | Duffel Payments fee rate (default `0.029`) |
| `NUXT_PUBLIC_SITE_URL` | Canonical site URL |
| `NUXT_DUFFEL_API_BASE` | Override Duffel base URL (integration tests only) |

Run the Supabase migrations in `supabase/migrations/` (or `supabase db push`).

## Testing

```sh
npm test              # unit tests (vitest)
npm run mock:duffel   # terminal 1: mock Duffel API on :4545
# terminal 2: run the built site against the mock
npm run build
NUXT_DUFFEL_API_TOKEN=x NUXT_DUFFEL_API_BASE=http://127.0.0.1:4545 PORT=3100 node .output/server/index.mjs
npm run test:e2e      # terminal 3: 68 API-level end-to-end checks
npm run test:browser  # headless-Chrome run of the full booking funnel
```

The e2e suite covers the full purchase pipeline: search → intent → pay → confirm →
order, plus double-spend/amount-mismatch rejection, the auto-refund path, rate
limiting, and soft-404 behaviour.

## Going live (checklist)

1. Enable **Duffel Payments** on your Duffel account (Dashboard → Payments).
   Availability is limited to certain countries — confirm with Duffel support
   that your account is eligible.
2. Verify the whole flow in **test mode** first: deploy with a `duffel_test_…`
   token and book with card `4242 4242 4242 4242` (any future expiry/CVC).
3. Get live access from Duffel, set the `duffel_live_…` token in Vercel env vars.
4. Check your actual Payments fee rate in the dashboard and set
   `NUXT_PAYMENTS_FEE_RATE` accordingly (too low → orders fail and auto-refund).
5. Watch the logs for `REFUND REQUIRED` entries — those need a manual refund in
   the Duffel dashboard.
