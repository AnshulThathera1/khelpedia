import Link from "next/link";

const PORTAL_TABS = [
  { label: "Teams", href: "/games/valorant/teams" },
  { label: "Transfers", href: "/games/valorant/transfers" },
  { label: "Tournaments", href: "/games/valorant/tournaments" },
  { label: "Agents", href: "/games/valorant/agents" },
  { label: "Players", href: "/games/valorant/players" },
  { label: "Statistics", href: "/games/valorant/statistics" },
  { label: "Maps", href: "/games/valorant/maps" },
];

export const metadata = {
  title: "VALORANT Portal | KhelPediA",
  description: "Comprehensive Valorant esports coverage — Teams, Transfers, Tournaments, Agents, Players, Statistics, and Maps.",
};

export default function ValorantPortalLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0f1923] text-[#ece8e1] selection:bg-red-500/30">
      {/* Portal Hero Header */}
      <div className="relative border-b border-zinc-800/80 overflow-hidden pt-24 pb-0"
        style={{ background: "linear-gradient(180deg, rgba(255,70,85,0.06) 0%, rgba(15,25,35,0.98) 100%)" }}>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none opacity-40" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Breadcrumb */}
          <Link href="/games/valorant"
            className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-4"
            style={{ fontFamily: '"Rajdhani", sans-serif' }}>
            ← Back to Valorant Hub
          </Link>
          {/* Portal Sub-Nav */}
          <nav className="flex items-center gap-0 overflow-x-auto scrollbar-hide -mb-px">
            {PORTAL_TABS.map((tab) => (
              <Link key={tab.href} href={tab.href}
                className="portal-nav-tab px-5 py-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap border-b-2 border-transparent text-zinc-500 hover:text-white hover:border-red-500/50 transition-all"
                style={{ fontFamily: '"Rajdhani", sans-serif' }}>
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      {/* Page Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  );
}
