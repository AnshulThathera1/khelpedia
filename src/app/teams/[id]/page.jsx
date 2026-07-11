import { getTeamById, getTeamPlayers, getTeamTournaments } from "@/lib/queries";
import Link from "next/link";
import { notFound } from "next/navigation";
import PlayerCard from "../../components/PlayerCard";

export async function generateMetadata({ params }) {
    const { id } = await params;
    const [team, roster, activeTournaments] = await Promise.all([
        getTeamById(id),
        getTeamPlayers(id),
        getTeamTournaments(id)
    ]);
    
    if (!team) return { title: "Team Not Found" };
    
    const hasEditorial = team.editorial_content && team.editorial_content.trim().length > 50;
    const hasRoster = roster.length > 0;
    const hasTournaments = activeTournaments.length > 0;
    
    // Only index pages that have a meaningful description OR both active roster and recent tournaments
    const isThin = !(hasEditorial || (hasRoster && hasTournaments));

    return {
        title: `${team.name} — Esports Team Profile`,
        description: `Roster, tournament history, and results for ${team.name}. View current players, recent placements, and team achievements.`,
        alternates: {
            canonical: `/teams/${id}`,
        },
        robots: isThin ? { index: false, follow: true } : { index: true, follow: true },
    };
}

export default async function TeamDetailPage({ params }) {
    const { id } = await params;

    const [team, roster, activeTournaments] = await Promise.all([
        getTeamById(id),
        getTeamPlayers(id),
        getTeamTournaments(id)
    ]);

    if (!team) {
        notFound();
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SportsTeam',
        name: team.name,
        sport: 'Esports',
        url: `https://khelpedia.org/teams/${team.id}`,
        logo: team.logo_url || '',
        description: team.description || `Roster and results for ${team.name}.`
    };

    return (
        <div className="page-container">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Team Header */}
            <div className="glass-card" style={{ padding: "4rem 2rem", marginBottom: "3rem", textAlign: "center", background: "linear-gradient(135deg, rgba(26,31,46,0.9), rgba(139,92,246,0.15))" }}>
                <div style={{ width: 120, height: 120, margin: "0 auto 1.5rem", borderRadius: "24px", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", fontWeight: 800, color: "var(--accent-purple)", boxShadow: "0 0 30px rgba(139,92,246,0.2)", border: "1px solid var(--border-color)", overflow: "hidden" }}>
                    {team.logo_url ? (
                        <img
                            src={team.logo_url}
                            alt={team.name}
                            style={{ width: "100%", height: "100%", objectFit: "contain", padding: "10px" }}
                        />
                    ) : null}
                    <span style={{ display: team.logo_url ? 'none' : 'block' }}>
                        {team.name.charAt(0).toUpperCase()}
                    </span>
                </div>

                <h1 className="page-title">{team.name}</h1>

                <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginTop: "1rem" }}>
                    <span className="badge" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)" }}>🌍 {team.region || "Global"}</span>
                    {team.founded_year && <span className="badge" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)" }}>Est. {team.founded_year}</span>}
                </div>

                <p style={{ color: "var(--text-secondary)", maxWidth: "600px", margin: "1.5rem auto 0", lineHeight: 1.6 }}>
                    {team.description || `One of the top competitive esports organizations competing across multiple premier titles.`}
                </p>
            </div>

            {/* About the Team (Editorial or Fallback) */}
            <section style={{ marginBottom: "3rem" }}>
                <h2 className="section-title" style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
                    About the Team
                </h2>
                <div className="glass-card" style={{ padding: "2rem", lineHeight: 1.8, color: "var(--text-secondary)" }}>
                    {team.editorial_content ? (
                        <div dangerouslySetInnerHTML={{ __html: team.editorial_content }} />
                    ) : (
                        <>
                            <p style={{ marginBottom: "1rem" }}>
                                <strong>{team.name}</strong> is a competitive esports organization {team.region ? `operating in the ${team.region} region` : 'competing globally'}. 
                                {team.founded_year ? ` Established in ${team.founded_year}, the organization has steadily built a reputation across premier esports titles.` : ' The team has actively participated in premier tier tournaments and continues to develop its competitive roster.'}
                            </p>
                            <p style={{ marginBottom: "1rem" }}>
                                {roster.length > 0 
                                    ? `The current active roster features ${roster.length} professional players who compete at the highest levels. This squad focuses on maintaining strong regional standings and qualifying for international majors.`
                                    : 'The active player roster is currently undergoing evaluations or restructuring. Stay tuned for official roster announcements and transfers.'}
                            </p>
                            <p>
                                {activeTournaments.length > 0 
                                    ? `Fans can track ${team.name}'s performance across ${activeTournaments.length} tracked events. The organization continues to battle for championship titles, prize pools, and global recognition in the ever-evolving esports ecosystem.`
                                    : `Follow ${team.name} on KhelPediA to stay updated on their latest tournament appearances, match results, and organizational news as they prepare for the upcoming competitive season.`}
                            </p>
                        </>
                    )}
                </div>
            </section>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem" }}>

                {/* Active Roster */}
                <section>
                    <div className="section-header">
                        <h2 className="section-title">Active Roster</h2>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {roster.map(player => (
                            <PlayerCard key={player.id} player={player} />
                        ))}
                        {roster.length === 0 && (
                            <div className="glass-card" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                                No active roster available.
                            </div>
                        )}
                    </div>
                </section>

                {/* Tournament History */}
                <section>
                    <div className="section-header">
                        <h2 className="section-title">Recent Tournaments</h2>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {activeTournaments.slice(0, 5).map(t => (
                            <Link key={t.id} href={`/tournaments/${t.tournament_id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                <div className="card" style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 4, color: "var(--text-primary)" }}>{t.tournaments?.name}</h3>
                                        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{t.tournaments?.games?.name}</p>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        {t.placement ? (
                                            <span className="badge" style={{ background: t.placement <= 3 ? "rgba(245, 158, 11, 0.15)" : "var(--bg-secondary)", color: t.placement <= 3 ? "#f59e0b" : "var(--text-muted)", border: t.placement <= 3 ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid var(--border-color)" }}>
                                                {t.placement === 1 ? '1st Place 🏆' : t.placement === 2 ? '2nd Place 🥈' : t.placement === 3 ? '3rd Place 🥉' : `${t.placement}th Place`}
                                            </span>
                                        ) : (
                                            <span className={`badge badge-${t.tournaments?.status}`}>{t.tournaments?.status}</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {activeTournaments.length === 0 && (
                            <div className="glass-card" style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                                No tournament records found.
                            </div>
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
}
