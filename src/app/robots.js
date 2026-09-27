export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/dashboard/', '/debug-blogs/', '/login/', '/auth/', '/api/'],
    },
    sitemap: 'https://khelpedia.org/sitemap.xml',
  }
}
