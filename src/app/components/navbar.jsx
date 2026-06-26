"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { searchAll } from "@/lib/queries";
import LoginModal from "./LoginModal";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "./ThemeProvider";

export default function AppNavbar({ user }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState({ players: [], teams: [], news: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef(null);
  const supabase = createClient();
  const { theme } = useTheme();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  // Search logic (debounced)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults({ players: [], teams: [], news: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchAll(searchQuery);
      setResults(res);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (href) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setIsMobileMenuOpen(false);
    router.push(href);
  };

  return (
    <>
      <nav
        className={`navbar ${isScrolled ? "scrolled" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transition: "all 0.3s ease",
          padding: isScrolled ? "0.75rem 0" : "1.25rem 0",
          background: isScrolled ? (theme === 'dark' ? "rgba(10, 15, 20, 0.98)" : "rgba(245, 245, 247, 0.95)") : "transparent",
          backdropFilter: isScrolled ? "blur(20px)" : "none",
          borderBottom: isScrolled ? "1px solid var(--border-color)" : "1px solid transparent"
        }}
      >
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Brand */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", zIndex: 1100 }}>
            <div style={{
              width: "32px",
              height: "32px",
              background: "var(--accent-red)",
              borderRadius: "2px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: "rotate(45deg)",
              boxShadow: "0 0 15px rgba(255, 70, 85, 0.3)"
            }}>
              <span style={{
                color: "#fff",
                fontFamily: '"Orbitron", sans-serif',
                fontWeight: 900,
                fontSize: "16px",
                transform: "rotate(-45deg)"
              }}>K</span>
            </div>
            <span
              style={{
                fontFamily: '"Rajdhani", sans-serif',
                fontSize: "1.6rem",
                fontWeight: 800,
                letterSpacing: "0.02em",
                color: "var(--text-primary)",
                textTransform: "uppercase"
              }}
            >
              Khel<span style={{ color: "var(--accent-red)" }}>PediA</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="desktop-only" style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
            <div className="nav-links" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
              <Link href="/tournaments" className={`nav-link ${pathname === '/tournaments' ? 'active' : ''}`}>Tournaments</Link>
              <Link href="/games" className={`nav-link ${pathname === '/games' ? 'active' : ''}`}>Games</Link>
              <Link href="/players" className={`nav-link ${pathname === '/players' ? 'active' : ''}`}>Players</Link>
              <Link href="/blogs" className={`nav-link ${pathname === '/blogs' ? 'active' : ''}`}>News</Link>
            </div>

            {/* Search Bar */}
            <div ref={searchRef} style={{ position: "relative" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: isScrolled
                    ? (theme === 'dark' ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)")
                    : (theme === 'dark' ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.05)"),
                  border: "1px solid var(--border-color)",
                  borderRadius: "0px",
                  padding: "0.4rem 0.8rem",
                  width: "240px",
                  transition: "all 0.2s"
                }}
              >
                <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginRight: "8px" }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search Agent/Team..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-primary)",
                    fontSize: "0.85rem",
                    width: "100%",
                    outline: "none",
                    fontFamily: '"Outfit", sans-serif'
                  }}
                />
              </div>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {isSearchOpen && (searchQuery.trim() || isSearching) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      width: "360px",
                      background: theme === 'dark' ? "rgba(15, 25, 35, 0.98)" : "rgba(255, 255, 255, 0.98)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid var(--border-color)",
                      marginTop: "0.75rem",
                      padding: "1.25rem",
                      maxHeight: "480px",
                      overflowY: "auto",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
                    }}
                  >
                    {isSearching ? (
                      <div style={{ textAlign: "center", padding: "1rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                        Searching Database...
                      </div>
                    ) : (
                      <>
                        {/* Players Section */}
                        {results.players.length > 0 && (
                          <div style={{ marginBottom: "1.5rem" }}>
                            <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--accent-red)", textTransform: "uppercase", marginBottom: "1rem", letterSpacing: "0.15em" }}>Players</div>
                            {results.players.map(player => (
                              <div
                                key={player.id}
                                onClick={() => handleResultClick(`/players/${player.slug || player.id}`)}
                                style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem", cursor: "pointer", transition: "all 0.2s" }}
                                className="search-result-item"
                              >
                                <div style={{ width: 40, height: 40, background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-color)", flexShrink: 0, position: "relative" }}>
                                  <div style={{ background: "var(--accent-red)", width: "100%", height: "100%", opacity: 0.1, position: "absolute", top: 0, left: 0 }} />
                                  {player.image_url && <img src={player.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", position: "relative", zIndex: 1 }} onError={(e) => e.target.style.display = 'none'} />}
                                </div>
                                <div>
                                  <div style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "1rem", textTransform: "uppercase", fontFamily: '"Rajdhani", sans-serif' }}>{player.ign}</div>
                                  <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 500 }}>{player.name}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Teams Section */}
                        {results.teams.length > 0 && (
                          <div style={{ marginBottom: "0.5rem" }}>
                            <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "1rem", letterSpacing: "0.15em" }}>Teams</div>
                            {results.teams.map(team => (
                              <div
                                key={team.id}
                                onClick={() => handleResultClick(`/teams/${team.id}`)}
                                style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem", cursor: "pointer", transition: "all 0.2s" }}
                                className="search-result-item"
                              >
                                <div style={{ width: 40, height: 40, background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-color)", flexShrink: 0, padding: "6px", position: "relative" }}>
                                  <div style={{ background: "rgba(255,255,255,0.05)", width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }} />
                                  {team.logo_url && <img src={team.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", position: "relative", zIndex: 1 }} onError={(e) => e.target.style.display = 'none'} />}
                                </div>
                                <div style={{ color: "var(--text-primary)", fontWeight: 800, fontSize: "1rem", textTransform: "uppercase", fontFamily: '"Rajdhani", sans-serif' }}>{team.name}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {results.players.length === 0 && results.teams.length === 0 && (
                          <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                            No matches found for "{searchQuery}"
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle size={38} />

            {/* Auth Button */}
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <Link
                  href="/dashboard"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "var(--text-primary)",
                    padding: "0.6rem 1.2rem",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textDecoration: "none",
                    border: "1px solid var(--border-color)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    textTransform: "uppercase"
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                style={{
                  background: "var(--accent-red)",
                  color: "#fff",
                  padding: "0.75rem 1.75rem",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  borderRadius: "0px",
                  boxShadow: "0 4px 15px rgba(255, 70, 85, 0.2)",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "#e63e4c";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "var(--accent-red)";
                  e.target.style.transform = "translateY(0)";
                }}
              > Sign In
              </button>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="mobile-toggle" style={{ display: "none", alignItems: "center", gap: "1rem", zIndex: 1100 }}>
            <ThemeToggle size={32} />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-primary)",
                fontSize: "1.5rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center"
              }}
            >
              {isMobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                width: "100%",
                height: "100vh",
                background: theme === 'dark' ? "var(--bg-primary)" : "var(--bg-secondary)",
                zIndex: 1050,
                padding: "8rem 2rem 2rem",
                display: "flex",
                flexDirection: "column",
                gap: "2rem"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <Link href="/tournaments" className="nav-link" style={{ fontSize: "1.5rem" }}>Tournaments</Link>
                <Link href="/games" className="nav-link" style={{ fontSize: "1.5rem" }}>Games</Link>
                <Link href="/players" className="nav-link" style={{ fontSize: "1.5rem" }}>Players</Link>
                <Link href="/blogs" className="nav-link" style={{ fontSize: "1.5rem" }}>News</Link>
              </div>


              <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "2rem" }}>
                {user ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <Link href="/dashboard" className="nav-link" style={{ fontSize: "1.2rem" }}>Dashboard</Link>
                    <button onClick={handleLogout} className="nav-link" style={{ background: "none", border: "none", textAlign: "left", fontSize: "1.2rem", cursor: "pointer", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>Logout</button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsLoginModalOpen(true);
                    }}
                    className="btn-primary"
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <style jsx global>{`
        @media (max-width: 1024px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-toggle {
            display: flex !important;
          }
        }

        .nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: all 0.2s;
          position: relative;
          font-family: "Rajdhani", sans-serif;
        }
        .nav-link:hover, .nav-link.active {
          color: var(--text-primary);
        }
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--accent-red);
        }
        .search-result-item:hover {
          background: rgba(255, 70, 85, 0.05);
          border-left: 2px solid var(--accent-red) !important;
        }
      `}</style>
    </>
  );
}
