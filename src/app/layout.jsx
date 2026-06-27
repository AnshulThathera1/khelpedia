import "./globals.css";
import LayoutWrapper from "./components/LayoutWrapper";
import Script from "next/script";
import { Outfit, Rajdhani, Orbitron } from 'next/font/google';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700'],
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rajdhani',
  weight: ['500', '600', '700'],
});

const orbitron = Orbitron({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-orbitron',
  weight: ['600', '700', '800', '900'],
});

export const metadata = {
  metadataBase: new URL("https://khelpedia.org"),
  title: {
    default: "KhelPediA — Esports Tournaments, Stats & Rankings",
    template: "%s | KhelPediA",
  },
  description:
    "Your ultimate esports hub. Track live tournaments, player stats, team rankings across Valorant, CS2, BGMI, PUBG Mobile, Free Fire, Dota 2 and more.",
  keywords: [
    "esports", "tournaments", "gaming", "stats", "Valorant", "CS2", "BGMI", "PUBG Mobile", "Free Fire", "Dota 2", "rankings"
  ],
  authors: [{ name: "KhelPediA Team" }],
  creator: "KhelPediA",
  openGraph: {
    title: "KhelPediA — Esports Tournaments, Stats & Rankings",
    description:
      "Track live esports tournaments worldwide. Player stats, team rankings, match results.",
    url: "https://khelpedia.org",
    siteName: "KhelPediA",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KhelPediA — Esports Tournaments, Stats & Rankings",
    description:
      "Track live esports tournaments worldwide. Player stats, team rankings, match results.",
  },
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "dJx1z7y3he6vo1cqT3IwvJ9hoHdlEZmsc-3fLJG9IJw",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import { createClient } from "@/utils/supabase/server";

export default async function RootLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-FOUC: set theme class before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('khelpedia-theme');
                  document.documentElement.className = (t === 'light') ? 'light' : 'dark';
                } catch(e) {
                  document.documentElement.className = 'dark';
                }
              })();
            `,
          }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3395571758829715"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=G-H4XKWJEZEY`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-H4XKWJEZEY');
            `,
          }}
        />
        {/* WebSite Schema for Site Name */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'KhelPediA',
              url: 'https://khelpedia.org',
            }),
          }}
        />
        {/* Organization Schema for Trust Signals */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'KhelPediA',
              url: 'https://khelpedia.org',
              logo: 'https://khelpedia.org/icon.png',
              description: 'The definitive esports encyclopedia — real-time tournament tracking, player analytics, team rankings, and original editorial content across all major competitive gaming titles.',
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'contact@khelpedia.org',
                contactType: 'customer service',
              },
              sameAs: [],
            }),
          }}
        />
      </head>
      <body suppressHydrationWarning className={`${outfit.variable} ${rajdhani.variable} ${orbitron.variable}`}>
        <LayoutWrapper user={user}>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
