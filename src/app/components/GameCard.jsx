import Link from "next/link";

export default function GameCard({ game, tournamentCount }) {
    return (
        <Link
            href={`/games/${game.slug}`}
            style={{ textDecoration: "none", color: "inherit" }}
        >
            <div className="card" style={{ cursor: "pointer", textAlign: "center" }}>
                {/* Icon */}
                <div
                    style={{
                        width: 72,
                        height: 72,
                        borderRadius: "var(--radius-lg)",
                        background: "linear-gradient(135deg, var(--bg-secondary), rgba(99, 102, 241, 0.1))",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "2rem",
                        margin: "0 auto 1rem",
                        border: "1px solid var(--border-color)",
                        overflow: "hidden"
                    }}
                >
                    {game.icon_url ? (
                        <img
                            src={game.icon_url}
                            alt={game.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : null}
                    <span style={{ display: game.icon_url ? 'none' : 'block' }}>🎮</span>
                </div>

                <h3
                    style={{
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: 4,
                    }}
                >
                    {game.name}
                </h3>
                <p
                    style={{
                        color: "var(--text-muted)",
                        fontSize: "0.8rem",
                        marginBottom: "0.75rem",
                    }}
                >
                    {game.genre}
                </p>

                {tournamentCount !== undefined && (
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            background: "rgba(6, 214, 160, 0.1)",
                            color: "var(--accent-cyan)",
                            padding: "4px 12px",
                            borderRadius: 9999,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                        }}
                    >
                        🏆 {tournamentCount} Tournament{tournamentCount !== 1 ? "s" : ""}
                    </div>
                )}
            </div>
        </Link>
    );
}
