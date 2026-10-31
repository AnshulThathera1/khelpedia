"use client";

import { Activity, ShieldCheck, Award, Coins } from "lucide-react";

export default function BGMITelemetryBar({ stats }) {
  const prizePoolUsd = stats?.totalPrizePoolUSD
    ? `$${(stats.totalPrizePoolUSD / 1000000).toFixed(2)}M`
    : "$0";
  const prizePoolInr = stats?.totalPrizePoolINR
    ? `₹${(stats.totalPrizePoolINR / 10000000).toFixed(1)}Cr`
    : "₹0";

  const metrics = [
    {
      id: "tournaments",
      label: "Indexed Tournaments",
      value: `${stats?.totalTournaments ?? 0}`,
      subtext: `${stats?.sTierEvents ?? 0} S & A Tier Events`,
      icon: <Award size={18} color="#F1B11D" />,
      accentColor: "#F1B11D",
    },
    {
      id: "prize",
      label: "Cumulative Prize Pool",
      value: prizePoolUsd,
      subtext: `Approx. ${prizePoolInr} tracked`,
      icon: <Coins size={18} color="var(--accent-cyan)" />,
      accentColor: "var(--accent-cyan)",
    },
    {
      id: "matches",
      label: "Recorded Match Results",
      value: `${stats?.totalMatches ?? 0}`,
      subtext: "Erangel, Miramar & Rondo maps",
      icon: <Activity size={18} color="var(--accent-red)" />,
      accentColor: "var(--accent-red)",
    },
    {
      id: "teams",
      label: "Active BGMI Squads",
      value: `${stats?.totalTeams ?? 0}`,
      subtext: "Tournament participants",
      icon: <ShieldCheck size={18} color="#cbd5e1" />,
      accentColor: "#cbd5e1",
    },
  ];

  return (
    <section aria-label="BGMI Platform Telemetry Metrics" style={{ marginTop: "2rem", marginBottom: "4rem" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            padding: "1.75rem",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          }}
        >
          {/* Subtle HUD Top Border Line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "linear-gradient(90deg, #F1B11D, var(--accent-cyan), var(--accent-red))",
              opacity: 0.85,
            }}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "2rem",
            }}
          >
            {metrics.map((m, idx) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  borderRight: idx < metrics.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  paddingRight: "1rem",
                }}
                className="max-md:border-r-0 max-md:border-b max-md:pb-4 max-md:border-[var(--border-subtle)]"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "6px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--border-subtle)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {m.icon}
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-rajdhani), sans-serif",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--text-muted)",
                    }}
                  >
                    {m.label}
                  </span>
                </div>

                <div
                  style={{
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    fontSize: "2rem",
                    fontWeight: 900,
                    color: m.accentColor,
                    lineHeight: 1.1,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {m.value}
                </div>

                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-secondary)",
                    marginTop: "4px",
                  }}
                >
                  {m.subtext}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
