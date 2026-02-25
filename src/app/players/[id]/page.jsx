import { getPlayerById, getPlayerStats } from "@/lib/queries";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
    const { id } = await params;
    const player = await getPlayerById(id);
    if (!player) return { title: "Player Not Found | KhelPediA" };
    return { title: `${player.ign} (${player.name}) | KhelPediA`, description: `Stats and match history for ${player.ign}.` };
}

export default async function PlayerDetailPage({ params }) {
    const { id } = await params;

    const [player, stats] = await Promise.all([
        getPlayerById(id),
        getPlayerStats(id)
    ]);

    if (!player) {
        notFound();
    }

    const formatEarnings = (amount) => {
        if (!amount) return "$0";
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="page-container">
            {/* Player Header */}
            <div className="glass-card" style={{ padding: "3rem", marginBottom: "3rem", display: "flex", gap: "3rem", alignItems: "center", flexWrap: "wrap", background: "linear-gradient(135deg, rgba(26,31,46,0.9), rgba(6,214,160,0.15))" }}>

                {/* Avatar */}
                <div style={{ width: 140, height: 140, borderRadius: "50%", background: "linear-gradient(135deg, #06d6a0, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", fontWeight: 800, color: "#fff", flexShrink: 0, boxShadow: "0 0 40px rgba(6,214,160,0.3)" }}>
                    {player.ign.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                        <h1 className="page-title" style={{ margin: 0 }}>{player.ign}</h1>
                        {player.country && <span style={{ fontSize: "1.5rem" }}>🏳️</span>}
                    </div>

                    <h2 style={{ color: "var(--text-secondary)", fontSize: "1.25rem", fontWeight: 400, marginBottom: "1.5rem" }}>
                        {player.name}
                    </h2>

                    <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                        <div>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Current Team</p>
                            {player.teams ? (
                                <Link href={`/teams/${player.teams.id}`} style={{ fontWeight: 600, color: "var(--accent-cyan)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                    {player.teams.logo_url && (
                                        <img src={player.teams.logo_url} alt={player.teams.name} style={{ width: 20, height: 20, objectFit: "contain" }} />
                                    )}
                                    {player.teams.name}
                                </Link>
                            ) : (
                                <p style={{ fontWeight: 500, color: "var(--text-primary)" }}>Free Agent</p>
                            )}
                        </div>
                        <div>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Role</p>
                            <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>{player.role || "Flex"}</p>
                        </div>
                        <div>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Earnings</p>
                            <p style={{ fontWeight: 700, color: "var(--accent-cyan)", fontSize: "1.1rem" }}>{formatEarnings(player.earnings)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Stats */}
            <h2 className="section-title" style={{ marginBottom: "1.5rem" }}>Performance Stats</h2>
            <div className="grid-auto">
                {stats.length > 0 ? stats.map(stat => (
                    <div key={stat.id} className="card">
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border-color)" }}>
                            <span style={{ fontSize: "1.5rem" }}>🎮</span>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{stat.games?.name}</h3>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                            <div>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: 4 }}>Rating</p>
                                <p style={{ fontSize: "1.5rem", fontWeight: 800, color: stat.rating >= 1.2 ? "var(--accent-cyan)" : "var(--text-primary)" }}>
                                    {stat.rating.toFixed(2)}
                                </p>
                            </div>
                            <div>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: 4 }}>K / D / A</p>
                                <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>{stat.kills} / {stat.deaths} / {stat.assists}</p>
                            </div>
                            <div>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: 4 }}>Win Rate</p>
                                <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>{stat.win_rate}%</p>
                            </div>
                            <div>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: 4 }}>Matches</p>
                                <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>{stat.matches_played}</p>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="glass-card" style={{ gridColumn: "1 / -1", padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                        No detailed stats available for this player.
                    </div>
                )}
            </div>
        </div>
    );
}
