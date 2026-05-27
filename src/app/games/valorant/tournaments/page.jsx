import { getTournaments, getGameBySlug } from "@/lib/queries";
import Link from "next/link";
import { Trophy, Calendar, Coins, Globe } from "lucide-react";

export const metadata = { title: "Valorant Tournaments Portal | KhelPediA" };

const TIER_COLORS = {
  S: { bg: "rgba(255,70,85,0.15)", text: "#ff4655", border: "rgba(255,70,85,0.3)" },
  A: { bg: "rgba(168,85,247,0.15)", text: "#c084fc", border: "rgba(168,85,247,0.3)" },
  B: { bg: "rgba(59,130,246,0.15)", text: "#60a5fa", border: "rgba(59,130,246,0.3)" },
  C: { bg: "rgba(107,114,128,0.15)", text: "#9ca3af", border: "rgba(107,114,128,0.3)" },
};
const STATUS_COLORS = {
  live: { bg: "rgba(239,68,68,0.2)", text: "#f87171", label: "🔴 Live" },
  upcoming: { bg: "rgba(59,130,246,0.15)", text: "#60a5fa", label: "Upcoming" },
  completed: { bg: "rgba(107,114,128,0.15)", text: "#9ca3af", label: "Completed" },
};

export default async function TournamentsPortalPage() {
  const game = await getGameBySlug("valorant");
  const tournaments = game ? await getTournaments({ gameId: game.id }) : [];
  const live = tournaments.filter(t => t.status === "live");
  const upcoming = tournaments.filter(t => t.status === "upcoming");
  const completed = tournaments.filter(t => t.status === "completed");

  const renderTournament = (t) => {
    const tier = TIER_COLORS[t.tier] || TIER_COLORS.C;
    const status = STATUS_COLORS[t.status] || STATUS_COLORS.upcoming;
    return (
      <div key={t.id} className="border border-zinc-800/60 bg-zinc-900/30 p-4 hover:border-zinc-700 transition-all">
        <div className="flex items-start justify-between mb-3">
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: tier.bg, color: tier.text, border: `1px solid ${tier.border}` }}>
            Tier {t.tier}
          </span>
          <span className="px-2 py-0.5 text-[10px] font-bold" style={{ background: status.bg, color: status.text }}>
            {status.label}
          </span>
        </div>
        <h3 className="text-sm font-black uppercase text-white mb-2 leading-tight" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
          {t.name}
        </h3>
        <div className="space-y-1.5 text-[11px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Coins className="w-3 h-3" />
            <span className="text-green-400 font-bold">${Number(t.prize_pool || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            <span>{t.start_date} → {t.end_date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="w-3 h-3" />
            <span>{t.region} • {t.format}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-8" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
        Tournaments <span className="text-zinc-600 font-normal text-xl">— {tournaments.length} Events</span>
      </h1>

      {/* Live */}
      {live.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-black uppercase tracking-wide text-red-400 mb-4 flex items-center gap-2" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Live Now ({live.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {live.map(renderTournament)}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-black uppercase tracking-wide text-blue-400 mb-4" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
            <span className="text-blue-500">▎</span> Upcoming ({upcoming.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map(renderTournament)}
          </div>
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-black uppercase tracking-wide text-zinc-500 mb-4" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
            <span className="text-zinc-600">▎</span> Completed ({completed.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completed.map(renderTournament)}
          </div>
        </div>
      )}
    </div>
  );
}
