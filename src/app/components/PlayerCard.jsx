"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function PlayerCard({ player, rank }) {
    const formatEarnings = (amount) => {
        if (!amount) return "$0";
        return amount >= 1000000
            ? `$${(amount / 1000000).toFixed(1)}M`
            : amount >= 1000
                ? `$${(amount / 1000).toFixed(0)}K`
                : `$${amount}`;
    };

    return (
        <motion.div
            whileHover={{ x: 6 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <Link
                href={`/players/${player.slug || player.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
            >
                <div className="card" style={{ cursor: "pointer", padding: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                        {/* Rank */}
                        {rank && (
                            <div
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    background:
                                        rank <= 3
                                            ? rank === 1
                                                ? "linear-gradient(135deg, #f59e0b, #d97706)"
                                                : rank === 2
                                                    ? "linear-gradient(135deg, #94a3b8, #64748b)"
                                                    : "linear-gradient(135deg, #b45309, #92400e)"
                                            : "rgba(255,255,255,0.05)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.85rem",
                                    fontWeight: 800,
                                    color: rank <= 3 ? "#fff" : "var(--text-muted)",
                                    flexShrink: 0,
                                    border: rank <= 3 ? "none" : "1px solid var(--border-color)"
                                }}
                            >
                                {rank}
                            </div>
                        )}

                        {/* Avatar */}
                        <div
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: "50%",
                                background: "var(--gradient-primary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1rem",
                                fontWeight: 800,
                                color: "#fff",
                                flexShrink: 0,
                                overflow: "hidden",
                                border: "2px solid rgba(255,255,255,0.1)"
                            }}
                        >
                            {player.image_url ? (
                                <img src={player.image_url} alt={player.ign} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                player.ign?.charAt(0)?.toUpperCase() || "?"
                            )}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h3
                                style={{
                                    fontSize: "1rem",
                                    fontWeight: 700,
                                    color: "var(--text-primary)",
                                    marginBottom: 0,
                                    fontFamily: 'var(--font-display)'
                                }}
                            >
                                {player.ign}
                            </h3>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" }}>
                                <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {player.name}
                                </span>
                                {player.teams && (
                                    <>
                                        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>·</span>
                                        <div style={{ color: "var(--accent-cyan)", fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                                            {player.teams.logo_url && (
                                                <img src={player.teams.logo_url} alt={player.teams.name} style={{ width: 14, height: 14, objectFit: "contain" }} />
                                            )}
                                            {player.teams.name}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Earnings */}
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                            <p
                                style={{
                                    color: "var(--text-primary)",
                                    fontWeight: 700,
                                    fontSize: "0.95rem",
                                }}
                            >
                                {formatEarnings(player.earnings)}
                            </p>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                {player.country || "Global"}
                            </p>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

