export default defineEventHandler((event) => {
  const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://youfly.vercel.app'
  const today = new Date().toISOString().split('T')[0]

  const pages = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/deals', priority: '0.9', changefreq: 'daily' },
    { path: '/destinations', priority: '0.9', changefreq: 'weekly' },
    { path: '/blog', priority: '0.8', changefreq: 'weekly' },
    { path: '/faq', priority: '0.8', changefreq: 'monthly' },
    { path: '/about', priority: '0.7', changefreq: 'monthly' },
    { path: '/contact', priority: '0.7', changefreq: 'monthly' },
    { path: '/my-booking', priority: '0.6', changefreq: 'monthly' },
    { path: '/flight-status', priority: '0.6', changefreq: 'monthly' },
    { path: '/checkin', priority: '0.7', changefreq: 'monthly' },
    { path: '/luggage', priority: '0.7', changefreq: 'monthly' },
    { path: '/visa', priority: '0.8', changefreq: 'monthly' },
    { path: '/terms', priority: '0.3', changefreq: 'yearly' },
    { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${baseUrl}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  setHeader(event, 'Content-Type', 'application/xml')
  return xml
})
