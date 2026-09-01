"use client";

import Link from "next/link";
import Head from "next/head";

export default function HTMLSitemap() {
  const sections = [
    {
      title: "Main Content",
      links: [
        { href: "/", label: "Home" },
        { href: "/blogs", label: "News & Articles" },
        { href: "/tournaments", label: "Tournaments" },
        { href: "/teams", label: "Teams" },
        { href: "/players", label: "Players" },
        { href: "/games", label: "Games" },
      ],
    },
    {
      title: "Games",
      links: [
        { href: "/games/valorant", label: "Valorant" },
        { href: "/games/cs2", label: "CS2" },
        { href: "/games/bgmi", label: "BGMI" },
        { href: "/games/dota-2", label: "Dota 2" },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "/about", label: "About Us" },
        { href: "/contact", label: "Contact Us" },
        { href: "/editorial-policy", label: "Editorial Policy" },
        { href: "/corrections-policy", label: "Corrections Policy" },
        { href: "/disclaimer", label: "Disclaimer" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Service" },
        { href: "/cookies", label: "Cookie Policy" },
      ],
    },
  ];

  return (
    <>
      <Head>
        <title>Sitemap | KhelPediA</title>
        <meta
          name="description"
          content="Sitemap of KhelPediA. Find links to all our major sections, games, legal pages, and esports coverage."
        />
      </Head>
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem 1.5rem" }}>
        <h1
          style={{
            fontFamily: '"Orbitron", sans-serif',
            fontSize: "2.5rem",
            color: "var(--text-primary)",
            marginBottom: "1rem",
            borderBottom: "2px solid var(--border-color)",
            paddingBottom: "1rem"
          }}
        >
          HTML Sitemap
        </h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "3rem", fontSize: "1.1rem" }}>
          Navigate through KhelPediA using the structured links below to easily find the esports coverage, tournaments, and stats you are looking for.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
          {sections.map((section) => (
            <div key={section.title} style={{ background: "var(--bg-secondary)", padding: "2rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <h2
                style={{
                  fontFamily: '"Rajdhani", sans-serif',
                  fontSize: "1.5rem",
                  color: "var(--accent-red)",
                  marginBottom: "1.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px"
                }}
              >
                {section.title}
              </h2>
              <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
                {section.links.map((link) => (
                  <li key={link.href} style={{ marginBottom: "1rem" }}>
                    <Link
                      href={link.href}
                      style={{
                        color: "var(--text-primary)",
                        textDecoration: "none",
                        fontSize: "1.1rem",
                        transition: "color 0.2s"
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.color = "var(--accent-cyan)")}
                      onMouseOut={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
