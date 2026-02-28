"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function GameCard({ game, tournamentCount }) {
    return (
        <motion.div
            whileHover={{ y: -6, scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
            <Link
                href={`/games/${game.slug}`}
                style={{ textDecoration: "none", color: "inherit" }}
            >
                <div className="card" style={{ cursor: "pointer", textAlign: "center", height: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {/* Icon */}
                    <div
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: "var(--radius-lg)",
                            background: "linear-gradient(135deg, var(--bg-secondary), rgba(14, 165, 233, 0.1))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "2.2rem",
                            margin: "0 auto 1.25rem",
                            border: "1px solid var(--border-color)",
                            overflow: "hidden",
                            boxShadow: "0 8px 16px rgba(0,0,0,0.2)"
                        }}
                    >
                        {game.icon_url ? (
                            <img
                                src={game.icon_url}
                                alt={game.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                        ) : (
                            <span style={{ fontSize: "2rem" }}>🎮</span>
                        )}
                    </div>

                    <h3
                        style={{
                            fontSize: "1.2rem",
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            marginBottom: 4,
                            fontFamily: 'var(--font-display)'
                        }}
                    >
                        {game.name}
                    </h3>
                    <p
                        style={{
                            color: "var(--text-muted)",
                            fontSize: "0.85rem",
                            marginBottom: "1rem",
                            fontWeight: 500
                        }}
                    >
                        {game.genre}
                    </p>

                    <div style={{ marginTop: "auto" }}>
                        {tournamentCount !== undefined && (
                            <div
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    background: "rgba(14, 165, 233, 0.1)",
                                    color: "var(--accent-cyan)",
                                    padding: "4px 14px",
                                    borderRadius: "8px",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    letterSpacing: "0.02em",
                                    border: "1px solid rgba(14, 165, 233, 0.2)"
                                }}
                            >
                                🏆 {tournamentCount} TOURNEYS
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

