import "./globals.css";
import AppNavbar from "./components/navbar";
import Footer from "./components/footer";

export const metadata = {
  title: "KhelPediA — Esports Tournaments, Stats & Rankings",
  description:
    "Your ultimate esports hub. Track live tournaments, player stats, team rankings across Valorant, CS2, BGMI, PUBG Mobile, Free Fire, Dota 2 and more.",
  keywords:
    "esports, tournaments, gaming, stats, Valorant, CS2, BGMI, PUBG Mobile, Free Fire, Dota 2, rankings",
  openGraph: {
    title: "KhelPediA — Esports Tournaments, Stats & Rankings",
    description:
      "Track live esports tournaments worldwide. Player stats, team rankings, match results.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppNavbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
