"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Trophy, 
  MapPin, 
  ArrowRight, 
  Radio, 
  CheckCircle2, 
  Clock
} from "lucide-react";

export default function BGMITournamentRadar({ tournaments = [] }) {
  const [filter, setFilter] = useState("all");

  const live = tournaments.filter((t) => t.status?.toLowerCase() === "live");
  const upcoming = tournaments.filter((t) => t.status?.toLowerCase() === "upcoming");
  const completed = tournaments.filter((t) => t.status?.toLowerCase() === "completed");

  const filteredTournaments = filter === "all"
    ? tournaments
    : filter === "live"
      ? live
      : filter === "upcoming"
        ? upcoming
        : completed;

  const displayList = filteredTournaments.slice(0, 9);

  const formatPrize = (val, currency = "USD") => {
    if (!val) return "TBA";
    const num = Number(val);
    if (isNaN(num) || num <= 0) return "TBA";
    if (currency === "USD") {
      if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
      if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
      return `$${num.toLocaleString()}`;
    }
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    return `₹${num.toLocaleString()}`;
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

  const getTierBadge = (tier) => {
    if (tier === "S" || tier === "S-Tier") {
      return (
        <span
          style={{
            background: "rgba(229, 169, 60, 0.15)",
            color: "#E5A93C",
            border: "1px solid rgba(229, 169, 60, 0.35)",
            fontFamily: "var(--font-rajdhani), sans-serif",
            fontSize: "0.68rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            padding: "2px 8px",
            borderRadius: "3px",
          }}
        >
          S-TIER
        </span>
      );
    }
    if (tier === "A" || tier === "A-Tier") {
      return (
        <span
          style={{
            background: "rgba(0, 245, 212, 0.12)",
            color: "var(--accent-cyan)",
            border: "1px solid rgba(0, 245, 212, 0.3)",
            fontFamily: "var(--font-rajdhani), sans-serif",
            fontSize: "0.68rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            padding: "2px 8px",
            borderRadius: "3px",
          }}
        >
          A-TIER
        </span>
      );
    }
    return (
      <span
        style={{
          background: "rgba(148, 163, 184, 0.1)",
          color: "var(--text-secondary)",
          border: "1px solid rgba(148, 163, 184, 0.25)",
          fontFamily: "var(--font-rajdhani), sans-serif",
          fontSize: "0.68rem",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          padding: "2px 8px",
          borderRadius: "3px",
        }}
      >
        {tier || "B"}-TIER
      </span>
    );
  };

  const getStatusBadge = (status) => {
    if (status === "live") {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "0.65rem",
            fontWeight: 800,
            fontFamily: "var(--font-rajdhani), sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#ff4655",
            background: "rgba(255, 70, 85, 0.12)",
            border: "1px solid rgba(255, 70, 85, 0.3)",
            padding: "2px 6px",
            borderRadius: "3px",
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "#ff4655",
              boxShadow: "0 0 6px #ff4655",
            }}
          />
          LIVE
        </span>
      );
    }
    if (status === "upcoming") {
      return (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "0.65rem",
            fontWeight: 800,
            fontFamily: "var(--font-rajdhani), sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--accent-cyan)",
            background: "rgba(0, 245, 212, 0.08)",
            border: "1px solid rgba(0, 245, 212, 0.25)",
            padding: "2px 6px",
            borderRadius: "3px",
          }}
        >
          <Clock size={10} /> UPCOMING
        </span>
      );
    }
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "0.65rem",
          fontWeight: 800,
          fontFamily: "var(--font-rajdhani), sans-serif",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--text-muted)",
          background: "rgba(255, 255, 255, 0.04)",
          border: "1px solid var(--border-subtle)",
          padding: "2px 6px",
          borderRadius: "3px",
        }}
      >
        <CheckCircle2 size={10} /> CONCLUDED
      </span>
    );
  };

  return (
    <section id="radar" aria-label="BGMI Tournament Radar" style={{ marginBottom: "5rem" }}>
      {/* Section Header */}
      <div className="section-header">
        <div>
          <div className="tactical-kicker" style={{ color: "#F1B11D" }}>
            <Radio size={14} color="#F1B11D" />
            <span>// 02. COMPETITIVE RADAR</span>
          </div>
          <h2 className="section-title">BGMI Tournament Circuit</h2>
          <p className="section-subtitle">
            Tier-1 championships, sanctioned opens, and regional invitational tournaments
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Complete 4-State Filter Tabs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(8, 11, 16, 0.8)",
              border: "1px solid var(--border-color)",
              borderRadius: "6px",
              padding: "3px",
              gap: "2px",
            }}
          >
            <button
              type="button"
              onClick={() => setFilter("all")}
              style={{
                background: filter === "all" ? "rgba(241, 177, 29, 0.15)" : "transparent",
                color: filter === "all" ? "#F1B11D" : "var(--text-muted)",
                border: filter === "all" ? "1px solid rgba(241, 177, 29, 0.35)" : "1px solid transparent",
                borderRadius: "4px",
                padding: "4px 10px",
                fontSize: "0.72rem",
                fontWeight: 800,
                fontFamily: "var(--font-rajdhani), sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              All ({tournaments.length})
            </button>

            {live.length > 0 && (
              <button
                type="button"
                onClick={() => setFilter("live")}
                style={{
                  background: filter === "live" ? "rgba(255, 70, 85, 0.15)" : "transparent",
                  color: filter === "live" ? "#ff4655" : "var(--text-muted)",
                  border: filter === "live" ? "1px solid rgba(255, 70, 85, 0.35)" : "1px solid transparent",
                  borderRadius: "4px",
                  padding: "4px 10px",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                Live ({live.length})
              </button>
            )}

            {upcoming.length > 0 && (
              <button
                type="button"
                onClick={() => setFilter("upcoming")}
                style={{
                  background: filter === "upcoming" ? "rgba(0, 245, 212, 0.15)" : "transparent",
                  color: filter === "upcoming" ? "var(--accent-cyan)" : "var(--text-muted)",
                  border: filter === "upcoming" ? "1px solid rgba(0, 245, 212, 0.35)" : "1px solid transparent",
                  borderRadius: "4px",
                  padding: "4px 10px",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                Upcoming ({upcoming.length})
              </button>
            )}

            <button
              type="button"
              onClick={() => setFilter("completed")}
              style={{
                background: filter === "completed" ? "rgba(255, 255, 255, 0.08)" : "transparent",
                color: filter === "completed" ? "var(--text-primary)" : "var(--text-muted)",
                border: filter === "completed" ? "1px solid var(--border-color)" : "1px solid transparent",
                borderRadius: "4px",
                padding: "4px 10px",
                fontSize: "0.72rem",
                fontWeight: 800,
                fontFamily: "var(--font-rajdhani), sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              Concluded ({completed.length})
            </button>
          </div>

          <Link
            href="/bgmi/tournaments"
            style={{
              color: "#F1B11D",
              textDecoration: "none",
              fontWeight: 800,
              fontSize: "0.82rem",
              fontFamily: "var(--font-rajdhani), sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            All Tournaments <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Grid of Tournaments */}
      {displayList.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {displayList.map((t) => {
            const detailHref = t.id && !t.id.startsWith("amaze-")
              ? `/tournaments/${t.id}`
              : `/bgmi/tournaments/${encodeURIComponent(t.name.replace(/ /g, "_"))}`;

            return (
              <Link
                key={t.id}
                href={detailHref}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  background: "var(--bg-secondary)",
                  border: t.status === "live" ? "1px solid rgba(255, 70, 85, 0.45)" : "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "1.35rem",
                  transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = t.status === "live" ? "#ff4655" : "rgba(241, 177, 29, 0.45)";
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.background = "var(--bg-card-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = t.status === "live" ? "rgba(255, 70, 85, 0.45)" : "var(--border-color)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.background = "var(--bg-secondary)";
                }}
              >
                {/* Card Top: Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {getTierBadge(t.tier)}
                    {getStatusBadge(t.status)}
                  </div>
                  <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1">
                    <MapPin size={11} /> {t.region || "South Asia"}
                  </span>
                </div>

                {/* Tournament Name */}
                <h3
                  style={{
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    fontSize: "1.15rem",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    lineHeight: 1.3,
                    marginBottom: "0.85rem",
                    minHeight: "2.8rem",
                  }}
                  className="line-clamp-2"
                >
                  {t.name}
                </h3>

                {/* Card Mid: Schedule & Prize Info */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.75rem",
                    padding: "0.75rem 0",
                    borderTop: "1px solid var(--border-subtle)",
                    borderBottom: "1px solid var(--border-subtle)",
                    marginTop: "auto",
                    marginBottom: "0.85rem",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        fontFamily: "var(--font-rajdhani), sans-serif",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "var(--text-muted)",
                        display: "block",
                      }}
                    >
                      Dates
                    </span>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                        marginTop: "2px",
                        display: "block",
                      }}
                    >
                      {formatDate(t.start_date)}
                    </span>
                  </div>

                  <div>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        fontFamily: "var(--font-rajdhani), sans-serif",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "var(--text-muted)",
                        display: "block",
                      }}
                    >
                      Prize Pool
                    </span>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 800,
                        fontFamily: "var(--font-rajdhani), sans-serif",
                        color: "#4ade80",
                        marginTop: "2px",
                        display: "block",
                      }}
                    >
                      {formatPrize(t.prize_pool, t.currency || "USD")}
                    </span>
                  </div>
                </div>

                {/* Card Bottom: Winner / Status Footnote */}
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-1">
                  <span>
                    {t.winner ? (
                      <span className="text-[var(--text-secondary)] font-semibold flex items-center gap-1.5">
                        <Trophy size={12} color="#F1B11D" /> {t.winner}
                      </span>
                    ) : (
                      <span>Format: {t.format || "Battle Royale"}</span>
                    )}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-rajdhani), sans-serif",
                      fontWeight: 800,
                      color: "#F1B11D",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "2px",
                      fontSize: "0.78rem",
                      textTransform: "uppercase",
                    }}
                  >
                    View Details <ArrowRight size={11} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            padding: "3.5rem 2rem",
            textAlign: "center",
            background: "var(--bg-secondary)",
            border: "1px dashed var(--border-color)",
            borderRadius: "8px",
            color: "var(--text-secondary)",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📡</div>
          <h3
            style={{
              fontFamily: "var(--font-rajdhani), sans-serif",
              fontSize: "1.2rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: "0.4rem",
            }}
          >
            No Tournaments In This Filter
          </h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "400px", margin: "0 auto 1rem auto" }}>
            Check back as new Krafton and third-party BGMI circuits are added continuously.
          </p>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="btn-secondary"
            style={{ padding: "6px 18px", fontSize: "0.78rem" }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </section>
  );
}
