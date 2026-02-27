import { getPlayers } from "@/lib/queries";
import PlayerCard from "../components/PlayerCard";

export const metadata = {
    title: "Pro Player Rankings | KhelPediA",
    description: "Top professional esports players globally.",
};

export default async function PlayersPage() {
    const players = await getPlayers();

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Pro Player Rankings</h1>
                <p className="page-description">
                    The best professional athletes in the business. Ranked by career earnings.
                </p>
            </div>

            <div className="glass-card" style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {players.length > 0 ? (
                        players.map((p, index) => (
                            <PlayerCard key={p.id} player={p} rank={index + 1} />
                        ))
                    ) : (
                        <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>No players found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
