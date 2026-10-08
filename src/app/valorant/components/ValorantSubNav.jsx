"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Trophy,
  Users,
  Map,
  Crosshair,
  Target,
  ChevronDown,
  Activity,
  AlertTriangle,
} from "lucide-react";

/**
 * ValorantSubNav
 * Responsive secondary sub-navigation for the Valorant section of KhelPediA.
 *
 * Viewport Strategy:
 * - Desktop (>= 1024px): 1 single horizontal row containing Brand + all 5 links + Status Badge.
 * - Tablet (768px - 1023px): 1 single horizontal row with Search, Leaderboard, Agents, and More ▾ dropdown (Maps, Weapons).
 * - Mobile (< 768px down to 381px): 2 compact rows:
 *     Row 1: Brand (left) + Status Pill (right).
 *     Row 2: Search, Leaderboard, Agents, More ▾.
 * - Very Small Mobile (<= 380px down to 320px): 2 minimal rows:
 *     Row 1: Brand (left) + Status Pill (right).
 *     Row 2: Search, Leaderboard, More ▾ (Agents, Maps, Weapons inside More).
 *
 * Features:
 * - Sticky top positioning under main KhelPediA navbar.
 * - Active state detection based on URL pathname & scroll spy (#search, #agents, #maps, #weapons).
 * - Keyboard accessible More ▾ dropdown with click-outside and Esc support.
 * - Zero horizontal scroll across all devices (tested down to 320px).
 */
export default function ValorantSubNav({ serverStatus = null }) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("search");
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef(null);

  const isLeaderboardPage = pathname === "/valorant/leaderboard";

  // Active section tracking via ScrollSpy on /valorant
  useEffect(() => {
    if (isLeaderboardPage) {
      setActiveSection("leaderboard");
      return;
    }

    const handleScroll = () => {
      const sections = ["weapons", "maps", "agents", "search"];
      const scrollPosition = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(sectionId);
          return;
        }
      }
      setActiveSection("search");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLeaderboardPage]);

  // Click outside to close More dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setIsMoreOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMoreOpen(false);
      }
    };

    if (isMoreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMoreOpen]);

  const handleNavClick = (sectionId) => {
    setIsMoreOpen(false);
    setActiveSection(sectionId);
  };

  const isMoreActive =
    activeSection === "maps" ||
    activeSection === "weapons" ||
    activeSection === "agents";

  const currentStatus = serverStatus || { type: "success", message: "All Systems Online" };

  return (
    <nav className="valorant-subnav" aria-label="Valorant section navigation">
      <div className="container valorant-subnav-container">
        {/* Brand & Mobile Status (Row 1 on Mobile, Left column on Desktop) */}
        <div className="valorant-subnav-brand-bar">
          <Link
            href="/valorant"
            className="valorant-subnav-brand"
            aria-label="KhelPediA Valorant Hub"
          >
            <div className="valorant-brand-hex">
              <Target className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="valorant-brand-text">VALORANT</span>
          </Link>

          {/* Status Indicator (Mobile view: inline on row 1) */}
          <div className="valorant-status-mobile">
            <div
              className={`valorant-status-pill ${
                currentStatus.type === "success"
                  ? "status-success"
                  : currentStatus.type === "warning"
                  ? "status-warning"
                  : "status-danger"
              }`}
              title={currentStatus.message || "Valorant API Status"}
            >
              <span className="status-pulse-dot" />
              <span className="status-text">
                {currentStatus.type === "success" ? "ONLINE" : "ISSUES"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links (Row 2 on Mobile, Center on Desktop) */}
        <div className="valorant-subnav-links-bar">
          {/* 1. SEARCH */}
          <a
            href={isLeaderboardPage ? "/valorant#search" : "#search"}
            onClick={() => handleNavClick("search")}
            className={`valorant-nav-link ${
              !isLeaderboardPage && activeSection === "search" ? "is-active" : ""
            }`}
            aria-current={!isLeaderboardPage && activeSection === "search" ? "page" : undefined}
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span>Search</span>
          </a>

          {/* 2. LEADERBOARD */}
          <Link
            href="/valorant/leaderboard"
            onClick={() => handleNavClick("leaderboard")}
            className={`valorant-nav-link ${
              isLeaderboardPage || activeSection === "leaderboard" ? "is-active" : ""
            }`}
            aria-current={isLeaderboardPage ? "page" : undefined}
          >
            <Trophy className="w-3.5 h-3.5 shrink-0" />
            <span>Leaderboard</span>
          </Link>

          {/* 3. AGENTS (Visible on Desktop, Tablet, and Mobile > 380px) */}
          <a
            href={isLeaderboardPage ? "/valorant#agents" : "#agents"}
            onClick={() => handleNavClick("agents")}
            className={`valorant-nav-link nav-item-agents ${
              !isLeaderboardPage && activeSection === "agents" ? "is-active" : ""
            }`}
            aria-current={!isLeaderboardPage && activeSection === "agents" ? "page" : undefined}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Agents</span>
          </a>

          {/* 4. MAPS (Visible on Desktop >= 1024px only) */}
          <a
            href={isLeaderboardPage ? "/valorant#maps" : "#maps"}
            onClick={() => handleNavClick("maps")}
            className={`valorant-nav-link nav-item-desktop-only ${
              !isLeaderboardPage && activeSection === "maps" ? "is-active" : ""
            }`}
            aria-current={!isLeaderboardPage && activeSection === "maps" ? "page" : undefined}
          >
            <Map className="w-3.5 h-3.5 shrink-0" />
            <span>Maps</span>
          </a>

          {/* 5. WEAPONS (Visible on Desktop >= 1024px only) */}
          <a
            href={isLeaderboardPage ? "/valorant#weapons" : "#weapons"}
            onClick={() => handleNavClick("weapons")}
            className={`valorant-nav-link nav-item-desktop-only ${
              !isLeaderboardPage && activeSection === "weapons" ? "is-active" : ""
            }`}
            aria-current={!isLeaderboardPage && activeSection === "weapons" ? "page" : undefined}
          >
            <Crosshair className="w-3.5 h-3.5 shrink-0" />
            <span>Weapons</span>
          </a>

          {/* 6. MORE ▾ (Visible on Viewports < 1024px) */}
          <div className="valorant-nav-more-wrapper" ref={moreRef}>
            <button
              type="button"
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className={`valorant-nav-link valorant-more-btn ${
                isMoreOpen || (isMoreActive && !isLeaderboardPage) ? "is-active" : ""
              }`}
              aria-haspopup="true"
              aria-expanded={isMoreOpen}
              aria-controls="valorant-more-dropdown"
              aria-label="More Valorant sections"
            >
              <span>More</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isMoreOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Accessible Popover Dropdown */}
            {isMoreOpen && (
              <div
                id="valorant-more-dropdown"
                role="menu"
                className="valorant-more-dropdown"
              >
                {/* Agents appears in dropdown on very small screens (<= 380px) */}
                <a
                  href={isLeaderboardPage ? "/valorant#agents" : "#agents"}
                  role="menuitem"
                  onClick={() => handleNavClick("agents")}
                  className={`dropdown-item dropdown-item-agents-small ${
                    !isLeaderboardPage && activeSection === "agents" ? "is-active" : ""
                  }`}
                >
                  <Users className="w-4 h-4 text-red-400" />
                  <span>Agents</span>
                </a>

                {/* Maps (Tablet & Mobile) */}
                <a
                  href={isLeaderboardPage ? "/valorant#maps" : "#maps"}
                  role="menuitem"
                  onClick={() => handleNavClick("maps")}
                  className={`dropdown-item ${
                    !isLeaderboardPage && activeSection === "maps" ? "is-active" : ""
                  }`}
                >
                  <Map className="w-4 h-4 text-cyan-400" />
                  <span>Maps</span>
                </a>

                {/* Weapons (Tablet & Mobile) */}
                <a
                  href={isLeaderboardPage ? "/valorant#weapons" : "#weapons"}
                  role="menuitem"
                  onClick={() => handleNavClick("weapons")}
                  className={`dropdown-item ${
                    !isLeaderboardPage && activeSection === "weapons" ? "is-active" : ""
                  }`}
                >
                  <Crosshair className="w-4 h-4 text-amber-400" />
                  <span>Weapons</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Server Status (Desktop/Tablet: Right column) */}
        <div className="valorant-subnav-status-desktop">
          <div
            className={`valorant-status-badge ${
              currentStatus.type === "success"
                ? "status-success"
                : currentStatus.type === "warning"
                ? "status-warning"
                : "status-danger"
            }`}
          >
            {currentStatus.type === "success" ? (
              <Activity className="w-3.5 h-3.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            <span className="status-label">
              {currentStatus.message || "All Systems Online"}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
