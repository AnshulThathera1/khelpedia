import { getTournamentById, getTournamentTeams, getTournamentMatches } from "@/lib/queries";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";

export async function generateMetadata({ params }) {
    const { id } = await params;
    const tournament = await getTournamentById(id);
    if (!tournament) return { title: "Tournament Not Found | KhelPediA" };

    const gameName = tournament.games?.name || "Esports";
    const title = `${tournament.name} — ${gameName} Tournament | KhelPediA`;
    const description = `Complete coverage of ${tournament.name}. Track participating teams, live match results, tournament brackets, prize pool, and format for this ${gameName} event on KhelPediA.`;
    const images = tournament.games?.icon_url ? [tournament.games.icon_url] : [];

    return { 
        title, 
        description,
        openGraph: {
            title,
            description,
            type: "website",
            images: images,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: images,
        }
    };
}

export default async function TournamentDetailPage({ params }) {
    const { id } = await params;

    const [tournament, teams, matches] = await Promise.all([
        getTournamentById(id),
        getTournamentTeams(id),
        getTournamentMatches(id)
    ]);

    if (!tournament) {
        notFound();
    }

    // Fetch related blog posts
    const supabase = await createClient();
    const tournamentNameWords = tournament.name.split(/\s+/).filter(w => w.length > 3).slice(0, 3);
    let relatedBlogs = [];
    if (tournamentNameWords.length > 0) {
        const searchPattern = tournamentNameWords.map(w => `%${w}%`);
        const orConditions = searchPattern.map(p => `title.ilike.${p}`).join(',');
        const { data } = await supabase
            .from("blogs")
            .select("title, slug, created_at")
            .eq("is_published", true)
            .or(orConditions)
            .order("created_at", { ascending: false })
            .limit(3);
        relatedBlogs = data || [];
    }

    const formatPrize = (amount, curr) => {
        if (!amount) return "TBA";
        const cc = curr || "USD";
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: cc, maximumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'TBA';

    const gameName = tournament.games?.name || "Unknown";
    const gameSlug = tournament.games?.slug;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: tournament.name,
        startDate: tournament.start_date,
        endDate: tournament.end_date,
        eventStatus: tournament.status === 'live' ? "https://schema.org/EventMovedOnline" : "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
        location: {
            '@type': 'VirtualLocation',
            url: `https://khelpedia.org/tournaments/${tournament.id}`
        },
        image: tournament.games?.icon_url ? [tournament.games.icon_url] : [],
        description: `Follow ${tournament.name} live on KhelPediA. Track teams, matches, and results for this ${gameName} tournament.`,
        organizer: {
            '@type': 'Organization',
            name: 'KhelPediA',
            url: 'https://khelpedia.org'
        },
        offers: tournament.prize_pool ? {
            '@type': 'Offer',
            price: tournament.prize_pool,
            priceCurrency: tournament.currency || 'USD',
        } : undefined,
    };

    return (
        <div className="page-container">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Tournament Header */}
            <div className="glass-card" style={{ padding: "3rem 2rem", marginBottom: "3rem", borderTop: "4px solid var(--accent-cyan)" }}>
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                    <span className={`badge badge-${tournament.status}`}>{tournament.status}</span>
                    <span className="badge badge-tier">Tier {tournament.tier || "A"}</span>
                </div>

                <h1 className="page-title">{tournament.name}</h1>

                <div style={{ display: "flex", gap: "2rem", marginTop: "2rem", flexWrap: "wrap" }}>
                    <div>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>Game</p>
                        <p style={{ fontWeight: 600 }}>
                            {gameSlug ? (
                                <Link href={`/games/${gameSlug}`} style={{ color: "var(--text-primary)", textDecoration: "none" }}>
                                    {gameName}
                                </Link>
                            ) : gameName}
                        </p>
                    </div>
                    <div>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>Prize Pool</p>
                        <p style={{ fontWeight: 600, color: "var(--accent-cyan)" }}>{formatPrize(tournament.prize_pool, tournament.currency)}</p>
                    </div>
                    <div>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>Dates</p>
                        <p style={{ fontWeight: 600 }}>{formatDate(tournament.start_date)} — {formatDate(tournament.end_date)}</p>
                    </div>
                    <div>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>Region</p>
                        <p style={{ fontWeight: 600 }}>{tournament.region || "International"}</p>
                    </div>
                </div>
            </div>

            {/* Tournament Overview — adds original content to avoid thin pages */}
            <section style={{ marginBottom: "3rem" }}>
                <h2 className="section-title" style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
                    Tournament Overview
                </h2>
                <div className="glass-card" style={{ padding: "2rem" }}>
                    {tournament.editorial_content ? (
                        <div style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: tournament.editorial_content }} />
                    ) : (
                        <>
                            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.8, marginBottom: "1rem" }}>
                                {tournament.name} is {tournament.status === 'live' ? 'an ongoing' : tournament.status === 'upcoming' ? 'an upcoming' : 'a completed'}{' '}
                                {gameName} tournament{tournament.region ? ` in the ${tournament.region} region` : ''}.
                                {tournament.prize_pool ? ` With a prize pool of ${formatPrize(tournament.prize_pool, tournament.currency)}, it attracts some of the best professional teams in the ${gameName} competitive scene.` : ''}
                            </p>
                            <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.8, marginBottom: "1rem" }}>
                                {teams.length > 0
                                    ? `${teams.length} team${teams.length > 1 ? 's' : ''} ${tournament.status === 'completed' ? 'competed' : tournament.status === 'live' ? 'are competing' : 'are set to compete'} in this event, battling for glory and ranking points.`
                                    : 'Teams for this tournament have not yet been announced.'
                                }
                                {matches.length > 0
                                    ? ` So far, ${matches.length} match${matches.length > 1 ? 'es have' : ' has'} been played.`
                                    : ''
                                }
                            </p>
                            {gameSlug && (
                                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                                    Looking for more {gameName} tournaments?{' '}
                                    <Link href={`/games/${gameSlug}`} style={{ color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 600 }}>
                                        Browse all {gameName} events →
                                    </Link>
                                </p>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Teams to Watch */}
            {teams.length > 0 && (
                <section style={{ marginBottom: "3rem" }}>
                    <h2 className="section-title" style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
                        Teams to Watch
                    </h2>
                    <div className="glass-card" style={{ padding: "2rem" }}>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                            {teams.length > 3 
                                ? `Here are some of the key teams competing in ${tournament.name}. Follow their journey through the brackets and matches below.`
                                : `${teams.length} team${teams.length > 1 ? 's are' : ' is'} participating in ${tournament.name}.`
                            }
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                            {teams.slice(0, 8).map((t) => (
                                <Link
                                    key={t.id}
                                    href={`/teams/${t.team_id}`}
                                    style={{
                                        textDecoration: "none",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        padding: "0.75rem 1rem",
                                        background: "var(--bg-secondary)",
                                        border: "1px solid var(--border-color)",
                                        transition: "all 0.2s",
                                    }}
                                    className="team-watch-card"
                                >
                                    {t.teams?.logo_url && (
                                        <Image src={t.teams.logo_url} alt={t.teams?.name || ''} width={28} height={28} style={{ objectFit: "contain" }} />
                                    )}
                                    <div>
                                        <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "0.9rem" }}>
                                            {t.teams?.name}
                                        </div>
                                        {t.teams?.region && (
                                            <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                                                {t.teams.region}
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: "3rem" }}>
                {/* Left Column: Teams */}
                <aside>
                    <h2 className="section-title" style={{ fontSize: "1.25rem", marginBottom: "1.5rem" }}>Participating Teams</h2>
                    <div className="glass-card" style={{ padding: "1rem" }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Team</th>
                                    <th style={{ textAlign: "right" }}>Seed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teams.map((t, i) => (
                                    <tr key={t.id}>
                                        <td>
                                            <Link href={`/teams/${t.team_id}`} style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-primary)", textDecoration: "none", fontWeight: 600 }}>
                                                {t.teams?.logo_url && <Image src={t.teams.logo_url} alt={t.teams?.name} width={20} height={20} style={{ objectFit: "contain" }} />}
                                                {t.teams?.name}
                                            </Link>
                                        </td>
                                        <td style={{ textAlign: "right", color: "var(--text-muted)" }}>{t.placement || i + 1}</td>
                                    </tr>
                                ))}
                                {teams.length === 0 && (
                                    <tr><td colSpan="2" style={{ textAlign: "center", color: "var(--text-muted)" }}>Teams TBA</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </aside>

                {/* Right Column: matches */}
                <main>
                    <div className="section-header">
                        <h2 className="section-title" style={{ fontSize: "1.25rem", margin: 0 }}>Recent Matches</h2>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {matches.map(m => (
                            <div key={m.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px", paddingRight: "2rem" }}>
                                    <Link href={`/teams/${m.team1_id}`} style={{ textDecoration: "none", color: m.winner_id === m.team1_id ? "var(--text-primary)" : "var(--text-muted)", fontWeight: m.winner_id === m.team1_id ? 700 : 400 }}>
                                        {m.team1?.name || "TBD"}
                                    </Link>
                                    {m.team1?.logo_url && <Image src={m.team1.logo_url} alt={m.team1.name} width={24} height={24} style={{ objectFit: "contain", filter: m.winner_id === m.team1_id ? "none" : "grayscale(50%)" }} />}
                                </div>

                                <div style={{ display: "flex", gap: "1rem", alignItems: "center", background: "var(--bg-secondary)", padding: "0.5rem 1.5rem", borderRadius: "12px", fontFamily: '"Rajdhani", sans-serif' }}>
                                    <span style={{ fontSize: "1.25rem", fontWeight: 700, color: m.winner_id === m.team1_id ? "var(--accent-cyan)" : "var(--text-primary)" }}>{m.score1}</span>
                                    <span style={{ color: "var(--text-muted)" }}>-</span>
                                    <span style={{ fontSize: "1.25rem", fontWeight: 700, color: m.winner_id === m.team2_id ? "var(--accent-cyan)" : "var(--text-primary)" }}>{m.score2}</span>
                                </div>

                                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px", paddingLeft: "2rem" }}>
                                    {m.team2?.logo_url && <Image src={m.team2.logo_url} alt={m.team2.name} width={24} height={24} style={{ objectFit: "contain", filter: m.winner_id === m.team2_id ? "none" : "grayscale(50%)" }} />}
                                    <Link href={`/teams/${m.team2_id}`} style={{ textDecoration: "none", color: m.winner_id === m.team2_id ? "var(--text-primary)" : "var(--text-muted)", fontWeight: m.winner_id === m.team2_id ? 700 : 400 }}>
                                        {m.team2?.name || "TBD"}
                                    </Link>
                                </div>

                                <div style={{ width: "100px", textAlign: "right" }}>
                                    <span className="badge" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)" }}>{m.round}</span>
                                </div>
                            </div>
                        ))}
                        {matches.length === 0 && (
                            <div className="glass-card" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                                No matches scheduled or played yet.
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Related Articles */}
            {relatedBlogs.length > 0 && (
                <section style={{ marginTop: "4rem" }}>
                    <h2 className="section-title" style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
                        Related Articles
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
                        {relatedBlogs.map(blog => (
                            <Link
                                key={blog.slug}
                                href={`/blogs/${blog.slug}`}
                                className="card"
                                style={{
                                    textDecoration: "none",
                                    padding: "1.5rem",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.5rem",
                                }}
                            >
                                <span style={{ color: "var(--accent-cyan)", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                    NEWS
                                </span>
                                <h3 style={{ color: "var(--text-primary)", fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.3, fontFamily: '"Rajdhani", sans-serif' }}>
                                    {blog.title}
                                </h3>
                                <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                                    {new Date(blog.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .team-watch-card:hover {
                    border-color: var(--accent-red) !important;
                    transform: translateY(-2px);
                }
            `}} />
        </div>
    );
}
