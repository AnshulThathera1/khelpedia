import { getGameBySlug, getTournaments } from "@/lib/queries";
import TournamentCard from "../../components/TournamentCard";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const game = await getGameBySlug(slug);
    if (!game) return { title: "Game Not Found | KhelPediA" };
    return { title: `${game.name} Esports | KhelPediA`, description: `Tournaments and stats for ${game.name}.` };
}

export default async function GameDetailPage({ params }) {
    const { slug } = await params;
    const game = await getGameBySlug(slug);

    if (!game) {
        notFound();
    }

    // Fetch all tournaments for this game
    const tournaments = await getTournaments({ gameId: game.id });
    const liveTournaments = tournaments.filter(t => t.status === 'live');
    const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming');
    const completedTournaments = tournaments.filter(t => t.status === 'completed');

    return (
        <div className="page-container">
            {/* Game Header */}
            <div className="glass-card" style={{ padding: "3rem 2rem", marginBottom: "3rem", display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap", background: "linear-gradient(135deg, rgba(26,31,46,0.9), rgba(15,23,42,0.9))" }}>
                <div style={{ width: 100, height: 100, borderRadius: "20px", background: "rgba(99, 102, 241, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", border: "1px solid var(--border-color)", overflow: "hidden" }}>
                    {game.icon_url ? (
                        <img
                            src={game.icon_url}
                            alt={game.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : null}
                    <span style={{ display: game.icon_url ? 'none' : 'block' }}>🎮</span>
                </div>
                <div>
                    <h1 className="page-title" style={{ marginBottom: "0.5rem" }}>{game.name}</h1>
                    <div style={{ display: "flex", gap: "1rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                        <span className="badge badge-tier">{game.genre}</span>
                    </div>
                    <p style={{ color: "var(--text-muted)", maxWidth: 600 }}>
                        {game.description || `The premier destination for ${game.name} esports.`}
                    </p>
                </div>
            </div>

            {/* Tournaments Grid */}
            <div style={{ display: "grid", gap: "4rem" }}>
                {liveTournaments.length > 0 && (
                    <section>
                        <div className="section-header">
                            <h2 className="section-title">🔴 Live Events</h2>
                        </div>
                        <div className="grid-auto">
                            {liveTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
                        </div>
                    </section>
                )}

                {upcomingTournaments.length > 0 && (
                    <section>
                        <div className="section-header">
                            <h2 className="section-title">📅 Upcoming</h2>
                        </div>
                        <div className="grid-auto">
                            {upcomingTournaments.map(t => <TournamentCard key={t.id} tournament={t} />)}
                        </div>
                    </section>
                )}

                {completedTournaments.length > 0 && (
                    <section>
                        <div className="section-header">
                            <h2 className="section-title">✅ Recent Results</h2>
                        </div>
                        <div className="grid-auto">
                            {completedTournaments.slice(0, 8).map(t => <TournamentCard key={t.id} tournament={t} />)}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
