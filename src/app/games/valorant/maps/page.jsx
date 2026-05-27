"use client";
import { useState } from "react";
import { MAPS } from "@/lib/valorantData";
import { MapPin, CheckCircle, XCircle } from "lucide-react";

export default function MapsPortalPage() {
  const [filter, setFilter] = useState("all");
  const activeMaps = MAPS.filter(m => m.active && m.type === "Standard");
  const allStandard = MAPS.filter(m => m.type === "Standard");
  const tdmMaps = MAPS.filter(m => m.type === "TDM");
  const displayed = filter === "active" ? activeMaps : filter === "tdm" ? tdmMaps : MAPS;

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
        Maps <span className="text-zinc-600 font-normal text-xl">— {MAPS.length} Total</span>
      </h1>

      {/* Active Pool Banner */}
      <div className="mb-8 p-4 border border-green-500/20 bg-green-500/5">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-green-400" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
            Active Competitive Pool — {activeMaps.length} Maps
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeMaps.map(m => (
            <span key={m.slug} className="px-3 py-1 text-xs font-bold bg-green-500/10 text-green-300 border border-green-500/20">
              {m.name}
            </span>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-8">
        {[["all", "All Maps"], ["active", "Active Pool"], ["tdm", "Team Deathmatch"]].map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border"
            style={{
              fontFamily: '"Rajdhani", sans-serif',
              background: filter === key ? "rgba(255,70,85,0.15)" : "rgba(255,255,255,0.03)",
              color: filter === key ? "#ff4655" : "#9ca3af",
              borderColor: filter === key ? "rgba(255,70,85,0.3)" : "rgba(255,255,255,0.08)",
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Map Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayed.map(map => (
          <div key={map.slug} className="group border border-zinc-800/60 bg-zinc-900/30 overflow-hidden hover:border-zinc-700 transition-all">
            <div className="aspect-video relative overflow-hidden bg-zinc-900">
              <img src={map.image} alt={map.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                onError={(e) => { e.target.style.display = 'none'; }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              {map.active && (
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] font-bold uppercase">
                  Active
                </div>
              )}
              <div className="absolute bottom-3 left-3">
                <h3 className="text-lg font-black uppercase text-white" style={{ fontFamily: '"Rajdhani", sans-serif' }}>{map.name}</h3>
              </div>
            </div>
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{map.type}</span>
                {map.sites > 0 && <span className="text-[10px] text-zinc-600">• {map.sites} Sites</span>}
              </div>
              <div className="flex items-center gap-1 text-zinc-600">
                <MapPin className="w-3 h-3" />
                <span className="text-[10px]">{map.coords}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
