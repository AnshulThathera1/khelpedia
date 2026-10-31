"use client";

import Link from "next/link";
import {
  Trophy,
  Users,
  ArrowRight,
  Flame,
  Crosshair,
  MapPin,
  Coins
} from "lucide-react";

export default function BGMIHero({ stats, featuredTournament }) {
  // Format prize display with clear dual-currency transparency
  const formatPrize = (val) => {
    if (!val) return "TBD";
    const num = Number(val);
    if (isNaN(num) || num <= 0) return "TBD";
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toLocaleString()}`;
  };

  const prizePoolUsdFormatted = stats?.totalPrizePoolUSD
    ? `$${(stats.totalPrizePoolUSD / 1000000).toFixed(2)}M`
    : "$0";
  const prizePoolInrFormatted = stats?.totalPrizePoolINR
    ? `₹${(stats.totalPrizePoolINR / 10000000).toFixed(1)}Cr`
    : "₹0";

  return (
    <section
      id="overview"
      style={{
        position: "relative",
        background: "var(--bg-primary)",
        borderBottom: "1px solid var(--border-color)",
        paddingTop: "2.5rem",
        paddingBottom: "3.5rem",
        overflow: "hidden",
      }}
    >
      {/* Hero Background Artwork Layer with Tactical Blending */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('/images/bgmi-hero-banner.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 25%",
          opacity: 0.99,
          filter: "contrast(1.15) saturate(1.1)",
          pointerEvents: "none",
        }}
      />

      {/* Dark Tactical Vignette & Grid Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(8, 11, 16, 0.75) 0%, rgba(8, 11, 16, 0.92) 60%, var(--bg-primary) 100%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(241, 177, 29, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(241, 177, 29, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
          opacity: 0.5,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

          {/* LEFT COLUMN: Editorial Hero Command (7 cols) */}
          <div className="lg:col-span-7">
            {/* Tactical Eyebrow */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 12px",
                borderRadius: "4px",
                background: "rgba(241, 177, 29, 0.12)",
                border: "1px solid rgba(241, 177, 29, 0.35)",
                marginBottom: "1.25rem",
              }}
            >
              <Crosshair size={13} color="#F1B11D" />
              <span
                style={{
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  fontSize: "0.74rem",
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                  color: "#F1B11D",
                  textTransform: "uppercase",
                }}
              >
                BATTLEGROUNDS MOBILE INDIA // COMPETITIVE INTELLIGENCE
              </span>
            </div>

            {/* Game Title with Official Logo */}
            <div className="flex items-center gap-4 mb-4">
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "12px",
                  background: "rgba(17, 23, 34, 0.9)",
                  border: "1px solid rgba(241, 177, 29, 0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px",
                  boxShadow: "0 0 25px rgba(241, 177, 29, 0.25)",
                  flexShrink: 0,
                }}
              >
                <img
                  src="/images/games/bgmi.png"
                  alt="BGMI Official Logo"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>

              <div>
                <h1
                  style={{
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    fontSize: "clamp(2rem, 4.5vw, 3.4rem)",
                    fontWeight: 900,
                    lineHeight: 1.05,
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                    color: "var(--text-primary)",
                  }}
                >
                  THE BGMI <span style={{ color: "#F1B11D" }}>ARENA</span>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      fontFamily: "var(--font-rajdhani), sans-serif",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--accent-cyan)",
                      background: "rgba(0, 245, 212, 0.1)",
                      border: "1px solid rgba(0, 245, 212, 0.25)",
                      padding: "2px 8px",
                      borderRadius: "3px",
                    }}
                  >
                    Battle Royale
                  </span>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      fontFamily: "var(--font-rajdhani), sans-serif",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--text-muted)",
                    }}
                  >
                    • South Asia Competitive Circuit
                  </span>
                </div>
              </div>
            </div>

            {/* Supporting Description */}
            <p
              style={{
                fontSize: "1rem",
                lineHeight: 1.6,
                color: "var(--text-secondary)",
                maxWidth: "580px",
                marginBottom: "2rem",
              }}
            >
              Your destination for BGMI tournament brackets, team rosters, match telemetry, player performance analytics, and competitive journalism.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#radar"
                className="btn-primary"
                style={{
                  background: "linear-gradient(135deg, #F1B11D 0%, #d49814 100%)",
                  color: "#080b10",
                  fontWeight: 800,
                  boxShadow: "0 4px 18px rgba(241, 177, 29, 0.35)",
                }}
              >
                <Trophy size={16} />
                Explore Tournaments
              </a>

              <a
                href="#teams"
                className="btn-secondary"
                style={{
                  borderColor: "rgba(255, 255, 255, 0.15)",
                }}
              >
                <Users size={16} />
                Featured Teams
              </a>

              <a
                href="#news"
                style={{
                  color: "var(--text-muted)",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "8px 12px",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                BGMI Intel <ArrowRight size={14} />
              </a>
            </div>
          </div>

          {/* RIGHT COLUMN: Tactical Command Radar HUD (5 cols) */}
          <div className="lg:col-span-5">
            <div
              style={{
                background: "linear-gradient(180deg, rgba(20, 26, 38, 0.96), rgba(14, 19, 28, 0.98))",
                border: "1px solid rgba(241, 177, 29, 0.28)",
                borderRadius: "10px",
                padding: "1.5rem",
                boxShadow: "0 12px 40px rgba(0, 0, 0, 0.6)",
                position: "relative",
                overflow: "hidden",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Tactical Reticle Borders */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "12px",
                  height: "12px",
                  borderTop: "2px solid #F1B11D",
                  borderLeft: "2px solid #F1B11D",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: "12px",
                  height: "12px",
                  borderBottom: "2px solid #F1B11D",
                  borderRight: "2px solid #F1B11D",
                }}
              />

              {/* HUD Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <Flame size={14} color="#F1B11D" />
                  <span
                    style={{
                      fontFamily: "var(--font-rajdhani), sans-serif",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "var(--text-primary)",
                    }}
                  >
                    CIRCUIT TELEMETRY
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--accent-cyan)",
                    background: "rgba(0, 245, 212, 0.08)",
                    border: "1px solid rgba(0, 245, 212, 0.25)",
                    padding: "2px 6px",
                    borderRadius: "2px",
                  }}
                >
                  LIVE HUD
                </span>
              </div>

              {/* Telemetry Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div
                  style={{
                    background: "rgba(8, 11, 16, 0.6)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "6px",
                    padding: "0.85rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      fontFamily: "var(--font-rajdhani), sans-serif",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      display: "block",
                    }}
                  >
                    Tracked Tourneys
                  </span>
                  <div
                    style={{
                      fontFamily: "var(--font-rajdhani), sans-serif",
                      fontSize: "1.6rem",
                      fontWeight: 900,
                      color: "var(--text-primary)",
                      marginTop: "2px",
                    }}
                  >
                    {stats?.totalTournaments ?? 0}
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    S & A Tier: {stats?.sTierEvents ?? 0}
                  </span>
                </div>

                <div
                  style={{
                    background: "rgba(8, 11, 16, 0.6)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "6px",
                    padding: "0.85rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      fontFamily: "var(--font-rajdhani), sans-serif",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      display: "block",
                    }}
                  >
                    Recorded Maps
                  </span>
                  <div
                    style={{
                      fontFamily: "var(--font-rajdhani), sans-serif",
                      fontSize: "1.6rem",
                      fontWeight: 900,
                      color: "var(--accent-cyan)",
                      marginTop: "2px",
                    }}
                  >
                    {stats?.totalMatches ?? 0}
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                    Verified match results
                  </span>
                </div>
              </div>

              {/* Total Prize Pool Strip */}
              <div
                style={{
                  background: "rgba(241, 177, 29, 0.06)",
                  border: "1px solid rgba(241, 177, 29, 0.2)",
                  borderRadius: "6px",
                  padding: "0.75rem 1rem",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "0.62rem",
                      fontWeight: 800,
                      fontFamily: "var(--font-rajdhani), sans-serif",
                      color: "#F1B11D",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      display: "block",
                    }}
                  >
                    CUMULATIVE CIRCUIT PRIZES
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-rajdhani), sans-serif",
                      fontSize: "1.25rem",
                      fontWeight: 900,
                      color: "#4ade80",
                    }}
                  >
                    {prizePoolUsdFormatted}{" "}
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      ({prizePoolInrFormatted})
                    </span>
                  </span>
                </div>
                <Coins size={22} color="#F1B11D" />
              </div>

              {/* Featured Tournament Spotlight Strip */}
              {featuredTournament && (
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "6px",
                    padding: "0.75rem 1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      style={{
                        fontSize: "0.62rem",
                        fontWeight: 800,
                        fontFamily: "var(--font-rajdhani), sans-serif",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      SPOTLIGHT EVENT
                    </span>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: 800,
                        fontFamily: "var(--font-rajdhani), sans-serif",
                        color: "#E5A93C",
                        background: "rgba(229, 169, 60, 0.15)",
                        border: "1px solid rgba(229, 169, 60, 0.3)",
                        padding: "1px 6px",
                        borderRadius: "2px",
                      }}
                    >
                      {featuredTournament.tier || "A"} TIER
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: "var(--font-rajdhani), sans-serif",
                      fontSize: "1rem",
                      fontWeight: 800,
                      color: "var(--text-primary)",
                      marginBottom: "4px",
                    }}
                    className="truncate"
                  >
                    {featuredTournament.name}
                  </h3>

                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} color="var(--text-muted)" />
                      {featuredTournament.region || "South Asia"}
                    </span>
                    <span className="font-bold text-green-400">
                      {formatPrize(featuredTournament.prize_pool)}
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Jump Action Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-xs">
                <span className="text-[var(--text-muted)] font-medium">
                  Official Battlegrounds Mobile India Hub
                </span>
                <Link
                  href="/bgmi/tournaments"
                  style={{
                    color: "#F1B11D",
                    textDecoration: "none",
                    fontWeight: 800,
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
                  View All Events <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
