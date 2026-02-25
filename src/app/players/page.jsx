import { getPlayers } from "@/lib/queries";
import PlayerCard from "../components/PlayerCard";

export const metadata = {
    title: "Player Rankings | KhelPediA",
    description: "Top esports players globally.",
};

export default async function PlayersPage() {
    const players = await getPlayers();

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Player Rankings</h1>
                <p className="page-description">
                    The best in the business. Ranked by earnings.
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
