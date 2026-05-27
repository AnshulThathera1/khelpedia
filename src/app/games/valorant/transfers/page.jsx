"use client";
import { useState } from "react";
import { TRANSFERS, TRANSFER_COLORS } from "@/lib/valorantData";
import { ArrowRight, UserPlus, UserMinus, Clock } from "lucide-react";

export default function TransfersPortalPage() {
  const [regionFilter, setRegionFilter] = useState("All");
  const regions = ["All", "NA", "EU", "APAC", "SA"];
  const filtered = regionFilter === "All" ? TRANSFERS : TRANSFERS.filter(t => t.region === regionFilter);

  // Group by month
  const grouped = {};
  filtered.forEach(t => {
    const month = new Date(t.date).toLocaleDateString("en-US", { year: "numeric", month: "long" });
    if (!grouped[month]) grouped[month] = [];
    grouped[month].push(t);
  });

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
        Transfers <span className="text-zinc-600 font-normal text-xl">— Roster Movements</span>
      </h1>
      <p className="text-zinc-500 text-sm mb-8">Notable player transfers, releases, and roster changes across the Valorant competitive scene.</p>

      {/* Region Filter */}
      <div className="flex gap-2 mb-8">
        {regions.map(r => (
          <button key={r} onClick={() => setRegionFilter(r)}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border"
            style={{
              fontFamily: '"Rajdhani", sans-serif',
              background: regionFilter === r ? "rgba(255,70,85,0.15)" : "rgba(255,255,255,0.03)",
              color: regionFilter === r ? "#ff4655" : "#9ca3af",
              borderColor: regionFilter === r ? "rgba(255,70,85,0.3)" : "rgba(255,255,255,0.08)",
            }}>
            {r}
          </button>
        ))}
      </div>

      {/* Transfer Table */}
      <div className="border border-zinc-800/60">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-zinc-900/60 border-b border-zinc-800/60 text-[10px] font-bold uppercase tracking-wider text-zinc-500" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
          <div className="col-span-2">Date</div>
          <div className="col-span-3">Player</div>
          <div className="col-span-2">From</div>
          <div className="col-span-1 text-center">→</div>
          <div className="col-span-2">To</div>
          <div className="col-span-2">Type</div>
        </div>

        {Object.entries(grouped).map(([month, transfers]) => (
          <div key={month}>
            <div className="px-4 py-2 bg-red-500/5 border-b border-zinc-800/40">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
                <Clock className="w-3 h-3 inline mr-1.5 -mt-0.5" />{month}
              </span>
            </div>
            {transfers.map((t, i) => {
              const colors = TRANSFER_COLORS[t.type] || TRANSFER_COLORS.Released;
              return (
                <div key={i} className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-zinc-800/30 hover:bg-white/[0.02] transition-colors items-center">
                  <div className="col-span-2 text-xs text-zinc-500">
                    {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                  <div className="col-span-3 text-sm font-bold text-white" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
                    {t.player}
                    <span className="ml-2 text-[10px] font-bold text-zinc-600 uppercase">{t.region}</span>
                  </div>
                  <div className="col-span-2 text-xs text-zinc-400">{t.from || "—"}</div>
                  <div className="col-span-1 text-center">
                    <ArrowRight className="w-3 h-3 text-zinc-600 mx-auto" />
                  </div>
                  <div className="col-span-2 text-xs text-zinc-400">{t.to || "—"}</div>
                  <div className="col-span-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: colors.bg, color: colors.text }}>
                      {t.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
