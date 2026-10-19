"use client";

import Link from "next/link";
import { Chip, Tooltip } from "@nextui-org/react";
import { Calendar } from "lucide-react";

export default function TournamentCard({ tournament }) {
  if (!tournament) return null;

  const isLive = tournament.status === "live";

  const formatPrize = (amount) => {
    const num = Number(amount);
    if (!amount || isNaN(num) || num <= 0) return "TBA";
    return num >= 1000000
      ? `$${(num / 1000000).toFixed(1)}M`
      : num >= 1000
        ? `$${(num / 1000).toFixed(0)}K`
        : `$${num.toLocaleString()}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Schedule TBA";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getTierChip = (tier) => {
    if (tier === "S") {
      return (
        <Chip
          size="sm"
          variant="flat"
          classNames={{
            base: "bg-[#E5A93C]/15 border border-[#E5A93C]/35 h-5 px-1.5",
            content: "text-[#E5A93C] font-black uppercase text-[10px] tracking-wider font-['Rajdhani']"
          }}
        >
          S TIER
        </Chip>
      );
    }
    if (tier === "A") {
      return (
        <Chip
          size="sm"
          variant="flat"
          classNames={{
            base: "bg-[#00F5D4]/15 border border-[#00F5D4]/35 h-5 px-1.5",
            content: "text-[#00F5D4] font-black uppercase text-[10px] tracking-wider font-['Rajdhani']"
          }}
        >
          A TIER
        </Chip>
      );
    }
    return (
      <Chip
        size="sm"
        variant="flat"
        classNames={{
          base: "bg-slate-500/15 border border-slate-500/25 h-5 px-1.5",
          content: "text-slate-300 font-bold uppercase text-[10px] tracking-wider font-['Rajdhani']"
        }}
      >
        {tier || "B"} TIER
      </Chip>
    );
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Link
        href={`/tournaments/${tournament.id}`}
        style={{
          textDecoration: "none",
          color: "inherit",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          background: "var(--bg-secondary)",
          border: isLive ? "1px solid rgba(255, 70, 85, 0.45)" : "1px solid var(--border-color)",
          borderRadius: "8px",
          padding: "1.25rem",
          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          position: "relative",
          overflow: "hidden"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = isLive ? "var(--accent-red)" : "rgba(255, 255, 255, 0.25)";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.background = "var(--bg-card-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = isLive ? "rgba(255, 70, 85, 0.45)" : "var(--border-color)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.background = "var(--bg-secondary)";
        }}
      >
        {/* Top Status Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem"
          }}
        >
          {/* Game Tag & Tier Chip */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontFamily: "var(--font-rajdhani), sans-serif",
                fontSize: "0.72rem",
                fontWeight: 800,
                color: "var(--accent-red)",
                textTransform: "uppercase",
                letterSpacing: "0.12em"
              }}
            >
              {tournament.games?.name || "Global Event"}
            </span>
            {getTierChip(tournament.tier)}
          </div>

          {/* HeroUI Chip for Live / Upcoming */}
          {isLive ? (
            <Chip
              size="sm"
              variant="dot"
              color="danger"
              classNames={{
                base: "bg-red-500/10 border border-red-500/30 h-5 px-2",
                content: "font-black uppercase text-[10px] tracking-wider text-[#FF4655] font-['Rajdhani']",
                dot: "bg-[#FF4655] animate-pulse"
              }}
            >
              LIVE
            </Chip>
          ) : (
            <Chip
              size="sm"
              variant="flat"
              classNames={{
                base: "bg-white/5 border border-white/10 h-5 px-2",
                content: "font-bold uppercase text-[10px] tracking-wider text-slate-400 font-['Rajdhani']"
              }}
            >
              {tournament.status || "Upcoming"}
            </Chip>
          )}
        </div>

        {/* Tournament Name & Logo */}
        <div style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start", marginBottom: "1.25rem" }}>
          {tournament.logo_url && !tournament.logo_url.includes("clearbit.com") && (
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "6px",
                background: "var(--bg-primary)",
                border: "1px solid var(--border-subtle)",
                overflow: "hidden",
                flexShrink: 0,
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <img
                src={tournament.logo_url}
                alt={`${tournament.name || "Tournament"} logo`}
                loading="lazy"
                decoding="async"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
              />
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontFamily: "var(--font-rajdhani), sans-serif",
                fontSize: "1.1rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                lineHeight: 1.25,
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                margin: 0
              }}
            >
              {tournament.name}
            </h3>
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "0.85rem",
            borderTop: "1px solid var(--border-subtle)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem",
            fontSize: "0.78rem"
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.62rem",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 800,
                marginBottom: "2px"
              }}
            >
              Prize Pool
            </div>
            <Tooltip
              content={`Verified Prize Pool: ${formatPrize(tournament.prize_pool)} USD`}
              placement="top"
              classNames={{
                content: "bg-[#141A26] text-white border border-white/10 text-xs font-['Rajdhani'] px-2 py-1"
              }}
            >
              <div
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 900,
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  color: "var(--accent-amber)",
                  letterSpacing: "0.02em",
                  cursor: "help",
                  width: "fit-content"
                }}
              >
                {formatPrize(tournament.prize_pool)}
              </div>
            </Tooltip>
          </div>

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "0.62rem",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 800,
                marginBottom: "2px"
              }}
            >
              Region
            </div>
            <div
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                fontFamily: "var(--font-rajdhani), sans-serif",
                color: "var(--text-primary)",
                textTransform: "uppercase"
              }}
            >
              {tournament.region || "Global"}
            </div>
          </div>
        </div>

        {/* Date Footer */}
        <div
          style={{
            marginTop: "0.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.7rem",
            color: "var(--text-muted)"
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <Calendar size={12} />
            {formatDate(tournament.start_date)}
          </span>
          <span
            style={{
              color: isLive ? "var(--accent-red)" : "var(--text-secondary)",
              fontWeight: 700,
              fontFamily: "var(--font-rajdhani), sans-serif",
              letterSpacing: "0.04em",
              textTransform: "uppercase"
            }}
          >
            {isLive ? "View Arena →" : "View Bracket →"}
          </span>
        </div>
      </Link>
    </div>
  );
}
