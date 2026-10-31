"use client";

import Link from "next/link";
import { Shield, ArrowRight, Crosshair } from "lucide-react";

export default function BGMIPlayerSpotlight({ players = [] }) {
  const formatEarnings = (amount) => {
    const num = Number(amount);
    if (!amount || isNaN(num) || num <= 0) return null;
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <section id="players" aria-label="BGMI Player Spotlight" style={{ marginBottom: "5rem" }}>
      <div className="section-header">
        <div>
          <div className="tactical-kicker" style={{ color: "var(--accent-cyan)" }}>
            <Crosshair size={14} color="var(--accent-cyan)" />
            <span>// 05. ATHLETE SPOTLIGHT</span>
          </div>
          <h2 className="section-title">BGMI Pro Players & Legends</h2>
          <p className="section-subtitle">
            Notable Battlegrounds Mobile India athletes, in-game leaders, and premier assaulters
          </p>
        </div>

        <Link
          href="/bgmi/players"
          style={{
            color: "var(--accent-cyan)",
            textDecoration: "none",
            fontWeight: 800,
            fontSize: "0.85rem",
            fontFamily: "var(--font-rajdhani), sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          All Players Directory <ArrowRight size={14} />
        </Link>
      </div>

      {players.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {players.map((player, idx) => {
            const playerHref = player.slug ? `/players/${player.slug}` : `/bgmi/players`;
            const earningsDisplay = formatEarnings(player.earnings);

            return (
              <Link
                key={player.id || idx}
                href={playerHref}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "1.25rem",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent-cyan)";
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.background = "var(--bg-card-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-color)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.background = "var(--bg-secondary)";
                }}
              >
                {/* Header: Role Chip & Country */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    style={{
                      fontFamily: "var(--font-rajdhani), sans-serif",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--accent-cyan)",
                      background: "rgba(0, 245, 212, 0.1)",
                      border: "1px solid rgba(0, 245, 212, 0.25)",
                      padding: "2px 8px",
                      borderRadius: "3px",
                    }}
                  >
                    {player.role || "Pro Athlete"}
                  </span>

                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    {player.country ? `🇮🇳 ${player.country}` : "🇮🇳 IN"}
                  </span>
                </div>

                {/* Player Profile & IGN */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "8px",
                      background: "rgba(0, 245, 212, 0.08)",
                      border: "1px solid rgba(0, 245, 212, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      overflow: "hidden",
                      fontWeight: 900,
                      fontFamily: "var(--font-rajdhani), sans-serif",
                      fontSize: "1.2rem",
                      color: "var(--accent-cyan)",
                    }}
                  >
                    {player.image_url ? (
                      <img
                        src={player.image_url}
                        alt={player.ign}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : (
                      <span>{player.ign?.slice(0, 2).toUpperCase() || "BG"}</span>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      style={{
                        fontFamily: "var(--font-rajdhani), sans-serif",
                        fontSize: "1.25rem",
                        fontWeight: 900,
                        color: "var(--text-primary)",
                        lineHeight: 1.1,
                      }}
                      className="truncate"
                    >
                      {player.ign}
                    </h3>
                    <div className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                      {player.name || "Pro Athlete"}
                    </div>
                  </div>
                </div>

                {/* Team & Tracked Earnings Footer */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid var(--border-subtle)",
                    marginTop: "auto",
                  }}
                >
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                    <Shield size={12} color="var(--text-muted)" />
                    <span className="font-semibold truncate max-w-[120px]">
                      {player.team_name || "Pro BGMI Squad"}
                    </span>
                  </div>

                  {earningsDisplay && (
                    <span
                      style={{
                        fontFamily: "var(--font-rajdhani), sans-serif",
                        fontSize: "0.78rem",
                        fontWeight: 800,
                        color: "#4ade80",
                        textTransform: "uppercase",
                      }}
                    >
                      {earningsDisplay}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            padding: "2.5rem",
            textAlign: "center",
            background: "var(--bg-secondary)",
            border: "1px dashed var(--border-color)",
            borderRadius: "8px",
            color: "var(--text-muted)",
          }}
        >
          No BGMI player spotlight records available.
        </div>
      )}
    </section>
  );
}
