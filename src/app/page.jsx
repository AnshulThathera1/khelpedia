import { getLiveTournaments, getUpcomingTournaments, getTopPlayers, getGames } from "@/lib/queries";
import TournamentCard from "./components/TournamentCard";
import PlayerCard from "./components/PlayerCard";
import GameCard from "./components/GameCard";
import Link from "next/link";
import { Button } from "@nextui-org/react";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function HomePage() {
  const [liveTournaments, upcomingTournaments, topPlayers, games] = await Promise.all([
    getLiveTournaments(),
    getUpcomingTournaments(),
    getTopPlayers(5),
    getGames()
  ]);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-grid"></div>
        <div className="page-container" style={{ position: "relative", zIndex: 10, textAlign: "center", paddingTop: "2rem" }}>
          <h1
            className="animate-fade-in-up"
            style={{
              fontFamily: '"Rajdhani", sans-serif',
              fontSize: "clamp(3rem, 6vw, 5.5rem)",
              fontWeight: 800,
              lineHeight: 1.05,
              marginBottom: "1.5rem",
              letterSpacing: "-0.02em"
            }}
          >
            THE <span className="text-gradient">EPICENTER</span> OF <br />
            GLOBAL ESPORTS
          </h1>
          <p
            className="animate-fade-in-up delay-100"
            style={{
              color: "var(--text-secondary)",
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
              maxWidth: "600px",
              margin: "0 auto 2.5rem",
              lineHeight: 1.6,
              fontWeight: 400
            }}
          >
            Track live tournaments, analyze player stats, and follow your favorite teams across Valorant, CS2, BGMI, and more.
          </p>
          <div className="animate-fade-in-up delay-200" style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/tournaments" className="btn-primary">
              View Tournaments
            </Link>
            <Link href="/games" className="btn-secondary">
              Explore Games
            </Link>
          </div>
        </div>
      </section>

      <div className="page-container">
        {/* Live Tournaments */}
        <section style={{ marginBottom: "5rem" }}>
          <div className="section-header animate-fade-in-up delay-300">
            <div>
              <h2 className="section-title">
                <span style={{ color: "var(--accent-red)", marginRight: 8, animation: "pulse-dot 1.5s infinite", display: "inline-block", width: 12, height: 12, borderRadius: "50%" }}></span>
                Live Tournaments
              </h2>
              <p className="section-subtitle">Ongoing tier-A and S-tier events</p>
            </div>
            <Link href="/tournaments?status=live" style={{ color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 600 }}>
              View All →
            </Link>
          </div>

          {liveTournaments.length > 0 ? (
            <div className="grid-auto animate-fade-in-up delay-400">
              {liveTournaments.slice(0, 4).map(t => (
                <TournamentCard key={t.id} tournament={t} />
              ))}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
              No top-tier tournaments are currently live.
            </div>
          )}
        </section>

        {/* Featured Games */}
        <section style={{ marginBottom: "5rem" }}>
          <div className="section-header">
            <div>
              <h2 className="section-title animate-slide-in">Featured Games</h2>
              <p className="section-subtitle animate-slide-in delay-100">Top competitive titles we track</p>
            </div>
          </div>
          <div className="grid-auto animate-slide-in delay-200">
            {games.slice(0, 4).map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "3rem" }}>

          {/* Top Earning Players */}
          <section>
            <div className="section-header">
              <h2 className="section-title">Top Players</h2>
              <Link href="/players" style={{ color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem" }}>
                Full Leaderboard →
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {topPlayers.map((player, index) => (
                <PlayerCard key={player.id} player={player} rank={index + 1} />
              ))}
            </div>
          </section>

          {/* Upcoming Tournaments */}
          <section>
            <div className="section-header">
              <h2 className="section-title">Upcoming Events</h2>
              <Link href="/tournaments?status=upcoming" style={{ color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 600, fontSize: "0.9rem" }}>
                Schedule →
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {upcomingTournaments.slice(0, 5).map(t => (
                <TournamentCard key={t.id} tournament={t} />
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}