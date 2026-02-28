"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function TournamentCard({ tournament }) {
    const statusColors = {
        live: { bg: "rgba(244, 63, 94, 0.1)", color: "#f43f5e", border: "rgba(244, 63, 94, 0.2)" },
        upcoming: { bg: "rgba(14, 165, 233, 0.1)", color: "#0ea5e9", border: "rgba(14, 165, 233, 0.2)" },
        completed: { bg: "rgba(255, 255, 255, 0.05)", color: "#94a3b8", border: "rgba(255, 255, 255, 0.1)" },
    };

    const statusStyle = statusColors[tournament.status] || statusColors.upcoming;

    const formatPrize = (amount) => {
        if (!amount) return "TBA";
        return amount >= 1000000
            ? `$${(amount / 1000000).toFixed(1)}M`
            : `$${(amount / 1000).toFixed(0)}K`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "TBD";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <Link
                href={`/tournaments/${tournament.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
            >
                <div className="card" style={{ cursor: "pointer", height: "100%" }}>
                    {/* Header row */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "1.25rem",
                        }}
                    >
                        <div style={{ flex: 1, paddingRight: "10px" }}>
                            <div style={{ color: "var(--accent-cyan)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                                {tournament.games?.icon_url && (
                                    <img src={tournament.games.icon_url} alt="" style={{ width: 14, height: 14, objectFit: "contain" }} />
                                )}
                                {tournament.games?.name || "Global Event"}
                            </div>
                            <h3
                                style={{
                                    fontSize: "1.1rem",
                                    fontWeight: 700,
                                    color: "var(--text-primary)",
                                    lineHeight: 1.3,
                                }}
                            >
                                {tournament.name}
                            </h3>
                        </div>
                        <span
                            className="badge"
                            style={{
                                background: statusStyle.bg,
                                color: statusStyle.color,
                                border: `1px solid ${statusStyle.border}`,
                                flexShrink: 0,
                                fontSize: "0.65rem",
                                padding: "2px 8px"
                            }}
                        >
                            {tournament.status === "live" && (
                                <span
                                    style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: "50%",
                                        background: "#f43f5e",
                                        display: "inline-block",
                                        animation: "pulse-dot 1.5s infinite",
                                        marginRight: 4,
                                    }}
                                />
                            )}
                            {tournament.status}
                        </span>
                    </div>

                    {/* Meta Data */}
                    <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1rem" }}>
                        <div>
                            <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Prize</div>
                            <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>{formatPrize(tournament.prize_pool)}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Region</div>
                            <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>{tournament.region || "Global"}</div>
                        </div>
                    </div>

                    {/* Footer Row */}
                    <div style={{
                        marginTop: "auto",
                        paddingTop: "1rem",
                        borderTop: "1px solid rgba(255,255,255,0.05)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                            {formatDate(tournament.start_date)}
                        </div>
                        <div style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: "var(--accent-purple)",
                            background: "rgba(99, 102, 241, 0.1)",
                            padding: "2px 8px",
                            borderRadius: "4px"
                        }}>
                            {tournament.tier || "S"} TIER
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

