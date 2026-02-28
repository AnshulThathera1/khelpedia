"use client";
import { useEffect, useState } from "react";
import { getLiveTournaments, getUpcomingTournaments, getTopPlayers, getGames } from "@/lib/queries";
import TournamentCard from "./components/TournamentCard";
import PlayerCard from "./components/PlayerCard";
import GameCard from "./components/GameCard";
import Skeleton from "./components/Skeleton";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function HomePage() {
  const [liveTournaments, setLiveTournaments] = useState([]);
  const [upcomingTournaments, setUpcomingTournaments] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [live, upcoming, players, gms] = await Promise.all([
          getLiveTournaments(),
          getUpcomingTournaments(),
          getTopPlayers(5),
          getGames()
        ]);
        setLiveTournaments(live || []);
        setUpcomingTournaments(upcoming || []);
        setTopPlayers(players || []);
        setGames(gms || []);
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-grid"></div>
        <div className="page-container" style={{ position: "relative", zIndex: 10, textAlign: "center", paddingTop: "2rem" }}>
          <motion.h1
            variants={itemVariants}
            style={{
              fontFamily: '"Rajdhani", sans-serif',
              fontSize: "clamp(3rem, 7vw, 6rem)",
              fontWeight: 800,
              lineHeight: 1,
              marginBottom: "1.5rem",
              letterSpacing: "-0.03em"
            }}
          >
            THE <span className="text-gradient">EPICENTER</span> OF <br />
            GLOBAL ESPORTS
          </motion.h1>
          <motion.p
            variants={itemVariants}
            style={{
              color: "var(--text-secondary)",
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              maxWidth: "650px",
              margin: "0 auto 3rem",
              lineHeight: 1.6,
              fontWeight: 400
            }}
          >
            Real-time tournament tracking, player performance analytics, and professional team insights across all major titles.
          </motion.p>
          <motion.div variants={itemVariants} style={{ display: "flex", gap: "1.25rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/tournaments" className="btn-primary" style={{ padding: "12px 32px" }}>
              <span>Live Tournaments</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
            </Link>
            <Link href="/players" className="btn-secondary" style={{ padding: "12px 32px" }}>
              Explore Players
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="page-container">
        {/* Live Tournaments */}
        <section style={{ marginBottom: "6rem" }}>
          <motion.div variants={itemVariants} className="section-header">
            <div>
              <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ color: "var(--accent-red)", animation: "pulse-dot 1.5s infinite", display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "var(--accent-red)" }}></span>
                Live Action
              </h2>
              <p className="section-subtitle">Happening right now in the arena</p>
            </div>
            <Link href="/tournaments?status=live" style={{ color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" }}>
              View All Live Matches
            </Link>
          </motion.div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="grid-auto">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} style={{ height: 200, borderRadius: "14px" }} />)}
              </div>
            ) : liveTournaments.length > 0 ? (
              <motion.div variants={containerVariants} className="grid-auto">
                {liveTournaments.slice(0, 4).map(t => (
                  <motion.div key={t.id} variants={itemVariants}>
                    <TournamentCard tournament={t} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div variants={itemVariants} className="glass-card" style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)", borderStyle: "dashed" }}>
                <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🏟️</div>
                No top-tier tournaments are currently live.
                <div style={{ marginTop: "1rem" }}>
                  <Link href="/tournaments" style={{ color: "var(--accent-cyan)", textDecoration: "none" }}>Check the schedule →</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Featured Games */}
        <section style={{ marginBottom: "6rem" }}>
          <motion.div variants={itemVariants} className="section-header">
            <div>
              <h2 className="section-title">Top Titles</h2>
              <p className="section-subtitle">Games we currently monitor</p>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="grid-auto">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} style={{ height: 180, borderRadius: "14px" }} />)}
            </div>
          ) : (
            <motion.div variants={containerVariants} className="grid-auto">
              {games.slice(0, 4).map(game => (
                <motion.div key={game.id} variants={itemVariants}>
                  <GameCard key={game.id} game={game} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "4rem" }}>
          {/* Top Players */}
          <section>
            <motion.div variants={itemVariants} className="section-header">
              <h2 className="section-title">World Rankings</h2>
              <Link href="/players" style={{ color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 700, fontSize: "0.85rem" }}>
                Full Leaderboard
              </Link>
            </motion.div>
            <AnimatePresence>
              {isLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} style={{ height: 60, borderRadius: "10px" }} />)}
                </div>
              ) : (
                <motion.div variants={containerVariants} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {topPlayers.map((player, index) => (
                    <motion.div key={player.id} variants={itemVariants}>
                      <PlayerCard player={player} rank={index + 1} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Upcoming Tournaments */}
          <section>
            <motion.div variants={itemVariants} className="section-header">
              <h2 className="section-title">Schedule</h2>
              <Link href="/tournaments?status=upcoming" style={{ color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 700, fontSize: "0.85rem" }}>
                Full Calendar
              </Link>
            </motion.div>
            <AnimatePresence>
              {isLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} style={{ height: 160, borderRadius: "14px" }} />)}
                </div>
              ) : (
                <motion.div variants={containerVariants} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {upcomingTournaments.slice(0, 4).map(t => (
                    <motion.div key={t.id} variants={itemVariants}>
                      <TournamentCard tournament={t} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </div>
    </motion.div>
  );
}