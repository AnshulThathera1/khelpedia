/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "upgrade-insecure-requests"
          }
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/privacy',
        destination: '/privacy-policy',
        permanent: true,
      },
      {
        source: '/cookies',
        destination: '/cookie-policy',
        permanent: true,
      },
      {
        source: '/stories/sitemap.xml',
        destination: '/sitemap/stories/sitemap/0.xml',
        permanent: false,
      },
      {
        source: '/sitemap/stories.xml',
        destination: '/sitemap/stories/sitemap/0.xml',
        permanent: false,
      },
      {
        source: '/sitemap/stories/sitemap.xml',
        destination: '/sitemap/stories/sitemap/0.xml',
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.pandascore.co" },
      { protocol: "https", hostname: "owcdn.net" },
      { protocol: "https", hostname: "*.liquipedia.net" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "static.wikia.nocookie.net" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.vlr.gg" },
    ],
  },
};

export default nextConfig;
