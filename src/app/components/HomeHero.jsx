"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Tabs, Tab, Chip } from "@nextui-org/react";
import { Radio, Trophy, ArrowRight, Calendar, ExternalLink } from "lucide-react";

export default function HomeHero({ liveTournaments = [], upcomingTournaments = [] }) {
  const [activeTab, setActiveTab] = useState(liveTournaments.length > 0 ? "live" : "upcoming");

  const displayTournaments = (
    activeTab === "live"
      ? (liveTournaments.length > 0 ? liveTournaments : upcomingTournaments)
      : upcomingTournaments
  ).slice(0, 3);

  const formatPrize = (amount) => {
    const num = Number(amount);
    if (!amount || isNaN(num) || num <= 0) return "TBA";
    return num >= 1000000
      ? `$${(num / 1000000).toFixed(1)}M`
      : num >= 1000
        ? `$${(num / 1000).toFixed(0)}K`
        : `$${num.toLocaleString()}`;
  };

  return (
    <section
      aria-label="Esports Command Center Hero"
      style={{
        position: "relative",
        minHeight: "560px",
        overflow: "hidden",
        borderBottom: "1px solid var(--border-color)",
        background: "var(--bg-primary)"
      }}
    >
      {/* Cinematic Background Layer (Atmospheric CSS WebP with Obsidian Vignettes) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(ellipse at 70% 30%, rgba(255, 70, 85, 0.12) 100%, transparent 100%), linear-gradient(180deg, rgba(8, 11, 16, 0.75) 100%, rgba(8, 11, 16, 0.96) 100%, #080B10 100%), url('/images/esports-hero-bg.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center 25%",
          pointerEvents: "none"
        }}
      />

      {/* Tactical Grid Accent Line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, transparent, var(--accent-red) 30%, var(--accent-cyan) 70%, transparent)",
          opacity: 0.85
        }}
      />

      <div
        className="page-container"
        style={{
          position: "relative",
          zIndex: 10,
          paddingTop: "3.5rem",
          paddingBottom: "4rem"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "3rem",
            alignItems: "center"
          }}
        >
          {/* ================= LEFT COLUMN: EDITORIAL SPOTLIGHT ================= */}
          <div>
            {/* Tactical Kicker */}
            <div className="tactical-kicker">
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--accent-red)",
                  boxShadow: "0 0 10px var(--accent-red)",
                  display: "inline-block",
                  animation: "pulse-dot 1.5s infinite"
                }}
              />
              <span>// 01. GLOBAL ESPORTS INTELLIGENCE</span>
            </div>

            {/* High-Impact Main Title */}
            <h1
              style={{
                fontFamily: "var(--font-rajdhani), sans-serif",
                fontSize: "clamp(2.5rem, 5.2vw, 4.25rem)",
                fontWeight: 900,
                lineHeight: 1.02,
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                color: "var(--text-primary)",
                marginBottom: "1.25rem"
              }}
            >
              The Command Center <br />
              Of <span style={{ color: "var(--accent-red)" }}>Global Esports</span>
            </h1>

            {/* Editorial Lead Copy */}
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "clamp(1rem, 1.4vw, 1.15rem)",
                lineHeight: 1.7,
                maxWidth: "560px",
                marginBottom: "2.25rem"
              }}
            >
              Real-time tournament tracking, player analytics, and breaking editorial coverage across
              the world&apos;s tier-one competitive gaming titles.
            </p>

            {/* Accessible HeroUI CTA Buttons */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
              <Button
                as={Link}
                href="/tournaments?status=live"
                size="lg"
                endContent={<ArrowRight size={16} />}
                style={{
                  background: "var(--accent-red)",
                  color: "#fff",
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  borderRadius: "4px",
                  padding: "0 28px",
                  height: "46px"
                }}
              >
                Live Arena
              </Button>

              <Button
                as={Link}
                href="/players"
                size="lg"
                variant="bordered"
                startContent={<Trophy size={16} color="var(--accent-amber)" />}
                style={{
                  borderColor: "rgba(255, 255, 255, 0.15)",
                  color: "var(--text-primary)",
                  background: "rgba(14, 19, 28, 0.6)",
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  borderRadius: "4px",
                  padding: "0 24px",
                  height: "46px"
                }}
              >
                World Rankings
              </Button>
            </div>

            {/* System Status Ticker with HeroUI Chip */}
            <div style={{ marginTop: "2.5rem" }}>
              <Chip
                variant="flat"
                avatar={
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--accent-cyan)",
                      display: "inline-block",
                      marginLeft: "6px"
                    }}
                  />
                }
                style={{
                  background: "rgba(14, 19, 28, 0.8)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "4px 8px"
                }}
              >
                Live Telemetry Active | {liveTournaments.length} Active Events
              </Chip>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: LIVE ARENA RADAR ================= */}
          <div style={{ width: "100%", maxWidth: "520px", justifySelf: "end" }}>
            <div
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                boxShadow: "0 16px 48px rgba(0, 0, 0, 0.6)",
                overflow: "hidden"
              }}
            >
              {/* Radar Card Header */}
              <div
                style={{
                  padding: "0.85rem 1.25rem",
                  borderBottom: "1px solid var(--border-color)",
                  background: "var(--bg-card)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  flexWrap: "wrap"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Radio size={16} color="var(--accent-red)" />
                  <span
                    style={{
                      fontFamily: "var(--font-rajdhani), sans-serif",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: "var(--text-primary)"
                    }}
                  >
                    Live Arena Radar
                  </span>
                </div>

                {/* HeroUI Accessible Tabs */}
                <Tabs
                  selectedKey={activeTab}
                  onSelectionChange={(key) => setActiveTab(String(key))}
                  size="sm"
                  aria-label="Live Arena Radar Filter"
                  classNames={{
                    tabList: "bg-black/40 border border-white/10 p-0.5 rounded-md",
                    cursor: activeTab === "live" ? "bg-[#FF4655]" : "bg-[#00F5D4]",
                    tab: "h-7 px-3 text-xs font-bold uppercase font-['Rajdhani']",
                    tabContent: activeTab === "live" ? "group-data-[selected=true]:text-white" : "group-data-[selected=true]:text-black"
                  }}
                >
                  <Tab key="live" title={`Live (${liveTournaments.length})`} />
                  <Tab key="upcoming" title="Upcoming" />
                </Tabs>
              </div>

              {/* Tournament Rows */}
              <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {displayTournaments.length > 0 ? (
                  displayTournaments.map((t, idx) => (
                    <Link
                      key={t.id || idx}
                      href={`/tournaments/${t.id}`}
                      style={{
                        display: "block",
                        textDecoration: "none",
                        color: "inherit",
                        padding: "0.85rem 1rem",
                        borderRadius: "6px",
                        background: "rgba(255, 255, 255, 0.02)",
                        border: "1px solid var(--border-subtle)",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--bg-card-hover)";
                        e.currentTarget.style.borderColor = "rgba(255, 70, 85, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
                        e.currentTarget.style.borderColor = "var(--border-subtle)";
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              fontSize: "0.68rem",
                              fontWeight: 800,
                              fontFamily: "var(--font-rajdhani), sans-serif",
                              color: "var(--accent-red)",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em"
                            }}
                          >
                            {t.games?.name || "Esports Title"}
                          </span>
                          <span className={t.tier === "S" ? "tier-badge tier-badge-s" : "tier-badge tier-badge-a"}>
                            {t.tier || "A"} TIER
                          </span>
                        </div>

                        {t.status === "live" ? (
                          <Chip
                            size="sm"
                            variant="dot"
                            color="danger"
                            style={{
                              height: "22px",
                              fontFamily: "var(--font-rajdhani), sans-serif",
                              fontWeight: 900,
                              fontSize: "0.65rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em"
                            }}
                          >
                            LIVE
                          </Chip>
                        ) : (
                          <span
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              color: "var(--text-muted)",
                              textTransform: "uppercase"
                            }}
                          >
                            {t.start_date ? new Date(t.start_date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Scheduled"}
                          </span>
                        )}
                      </div>

                      <h2
                        style={{
                          fontSize: "1rem",
                          fontWeight: 800,
                          fontFamily: "var(--font-rajdhani), sans-serif",
                          color: "var(--text-primary)",
                          textTransform: "uppercase",
                          letterSpacing: "0.02em",
                          margin: "0 0 6px 0",
                          lineHeight: 1.25,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                      >
                        {t.name}
                      </h2>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "0.75rem",
                          color: "var(--text-muted)"
                        }}
                      >
                        <span>
                          Pool:{" "}
                          <strong style={{ color: "var(--accent-amber)", fontFamily: "var(--font-rajdhani), sans-serif", fontWeight: 800 }}>
                            {formatPrize(t.prize_pool)}
                          </strong>
                        </span>
                        <span>{t.region || "Global"}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    No events currently monitored in this category.
                  </div>
                )}
              </div>

              {/* Radar Footer Action */}
              <div
                style={{
                  padding: "0.75rem 1.25rem",
                  borderTop: "1px solid var(--border-color)",
                  background: "rgba(0, 0, 0, 0.2)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Verified tournament records
                </span>
                <Link
                  href="/tournaments"
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    color: "var(--accent-red)",
                    textDecoration: "none",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  Full Schedule <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
