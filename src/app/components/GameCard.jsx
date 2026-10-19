"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function GameCard({ game, tournamentCount }) {
  if (!game) return null;

  // Official high-res logo mapping
  const officialLogos = {
    valorant: "https://cdn.pandascore.co/images/game/icon_url/26/valorant.png",
    cs2: "https://cdn.pandascore.co/images/game/icon_url/33602/counter_strike_2.png",
    bgmi: "https://cdn.pandascore.co/images/game/icon_url/23344/bgmi.png",
    "dota-2": "https://cdn.pandascore.co/images/game/icon_url/4/dota2.png",
    "free-fire": "https://cdn.pandascore.co/images/game/icon_url/22889/free_fire.png",
    "pubg-mobile": "https://cdn.pandascore.co/images/game/icon_url/20853/pubg_mobile.png"
  };

  const gameColors = {
    valorant: "#FF4655",
    cs2: "#E5A93C",
    bgmi: "#00F5D4",
    "dota-2": "#E63946",
    "free-fire": "#FF7849",
    "pubg-mobile": "#F59E0B"
  };

  const logoUrl = officialLogos[game.slug] || game.icon_url;
  const brandColor = gameColors[game.slug] || "var(--accent-red)";
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={`/games/${game.slug}`}
      style={{
        textDecoration: "none",
        color: "inherit",
        display: "block",
        height: "100%"
      }}
    >
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: "8px",
          padding: "1.5rem",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `${brandColor}80`;
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.background = "var(--bg-card-hover)";
          const line = e.currentTarget.querySelector(".top-accent-line");
          if (line) line.style.width = "100%";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border-color)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.background = "var(--bg-secondary)";
          const line = e.currentTarget.querySelector(".top-accent-line");
          if (line) line.style.width = "40px";
        }}
      >
        {/* Top Animated Accent Line */}
        <div
          className="top-accent-line"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "40px",
            height: "3px",
            background: brandColor,
            transition: "width 0.3s ease"
          }}
        />

        {/* Game Icon Showcase Box */}
        <div
          style={{
            width: "100%",
            height: "110px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(8, 11, 16, 0.7)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "6px",
            marginBottom: "1.25rem",
            padding: "1rem"
          }}
        >
          {logoUrl && !imgError ? (
            <img
              src={logoUrl}
              alt={game.name}
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.6))"
              }}
            />
          ) : (
            <span style={{ fontSize: "2.5rem" }}>🎮</span>
          )}
        </div>

        {/* Title & Genre */}
        <h3
          style={{
            fontFamily: "var(--font-rajdhani), sans-serif",
            fontSize: "1.3rem",
            fontWeight: 800,
            color: "var(--text-primary)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            margin: "0 0 4px 0",
            lineHeight: 1.2
          }}
        >
          {game.name}
        </h3>

        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 700,
            fontFamily: "var(--font-rajdhani), sans-serif",
            marginBottom: "1.25rem"
          }}
        >
          {game.genre || "Competitive Esports"}
        </div>

        {/* Bottom Status & Link */}
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "0.85rem",
            borderTop: "1px solid var(--border-subtle)"
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.68rem",
              fontWeight: 800,
              fontFamily: "var(--font-rajdhani), sans-serif",
              color: brandColor,
              textTransform: "uppercase",
              letterSpacing: "0.08em"
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: brandColor
              }}
            />
            {tournamentCount !== undefined ? `${tournamentCount} Tournaments` : "Active Circuit"}
          </span>

          <span
            style={{
              color: "var(--text-muted)",
              fontSize: "0.75rem",
              display: "inline-flex",
              alignItems: "center"
            }}
          >
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
