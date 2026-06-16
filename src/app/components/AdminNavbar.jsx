import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const adminLinks = [
    { href: "/admin", label: "CMS Home" },
    { href: "/admin/marketing", label: "Marketing" },
    { href: "/admin/tournaments", label: "Tournaments" },
    { href: "/admin/players", label: "Players" },
    { href: "/admin/users", label: "Users" },
];

export default function AdminNavbar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

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
                    <Link href="/admin" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", zIndex: 1100 }}>
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
                        <span className="admin-title" style={{
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

                    {/* Admin Links - Desktop */}
                    <div className="admin-links-desktop" style={{ display: "flex", gap: "1.5rem", marginLeft: "2rem" }}>
                        <style dangerouslySetInnerHTML={{__html: `
                            .admin-nav-link { transition: color 0.2s; }
                            .admin-nav-link:hover { color: var(--accent-red) !important; }
                        `}} />
                        {adminLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="admin-nav-link"
                                style={{
                                    textDecoration: "none",
                                    color: pathname === link.href ? "var(--accent-red)" : "var(--text-secondary)",
                                    fontSize: "0.8rem",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                    fontFamily: '"Rajdhani", sans-serif',
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Desktop Exit */}
                <Link
                    href="/"
                    className="exit-admin-desktop"
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
                >
                    Return to Site
                </Link>

                {/* Mobile Toggle */}
                <button 
                    className="admin-mobile-toggle"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-primary)",
                        fontSize: "1.5rem",
                        cursor: "pointer",
                        display: "none",
                        zIndex: 1100
                    }}
                >
                    {isMobileMenuOpen ? "✕" : "☰"}
                </button>
            </div>

            {/* Mobile Admin Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100vh",
                            background: "rgba(10, 5, 5, 0.98)",
                            zIndex: 1050,
                            padding: "8rem 2rem 2rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "2rem"
                        }}
                    >
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            {adminLinks.map((link) => (
                                <Link 
                                    key={link.href} 
                                    href={link.href} 
                                    style={{ 
                                        color: pathname === link.href ? "var(--accent-red)" : "var(--text-primary)", 
                                        textDecoration: "none", 
                                        fontSize: "1.5rem", 
                                        fontWeight: 800,
                                        fontFamily: '"Rajdhani", sans-serif',
                                        textTransform: "uppercase"
                                    }}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                        <Link href="/" style={{ marginTop: "2rem", color: "var(--text-muted)", textDecoration: "none", fontSize: "1rem", fontWeight: 700 }}>
                            ← EXIT COMMAND CENTER
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @media (max-width: 1024px) {
                    .admin-links-desktop, .exit-admin-desktop {
                        display: none !important;
                    }
                    .admin-mobile-toggle {
                        display: block !important;
                    }
                    .admin-title {
                        display: none;
                    }
                }
            `}</style>
        </nav>
    );
}
