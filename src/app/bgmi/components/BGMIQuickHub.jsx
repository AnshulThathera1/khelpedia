"use client";

import Link from "next/link";
import { Trophy, Users, Target, Newspaper, Gamepad2, ArrowRight } from "lucide-react";

export default function BGMIQuickHub() {
  const hubs = [
    {
      title: "All Tournaments",
      desc: "Full tournament archive, upcoming open qualifiers, and tier rankings",
      href: "/bgmi/tournaments",
      icon: <Trophy size={20} color="#F1B11D" />,
      accent: "#F1B11D",
    },
    {
      title: "Team Directory",
      desc: "Explore verified esports organizations, rosters, and franchise records",
      href: "/bgmi/teams",
      icon: <Users size={20} color="var(--accent-cyan)" />,
      accent: "var(--accent-cyan)",
    },
    {
      title: "Player Database",
      desc: "Athlete profiles, role specializations, in-game leaders, and earnings",
      href: "/bgmi/players",
      icon: <Target size={20} color="#FF4055" />,
      accent: "#FF4055",
    },
    {
      title: "News & Guides",
      desc: "Original editorial analysis, meta breakdowns, and tournament previews",
      href: "/blogs",
      icon: <Newspaper size={20} color="#E5A93C" />,
      accent: "#E5A93C",
    },
  ];

  return (
    <section aria-label="BGMI Hub Fast Access" style={{ marginBottom: "5rem" }}>
      <div className="section-header" style={{ marginBottom: "1.25rem" }}>
        <div>
          <div className="tactical-kicker" style={{ color: "var(--text-muted)" }}>
            <Gamepad2 size={14} color="var(--text-muted)" />
            <span>// 08. DIRECTORY INDEX</span>
          </div>
          <h2 className="section-title">BGMI Intelligence Hubs</h2>
          <p className="section-subtitle">
            Direct access to dedicated databases and competitive registries
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {hubs.map((h) => (
          <Link
            key={h.title}
            href={h.href}
            style={{
              textDecoration: "none",
              color: "inherit",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = h.accent;
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.background = "var(--bg-card-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-color)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background = "var(--bg-secondary)";
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "6px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
              }}
            >
              {h.icon}
            </div>

            <h3
              style={{
                fontFamily: "var(--font-rajdhani), sans-serif",
                fontSize: "1.15rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                marginBottom: "0.35rem",
              }}
            >
              {h.title}
            </h3>

            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--text-secondary)",
                lineHeight: 1.5,
                marginBottom: "1rem",
              }}
            >
              {h.desc}
            </p>

            <div
              style={{
                marginTop: "auto",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontFamily: "var(--font-rajdhani), sans-serif",
                fontSize: "0.78rem",
                fontWeight: 800,
                color: h.accent,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              <span>Explore Section</span>
              <ArrowRight size={12} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
