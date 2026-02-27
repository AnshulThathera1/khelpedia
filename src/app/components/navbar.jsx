"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/games", label: "Games" },
  { href: "/tournaments", label: "Tournaments" },
  { href: "/players", label: "Pro Players" },
  { href: "/teams", label: "Teams" },
];

export default function AppNavbar({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

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
            gap: "2rem",
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
                  paddingBottom: 4,
                  borderBottom: isActive ? "2px solid #06d6a0" : "2px solid transparent",
                }}
              >
                {link.label}
              </Link>
            );
          })}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginLeft: "1rem" }}>
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
      `}</style>
    </nav>
  );
}
