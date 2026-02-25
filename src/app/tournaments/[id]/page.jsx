import { getTournamentById, getTournamentTeams, getTournamentMatches } from "@/lib/queries";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
    const { id } = await params;
    const tournament = await getTournamentById(id);
    if (!tournament) return { title: "Tournament Not Found | KhelPediA" };
    return { title: `${tournament.name} | KhelPediA`, description: `Follow ${tournament.name} live.` };
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

    const formatPrize = (amount, curr) => {
        if (!amount) return "TBA";
        const cc = curr || "USD";
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: cc, maximumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString() : 'TBA';

    return (
        <div className="page-container">
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
                        <p style={{ fontWeight: 600 }}>{tournament.games?.name || "Unknown"}</p>
                    </div>
                    <div>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>Prize Pool</p>
                        <p style={{ fontWeight: 600, color: "var(--accent-cyan)" }}>{formatPrize(tournament.prize_pool, tournament.currency)}</p>
                    </div>
                    <div>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>Dates</p>
                        <p style={{ fontWeight: 600 }}>{formatDate(tournament.start_date)} - {formatDate(tournament.end_date)}</p>
                    </div>
                    <div>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>Location</p>
                        <p style={{ fontWeight: 600 }}>{tournament.region}</p>
                    </div>
                </div>
            </div>

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
                                                {t.teams?.logo_url && <img src={t.teams.logo_url} alt={t.teams?.name} style={{ width: 20, height: 20, objectFit: "contain" }} />}
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
                                    {m.team1?.logo_url && <img src={m.team1.logo_url} alt={m.team1.name} style={{ width: 24, height: 24, objectFit: "contain", filter: m.winner_id === m.team1_id ? "none" : "grayscale(50%)" }} />}
                                </div>

                                <div style={{ display: "flex", gap: "1rem", alignItems: "center", background: "var(--bg-secondary)", padding: "0.5rem 1.5rem", borderRadius: "12px", fontFamily: '"Rajdhani", sans-serif' }}>
                                    <span style={{ fontSize: "1.25rem", fontWeight: 700, color: m.winner_id === m.team1_id ? "var(--accent-cyan)" : "var(--text-primary)" }}>{m.score1}</span>
                                    <span style={{ color: "var(--text-muted)" }}>-</span>
                                    <span style={{ fontSize: "1.25rem", fontWeight: 700, color: m.winner_id === m.team2_id ? "var(--accent-cyan)" : "var(--text-primary)" }}>{m.score2}</span>
                                </div>

                                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "12px", paddingLeft: "2rem" }}>
                                    {m.team2?.logo_url && <img src={m.team2.logo_url} alt={m.team2.name} style={{ width: 24, height: 24, objectFit: "contain", filter: m.winner_id === m.team2_id ? "none" : "grayscale(50%)" }} />}
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
        </div>
    );
}
