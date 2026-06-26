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
            { href: "/blogs", label: "News & Articles" },
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
            { href: "/contact", label: "Contact" },
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

const socialLinks = [
    {
        name: "Discord",
        href: "#",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
            </svg>
        ),
    },
    {
        name: "Twitter",
        href: "#",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
        ),
    },
    {
        name: "YouTube",
        href: "#",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
        ),
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
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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

                        {/* Contact Email */}
                        <div style={{ marginTop: "1.25rem" }}>
                            <a
                                href="mailto:contact@khelpedia.org"
                                style={{
                                    color: "var(--accent-cyan)",
                                    textDecoration: "none",
                                    fontSize: "0.85rem",
                                    fontWeight: 500,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                }}
                                className="footer-link"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="20" height="16" x="2" y="4" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                                contact@khelpedia.org
                            </a>
                        </div>
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
                            © 2026 KHELPEDIA ESPORTS. All rights reserved.
                        </p>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 500 }}>
                            Built with passion for competitive gaming.
                        </p>
                    </div>
                    
                    {/* Social Icons */}
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        {socialLinks.map((social) => (
                            <a
                                key={social.name}
                                href={social.href}
                                target={social.href !== "#" ? "_blank" : undefined}
                                rel={social.href !== "#" ? "noopener noreferrer" : undefined}
                                aria-label={social.name}
                                title={social.name}
                                style={{
                                    color: "var(--text-muted)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "36px",
                                    height: "36px",
                                    border: "1px solid var(--border-color)",
                                    transition: "all 0.2s",
                                }}
                                className="footer-social"
                            >
                                {social.icon}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
            <style jsx>{`
                .footer-link:hover {
                    color: var(--accent-red) !important;
                }
                .footer-social:hover {
                    color: var(--accent-red) !important;
                    border-color: var(--accent-red) !important;
                    transform: translateY(-2px);
                }
            `}</style>
        </footer>
    );
}
