"use client";

import Link from "next/link";
import { Users, Shield, ArrowRight, MapPin } from "lucide-react";

export default function BGMITeamLeaderboard({ teams = [] }) {
  return (
    <section id="teams" aria-label="Featured BGMI Teams" style={{ marginBottom: "5rem" }}>
      <div className="section-header">
        <div>
          <div className="tactical-kicker" style={{ color: "#F1B11D" }}>
            <Users size={14} color="#F1B11D" />
            <span>// 04. COMPETITIVE ORGANIZATIONS</span>
          </div>
          <h2 className="section-title">Featured BGMI Teams</h2>
          <p className="section-subtitle">
            Battlegrounds Mobile India esports organizations and tournament competitors
          </p>
        </div>

        <Link
          href="/bgmi/teams"
          style={{
            color: "#F1B11D",
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
          All Teams Directory <ArrowRight size={14} />
        </Link>
      </div>

      {teams.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1rem",
          }}
        >
          {teams.map((team, idx) => {
            const teamHref = team.id && !team.id.startsWith("amaze-")
              ? `/teams/${team.id}`
              : `/bgmi/teams`;

            return (
              <Link
                key={team.id || idx}
                href={teamHref}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 1.25rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#F1B11D";
                  e.currentTarget.style.transform = "translateX(3px)";
                  e.currentTarget.style.background = "var(--bg-card-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-color)";
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.background = "var(--bg-secondary)";
                }}
              >
                {/* Team Logo Container */}
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: "8px",
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    flexShrink: 0,
                    padding: "4px",
                  }}
                >
                  {team.logo_url ? (
                    <img
                      src={team.logo_url}
                      alt={team.name}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    <Shield size={20} color="var(--text-muted)" />
                  )}
                </div>

                {/* Team Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-rajdhani), sans-serif",
                      fontSize: "1.05rem",
                      fontWeight: 800,
                      color: "var(--text-primary)",
                      marginBottom: "2px",
                    }}
                    className="truncate"
                  >
                    {team.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <MapPin size={10} /> {team.country || team.region || "South Asia"}
                    </span>
                    <span>•</span>
                    <span className="text-[var(--text-secondary)] font-semibold">
                      BGMI Circuit Roster
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    fontWeight: 800,
                    fontSize: "0.75rem",
                    color: "#F1B11D",
                    textTransform: "uppercase",
                  }}
                >
                  <ArrowRight size={14} />
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
          No BGMI team records indexed yet.
        </div>
      )}
    </section>
  );
}
