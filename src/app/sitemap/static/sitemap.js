export default function sitemap() {
  const baseUrl = "https://khelpedia.org";
  
  // Static routes — includes all trust/policy pages
  const routes = [
    '',
    '/tournaments',
    '/blogs',
    '/games',
    '/players',
    '/teams',
    '/valorant',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/cookies',
    '/disclaimer',
    '/editorial-policy',
    '/corrections-policy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'monthly',
    priority: route === '' ? 1 : route === '/blogs' ? 0.9 : 0.7,
  }));

  return routes;
}
