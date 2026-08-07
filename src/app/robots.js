export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/dashboard/', '/debug-blogs/', '/login/', '/auth/'],
    },
    sitemap: 'https://khelpedia.org/sitemap.xml',
  }
}
