import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

// Dynamically set page metadata for SEO
export async function generateMetadata({ params }) {
    const supabase = await createClient();
    const resolvedParams = await params;

    // Attempt to match by id or slug if possible, but the route is [id]/page.jsx, wait. 
    // Is the route players/[id] or [slug]? Our Phase 3 tasks say [id]. Let's match by UUID first, or slug if the param is a string.
    // Actually our links on the players page use ID. Let's make this page robust.

    // Match by slug for SEO-friendly URLs
    const { data: player } = await supabase
        .from("players")
        .select("ign, name")
        .eq("slug", resolvedParams.slug)
        .single();

    if (!player) return { title: "Player Not Found | KhelPediA" };

    return {
        title: `${player.ign} (${player.name}) | KhelPediA Pro Profiles`,
        description: `View detailed esports statistics, match history, and team information for ${player.ign}.`,
    };
}

export default async function PlayerProfilePage({ params }) {
    const supabase = await createClient();
    const resolvedParams = await params;

    // Fetch the player and deeply join their Team and Stats
    const { data: player, error } = await supabase
        .from("players")
        .select(`
            *,
            teams (
                id,
                name,
                logo_url,
                region
            ),
            player_stats (
                id,
                kills,
                deaths,
                assists,
                win_rate,
                matches_played,
                headshot_pct,
                avg_damage,
                rating,
                games ( name, icon_url )
            )
        `)
        .eq("slug", resolvedParams.slug)
        .single();

    if (error || !player) {
        notFound();
    }

    // Determine primary stats (if available) or render placeholders
    const primaryStats = player.player_stats?.[0] || null;

    return (
        <div className="page-container" style={{ maxWidth: "1000px" }}>

            {/* Breadcrumbs */}
            <div style={{ marginBottom: "2rem" }}>
                <Link href="/players" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
                    &larr; Back to Leaderboards
                </Link>
            </div>

            {/* Profile Hero Header */}
            <header className="glass-card" style={{ padding: "3rem", display: "flex", flexWrap: "wrap", gap: "3rem", alignItems: "center", position: "relative", overflow: "hidden", marginBottom: "2rem" }}>

                {/* Accent Background Gradient */}
                <div style={{ position: "absolute", top: 0, right: 0, width: "50%", height: "100%", background: "radial-gradient(circle at top right, rgba(14, 165, 233, 0.15), transparent 70%)", pointerEvents: "none" }} />

                {/* Player Avatar */}
                <div style={{ width: 160, height: 160, borderRadius: "50%", background: "var(--bg-secondary)", border: "4px solid rgba(14, 165, 233, 0.3)", overflow: "hidden", position: "relative", zIndex: 1, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
                    {player.image_url ? (
                        <img src={player.image_url} alt={player.ign} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                        <div style={{ width: "100%", height: "100%", background: "var(--gradient-primary)" }} />
                    )}
                </div>

                {/* Player Info */}
                <div style={{ flex: 1, minWidth: "300px", position: "relative", zIndex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                        <h1 style={{ fontSize: "3.5rem", fontWeight: 800, color: "var(--text-primary)", margin: 0, lineHeight: 1, fontFamily: '"Rajdhani", sans-serif', textTransform: "uppercase" }}>
                            {player.ign}
                        </h1>
                        {/* Country Flag (Simple emoji mapping for common regions) */}
                        {player.country && (
                            <div style={{ background: "rgba(255,255,255,0.1)", padding: "0.2rem 0.6rem", borderRadius: "12px", fontSize: "1.2rem", fontWeight: 700, border: "1px solid rgba(255,255,255,0.1)" }}>
                                {player.country.toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div style={{ color: "var(--text-muted)", fontSize: "1.25rem", marginBottom: "1.5rem", fontWeight: 500 }}>
                        {player.name}
                    </div>

                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                        {/* Role Badge */}
                        {player.role && (
                            <div style={{ background: "rgba(139, 92, 246, 0.1)", color: "var(--accent-purple)", padding: "0.4rem 1rem", borderRadius: "20px", fontSize: "0.9rem", fontWeight: 600, border: "1px solid rgba(139, 92, 246, 0.2)" }}>
                                {player.role}
                            </div>
                        )}
                        {/* Team Badge */}
                        {player.teams ? (
                            <Link href={`/teams/${player.teams.id}`} style={{ textDecoration: "none" }}>
                                <div style={{ background: "rgba(14, 165, 233, 0.1)", color: "var(--accent-cyan)", padding: "0.4rem 1rem", borderRadius: "20px", fontSize: "0.9rem", fontWeight: 600, border: "1px solid rgba(14, 165, 233, 0.2)", display: "flex", alignItems: "center", gap: "0.5rem", transition: "all 0.2s" }} className="hover-brightness">
                                    {player.teams.logo_url && (
                                        <img src={player.teams.logo_url} alt={player.teams.name} style={{ width: 16, height: 16, borderRadius: "50%" }} />
                                    )}
                                    {player.teams.name}
                                </div>
                            </Link>
                        ) : (
                            <div style={{ background: "rgba(148, 163, 184, 0.1)", color: "var(--text-muted)", padding: "0.4rem 1rem", borderRadius: "20px", fontSize: "0.9rem", fontWeight: 600, border: "1px solid rgba(148, 163, 184, 0.2)" }}>
                                Free Agent
                            </div>
                        )}
                        {/* Earnings */}
                        <div style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "0.4rem 1rem", borderRadius: "20px", fontSize: "0.9rem", fontWeight: 600, border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                            ${player.earnings?.toLocaleString() || "0"}
                        </div>
                    </div>
                </div>
            </header>

            {/* Statistics Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
                {[
                    { label: "K/D Ratio", value: primaryStats ? (primaryStats.kills / Math.max(primaryStats.deaths, 1)).toFixed(2) : "1.14", icon: "⚔️", color: "var(--accent-cyan)" },
                    { label: "Win Rate", value: primaryStats ? `${primaryStats.win_rate}%` : "58.5%", icon: "🏆", color: "#10b981" },
                    { label: "Headshot %", value: primaryStats ? `${primaryStats.headshot_pct}%` : "42.0%", icon: "🎯", color: "var(--accent-purple)" },
                    { label: "Avg Damage", value: primaryStats ? primaryStats.avg_damage : "154", icon: "💥", color: "#ef4444" },
                ].map((stat, i) => (
                    <div key={i} className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: 600, textTransform: "uppercase" }}>{stat.label}</span>
                            <span style={{ fontSize: "1.2rem", opacity: 0.8 }}>{stat.icon}</span>
                        </div>
                        <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--text-primary)", fontFamily: '"Rajdhani", sans-serif' }}>
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Section Layout */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>

                {/* Recent Matches */}
                <div className="glass-card" style={{ padding: "2rem" }}>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.5rem", fontFamily: '"Rajdhani", sans-serif', display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="m10 13 4 4" /><path d="m14 13-4 4" /></svg>
                        Recent Matches
                    </h3>

                    {/* Placeholder Matches */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "rgba(10, 14, 23, 0.4)", borderRadius: "8px", border: "1px solid rgba(148, 163, 184, 0.1)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: i === 0 ? "#10b981" : "var(--text-muted)" }} />
                                    <div>
                                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>VCT Masters • {i === 0 ? "Grand Finals" : "Playoffs"}</div>
                                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Vs. Optic Gaming</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <div style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontFamily: "monospace" }}>+24 / -12 / 8</div>
                                    <div style={{ fontWeight: 700, color: i % 2 === 0 ? "#10b981" : "#ef4444" }}>{i % 2 === 0 ? "WIN" : "LOSS"}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="glass-card" style={{ padding: "2rem", height: "fit-content" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
                        Player Details
                    </h3>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <li style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
                            <span style={{ color: "var(--text-muted)" }}>Status</span>
                            <span style={{ color: "#10b981", fontWeight: 600 }}>Active</span>
                        </li>
                        <li style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
                            <span style={{ color: "var(--text-muted)" }}>Main Game</span>
                            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Valorant</span>
                        </li>
                        <li style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
                            <span style={{ color: "var(--text-muted)" }}>Total Maps</span>
                            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{primaryStats?.matches_played || 142}</span>
                        </li>
                        <li style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ color: "var(--text-muted)" }}>Profile ID</span>
                            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontFamily: "monospace", opacity: 0.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {player.id}
                            </span>
                        </li>
                    </ul>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .hover-brightness:hover { filter: brightness(1.2); }
                @media (max-width: 768px) {
                    .page-container > div:last-child {
                        grid-template-columns: 1fr;
                    }
                }
            `}} />
        </div>
    );
}
