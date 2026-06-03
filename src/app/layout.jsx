import "./globals.css";
import LayoutWrapper from "./components/LayoutWrapper";

export const metadata = {
  metadataBase: new URL("https://khelpedia.vercel.app"),
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
    url: "https://khelpedia.vercel.app",
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
};

import { createClient } from "@/utils/supabase/server";

export default async function RootLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LayoutWrapper user={user}>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
