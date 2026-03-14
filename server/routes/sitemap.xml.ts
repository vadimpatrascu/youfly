export default defineEventHandler((event) => {
  const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://youfly-xi.vercel.app'
  const today = new Date().toISOString().split('T')[0]

  const blogSlugs = [
    'cum-sa-gasesti-bilete-ieftine',
    'top-destinatii-moldova',
    'bagaj-de-mana-ghid-complet',
    'rezervare-cu-escala-vs-direct',
    'asigurare-calatorie-de-ce',
    'istanbul-ghid-3-zile',
  ]

  const pages = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/deals', priority: '0.9', changefreq: 'daily' },
    { path: '/destinations', priority: '0.9', changefreq: 'weekly' },
    { path: '/blog', priority: '0.8', changefreq: 'weekly' },
    ...blogSlugs.map(slug => ({ path: `/blog/${slug}`, priority: '0.7', changefreq: 'monthly' })),
    { path: '/faq', priority: '0.8', changefreq: 'monthly' },
    { path: '/about', priority: '0.7', changefreq: 'monthly' },
    { path: '/contact', priority: '0.7', changefreq: 'monthly' },
    { path: '/my-booking', priority: '0.6', changefreq: 'monthly' },
    { path: '/flight-status', priority: '0.6', changefreq: 'monthly' },
    { path: '/checkin', priority: '0.7', changefreq: 'monthly' },
    { path: '/luggage', priority: '0.7', changefreq: 'monthly' },
    { path: '/visa', priority: '0.8', changefreq: 'monthly' },
    { path: '/airports', priority: '0.7', changefreq: 'monthly' },
    { path: '/terms', priority: '0.3', changefreq: 'yearly' },
    { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages.map(p => `  <url>
    <loc>${baseUrl}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
    <xhtml:link rel="alternate" hreflang="ro" href="${baseUrl}${p.path}"/>
    <xhtml:link rel="alternate" hreflang="ru" href="${baseUrl}${p.path}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}${p.path}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${p.path}"/>
  </url>`).join('\n')}
</urlset>`

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=86400')
  return xml
})
