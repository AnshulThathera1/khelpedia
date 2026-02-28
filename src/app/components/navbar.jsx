"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/games", label: "Games" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/players", label: "Pro Players" },
  { href: "/teams", label: "Teams" },
  { href: "/blogs", label: "News" }
];

export default function AppNavbar({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState({ players: [], teams: [], blogs: [] });
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef(null);

  // Debounced Search Logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
          const data = await res.json();
          setResults(data.results);
          setShowResults(true);
        } catch (error) {
          console.error("Search error:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults({ players: [], teams: [], blogs: [] });
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (href) => {
    setSearchQuery("");
    setShowResults(false);
    router.push(href);
  };

  const renderResults = () => {
    const hasResults = results.players.length > 0 || results.teams.length > 0 || results.blogs.length > 0;

    if (!showResults) return null;

    return (
      <div
        style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          background: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(148, 163, 184, 0.1)",
          borderRadius: "12px",
          marginTop: "10px",
          maxHeight: "400px",
          overflowY: "auto",
          zIndex: 1000,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          padding: "1rem"
        }}
      >
        {!hasResults && !isLoading && (
          <div style={{ padding: "1rem", color: "var(--text-muted)", textAlign: "center" }}>
            No results found for "{searchQuery}"
          </div>
        )}

        {isLoading && (
          <div style={{ padding: "1rem", color: "var(--accent-cyan)", textAlign: "center" }}>
            Searching...
          </div>
        )}

        {/* Players Section */}
        {results.players.length > 0 && (
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>Players</div>
            {results.players.map(player => (
              <div
                key={player.id}
                onClick={() => handleResultClick(`/players/${player.slug || player.id}`)}
                style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem", borderRadius: "8px", cursor: "pointer", transition: "background 0.2s" }}
                className="search-result-item"
              >
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg-secondary)", overflow: "hidden" }}>
                  {player.image_url ? <img src={player.image_url} alt={player.ign} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ background: "var(--gradient-primary)", width: "100%", height: "100%" }} />}
                </div>
                <div>
                  <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem" }}>{player.ign}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{player.name}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Teams Section */}
        {results.teams.length > 0 && (
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-purple)", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>Teams</div>
            {results.teams.map(team => (
              <div
                key={team.id}
                onClick={() => handleResultClick(`/teams/${team.id}`)}
                style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem", borderRadius: "8px", cursor: "pointer", transition: "background 0.2s" }}
                className="search-result-item"
              >
                <div style={{ width: 32, height: 32, borderRadius: "4px", background: "var(--bg-secondary)", overflow: "hidden" }}>
                  {team.logo_url ? <img src={team.logo_url} alt={team.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <div style={{ background: "var(--bg-secondary)", width: "100%", height: "100%" }} />}
                </div>
                <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem" }}>{team.name}</div>
              </div>
            ))}
          </div>
        )}

        {/* Blogs Section */}
        {results.blogs.length > 0 && (
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#10b981", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>News</div>
            {results.blogs.map(blog => (
              <div
                key={blog.id}
                onClick={() => handleResultClick(`/blogs/${blog.slug}`)}
                style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem", borderRadius: "8px", cursor: "pointer", transition: "background 0.2s" }}
                className="search-result-item"
              >
                <div style={{ width: 32, height: 32, borderRadius: "4px", background: "var(--bg-secondary)", overflow: "hidden" }}>
                  {blog.cover_image_url ? <img src={blog.cover_image_url} alt={blog.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ background: "var(--bg-secondary)", width: "100%", height: "100%" }} />}
                </div>
                <div style={{ color: "var(--text-primary)", fontWeight: 500, fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{blog.title}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(10, 14, 23, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(148, 163, 184, 0.08)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 72,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "26px",
              height: "26px",
              background: "var(--gradient-primary)",
              borderRadius: "5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: "rotate(45deg)",
              boxShadow: "0 2px 10px rgba(14, 165, 233, 0.3)"
            }}>
              <span style={{
                color: "#fff",
                fontFamily: '"Orbitron", sans-serif',
                fontWeight: 800,
                fontSize: "14px",
                transform: "rotate(-45deg)"
              }}>K</span>
            </div>
            <span
              style={{
                fontFamily: '"Rajdhani", sans-serif',
                fontSize: "1.5rem",
                fontWeight: 700,
                letterSpacing: "-0.01em",
                color: "var(--text-primary)"
              }}
            >
              Khel<span style={{ color: "var(--accent-cyan)" }}>PediA</span>
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            flex: 1,
            justifyContent: "flex-end"
          }}
          className="desktop-nav"
        >
          {navLinks.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: isActive ? "#06d6a0" : "#94a3b8",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  fontWeight: isActive ? 600 : 500,
                  transition: "color 0.2s",
                  position: "relative",
                  whiteSpace: "nowrap"
                }}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Search Bar Desktop */}
          <div style={{ position: "relative", width: "220px", marginLeft: "0.5rem" }} ref={searchRef}>
            <div style={{ position: "relative" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                style={{
                  width: "100%",
                  padding: "0.5rem 1rem 0.5rem 2.2rem",
                  borderRadius: "20px",
                  background: "rgba(148, 163, 184, 0.05)",
                  border: "1px solid rgba(148, 163, 184, 0.1)",
                  color: "white",
                  fontSize: "0.85rem",
                  outline: "none",
                  transition: "all 0.2s"
                }}
                className="search-input"
              />
            </div>
            {renderResults()}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {user ? (
              <Link href="/dashboard" style={{ textDecoration: "none" }}>
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "var(--bg-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid var(--border-color)",
                  overflow: "hidden",
                  cursor: "pointer",
                }}>
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)" }}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  )}
                </div>
              </Link>
            ) : (
              <Link href="/login" style={{ textDecoration: "none" }}>
                <button className="btn btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>
                  <span>Log In</span>
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          className="mobile-toggle"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "#f1f5f9",
            fontSize: "1.5rem",
            cursor: "pointer",
            padding: 8,
          }}
          aria-label="Toggle menu"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className="mobile-menu"
          style={{
            background: "var(--bg-secondary)",
            borderTop: "1px solid var(--border-color)",
            padding: "1rem 1.5rem",
          }}
        >
          {/* Mobile Search */}
          <div style={{ marginBottom: "1.5rem", position: "relative" }}>
            <div style={{ position: "relative" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              <input
                type="text"
                placeholder="Search players, teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem 0.75rem 2.5rem",
                  borderRadius: "12px",
                  background: "rgba(148, 163, 184, 0.05)",
                  border: "1px solid rgba(148, 163, 184, 0.1)",
                  color: "white",
                  fontSize: "0.95rem",
                  outline: "none"
                }}
              />
            </div>
            {renderResults()}
          </div>
          {navLinks.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                style={{
                  display: "block",
                  color: isActive ? "#06d6a0" : "#94a3b8",
                  textDecoration: "none",
                  fontSize: "1rem",
                  fontWeight: isActive ? 600 : 500,
                  padding: "10px 0",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                {link.label}
              </Link>
            );
          })}
          {user ? (
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              style={{
                display: "block",
                color: "#94a3b8",
                textDecoration: "none",
                fontSize: "1rem",
                fontWeight: 600,
                padding: "10px 0",
                marginTop: "10px"
              }}
            >
              Commander Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              style={{
                display: "block",
                color: "var(--accent-cyan)",
                textDecoration: "none",
                fontSize: "1rem",
                fontWeight: 600,
                padding: "10px 0",
                marginTop: "10px"
              }}
            >
              Log In
            </Link>
          )}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
        .search-result-item:hover {
          background: rgba(148, 163, 184, 0.1) !important;
        }
        .search-input:focus {
          border-color: var(--accent-cyan) !important;
          background: rgba(148, 163, 184, 0.08) !important;
          width: 260px !important;
        }
      `}</style>
    </nav>
  );
}
