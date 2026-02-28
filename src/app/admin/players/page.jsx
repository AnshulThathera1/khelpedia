import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export const metadata = {
    title: "Manage Custom Players | KhelPediA Admin",
};

export default async function AdminPlayersPage() {
    const supabase = await createClient();

    // Fetch all players to manage. Order custom ones first, then by name.
    const { data: players, error } = await supabase
        .from("players")
        .select(`
            *,
            teams ( name )
        `)
        .order("is_custom", { ascending: false })
        .order("name", { ascending: true });

    // Server Action to flag a player as custom and toggle their status
    async function toggleCustomFlag(formData) {
        "use server";
        const id = formData.get("id");
        const currentStatus = formData.get("status") === "true";
        const supabaseServer = await createClient();
        await supabaseServer
            .from("players")
            .update({ is_custom: !currentStatus })
            .eq("id", id);
        revalidatePath("/admin/players");
        revalidatePath("/players");
    }

    // Server Action to delete a custom player
    async function deletePlayer(formData) {
        "use server";
        const id = formData.get("id");
        const supabaseServer = await createClient();
        // Only allow deleting custom players to prevent breaking API references
        await supabaseServer.from("players").delete().eq("id", id).eq("is_custom", true);
        revalidatePath("/admin/players");
        revalidatePath("/players");
    }

    return (
        <div className="page-container">
            <div className="page-header" style={{ marginBottom: "2.5rem", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 className="page-title">Manage Custom Players</h1>
                    <p className="page-description" style={{ margin: 0 }}>
                        Create untracked players, or edit existing API players.
                    </p>
                </div>
                <Link href="/admin/players/new" className="btn btn-primary" style={{ textDecoration: "none" }}>
                    + Add New Player
                </Link>
            </div>

            {/* Warning Banner */}
            <div style={{ padding: "1rem", background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "8px", marginBottom: "2rem", display: "flex", gap: "1rem" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                <div style={{ color: "var(--text-primary)", fontSize: "0.95rem", lineHeight: 1.5 }}>
                    <strong>Important Note on API Scrapers:</strong> If you edit an automated PandaScore player, ensure they are flagged as <strong>"Manual Edit"</strong>. You must update your Python scraper to skip overwriting players where <code style={{ color: "#f59e0b" }}>is_custom = true</code>, otherwise the API will overwrite your manual changes within 6 hours.
                </div>
            </div>

            <div className="glass-card" style={{ padding: "0" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-color)", background: "rgba(10, 14, 23, 0.5)" }}>
                            <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase" }}>Player</th>
                            <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase" }}>Team & Role</th>
                            <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase" }}>Data Source</th>
                            <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players && players.length > 0 ? (
                            players.map(player => (
                                <tr key={player.id} style={{ borderBottom: "1px solid rgba(148, 163, 184, 0.05)" }}>
                                    <td style={{ padding: "1rem 1.5rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--bg-secondary)", overflow: "hidden" }}>
                                                {player.image_url ? (
                                                    <img src={player.image_url} alt={player.ign} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                ) : (
                                                    <div style={{ width: "100%", height: "100%", background: "var(--gradient-primary)" }} />
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem", fontSize: "1.05rem" }}>{player.ign}</div>
                                                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{player.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                        <div style={{ color: "var(--text-primary)", fontWeight: 500 }}>{player.teams?.name || "Free Agent"}</div>
                                        <div>{player.role || "Player"}</div>
                                    </td>
                                    <td style={{ padding: "1rem 1.5rem" }}>
                                        <span style={{
                                            padding: "0.25rem 0.75rem",
                                            borderRadius: "12px",
                                            fontSize: "0.8rem",
                                            fontWeight: 600,
                                            background: player.is_custom ? "rgba(139, 92, 246, 0.1)" : "rgba(14, 165, 233, 0.1)",
                                            color: player.is_custom ? "#8b5cf6" : "var(--accent-cyan)",
                                            border: `1px solid ${player.is_custom ? "rgba(139, 92, 246, 0.3)" : "rgba(14, 165, 233, 0.3)"}`
                                        }}>
                                            {player.is_custom ? "Manual Edit" : "API Synced"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1rem 1.5rem", textAlign: "right", display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>

                                        {/* Toggle Custom Status */}
                                        <form action={toggleCustomFlag}>
                                            <input type="hidden" name="id" value={player.id} />
                                            <input type="hidden" name="status" value={player.is_custom} />
                                            <button type="submit" className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }} title="Toggle whether the Python Scraper should overwrite this player">
                                                {player.is_custom ? "Lock to API" : "Lock to Manual"}
                                            </button>
                                        </form>

                                        {/* Edit Link */}
                                        <Link href={`/admin/players/edit/${player.id}`} className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", textDecoration: "none" }}>
                                            Edit
                                        </Link>

                                        {/* Delete Custom Player */}
                                        {player.is_custom && (
                                            <form action={deletePlayer} onSubmit={(e) => {
                                                if (!confirm('Are you sure you want to delete this custom player?')) e.preventDefault();
                                            }}>
                                                <input type="hidden" name="id" value={player.id} />
                                                <button type="submit" className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.3)" }}>
                                                    Delete
                                                </button>
                                            </form>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ padding: "3rem 1.5rem", textAlign: "center", color: "var(--text-muted)" }}>
                                    No players found in the database.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

