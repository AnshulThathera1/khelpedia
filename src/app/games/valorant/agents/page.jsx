"use client";
import { useState } from "react";
import { AGENTS, AGENT_ROLES, ROLE_COLORS } from "@/lib/valorantData";
import { Shield, Crosshair, Zap, Eye } from "lucide-react";

const ROLE_ICONS = { Controller: Eye, Duelist: Crosshair, Initiator: Zap, Sentinel: Shield };

export default function AgentsPortalPage() {
  const [activeRole, setActiveRole] = useState("All");
  const [expandedAgent, setExpandedAgent] = useState(null);
  const filtered = activeRole === "All" ? AGENTS : AGENTS.filter(a => a.role === activeRole);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
          Agents <span className="text-zinc-600 font-normal text-xl">— {AGENTS.length} Playable Characters</span>
        </h1>
        <p className="text-zinc-500 text-sm mt-2">Agents are divided into 4 roles: Controllers, Duelists, Initiators, and Sentinels.</p>
      </div>

      {/* Role Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {["All", ...AGENT_ROLES].map(role => {
          const isActive = activeRole === role;
          const colors = ROLE_COLORS[role];
          return (
            <button key={role} onClick={() => setActiveRole(role)}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border"
              style={{
                fontFamily: '"Rajdhani", sans-serif',
                background: isActive ? (colors?.bg || "rgba(255,70,85,0.15)") : "rgba(255,255,255,0.03)",
                color: isActive ? (colors?.text || "#ff4655") : "#9ca3af",
                borderColor: isActive ? (colors?.border || "rgba(255,70,85,0.3)") : "rgba(255,255,255,0.08)",
              }}>
              {role} {role !== "All" && `(${AGENTS.filter(a => a.role === role).length})`}
            </button>
          );
        })}
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filtered.map(agent => {
          const colors = ROLE_COLORS[agent.role];
          const Icon = ROLE_ICONS[agent.role];
          const isExpanded = expandedAgent === agent.slug;
          return (
            <div key={agent.slug} onClick={() => setExpandedAgent(isExpanded ? null : agent.slug)}
              className="group cursor-pointer transition-all duration-300"
              style={{
                background: isExpanded ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${isExpanded ? colors.border : "rgba(255,255,255,0.06)"}`,
              }}>
              {/* Agent Icon */}
              <div className="aspect-square relative overflow-hidden" style={{ background: `${colors.bg}` }}>
                <img src={agent.icon} alt={agent.name}
                  className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => { e.target.style.display = 'none'; }} />
                <div className="absolute top-2 right-2 p-1" style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
                  {Icon && <Icon className="w-3 h-3" style={{ color: colors.text }} />}
                </div>
              </div>
              {/* Agent Info */}
              <div className="p-3">
                <h3 className="font-black text-sm uppercase tracking-wide text-white" style={{ fontFamily: '"Rajdhani", sans-serif' }}>
                  {agent.name}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: colors.text }}>
                  {agent.role}
                </span>
                <p className="text-zinc-600 text-[10px] mt-0.5">{agent.origin}</p>
              </div>
              {/* Expanded Abilities */}
              {isExpanded && (
                <div className="px-3 pb-3 border-t border-zinc-800/50 pt-2">
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Abilities</p>
                  {agent.abilities.map((ability, i) => (
                    <div key={i} className="flex items-center gap-2 py-1">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: colors.text }} />
                      <span className="text-xs text-zinc-400">{ability}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
