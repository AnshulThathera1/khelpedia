"use client";

import Link from "next/link";

const footerLinks = [
    {
        title: "Browse",
        links: [
            { href: "/games", label: "Games" },
            { href: "/tournaments", label: "Tournaments" },
            { href: "/players", label: "Pro Players" },
            { href: "/teams", label: "Teams" },
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
        title: "Legal",
        links: [
            { href: "/privacy", label: "Privacy Policy" },
            { href: "/terms", label: "Terms of Service" },
            { href: "/valorant", label: "Opt-in Policy" },
        ],
    },
];

export default function Footer() {
    return (
        <footer
            style={{
                background: "var(--bg-primary)",
                borderTop: "1px solid var(--border-color)",
                marginTop: "6rem",
                paddingBottom: "2rem"
            }}
        >
            <div
                style={{
                    maxWidth: 1280,
                    margin: "0 auto",
                    padding: "4rem 1.5rem 2rem",
                }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "3rem",
                        marginBottom: "4rem",
                    }}
                >
                    {/* Brand */}
                    <div style={{ gridColumn: "span 1" }}>
                        <Link href="/" style={{ textDecoration: "none", display: "inline-block" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{
                                    width: "28px",
                                    height: "28px",
                                    background: "var(--accent-red)",
                                    borderRadius: "2px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transform: "rotate(45deg)"
                                }}>
                                    <span style={{
                                        color: "#fff",
                                        fontFamily: '"Orbitron", sans-serif',
                                        fontWeight: 900,
                                        fontSize: "14px",
                                        transform: "rotate(-45deg)"
                                    }}>K</span>
                                </div>
                                <span
                                    style={{
                                        fontFamily: '"Rajdhani", sans-serif',
                                        fontSize: "1.5rem",
                                        fontWeight: 800,
                                        letterSpacing: "0.05em",
                                        color: "var(--text-primary)",
                                        textTransform: "uppercase"
                                    }}
                                >
                                    Khel<span style={{ color: "var(--accent-red)" }}>PediA</span>
                                </span>
                            </div>
                        </Link>
                        <p
                            style={{
                                color: "var(--text-secondary)",
                                fontSize: "0.85rem",
                                marginTop: "1.25rem",
                                lineHeight: 1.8,
                                maxWidth: "300px"
                            }}
                        >
                            Your ultimate epicenter for live esports tracking, player stats, and
                            global team rankings across all major titles.
                        </p>
                    </div>

                    {/* Link columns */}
                    {footerLinks.map((column) => (
                        <div key={column.title}>
                            <h4
                                style={{
                                    color: "var(--text-primary)",
                                    fontSize: "0.75rem",
                                    fontWeight: 800,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.15em",
                                    marginBottom: "1.5rem",
                                    fontFamily: '"Rajdhani", sans-serif'
                                }}
                            >
                                {column.title}
                            </h4>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                {column.links.map((link) => (
                                    <li key={link.href} style={{ marginBottom: "0.75rem" }}>
                                        <Link
                                            href={link.href}
                                            style={{
                                                color: "var(--text-muted)",
                                                textDecoration: "none",
                                                fontSize: "0.85rem",
                                                fontWeight: 500,
                                                transition: "color 0.2s",
                                            }}
                                            className="footer-link"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div
                    style={{
                        borderTop: "1px solid var(--border-color)",
                        paddingTop: "2rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "1rem",
                    }}
                >
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 500 }}>
                            © 2026 KHELPEDIA ESPORTS.
                        </p>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 500 }}>
                            Built with passion for competitive gaming.
                        </p>
                    </div>
                    
                    <div style={{ display: "flex", gap: "1.5rem" }}>
                        {/* Social Placeholders */}
                        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", textTransform: "uppercase" }}>Discord</span>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", textTransform: "uppercase" }}>Twitter</span>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .footer-link:hover {
                    color: var(--accent-red) !important;
                }
            `}</style>
        </footer>
    );
}
