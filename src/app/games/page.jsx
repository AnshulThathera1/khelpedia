import { getGames } from "@/lib/queries";
import GameCard from "../components/GameCard";

export const metadata = {
    title: "Games | KhelPediA",
    description: "Browse all competitive esports titles.",
};

export default async function GamesPage() {
    const games = await getGames();

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Supported Games</h1>
                <p className="page-description">
                    Find tournaments, players, and stats for your favorite esports titles.
                </p>
            </div>

            <div className="grid-auto">
                {games.map((game) => (
                    <GameCard key={game.id} game={game} />
                ))}
            </div>
        </div>
    );
}
