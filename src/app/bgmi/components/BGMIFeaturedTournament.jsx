"use client";

import Link from "next/link";
import { 
  Trophy, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  Coins, 
  Flame, 
  CheckCircle2, 
  ShieldCheck, 
  Layers
} from "lucide-react";

export default function BGMIFeaturedTournament({ tournament }) {
  if (!tournament) return null;

  const formatPrize = (val) => {
    if (!val) return "₹45Cr+";
    const num = Number(val);
    if (isNaN(num) || num <= 0) return "₹45Cr+";
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toLocaleString()}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Schedule TBA";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const detailHref = tournament.id && !tournament.id.startsWith("amaze-")
    ? `/tournaments/${tournament.id}`
    : `/bgmi/tournaments/${encodeURIComponent(tournament.name.replace(/ /g, "_"))}`;

  return (
    <section aria-label="Featured BGMI Championship" style={{ marginBottom: "5rem" }}>
      <div className="section-header" style={{ marginBottom: "1.25rem" }}>
        <div>
          <div className="tactical-kicker" style={{ color: "#E5A93C" }}>
            <Flame size={14} color="#E5A93C" />
            <span>// 03. EDITORIAL SHOWCASE</span>
          </div>
          <h2 className="section-title">Championship Spotlight</h2>
          <p className="section-subtitle">Premier flagship competition with verified tournament telemetry</p>
        </div>
      </div>

      <div
        style={{
          background: "linear-gradient(135deg, rgba(20, 26, 38, 0.98) 0%, rgba(14, 19, 28, 0.95) 100%)",
          border: "1px solid rgba(241, 177, 29, 0.35)",
          borderRadius: "10px",
          padding: "2rem",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 14px 44px rgba(0, 0, 0, 0.55)",
        }}
      >
        {/* Glow corner */}
        <div
          style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "250px",
            height: "250px",
            background: "radial-gradient(circle, rgba(241, 177, 29, 0.15) 0%, transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Tournament Badge & Details (8 cols) */}
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                style={{
                  background: "rgba(229, 169, 60, 0.15)",
                  color: "#E5A93C",
                  border: "1px solid rgba(229, 169, 60, 0.35)",
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  padding: "3px 10px",
                  borderRadius: "3px",
                }}
              >
                {tournament.tier || "S"} TIER CHAMPIONSHIP
              </span>

              <span
                style={{
                  background: "rgba(0, 245, 212, 0.1)",
                  color: "var(--accent-cyan)",
                  border: "1px solid rgba(0, 245, 212, 0.3)",
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  padding: "3px 8px",
                  borderRadius: "3px",
                }}
              >
                {tournament.status === "upcoming" ? "UPCOMING" : "OFFICIAL CIRCUIT"}
              </span>

              <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 ml-2">
                <MapPin size={12} /> {tournament.region || "South Asia"}
              </span>
            </div>

            <h3
              style={{
                fontFamily: "var(--font-rajdhani), sans-serif",
                fontSize: "clamp(1.5rem, 3vw, 2.2rem)",
                fontWeight: 900,
                color: "var(--text-primary)",
                lineHeight: 1.15,
                marginBottom: "0.75rem",
              }}
            >
              {tournament.name}
            </h3>

            <p
              style={{
                fontSize: "0.95rem",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                maxWidth: "680px",
                marginBottom: "1.5rem",
              }}
            >
              {tournament.description || "The premier national stage for Battlegrounds Mobile India elite rosters. Featuring regional qualifiers, multi-stage group brackets, and grand finals."}
            </p>

            {/* Quick Metrics Strip */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "1rem",
                padding: "1rem",
                background: "rgba(8, 11, 16, 0.6)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "6px",
                marginBottom: "1.5rem",
              }}
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
                  Prize Pool
                </span>
                <span className="font-bold text-lg text-green-400 font-['Rajdhani']">
                  {formatPrize(tournament.prize_pool)}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
                  Start Date
                </span>
                <span className="font-bold text-sm text-[var(--text-primary)] font-['Rajdhani']">
                  {formatDate(tournament.start_date)}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
                  Format
                </span>
                <span className="font-bold text-sm text-[var(--text-primary)] font-['Rajdhani']">
                  {tournament.format || "Battle Royale"}
                </span>
              </div>
            </div>

            <Link
              href={detailHref}
              className="btn-primary"
              style={{
                background: "linear-gradient(135deg, #F1B11D 0%, #c98e10 100%)",
                color: "#080b10",
                fontWeight: 800,
                padding: "10px 24px",
                fontSize: "0.85rem",
              }}
            >
              View Tournament Bracket & Standings <ArrowRight size={14} />
            </Link>
          </div>

          {/* Right: Graphic Card & Trophy Visual (4 cols) */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center">
            <div
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "20px",
                background: "radial-gradient(circle, rgba(241, 177, 29, 0.15) 0%, rgba(8, 11, 16, 0.9) 70%)",
                border: "1px solid rgba(241, 177, 29, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 40px rgba(241, 177, 29, 0.2)",
                marginBottom: "1rem",
              }}
            >
              <Trophy size={64} color="#F1B11D" />
            </div>

            <div className="text-center">
              <span
                style={{
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "#F1B11D",
                  display: "block",
                }}
              >
                KRAFTON SANCTIONED
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                Official Competitive Series
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
