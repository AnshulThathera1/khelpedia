"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function GameCard({ game, tournamentCount }) {
    // Official Logo Mapping — using reliable CDN/official sources
    const officialLogos = {
        "valorant": "https://cdn.pandascore.co/images/game/icon_url/26/valorant.png",
        "cs2": "https://cdn.pandascore.co/images/game/icon_url/33602/counter_strike_2.png",
        "bgmi": "https://cdn.pandascore.co/images/game/icon_url/23344/bgmi.png",
        "dota-2": "https://cdn.pandascore.co/images/game/icon_url/4/dota2.png",
        "free-fire": "https://cdn.pandascore.co/images/game/icon_url/22889/free_fire.png",
        "pubg-mobile": "https://cdn.pandascore.co/images/game/icon_url/20853/pubg_mobile.png"
    };

    const logoUrl = officialLogos[game.slug] || game.icon_url;
    const [imgError, setImgError] = React.useState(false);

    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
        >
            <Link
                href={`/games/${game.slug}`}
                style={{ textDecoration: "none", color: "inherit" }}
            >
                <div className="card" style={{ 
                    cursor: "pointer", 
                    textAlign: "left", 
                    height: "100%", 
                    display: "flex", 
                    flexDirection: "column", 
                    padding: "2rem",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "0px", /* Sharp Riot style */
                    position: "relative"
                }}>
                    {/* Top Accent Line */}
                    <div style={{ position: "absolute", top: 0, left: 0, width: "30%", height: "2px", background: "var(--accent-red)" }} />

                    {/* Logo Container */}
                    <div
                        style={{
                            width: "100%",
                            height: 120,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "1.5rem",
                            background: "var(--bg-card)",
                            padding: "1rem",
                            border: "1px solid var(--border-color)"
                        }}
                    >
                        {logoUrl && !imgError ? (
                            <img
                                src={logoUrl}
                                alt={game.name}
                                onError={() => setImgError(true)}
                                style={{ 
                                    maxWidth: "100%", 
                                    maxHeight: "100%", 
                                    objectFit: "contain",
                                    filter: "drop-shadow(0 0 8px rgba(0,0,0,0.5))"
                                }}
                            />
                        ) : (
                            <span style={{ fontSize: "2.5rem" }}>🎮</span>
                        )}
                    </div>

                    <h3
                        style={{
                            fontSize: "1.4rem",
                            fontWeight: 800,
                            color: "var(--text-primary)",
                            marginBottom: 4,
                            fontFamily: '"Rajdhani", sans-serif',
                            textTransform: "uppercase",
                            letterSpacing: "0.05em"
                        }}
                    >
                        {game.name}
                    </h3>
                    <p
                        style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.8rem",
                            marginBottom: "1.5rem",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em"
                        }}
                    >
                        {game.genre}
                    </p>

                    <div style={{ marginTop: "auto" }}>
                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                background: "rgba(255, 70, 85, 0.1)",
                                color: "var(--accent-red)",
                                padding: "6px 16px",
                                fontSize: "0.7rem",
                                fontWeight: 800,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                border: "1px solid rgba(255, 70, 85, 0.2)"
                            }}
                        >
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-red)" }}></span>
                            Active Tournaments
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

