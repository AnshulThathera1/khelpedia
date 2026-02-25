import Link from "next/link";

const footerLinks = [
    {
        title: "Browse",
        links: [
            { href: "/games", label: "Games" },
            { href: "/tournaments", label: "Tournaments" },
            { href: "/players", label: "Players" },
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
];

export default function Footer() {
    return (
        <footer
            style={{
                background: "var(--bg-secondary)",
                borderTop: "1px solid var(--border-color)",
                marginTop: "4rem",
            }}
        >
            <div
                style={{
                    maxWidth: 1280,
                    margin: "0 auto",
                    padding: "3rem 1.5rem 2rem",
                }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "2rem",
                        marginBottom: "2rem",
                    }}
                >
                    {/* Brand */}
                    <div>
                        <Link href="/" style={{ textDecoration: "none", display: "inline-block" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{
                                    width: "24px",
                                    height: "24px",
                                    background: "var(--gradient-primary)",
                                    borderRadius: "5px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transform: "rotate(45deg)"
                                }}>
                                    <span style={{
                                        color: "#fff",
                                        fontFamily: '"Orbitron", sans-serif',
                                        fontWeight: 800,
                                        fontSize: "13px",
                                        transform: "rotate(-45deg)"
                                    }}>K</span>
                                </div>
                                <span
                                    style={{
                                        fontFamily: '"Rajdhani", sans-serif',
                                        fontSize: "1.4rem",
                                        fontWeight: 700,
                                        letterSpacing: "-0.01em",
                                        color: "var(--text-primary)"
                                    }}
                                >
                                    Khel<span style={{ color: "var(--accent-cyan)" }}>PediA</span>
                                </span>
                            </div>
                        </Link>
                        <p
                            style={{
                                color: "var(--text-muted)",
                                fontSize: "0.85rem",
                                marginTop: "0.75rem",
                                lineHeight: 1.6,
                            }}
                        >
                            Your ultimate esports hub for live tournaments, player stats, and
                            team rankings across all major competitive titles worldwide.
                        </p>
                    </div>

                    {/* Link columns */}
                    {footerLinks.map((column) => (
                        <div key={column.title}>
                            <h4
                                style={{
                                    color: "var(--text-primary)",
                                    fontSize: "0.85rem",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    marginBottom: "1rem",
                                }}
                            >
                                {column.title}
                            </h4>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                {column.links.map((link) => (
                                    <li key={link.href} style={{ marginBottom: "0.5rem" }}>
                                        <Link
                                            href={link.href}
                                            style={{
                                                color: "var(--text-muted)",
                                                textDecoration: "none",
                                                fontSize: "0.9rem",
                                                transition: "color 0.2s",
                                            }}
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
                        paddingTop: "1.5rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "1rem",
                    }}
                >
                    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                        © 2026 KhelPediA. All rights reserved.
                    </p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                        Built with ❤️ for the esports community
                    </p>
                </div>
            </div>
        </footer>
    );
}
