"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function TournamentCard({ tournament }) {
    const statusColors = {
        live: { bg: "rgba(255, 70, 85, 0.1)", color: "#ff4655", border: "rgba(255, 70, 85, 0.3)" },
        upcoming: { bg: "rgba(236, 232, 225, 0.05)", color: "#ece8e1", border: "rgba(236, 232, 225, 0.2)" },
        completed: { bg: "rgba(0, 0, 0, 0.2)", color: "#7e7e7e", border: "rgba(236, 232, 225, 0.05)" },
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
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
        >
            <Link
                href={`/tournaments/${tournament.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
            >
                <div className="card" style={{ 
                    cursor: "pointer", 
                    height: "100%", 
                    borderRadius: "0px", 
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    padding: "1.5rem"
                }}>
                    {/* Header row */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "1.25rem",
                        }}
                    >
                        <div style={{ flex: 1, paddingRight: "10px", display: "flex", gap: "1rem", alignItems: "center" }}>
                            {tournament.logo_url && (
                                <div style={{ width: 48, height: 48, borderRadius: "0px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(236, 232, 225, 0.05)", overflow: "hidden", flexShrink: 0, padding: "4px" }}>
                                    <img src={tournament.logo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                </div>
                            )}
                            <div>
                                <div style={{ color: "var(--accent-red)", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                                    {tournament.games?.name || "Global Event"}
                                </div>
                                <h3
                                    style={{
                                        fontSize: "1.1rem",
                                        fontWeight: 800,
                                        color: "var(--text-primary)",
                                        lineHeight: 1.2,
                                        fontFamily: '"Rajdhani", sans-serif',
                                        textTransform: "uppercase",
                                        letterSpacing: "0.02em"
                                    }}
                                >
                                    {tournament.name}
                                </h3>
                            </div>
                        </div>
                        <span
                            style={{
                                background: statusStyle.bg,
                                color: statusStyle.color,
                                border: `1px solid ${statusStyle.border}`,
                                flexShrink: 0,
                                fontSize: "0.6rem",
                                fontWeight: 900,
                                padding: "2px 10px",
                                textTransform: "uppercase",
                                letterSpacing: "0.1em"
                            }}
                        >
                            {tournament.status === "live" && (
                                <span
                                    style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: "50%",
                                        background: "#ff4655",
                                        display: "inline-block",
                                        animation: "pulse-dot 1.5s infinite",
                                        marginRight: 6,
                                    }}
                                />
                            )}
                            {tournament.status}
                        </span>
                    </div>

                    {/* Meta Data */}
                    <div style={{ display: "flex", gap: "2rem", marginBottom: "1.5rem" }}>
                        <div>
                            <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px", fontWeight: 700 }}>Prize Pool</div>
                            <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", fontFamily: '"Rajdhani", sans-serif' }}>{formatPrize(tournament.prize_pool)}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: "0.6rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px", fontWeight: 700 }}>Region</div>
                            <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: '"Rajdhani", sans-serif' }}>{tournament.region || "Global"}</div>
                        </div>
                    </div>

                    {/* Footer Row */}
                    <div style={{
                        marginTop: "auto",
                        paddingTop: "1rem",
                        borderTop: "1px solid rgba(236, 232, 225, 0.05)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {formatDate(tournament.start_date)}
                        </div>
                        <div style={{
                            fontSize: "0.7rem",
                            fontWeight: 900,
                            color: "var(--text-primary)",
                            background: "rgba(236, 232, 225, 0.05)",
                            padding: "4px 10px",
                            border: "1px solid rgba(236, 232, 225, 0.1)",
                            letterSpacing: "0.1em"
                        }}>
                            {tournament.tier || "S"} TIER
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

