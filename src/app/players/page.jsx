import { getPlayers } from "@/lib/queries";
import PlayerCard from "../components/PlayerCard";
import Pagination from "../components/Pagination";

export async function generateMetadata({ searchParams }) {
    const resolvedParams = await searchParams;
    const page = parseInt(resolvedParams.page) || 1;
    const isPaginated = page > 1;

    return {
        title: "Pro Player Rankings",
        description: "Browse the top professional esports players ranked by career earnings. View detailed statistics, team affiliations, and performance data across all major competitive titles.",
        alternates: {
            canonical: "/players",
        },
        ...(isPaginated ? {
            robots: {
                index: false,
                follow: true,
            },
        } : {}),
    };
}

export default async function PlayersPage({ searchParams }) {
    const resolvedParams = await searchParams;
    const page = parseInt(resolvedParams.page) || 1;
    const limit = 24;

    const { players, count } = await getPlayers({ page, limit, paginate: true }) || { players: [], count: 0 };
    const totalPages = Math.ceil(count / limit);

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
                            <PlayerCard key={p.id} player={p} rank={((page - 1) * limit) + index + 1} />
                        ))
                    ) : (
                        <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>No players found.</p>
                    )}
                </div>
            </div>

            {totalPages > 1 && (
                <div style={{ marginTop: "2rem" }}>
                    <Pagination currentPage={page} totalPages={totalPages} searchParams={resolvedParams} />
                </div>
            )}
        </div>
    );
}
