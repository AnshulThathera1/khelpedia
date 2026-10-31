import BGMISubNav from "./components/BGMISubNav";

export const metadata = {
  title: "BGMI Esports — Tournaments, Rankings, Teams & Match Telemetry",
  description: "Your premier BGMI intelligence command center. Track live Krafton tournaments, team rankings, match telemetry, player performance, and competitive editorial analysis.",
  alternates: {
    canonical: "/bgmi",
  },
  openGraph: {
    title: "BGMI Esports — Tournaments, Rankings & Stats | KhelPediA",
    description: "Real-time BGMI tournament brackets, team standings, player records, and competitive analysis.",
    url: "https://khelpedia.org/bgmi",
    siteName: "KhelPediA",
    type: "website",
    images: ["/images/games/bgmi.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "BGMI Esports — Tournaments, Rankings & Stats | KhelPediA",
    description: "Real-time BGMI tournament brackets, team standings, player records, and competitive analysis.",
    images: ["/images/games/bgmi.png"],
  },
};

export default function BGMILayout({ children }) {
  return (
    <div className="bgmi-hub-layout min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[#F1B11D]/30 pb-20">
      {/* Sticky Secondary Navigation */}
      <BGMISubNav />
      {children}
    </div>
  );
}
