"use client";
import { useEffect, useState } from "react";
import { getGames } from "@/lib/queries";
import GameCard from "../components/GameCard";
import Skeleton from "../components/Skeleton";
import { motion } from "framer-motion";

export default function GamesPage() {
    const [games, setGames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getGames().then(res => {
            setGames(res || []);
            setIsLoading(false);
        });
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="page-container"
        >
            <motion.div variants={itemVariants} className="page-header">
                <h1 className="page-title">Supported Games</h1>
                <p className="page-description">
                    Find tournaments, players, and stats for your favorite esports titles.
                </p>
            </motion.div>

            <motion.div variants={itemVariants} className="grid-auto">
                {isLoading ? (
                    [1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} style={{ height: 180, borderRadius: "14px" }} />)
                ) : (
                    games.map((game) => (
                        <motion.div key={game.id} variants={itemVariants}>
                            <GameCard game={game} />
                        </motion.div>
                    ))
                )}
            </motion.div>
        </motion.div>
    );
}

