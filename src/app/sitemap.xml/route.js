export async function GET() {
  const baseUrl = "https://khelpedia.org";
  
  // List of all the sub-sitemaps
  const sitemaps = [
    'static',
    'blogs',
    'tournaments',
    'games',
    'players',
    'teams'
  ];

  const sitemapIndexXML = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (name) => `  <sitemap>
    <loc>${baseUrl}/sitemap/${name}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`
  )
  .join('\n')}
</sitemapindex>`;

  return new Response(sitemapIndexXML, {
    headers: {
      'Content-Type': 'text/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate',
    },
  });
}
