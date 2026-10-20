import { getLiveTournaments, getUpcomingTournaments, getTopPlayers, getGames, getSiteStats } from "@/lib/queries";
import { query } from "@/lib/db";
import Link from "next/link";
import { ArrowRight, Trophy, Calendar, Radio, Gamepad2, BookOpen } from "lucide-react";
import TournamentCard from "./components/TournamentCard";
import PlayerCard from "./components/PlayerCard";
import GameCard from "./components/GameCard";
import HomeHero from "./components/HomeHero";
import GameQuickStrip from "./components/home/GameQuickStrip";
import EditorialNewsGrid from "./components/home/EditorialNewsGrid";
import StatsTelemetryBar from "./components/home/StatsTelemetryBar";
import AdContainer from "./components/ads/AdContainer";
import DesktopSidebarLayout from "./components/ads/DesktopSidebarLayout";
import ValorantPromoPopup from "./components/ValorantPromoPopup";

export default async function HomePage() {
  let liveTournaments = [];
  let upcomingTournaments = [];
  let topPlayers = [];
  let games = [];
  let stats = { matches: 0, games: 0, tournaments: 0, teams: 0 };
  let blogs = [];

  try {
    const [live, upcoming, players, gms, siteStats, blogsRes] = await Promise.all([
      getLiveTournaments().catch(() => []),
      getUpcomingTournaments().catch(() => []),
      getTopPlayers(5).catch(() => []),
      getGames().catch(() => []),
      getSiteStats().catch(() => ({ matches: 0, games: 0, tournaments: 0, teams: 0 })),
      query(`
        SELECT b.id, b.title, b.slug, b.excerpt, b.cover_image_url, b.created_at, b.author_id,
          CASE WHEN p.id IS NOT NULL THEN json_build_object('id', p.id, 'display_name', p.display_name) ELSE NULL END AS profiles
        FROM blogs b
        LEFT JOIN profiles p ON b.author_id = p.id
        WHERE b.is_published = true
        ORDER BY b.created_at DESC
        LIMIT 10
      `).catch(() => ({ rows: [] }))
    ]);

    liveTournaments = live || [];
    upcomingTournaments = upcoming || [];
    topPlayers = players || [];
    games = gms || [];
    stats = siteStats || { matches: 0, games: 0, tournaments: 0, teams: 0 };
    blogs = blogsRes.rows || [];
  } catch (err) {
    console.error("Error loading homepage data:", err);
  }

  return (
    <div style={{ background: "var(--bg-primary)" }}>
      {/* Valorant Feature / Profile Tracker Promo Modal */}
      <ValorantPromoPopup />

      {/* 01: Cinematic Editorial Hero + Live Arena Radar */}
      <HomeHero
        liveTournaments={liveTournaments}
        upcomingTournaments={upcomingTournaments}
      />

      {/* Platform Telemetry HUD Metrics */}
      <StatsTelemetryBar stats={stats} />

      {/* 02: Quick Game Switcher Bar (Blitz-style) */}
      <GameQuickStrip games={games} />

      {/* 03: Main Content Area (Protected by Desktop Sidebar Ad Rails) */}
      <DesktopSidebarLayout pageType="homepage" variant="standard">
        <div className="page-container" style={{ paddingTop: "3rem" }}>

          {/* Editorial Dispatch: Featured Cover Story + Breaking Stack + Deep Dives */}
          {blogs.length > 0 && (
            <EditorialNewsGrid blogs={blogs} />
          )}

          {/* Live Action Section */}
          <section aria-label="Live Esports Matches" style={{ marginBottom: "5rem" }}>
            <div className="section-header">
              <div>
                <div className="tactical-kicker">
                  <Radio size={14} color="var(--accent-red)" />
                  <span>// 03. LIVE CIRCUIT</span>
                </div>
                <h2 className="section-title">Live Action Arena</h2>
                <p className="section-subtitle">Real-time tournaments and live championship broadcasts</p>
              </div>
              <Link
                href="/tournaments?status=live"
                style={{
                  color: "var(--accent-red)",
                  textDecoration: "none",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                All Live Matches <ArrowRight size={14} />
              </Link>
            </div>

            {liveTournaments.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "1.5rem"
                }}
              >
                {liveTournaments.slice(0, 4).map((t) => (
                  <TournamentCard key={t.id} tournament={t} />
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: "3.5rem 2rem",
                  textAlign: "center",
                  background: "var(--bg-secondary)",
                  border: "1px dashed var(--border-color)",
                  borderRadius: "8px",
                  color: "var(--text-secondary)"
                }}
              >
                <div style={{ fontSize: "2.2rem", marginBottom: "0.75rem" }}>🏟️</div>
                <h3
                  style={{
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    marginBottom: "0.5rem"
                  }}
                >
                  No Live Matches Currently in Progress
                </h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", maxWidth: "440px", margin: "0 auto 1.25rem auto" }}>
                  All scheduled series for today have concluded. Check the upcoming tournament circuit to track next matches.
                </p>
                <Link
                  href="/tournaments?status=upcoming"
                  className="btn-primary"
                  style={{ padding: "8px 20px", fontSize: "0.8rem" }}
                >
                  Browse Tournament Schedule
                </Link>
              </div>
            )}
          </section>

          {/* Featured Upcoming Tournaments */}
          {upcomingTournaments.length > 0 && (
            <section aria-label="Upcoming Featured Tournaments" style={{ marginBottom: "3.5rem" }}>
              <div className="section-header">
                <div>
                  <div className="tactical-kicker tactical-kicker-amber">
                    <Calendar size={14} color="var(--accent-amber)" />
                    <span>// 04. GLOBAL CIRCUIT</span>
                  </div>
                  <h2 className="section-title">Featured Upcoming Tournaments</h2>
                  <p className="section-subtitle">Tier-one championships and regional qualifiers on the official calendar</p>
                </div>
                <Link
                  href="/tournaments?status=upcoming"
                  style={{
                    color: "var(--accent-amber)",
                    textDecoration: "none",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  All Upcoming <ArrowRight size={14} />
                </Link>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "1.5rem"
                }}
              >
                {upcomingTournaments.slice(0, 4).map((t) => (
                  <TournamentCard key={t.id} tournament={t} />
                ))}
              </div>
            </section>
          )}

          {/* Homepage Leaderboard Ad Break */}
          <AdContainer type="banner" placement="homepage_tournaments_break" />

          {/* Split Broadcast Scoreboard: World Rankings & Tournament Calendar */}
          <div
            style={{
              marginTop: "4rem",
              marginBottom: "5rem",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "3rem"
            }}
          >
            {/* Left: Top Pro Players Leaderboard */}
            <section aria-label="World Rankings Leaderboard">
              <div className="section-header" style={{ marginBottom: "1.25rem" }}>
                <div>
                  <div className="tactical-kicker tactical-kicker-amber" style={{ marginBottom: "2px" }}>
                    <Trophy size={13} color="var(--accent-amber)" />
                    <span>LEADERBOARD</span>
                  </div>
                  <h2 className="section-title" style={{ fontSize: "1.4rem" }}>World Rankings</h2>
                </div>
                <Link
                  href="/players"
                  style={{
                    color: "var(--accent-amber)",
                    textDecoration: "none",
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  Full Leaderboard <ArrowRight size={12} />
                </Link>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {topPlayers.map((player, index) => (
                  <PlayerCard key={player.id} player={player} rank={index + 1} />
                ))}
              </div>
            </section>

            {/* Right: Tournament Schedule */}
            <section aria-label="Tournament Schedule">
              <div className="section-header" style={{ marginBottom: "1.25rem" }}>
                <div>
                  <div className="tactical-kicker tactical-kicker-cyan" style={{ marginBottom: "2px" }}>
                    <Calendar size={13} color="var(--accent-cyan)" />
                    <span>TIMELINE</span>
                  </div>
                  <h2 className="section-title" style={{ fontSize: "1.4rem" }}>Event Calendar</h2>
                </div>
                <Link
                  href="/tournaments?status=upcoming"
                  style={{
                    color: "var(--accent-cyan)",
                    textDecoration: "none",
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  Full Calendar <ArrowRight size={12} />
                </Link>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {upcomingTournaments.slice(0, 4).map((t) => (
                  <TournamentCard key={t.id} tournament={t} />
                ))}
              </div>
            </section>
          </div>

          {/* Top Titles (Game Universe) */}
          <section aria-label="Top Esports Titles" style={{ marginBottom: "5rem" }}>
            <div className="section-header">
              <div>
                <div className="tactical-kicker tactical-kicker-cyan">
                  <Gamepad2 size={14} color="var(--accent-cyan)" />
                  <span>// 06. TITLE DIRECTORY</span>
                </div>
                <h2 className="section-title">Major Esports Universes</h2>
                <p className="section-subtitle">Real-time match data, roster changes, and analytics across primary disciplines</p>
              </div>
              <Link
                href="/games"
                style={{
                  color: "var(--accent-cyan)",
                  textDecoration: "none",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                All Titles <ArrowRight size={14} />
              </Link>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "1.5rem"
              }}
            >
              {games.slice(0, 6).map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </section>

          {/* Encyclopedic Manifesto & Trust Signals (What is KhelPediA) */}
          <section
            aria-label="About KhelPediA Esports Encyclopedia"
            style={{ marginBottom: "5rem" }}
          >
            <div
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderLeft: "4px solid var(--accent-red)",
                borderRadius: "8px",
                padding: "2.5rem",
                boxShadow: "0 12px 36px rgba(0, 0, 0, 0.4)"
              }}
            >
              <div className="tactical-kicker">
                <BookOpen size={14} color="var(--accent-red)" />
                <span>// ENCYCLOPEDIA MANIFESTO</span>
              </div>
              <h2
                style={{
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  margin: "0 0 1.25rem 0"
                }}
              >
                What is KhelPediA?
              </h2>

              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "1rem",
                  lineHeight: 1.8,
                  marginBottom: "1.25rem"
                }}
              >
                KhelPediA is the definitive esports encyclopedia — a comprehensive
                platform for tracking live tournaments, analyzing player
                performance, and following professional teams across the world&apos;s
                biggest competitive gaming titles. Whether you&apos;re a casual viewer
                tuning into a Valorant Masters or a dedicated analyst studying CS2
                team compositions, KhelPediA gives you the data and context you need.
              </p>

              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "1rem",
                  lineHeight: 1.8,
                  marginBottom: "1.25rem"
                }}
              >
                The name combines &quot;Khel&quot; (खेल — the Hindi word for sport or game)
                with &quot;Pedia&quot; (from encyclopedia), reflecting our mission to build a
                globally inclusive knowledge base for competitive gaming. From BGMI
                tournaments in South Asia to international Dota 2 Majors, we cover
                esports at every level.
              </p>

              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "1rem",
                  lineHeight: 1.8,
                  margin: 0
                }}
              >
                Beyond raw telemetry, our editorial desk publishes original{" "}
                <Link
                  href="/blogs"
                  style={{
                    color: "var(--accent-cyan)",
                    textDecoration: "none",
                    fontWeight: 700
                  }}
                >
                  tournament previews, match analyses, and meta guides
                </Link>{" "}
                to help you understand the stories behind the stats.{" "}
                <Link
                  href="/about"
                  style={{
                    color: "var(--accent-red)",
                    textDecoration: "none",
                    fontWeight: 700,
                    marginLeft: "4px"
                  }}
                >
                  Learn more about our mission →
                </Link>
              </p>
            </div>
          </section>

        </div>
      </DesktopSidebarLayout>
    </div>
  );
}