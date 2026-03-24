/**
 * Email utility — sends transactional emails.
 * Supports Resend (RESEND_API_KEY) or falls back to console logging.
 *
 * To enable real email delivery:
 * 1. Sign up at resend.com
 * 2. Add RESEND_API_KEY to Vercel env vars
 * 3. Verify your domain (youfly.md)
 */

interface EmailPayload {
  to: string
  subject: string
  html: string
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const config = useRuntimeConfig()
  const resendKey = (config as any).resendApiKey

  if (resendKey) {
    // Real email via Resend API
    try {
      const res = await $fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: {
          from: 'YouFly <noreply@youfly.md>',
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
        },
      })
      console.log('[Email] Sent via Resend to', payload.to)
      return true
    } catch (e: any) {
      console.error('[Email] Resend error:', e?.message || e)
      return false
    }
  }

  // Fallback: log to Vercel runtime logs
  console.log('[Email] Would send to', payload.to, '| Subject:', payload.subject)
  return true
}

/**
 * Build a booking confirmation email HTML.
 */
export function buildBookingConfirmationEmail(data: {
  reference: string
  amount: string
  currency: string
  flights: Array<{ from: string; to: string; departure: string }>
}): string {
  const flightRows = data.flights.map(f =>
    `<tr><td style="padding:8px;border-bottom:1px solid #eee">${f.from} → ${f.to}</td><td style="padding:8px;border-bottom:1px solid #eee">${new Date(f.departure).toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td></tr>`
  ).join('')

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;padding:20px">
<div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
  <div style="background:#0284c7;color:white;padding:24px;text-align:center">
    <h1 style="margin:0;font-size:24px">✈ YouFly</h1>
    <p style="margin:8px 0 0;opacity:0.8;font-size:14px">Booking Confirmed</p>
  </div>
  <div style="padding:24px">
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;text-align:center;margin-bottom:20px">
      <p style="margin:0 0 4px;color:#15803d;font-size:14px">Booking Reference</p>
      <p style="margin:0;font-size:28px;font-weight:900;letter-spacing:0.15em;color:#166534;font-family:monospace">${data.reference}</p>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr style="background:#f9fafb"><th style="padding:8px;text-align:left">Flight</th><th style="padding:8px;text-align:left">Departure</th></tr>
      ${flightRows}
    </table>
    <div style="margin-top:16px;padding:12px;background:#f9fafb;border-radius:8px;text-align:center">
      <p style="margin:0;font-size:12px;color:#6b7280">Total paid</p>
      <p style="margin:4px 0 0;font-size:24px;font-weight:900;color:#0284c7">${data.amount} ${data.currency}</p>
    </div>
    <div style="margin-top:20px;text-align:center">
      <a href="https://youfly-xi.vercel.app/my-booking?ref=${data.reference}" style="display:inline-block;background:#0284c7;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">View Booking →</a>
    </div>
  </div>
  <div style="padding:16px;text-align:center;border-top:1px solid #f3f4f6">
    <p style="margin:0;font-size:11px;color:#9ca3af">© 2026 YouFly · Chișinău, Moldova · support@youfly.md</p>
  </div>
</div>
</body></html>`
}
