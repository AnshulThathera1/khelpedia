"use client";

import { useEffect, useRef, useState } from "react";
import NumberFlow, { NumberFlowGroup, continuous } from "@number-flow/react";
import { Tooltip, Chip } from "@nextui-org/react";
import { Activity, ShieldCheck, Database, Award } from "lucide-react";

export default function StatsTelemetryBar({ stats = { matches: 0, games: 0, tournaments: 0, teams: 0 } }) {
  const targetMatches = stats.matches > 0 ? Math.floor(stats.matches / 100) * 100 : 0;
  const targetGames = stats.games || 0;
  const targetTournaments = stats.tournaments || 0;
  const targetTeams = stats.teams || 0;

  const [inView, setInView] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const metrics = [
    {
      id: "matches",
      label: "Recorded Match Results",
      target: targetMatches,
      suffix: "+",
      subtext: "Verified head-to-head maps",
      tooltip: "Verified map outcomes ingested from official publisher APIs and tournament organizers.",
      icon: <Activity size={18} color="var(--accent-red)" />,
      accentColor: "var(--accent-red)"
    },
    {
      id: "games",
      label: "Tier-One Esports Titles",
      target: targetGames,
      suffix: "",
      subtext: "Real-time API tracking",
      tooltip: "Primary competitive gaming titles monitored with automated telemetry updates.",
      icon: <Database size={18} color="var(--accent-cyan)" />,
      accentColor: "var(--accent-cyan)"
    },
    {
      id: "tournaments",
      label: "Monitored Tournaments",
      target: targetTournaments,
      suffix: "",
      subtext: "Global S & A tier circuits",
      tooltip: "Active and historical championship series indexed in the KhelPediA database.",
      icon: <Award size={18} color="var(--accent-amber)" />,
      accentColor: "var(--accent-amber)"
    },
    {
      id: "teams",
      label: "Active Pro Organizations",
      target: targetTeams,
      suffix: "",
      subtext: "Indexed team rosters",
      tooltip: "Professional esports teams with recorded competitive match histories.",
      icon: <ShieldCheck size={18} color="var(--text-primary)" />,
      accentColor: "var(--text-primary)"
    }
  ];

  return (
    <section ref={sectionRef} aria-label="Platform Telemetry Metrics" style={{ marginBottom: "5rem" }}>
      <div
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: "8px",
          padding: "2rem",
          position: "relative",
          overflow: "hidden"
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
            background: "linear-gradient(90deg, var(--accent-red), var(--accent-cyan), var(--accent-amber))",
            opacity: 0.7
          }}
        />

        {/* Section Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.75rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid var(--border-subtle)",
            flexWrap: "wrap",
            gap: "1rem"
          }}
        >
          <div>
            <div className="tactical-kicker tactical-kicker-cyan" style={{ marginBottom: "2px" }}>
              <span>// 05. PLATFORM INTELLIGENCE</span>
            </div>
            <h3
              style={{
                fontFamily: "var(--font-rajdhani), sans-serif",
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                margin: 0
              }}
            >
              Verified Esports Data Network
            </h3>
          </div>

          <Chip
            size="sm"
            variant="flat"
            avatar={
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--accent-cyan)",
                  boxShadow: "0 0 8px var(--accent-cyan)",
                  display: "inline-block",
                  animation: "pulse-dot 2s infinite",
                  marginLeft: "4px"
                }}
              />
            }
            classNames={{
              base: "bg-[#00F5D4]/10 border border-[#00F5D4]/30 h-7 px-2",
              content: "text-[#00F5D4] font-black uppercase text-[10px] tracking-wider font-['Rajdhani']"
            }}
          >
            Continuous Telemetry Ingestion
          </Chip>
        </div>

        {/* 4-Metric Grid with Synchronized NumberFlow Rolling Digits */}
        <NumberFlowGroup>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem"
            }}
          >
            {metrics.map((m) => (
              <Tooltip
                key={m.id}
                content={m.tooltip}
                placement="top"
                classNames={{
                  content: "bg-[#141A26] text-white border border-white/10 text-xs font-['Rajdhani'] px-2 py-1 max-w-xs text-center"
                }}
              >
                <div
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "6px",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    cursor: "help",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        fontFamily: "var(--font-rajdhani), sans-serif",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em"
                      }}
                    >
                      {m.label}
                    </span>
                    {m.icon}
                  </div>

                  <div
                    style={{
                      fontFamily: "var(--font-rajdhani), sans-serif",
                      fontSize: "clamp(2rem, 3.2vw, 2.75rem)",
                      fontWeight: 900,
                      color: "var(--text-primary)",
                      lineHeight: 1,
                      letterSpacing: "0.02em",
                      marginBottom: "0.35rem",
                      display: "flex",
                      alignItems: "baseline"
                    }}
                  >
                    {/* Screen reader & SEO semantic text */}
                    <span className="sr-only">
                      {m.target.toLocaleString("en-US")}{m.suffix}
                    </span>

                    {/* Smooth NumberFlow Rolling Digit Counter */}
                    <span aria-hidden="true" style={{ display: "inline-block" }}>
                      <NumberFlow
                        value={inView ? m.target : 0}
                        locales="en-US"
                        suffix={m.suffix}
                        trend={false}
                        plugins={[continuous]}
                        spinTiming={{ duration: 3200, easing: "cubic-bezier(0.12, 0.8, 0.2, 1)" }}
                        transformTiming={{ duration: 3200, easing: "cubic-bezier(0.12, 0.8, 0.2, 1)" }}
                        opacityTiming={{ duration: 600, easing: "ease-out" }}
                      />
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--text-secondary)",
                      marginTop: "auto"
                    }}
                  >
                    {m.subtext}
                  </div>
                </div>
              </Tooltip>
            ))}
          </div>
        </NumberFlowGroup>
      </div>
    </section>
  );
}
