"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Trophy, 
  Users, 
  Target, 
  Radio, 
  Flame, 
  ChevronLeft,
  Calendar,
  Newspaper,
  Swords
} from "lucide-react";

export default function BGMISubNav() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("overview");

  const isHubPage = pathname === "/bgmi";

  // ScrollSpy tracking for the BGMI Hub page
  useEffect(() => {
    if (!isHubPage) return;

    const handleScroll = () => {
      const sections = ["news", "matches", "players", "teams", "radar", "overview"];
      const scrollPosition = window.scrollY + 180;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sectionId);
          return;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHubPage]);

  const navLinks = [
    {
      id: "overview",
      label: "Overview",
      href: isHubPage ? "#overview" : "/bgmi#overview",
      icon: <Radio className="w-3.5 h-3.5" />,
      isAnchor: true,
    },
    {
      id: "radar",
      label: "Tournaments",
      href: isHubPage ? "#radar" : "/bgmi/tournaments",
      secondaryHref: "/bgmi/tournaments",
      icon: <Calendar className="w-3.5 h-3.5" />,
    },
    {
      id: "teams",
      label: "Teams",
      href: isHubPage ? "#teams" : "/bgmi/teams",
      secondaryHref: "/bgmi/teams",
      icon: <Users className="w-3.5 h-3.5" />,
    },
    {
      id: "players",
      label: "Players",
      href: isHubPage ? "#players" : "/bgmi/players",
      secondaryHref: "/bgmi/players",
      icon: <Target className="w-3.5 h-3.5" />,
    },
    {
      id: "matches",
      label: "Match Results",
      href: isHubPage ? "#matches" : "/bgmi#matches",
      icon: <Swords className="w-3.5 h-3.5" />,
      isAnchor: true,
    },
    {
      id: "news",
      label: "News & Intel",
      href: isHubPage ? "#news" : "/bgmi#news",
      icon: <Newspaper className="w-3.5 h-3.5" />,
      isAnchor: true,
    },
  ];

  return (
    <nav
      aria-label="BGMI Hub Secondary Navigation"
      style={{
        position: "sticky",
        top: 68,
        zIndex: 45,
        background: "rgba(11, 16, 24, 0.94)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(241, 177, 29, 0.2)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
        width: "100%",
        transition: "top 0.2s ease",
      }}
    >
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "48px",
          gap: "1rem",
        }}
      >
        {/* Left: Game Brand Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
          <Link
            href="/games"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              color: "var(--text-muted)",
              textDecoration: "none",
              fontSize: "0.72rem",
              fontWeight: 800,
              fontFamily: "var(--font-rajdhani), sans-serif",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              paddingRight: "0.75rem",
              borderRight: "1px solid var(--border-color)",
              transition: "color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#F1B11D")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Games</span>
          </Link>

          <Link
            href="/bgmi"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(241, 177, 29, 0.12)",
                border: "1px solid rgba(241, 177, 29, 0.35)",
              }}
            >
              <img
                src="/images/games/bgmi.png"
                alt="BGMI Logo"
                style={{ width: "16px", height: "16px", objectFit: "contain" }}
              />
            </div>
            <span
              style={{
                fontFamily: "var(--font-rajdhani), sans-serif",
                fontSize: "0.95rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-primary)",
              }}
            >
              BGMI <span style={{ color: "#F1B11D" }}>HUB</span>
            </span>
          </Link>
        </div>

        {/* Center/Right: Navigation Links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            overflowX: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            padding: "2px 0",
          }}
        >
          {navLinks.map((item) => {
            const isActive = isHubPage
              ? activeSection === item.id
              : pathname === item.secondaryHref || pathname.startsWith(item.secondaryHref || "###");

            return (
              <a
                key={item.id}
                href={item.href}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px",
                  borderRadius: "4px",
                  fontSize: "0.76rem",
                  fontWeight: 700,
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                  color: isActive ? "#F1B11D" : "var(--text-secondary)",
                  background: isActive ? "rgba(241, 177, 29, 0.12)" : "transparent",
                  border: isActive ? "1px solid rgba(241, 177, 29, 0.35)" : "1px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--text-primary)";
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--text-secondary)";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>

        {/* Right Status Pill */}
        <div
          className="hidden md:flex items-center gap-2 pl-3 border-l border-[var(--border-color)]"
          style={{ flexShrink: 0 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "3px 8px",
              borderRadius: "999px",
              background: "rgba(0, 245, 212, 0.1)",
              border: "1px solid rgba(0, 245, 212, 0.3)",
              fontSize: "0.68rem",
              fontWeight: 800,
              fontFamily: "var(--font-rajdhani), sans-serif",
              letterSpacing: "0.08em",
              color: "var(--accent-cyan)",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--accent-cyan)",
                boxShadow: "0 0 8px var(--accent-cyan)",
              }}
            />
            CIRCUIT ACTIVE
          </div>
        </div>
      </div>
    </nav>
  );
}
