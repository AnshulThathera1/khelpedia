import { getGames } from "@/lib/queries";
import GameCard from "../components/GameCard";

export const metadata = {
    title: "Supported Games",
    description: "Find tournaments, players, and stats for your favorite esports titles. KhelPediA covers Valorant, CS2, BGMI, Dota 2, Free Fire, PUBG Mobile, and more.",
    alternates: {
        canonical: "/games",
    },
};

export default async function GamesPage() {
    const games = await getGames() || [];

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Supported Games</h1>
                <p className="page-description">
                    Find tournaments, players, and stats for your favorite esports titles.
                </p>
            </div>

            <div className="grid-auto">
                {games.length > 0 ? (
                    games.map((game) => (
                        <GameCard key={game.id} game={game} />
                    ))
                ) : (
                    <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>
                        No games found.
                    </p>
                )}
            </div>
        </div>
    );
}
