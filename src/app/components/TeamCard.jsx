import Link from "next/link";

export default function TeamCard({ team }) {
    return (
        <Link
            href={`/teams/${team.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
        >
            <div className="card card-purple" style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    {/* Logo */}
                    <div
                        style={{
                            width: 56,
                            height: 56,
                            borderRadius: "var(--radius-md)",
                            background: "var(--bg-secondary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.5rem",
                            fontWeight: 800,
                            color: "var(--accent-purple)",
                            flexShrink: 0,
                            border: "1px solid var(--border-color)",
                            overflow: "hidden"
                        }}
                    >
                        {team.logo_url ? (
                            <img
                                src={team.logo_url}
                                alt={team.name}
                                style={{ width: "100%", height: "100%", objectFit: "contain", padding: "4px" }}
                            />
                        ) : null}
                        <span style={{ display: team.logo_url ? 'none' : 'block' }}>
                            {team.name?.charAt(0)?.toUpperCase() || "T"}
                        </span>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                        <h3
                            style={{
                                fontSize: "1.05rem",
                                fontWeight: 700,
                                color: "var(--text-primary)",
                                marginBottom: 4,
                            }}
                        >
                            {team.name}
                        </h3>
                        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                                📍 {team.region || "Global"}
                            </span>
                            {team.country && (
                                <span
                                    style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}
                                >
                                    🏳️ {team.country}
                                </span>
                            )}
                            {team.founded_year && (
                                <span
                                    style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}
                                >
                                    📅 {team.founded_year}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
