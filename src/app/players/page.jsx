"use client";
import { useEffect, useState } from "react";
import { getPlayers } from "@/lib/queries";
import PlayerCard from "../components/PlayerCard";
import Skeleton from "../components/Skeleton";
import { motion } from "framer-motion";

export default function PlayersPage() {
    const [players, setPlayers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getPlayers().then(res => {
            setPlayers(res || []);
            setIsLoading(false);
        });
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="page-container"
        >
            <motion.div variants={itemVariants}>
                <div className="page-header" style={{ textAlign: "center", marginBottom: "4rem" }}>
                    <h1 className="page-title" style={{ fontSize: "3.5rem", fontWeight: 900, fontFamily: '"Rajdhani", sans-serif', textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>Pro Player Rankings</h1>
                    <p className="page-description" style={{ fontSize: "1.1rem", color: "var(--text-secondary)", maxWidth: "800px", margin: "0 auto" }}>
                        The best professional athletes in the business. Ranked by career earnings.
                    </p>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card" style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {isLoading ? (
                        [1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} style={{ height: 60, borderRadius: "10px" }} />)
                    ) : players.length > 0 ? (
                        players.map((p, index) => (
                            <motion.div key={p.id} variants={itemVariants}>
                                <PlayerCard player={p} rank={index + 1} />
                            </motion.div>
                        ))
                    ) : (
                        <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>No players found.</p>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

