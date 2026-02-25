import Link from "next/link";

export default function PlayerCard({ player, rank }) {
    const formatEarnings = (amount) => {
        if (!amount) return "$0";
        return amount >= 1000000
            ? `$${(amount / 1000000).toFixed(1)}M`
            : amount >= 1000
                ? `$${(amount / 1000).toFixed(0)}K`
                : `$${amount}`;
    };

    return (
        <Link
            href={`/players/${player.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
        >
            <div className="card" style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    {/* Rank */}
                    {rank && (
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                background:
                                    rank <= 3
                                        ? rank === 1
                                            ? "linear-gradient(135deg, #f59e0b, #d97706)"
                                            : rank === 2
                                                ? "linear-gradient(135deg, #94a3b8, #64748b)"
                                                : "linear-gradient(135deg, #b45309, #92400e)"
                                        : "var(--bg-secondary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                color: rank <= 3 ? "#fff" : "var(--text-muted)",
                                flexShrink: 0,
                            }}
                        >
                            {rank}
                        </div>
                    )}

                    {/* Avatar */}
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #8b5cf6, #06d6a0)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.2rem",
                            fontWeight: 700,
                            color: "#fff",
                            flexShrink: 0,
                        }}
                    >
                        {player.ign?.charAt(0)?.toUpperCase() || "?"}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h3
                            style={{
                                fontSize: "1rem",
                                fontWeight: 700,
                                color: "var(--text-primary)",
                                marginBottom: 2,
                            }}
                        >
                            {player.ign}
                        </h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                            {player.name}
                            {player.teams && (
                                <span style={{ color: "var(--accent-cyan)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                    {" · "}
                                    {player.teams.logo_url && (
                                        <img src={player.teams.logo_url} alt={player.teams.name} style={{ width: 14, height: 14, objectFit: "contain" }} />
                                    )}
                                    {player.teams.name}
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Earnings */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p
                            style={{
                                color: "var(--accent-cyan)",
                                fontWeight: 700,
                                fontSize: "1rem",
                            }}
                        >
                            {formatEarnings(player.earnings)}
                        </p>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
                            {player.country || ""}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
