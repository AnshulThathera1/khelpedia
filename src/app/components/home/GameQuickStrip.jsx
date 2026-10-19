"use client";

import Link from "next/link";
import { Chip } from "@nextui-org/react";
import { Flame } from "lucide-react";

const FEATURED_GAMES = [
  {
    slug: "valorant",
    name: "VALORANT",
    shortName: "VAL",
    color: "#FF4655",
    icon: "https://cdn.pandascore.co/images/game/icon_url/26/valorant.png",
    activeCircuit: "VCT Masters"
  },
  {
    slug: "cs2",
    name: "Counter-Strike 2",
    shortName: "CS2",
    color: "#E5A93C",
    icon: "https://cdn.pandascore.co/images/game/icon_url/33602/counter_strike_2.png",
    activeCircuit: "BLAST Premier"
  },
  {
    slug: "bgmi",
    name: "BGMI",
    shortName: "BGMI",
    color: "#00F5D4",
    icon: "https://cdn.pandascore.co/images/game/icon_url/23344/bgmi.png",
    activeCircuit: "BMS Series"
  },
  {
    slug: "dota-2",
    name: "Dota 2",
    shortName: "DOTA",
    color: "#E63946",
    icon: "https://cdn.pandascore.co/images/game/icon_url/4/dota2.png",
    activeCircuit: "DreamLeague"
  },
  {
    slug: "free-fire",
    name: "Free Fire",
    shortName: "FF",
    color: "#FF7849",
    icon: "https://cdn.pandascore.co/images/game/icon_url/22889/free_fire.png",
    activeCircuit: "World Series"
  },
  {
    slug: "pubg-mobile",
    name: "PUBG Mobile",
    shortName: "PUBG-M",
    color: "#F59E0B",
    icon: "https://cdn.pandascore.co/images/game/icon_url/20853/pubg_mobile.png",
    activeCircuit: "Global Open"
  }
];

export default function GameQuickStrip({ games = [] }) {
  return (
    <nav
      aria-label="Quick Game Switcher"
      style={{
        borderBottom: "1px solid var(--border-color)",
        background: "rgba(14, 19, 28, 0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        position: "sticky",
        top: 68,
        zIndex: 40,
        overflowX: "auto",
        scrollbarWidth: "none",
        msOverflowStyle: "none"
      }}
    >
      <div
        className="page-container"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.6rem 1rem",
          minWidth: "max-content"
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "0.68rem",
            fontWeight: 800,
            fontFamily: "var(--font-rajdhani), sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: "var(--text-muted)",
            paddingRight: "0.75rem",
            borderRight: "1px solid var(--border-color)",
            whiteSpace: "nowrap"
          }}
        >
          <Flame size={12} color="var(--accent-red)" />
          Game Circuits
        </span>

        {FEATURED_GAMES.map((g) => (
          <Link
            key={g.slug}
            href={`/games/${g.slug}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 12px",
              borderRadius: "4px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid var(--border-subtle)",
              textDecoration: "none",
              color: "var(--text-secondary)",
              fontSize: "0.8rem",
              fontWeight: 700,
              fontFamily: "var(--font-rajdhani), sans-serif",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${g.color}60`;
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.background = `${g.color}14`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.color = "var(--text-secondary)";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
            }}
          >
            {/* Game Icon */}
            <img
              src={g.icon}
              alt={g.name}
              loading="lazy"
              decoding="async"
              style={{
                width: "16px",
                height: "16px",
                objectFit: "contain",
                filter: "drop-shadow(0 0 4px rgba(0,0,0,0.4))"
              }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
            <span>{g.name}</span>
            <Chip
              size="sm"
              variant="flat"
              style={{
                background: `${g.color}1c`,
                color: g.color,
                borderColor: `${g.color}35`
              }}
              classNames={{
                base: "h-4.5 px-1.5 border",
                content: "text-[9px] font-black uppercase tracking-wider font-['Rajdhani']"
              }}
            >
              {g.activeCircuit}
            </Chip>
          </Link>
        ))}

        <Link
          href="/games"
          style={{
            marginLeft: "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "0.72rem",
            fontWeight: 800,
            fontFamily: "var(--font-rajdhani), sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--accent-red)",
            textDecoration: "none",
            padding: "4px 8px",
            whiteSpace: "nowrap"
          }}
        >
          All Titles →
        </Link>
      </div>
    </nav>
  );
}
