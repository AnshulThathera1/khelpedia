"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
    { href: "/admin", label: "CMS Home" },
    { href: "/admin/marketing", label: "Marketing" },
    { href: "/admin/tournaments", label: "Tournaments" },
    { href: "/admin/players", label: "Players" },
    { href: "/admin/users", label: "Users" },
];

export default function AdminNavbar() {
    const pathname = usePathname();

    return (
        <nav
            style={{
                background: "rgba(10, 5, 5, 1)",
                borderBottom: "1px solid rgba(255, 70, 85, 0.4)",
                padding: "1.25rem 0",
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                margin: 0,
                zIndex: 9999,
                backdropFilter: "blur(20px)"
            }}
        >
            <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                    {/* Admin Branding */}
                    <Link href="/admin" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                            padding: "4px 10px",
                            background: "var(--accent-red)",
                            color: "#fff",
                            fontSize: "0.7rem",
                            fontWeight: 900,
                            fontFamily: '"Orbitron", sans-serif',
                            letterSpacing: "0.1em",
                            borderRadius: "2px"
                        }}>
                            ADMIN
                        </div>
                        <span style={{
                            fontFamily: '"Rajdhani", sans-serif',
                            fontSize: "1.2rem",
                            fontWeight: 800,
                            color: "var(--text-primary)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em"
                        }}>
                            Command Center
                        </span>
                    </Link>

                    {/* Admin Links */}
                    <div style={{ display: "flex", gap: "1.5rem", marginLeft: "2rem" }}>
                        {adminLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                style={{
                                    textDecoration: "none",
                                    color: pathname === link.href ? "var(--accent-red)" : "var(--text-secondary)",
                                    fontSize: "0.8rem",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                    fontFamily: '"Rajdhani", sans-serif',
                                    transition: "color 0.2s"
                                }}
                                onMouseEnter={(e) => e.target.style.color = "var(--accent-red)"}
                                onMouseLeave={(e) => e.target.style.color = pathname === link.href ? "var(--accent-red)" : "var(--text-secondary)"}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Exit Admin Mode */}
                <Link
                    href="/"
                    style={{
                        background: "rgba(255,255,255,0.05)",
                        color: "var(--text-primary)",
                        padding: "0.5rem 1rem",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        textDecoration: "none",
                        border: "1px solid var(--border-color)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => e.target.style.borderColor = "var(--accent-red)"}
                    onMouseLeave={(e) => e.target.style.borderColor = "var(--border-color)"}
                >
                    Return to Site
                </Link>
            </div>
        </nav>
    );
}
