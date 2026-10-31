"use client";

import Link from "next/link";
import { Swords, Calendar, MapPin, ArrowRight, Activity, Shield } from "lucide-react";

export default function BGMIMatchFeed({ matches = [] }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "Recent";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <section id="matches" aria-label="BGMI Recent Match Feed" style={{ marginBottom: "5rem" }}>
      <div className="section-header">
        <div>
          <div className="tactical-kicker" style={{ color: "var(--accent-red)" }}>
            <Swords size={14} color="var(--accent-red)" />
            <span>// 06. MATCH TELEMETRY</span>
          </div>
          <h2 className="section-title">Verified Match Outcomes</h2>
          <p className="section-subtitle">
            Recent competitive lobby outcomes across Erangel, Miramar, and Sanhok
          </p>
        </div>

        <Link
          href="/tournaments"
          style={{
            color: "var(--accent-red)",
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
          Esports Tournaments <ArrowRight size={14} />
        </Link>
      </div>

      {matches.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1rem",
          }}
        >
          {matches.map((m, idx) => {
            const mapName = m.map || "Erangel";
            const tournamentHref = m.tournament_id ? `/tournaments/${m.tournament_id}` : "#";

            return (
              <div
                key={m.id || idx}
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "1.1rem 1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.18s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-glow)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.background = "var(--bg-card-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-color)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.background = "var(--bg-secondary)";
                }}
              >
                {/* Top: Tournament & Map */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    style={{
                      fontFamily: "var(--font-rajdhani), sans-serif",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--accent-red)",
                      background: "rgba(255, 70, 85, 0.08)",
                      border: "1px solid rgba(255, 70, 85, 0.25)",
                      padding: "2px 8px",
                      borderRadius: "3px",
                    }}
                  >
                    {mapName}
                  </span>

                  <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 font-medium">
                    <Calendar size={11} /> {formatDate(m.played_at)}
                  </span>
                </div>

                {/* Match Round / Detail */}
                <h3
                  style={{
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    lineHeight: 1.35,
                    marginBottom: "0.75rem",
                  }}
                  className="line-clamp-2"
                >
                  {m.round || `${m.tournament_name || "BGMI Championship"} Match`}
                </h3>

                {/* Tournament Link */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "0.6rem",
                    borderTop: "1px solid var(--border-subtle)",
                    marginTop: "auto",
                  }}
                >
                  <span className="text-xs text-[var(--text-muted)] truncate max-w-[200px]">
                    {m.tournament_name || "Official Series"}
                  </span>

                  <Link
                    href={tournamentHref}
                    style={{
                      fontFamily: "var(--font-rajdhani), sans-serif",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      color: "var(--accent-red)",
                      textTransform: "uppercase",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "2px",
                    }}
                  >
                    Event Details <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
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
          No recent BGMI match telemetry records available.
        </div>
      )}
    </section>
  );
}
