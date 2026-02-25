import { getTeamById, getTeamPlayers, getTeamTournaments } from "@/lib/queries";
import Link from "next/link";
import { notFound } from "next/navigation";
import PlayerCard from "../../components/PlayerCard";

export async function generateMetadata({ params }) {
    const { id } = await params;
    const team = await getTeamById(id);
    if (!team) return { title: "Team Not Found | KhelPediA" };
    return { title: `${team.name} Esports | KhelPediA`, description: `Roster and results for ${team.name}.` };
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

    return (
        <div className="page-container">
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
