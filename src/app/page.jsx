import { getLiveTournaments, getUpcomingTournaments, getTopPlayers, getGames, getSiteStats } from "@/lib/queries";
import { createClient } from "@/utils/supabase/server";
import TournamentCard from "./components/TournamentCard";
import PlayerCard from "./components/PlayerCard";
import GameCard from "./components/GameCard";
import Link from "next/link";
import HomeHero from "./components/HomeHero";
import BlogCarousel from "./components/BlogCarousel";

export default async function HomePage() {
    const supabase = await createClient();

    const [live, upcoming, players, gms, stats] = await Promise.all([
        getLiveTournaments(),
        getUpcomingTournaments(),
        getTopPlayers(5),
        getGames(),
        getSiteStats(),
    ]);

    // Fetch latest blog posts for News and Editor's Picks
    const { data: latestBlogs } = await supabase
        .from("blogs")
        .select("id, title, slug, excerpt, cover_image_url, created_at, author_id")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(10);

    let blogs = latestBlogs || [];
    if (blogs.length > 0) {
        const authorIds = [...new Set(blogs.map(b => b.author_id))];
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, display_name")
            .in("id", authorIds);
        const profileMap = (profiles || []).reduce((acc, p) => {
            acc[p.id] = p;
            return acc;
        }, {});
        blogs = blogs.map(blog => ({
            ...blog,
            profiles: profileMap[blog.author_id] || null,
        }));
    }

    const liveTournaments = live || [];
    const upcomingTournaments = upcoming || [];
    const topPlayers = players || [];
    const games = gms || [];

    return (
        <div>
            {/* Animated Hero (client component) */}
            <HomeHero />

            <div className="page-container">
                {/* What is KhelPediA - SEO-rich original content */}
                <section style={{ marginBottom: "5rem" }}>
                    <div
                        className="glass-card"
                        style={{
                            padding: "3rem 2.5rem",
                            borderTop: "4px solid var(--accent-red)",
                        }}
                    >
                        <h2
                            className="section-title"
                            style={{ marginBottom: "1.25rem" }}
                        >
                            What is KhelPediA?
                        </h2>
                        <p
                            style={{
                                color: "var(--text-secondary)",
                                fontSize: "1.05rem",
                                lineHeight: 1.8,
                                marginBottom: "1.25rem",
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
                                fontSize: "1.05rem",
                                lineHeight: 1.8,
                                marginBottom: "1.25rem",
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
                                fontSize: "1.05rem",
                                lineHeight: 1.8,
                            }}
                        >
                            Beyond raw data, our editorial team publishes original{" "}
                            <Link href="/blogs" style={{ color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 600 }}>
                                tournament previews, match analyses, and meta guides
                            </Link>{" "}
                            to help you understand the stories behind the stats.{" "}
                            <Link href="/about" style={{ color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 600 }}>
                                Learn more about us →
                            </Link>
                        </p>
                    </div>
                </section>

                {/* Live Tournaments */}
                <section style={{ marginBottom: "5rem" }}>
                    <div className="section-header">
                        <div>
                            <h2 className="section-title" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <span style={{ color: "var(--accent-red)", animation: "pulse-dot 1.5s infinite", display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "var(--accent-red)" }}></span>
                                Live Action
                            </h2>
                            <p className="section-subtitle">Happening right now in the arena</p>
                        </div>
                        <Link href="/tournaments?status=live" style={{ color: "var(--accent-red)", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem" }}>
                            View All Live Matches
                        </Link>
                    </div>

                    {liveTournaments.length > 0 ? (
                        <div className="grid-auto">
                            {liveTournaments.slice(0, 4).map(t => (
                                <TournamentCard key={t.id} tournament={t} />
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card" style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)", borderStyle: "dashed" }}>
                            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🏟️</div>
                            No top-tier tournaments are currently live.
                            <div style={{ marginTop: "1rem" }}>
                                <Link href="/tournaments" style={{ color: "var(--accent-red)", textDecoration: "none" }}>Check the schedule →</Link>
                            </div>
                        </div>
                    )}
                </section>

                {/* Featured Tournaments */}
                {upcomingTournaments.length > 0 && (
                    <section style={{ marginBottom: "5rem" }}>
                        <div className="section-header">
                            <div>
                                <h2 className="section-title">Featured Tournaments</h2>
                                <p className="section-subtitle">Upcoming major events to watch</p>
                            </div>
                            <Link href="/tournaments?status=upcoming" style={{ color: "var(--accent-red)", textDecoration: "none", fontWeight: 700, fontSize: "0.85rem" }}>
                                All Upcoming
                            </Link>
                        </div>
                        <div className="grid-auto">
                            {upcomingTournaments.slice(0, 4).map(t => (
                                <TournamentCard key={t.id} tournament={t} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Latest News & Analysis */}
                {blogs.length > 0 && (
                    <section style={{ marginBottom: "5rem" }}>
                        <div className="section-header">
                            <div>
                                <h2 className="section-title">Latest Esports News & Analysis</h2>
                                <p className="section-subtitle">Original editorial coverage from our experts</p>
                            </div>
                            <Link href="/blogs" style={{ color: "var(--accent-red)", textDecoration: "none", fontWeight: 700, fontSize: "0.85rem" }}>
                                All Articles
                            </Link>
                        </div>
                        <BlogCarousel blogs={blogs.slice(0, 5)} variant="news" />
                    </section>
                )}

                {/* Editor's Picks */}
                {blogs.length > 3 && (
                    <section style={{ marginBottom: "5rem" }}>
                        <div className="section-header">
                            <div>
                                <h2 className="section-title">Editor's Picks</h2>
                                <p className="section-subtitle">Deep dives and curated content</p>
                            </div>
                        </div>
                        <BlogCarousel blogs={blogs.slice(5, 10)} variant="featured" />
                    </section>
                )}

                {/* Featured Games */}
                <section style={{ marginBottom: "5rem" }}>
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">Top Titles</h2>
                            <p className="section-subtitle">Games we currently monitor</p>
                        </div>
                    </div>
                    <div className="grid-auto">
                        {games.slice(0, 4).map(game => (
                            <GameCard key={game.id} game={game} />
                        ))}
                    </div>
                </section>

                {/* Site Stats */}
                <section style={{ marginBottom: "5rem" }}>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                            gap: "1.5rem",
                        }}
                    >
                        {[
                            { label: "Games Tracked", value: stats.games, icon: "🎮" },
                            { label: "Tournaments", value: stats.tournaments, icon: "🏆" },
                            { label: "Pro Players", value: stats.players, icon: "👤" },
                            { label: "Teams", value: stats.teams, icon: "⚔️" },
                        ].map(stat => (
                            <div
                                key={stat.label}
                                className="glass-card"
                                style={{ padding: "2rem 1.5rem", textAlign: "center" }}
                            >
                                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{stat.icon}</div>
                                <div
                                    style={{
                                        fontSize: "2.5rem",
                                        fontWeight: 900,
                                        fontFamily: '"Rajdhani", sans-serif',
                                        color: "var(--accent-red)",
                                        lineHeight: 1,
                                        marginBottom: "0.25rem",
                                    }}
                                >
                                    {stat.value.toLocaleString()}
                                </div>
                                <div
                                    style={{
                                        color: "var(--text-muted)",
                                        fontSize: "0.8rem",
                                        fontWeight: 600,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.1em",
                                    }}
                                >
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "4rem" }}>
                    {/* Top Players */}
                    <section>
                        <div className="section-header">
                            <h2 className="section-title">World Rankings</h2>
                            <Link href="/players" style={{ color: "var(--accent-red)", textDecoration: "none", fontWeight: 700, fontSize: "0.85rem" }}>
                                Full Leaderboard
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
                            <h2 className="section-title">Schedule</h2>
                            <Link href="/tournaments?status=upcoming" style={{ color: "var(--accent-red)", textDecoration: "none", fontWeight: 700, fontSize: "0.85rem" }}>
                                Full Calendar
                            </Link>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            {upcomingTournaments.slice(0, 4).map(t => (
                                <TournamentCard key={t.id} tournament={t} />
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}