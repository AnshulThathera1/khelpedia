"use client";

import Link from "next/link";
import { Chip, Tooltip } from "@nextui-org/react";

export default function PlayerCard({ player, rank }) {
  if (!player) return null;

  const formatEarnings = (amount) => {
    const num = Number(amount);
    if (!amount || isNaN(num) || num <= 0) return "$0";
    return num >= 1000000
      ? `$${(num / 1000000).toFixed(1)}M`
      : num >= 1000
        ? `$${(num / 1000).toFixed(0)}K`
        : `$${num.toLocaleString()}`;
  };

  const getRankBadgeClass = (r) => {
    if (r === 1) return "rank-badge rank-badge-1";
    if (r === 2) return "rank-badge rank-badge-2";
    if (r === 3) return "rank-badge rank-badge-3";
    return "rank-badge rank-badge-other";
  };

  return (
    <Link
      href={`/players/${player.slug || player.id}`}
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "0.85rem 1rem",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: "6px",
          transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = rank === 1 ? "var(--accent-amber)" : "var(--border-glow)";
          e.currentTarget.style.transform = "translateX(4px)";
          e.currentTarget.style.background = "var(--bg-card-hover)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border-color)";
          e.currentTarget.style.transform = "translateX(0)";
          e.currentTarget.style.background = "var(--bg-secondary)";
        }}
      >
        {/* Podium Rank Medal */}
        {rank && (
          <div className={getRankBadgeClass(rank)}>
            {rank}
          </div>
        )}

        {/* Player Avatar */}
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: "6px",
            background: "var(--bg-primary)",
            border: "1px solid var(--border-subtle)",
            overflow: "hidden",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1rem",
            fontWeight: 800,
            color: "var(--text-secondary)",
            fontFamily: "var(--font-rajdhani), sans-serif"
          }}
        >
          {player.image_url ? (
            <img
              src={player.image_url}
              alt={player.ign}
              loading="lazy"
              decoding="async"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          ) : (
            player.ign?.charAt(0)?.toUpperCase() || "?"
          )}
        </div>

        {/* Player Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h3
              style={{
                fontFamily: "var(--font-rajdhani), sans-serif",
                fontSize: "1.05rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "0.02em"
              }}
            >
              {player.ign}
            </h3>

            {player.teams && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "var(--accent-cyan)",
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  textTransform: "uppercase"
                }}
              >
                {player.teams.logo_url && !player.teams.logo_url.includes("clearbit.com") && (
                  <img
                    src={player.teams.logo_url}
                    alt={`${player.teams.name} logo`}
                    loading="lazy"
                    decoding="async"
                    style={{ width: 14, height: 14, objectFit: "contain" }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                )}
                {player.teams.name}
              </span>
            )}
          </div>

          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {player.name || "Professional Competitor"}
          </div>
        </div>

        {/* Earnings & Country */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <Tooltip
            content={`Verified cumulative career earnings: ${formatEarnings(player.earnings)}`}
            placement="top-end"
            classNames={{
              content: "bg-[#141A26] text-white border border-white/10 text-xs font-['Rajdhani'] px-2 py-1"
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-rajdhani), sans-serif",
                fontSize: "1.05rem",
                fontWeight: 800,
                color: rank <= 3 ? "var(--accent-amber)" : "var(--text-primary)",
                lineHeight: 1,
                cursor: "help"
              }}
            >
              {formatEarnings(player.earnings)}
            </div>
          </Tooltip>

          <div style={{ marginTop: "4px", display: "flex", justifyContent: "flex-end" }}>
            <Chip
              size="sm"
              variant="flat"
              classNames={{
                base: "bg-white/5 border border-white/10 h-4 px-1.5",
                content: "text-[10px] text-slate-400 font-bold uppercase font-['Rajdhani']"
              }}
            >
              {player.country || "Global"}
            </Chip>
          </div>
        </div>
      </div>
    </Link>
  );
}
