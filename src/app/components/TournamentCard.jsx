import Link from "next/link";

export default function TournamentCard({ tournament }) {
    const statusColors = {
        live: { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "rgba(239, 68, 68, 0.3)" },
        upcoming: { bg: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", border: "rgba(59, 130, 246, 0.3)" },
        completed: { bg: "rgba(6, 214, 160, 0.15)", color: "#06d6a0", border: "rgba(6, 214, 160, 0.3)" },
    };

    const statusStyle = statusColors[tournament.status] || statusColors.upcoming;

    const formatPrize = (amount) => {
        if (!amount) return "TBA";
        return amount >= 1000000
            ? `$${(amount / 1000000).toFixed(1)}M`
            : `$${(amount / 1000).toFixed(0)}K`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <Link
            href={`/tournaments/${tournament.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
        >
            <div className="card" style={{ cursor: "pointer" }}>
                {/* Header row */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "1rem",
                    }}
                >
                    <div style={{ flex: 1 }}>
                        <h3
                            style={{
                                fontSize: "1.1rem",
                                fontWeight: 700,
                                color: "var(--text-primary)",
                                marginBottom: 4,
                            }}
                        >
                            {tournament.name}
                        </h3>
                        <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "6px" }}>
                            {tournament.games?.icon_url && (
                                <img src={tournament.games.icon_url} alt={tournament.games.name} style={{ width: 14, height: 14, objectFit: "cover", borderRadius: "2px" }} />
                            )}
                            {tournament.games?.name || "Multi-Game"}
                        </div>
                    </div>
                    <span
                        className={`badge badge-${tournament.status}`}
                        style={{
                            background: statusStyle.bg,
                            color: statusStyle.color,
                            border: `1px solid ${statusStyle.border}`,
                            flexShrink: 0,
                        }}
                    >
                        {tournament.status === "live" && (
                            <span
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    background: "#ef4444",
                                    display: "inline-block",
                                    animation: "pulse-dot 1.5s infinite",
                                    marginRight: 4,
                                }}
                            />
                        )}
                        {tournament.status}
                    </span>
                </div>

                {/* Details */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "0.75rem",
                    }}
                >
                    <div>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Prize Pool
                        </p>
                        <p style={{ color: "var(--accent-cyan)", fontWeight: 700, fontSize: "1.1rem" }}>
                            {formatPrize(tournament.prize_pool)}
                        </p>
                    </div>
                    <div>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Region
                        </p>
                        <p style={{ color: "var(--text-primary)", fontWeight: 500, fontSize: "0.9rem" }}>
                            {tournament.region || "Global"}
                        </p>
                    </div>
                    <div>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Dates
                        </p>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                            {formatDate(tournament.start_date)}
                        </p>
                    </div>
                    <div>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            Tier
                        </p>
                        <span className="badge badge-tier">{tournament.tier || "A"}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
