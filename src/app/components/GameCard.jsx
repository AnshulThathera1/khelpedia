"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function GameCard({ game, tournamentCount }) {
    // Official Logo Mapping for Premium Look
    const officialLogos = {
        "valorant": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Valorant_logo.svg/1280px-Valorant_logo.svg.png",
        "cs2": "https://upload.wikimedia.org/wikipedia/commons/9/9c/Counter_Strike_2_Logo.png",
        "bgmi": "https://upload.wikimedia.org/wikipedia/commons/9/99/Battlegrounds_Mobile_India%2C_BGMI_LOGO_white_-_1082x360.png",
        "dota-2": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Dota_logo.svg/1280px-Dota_logo.svg.png",
        "free-fire": "https://upload.wikimedia.org/wikipedia/en/c/c5/Logo_of_Garena_Free_Fire.png",
        "pubg-mobile": "https://upload.wikimedia.org/wikipedia/commons/4/43/PUBG_Mobile_simple_logo_black.png"
    };

    const logoUrl = officialLogos[game.slug] || game.icon_url;

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
                            background: "rgba(0,0,0,0.2)",
                            padding: "1rem",
                            border: "1px solid rgba(236, 232, 225, 0.05)"
                        }}
                    >
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt={game.name}
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

