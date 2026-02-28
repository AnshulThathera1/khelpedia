import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
    title: "Edit Player | KhelPediA Admin",
};

export default async function EditPlayerPage({ params }) {
    const supabase = await createClient();
    const resolvedParams = await params;

    // Fetch the player data
    const { data: player, error } = await supabase
        .from("players")
        .select("*")
        .eq("id", resolvedParams.id)
        .single();

    if (error || !player) {
        notFound();
    }

    // Fetch teams for the select dropdown
    const { data: teams } = await supabase.from("teams").select("id, name").order("name");

    async function updatePlayer(formData) {
        "use server";
        const id = formData.get("id");
        const name = formData.get("name");
        const ign = formData.get("ign");
        const slug = formData.get("slug");
        const role = formData.get("role");
        const country = formData.get("country");
        const image_url = formData.get("image_url");
        const team_id = formData.get("team_id") || null;
        const is_custom = formData.get("is_custom") === "on";

        const supabaseServer = await createClient();

        await supabaseServer.from("players").update({
            name,
            ign,
            slug,
            role,
            country,
            image_url,
            team_id,
            is_custom
        }).eq("id", id);

        redirect("/admin/players");
    }

    return (
        <div className="page-container" style={{ maxWidth: "800px" }}>
            <div className="page-header" style={{ marginBottom: "2.5rem" }}>
                <Link href="/admin/players" style={{ color: "var(--accent-cyan)", textDecoration: "none", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                    &larr; Back to Players
                </Link>
                <h1 className="page-title">Edit Player: {player.ign}</h1>
                <p className="page-description">
                    Modify this player's details. If they are an API-synced player, ensure you check "Manual Edit Override" so the automated scraper doesn't overwrite your changes.
                </p>
            </div>

            <div className="glass-card" style={{ padding: "2.5rem" }}>
                <form action={updatePlayer} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <input type="hidden" name="id" value={player.id} />

                    {/* IGN & Real Name */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label htmlFor="ign" style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>In-Game Name (IGN)</label>
                            <input
                                type="text"
                                id="ign"
                                name="ign"
                                required
                                defaultValue={player.ign}
                                style={{ padding: "0.8rem", borderRadius: "8px", background: "rgba(10, 14, 23, 0.5)", border: "1px solid var(--border-color)", color: "white", width: "100%" }}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label htmlFor="name" style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>Real Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                defaultValue={player.name}
                                style={{ padding: "0.8rem", borderRadius: "8px", background: "rgba(10, 14, 23, 0.5)", border: "1px solid var(--border-color)", color: "white", width: "100%" }}
                            />
                        </div>
                    </div>

                    {/* Slug */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label htmlFor="slug" style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>URL Slug <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(e.g. tenz-tyson-ngo)</span></label>
                        <input
                            type="text"
                            id="slug"
                            name="slug"
                            required
                            defaultValue={player.slug}
                            style={{ padding: "0.8rem", borderRadius: "8px", background: "rgba(10, 14, 23, 0.5)", border: "1px solid var(--border-color)", color: "white", width: "100%", fontFamily: "monospace" }}
                        />
                    </div>

                    {/* Role & Country */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label htmlFor="role" style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>Role</label>
                            <input
                                type="text"
                                id="role"
                                name="role"
                                defaultValue={player.role || ""}
                                style={{ padding: "0.8rem", borderRadius: "8px", background: "rgba(10, 14, 23, 0.5)", border: "1px solid var(--border-color)", color: "white", width: "100%" }}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label htmlFor="country" style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>Country Code <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(e.g. US, KR)</span></label>
                            <input
                                type="text"
                                id="country"
                                name="country"
                                maxLength={2}
                                defaultValue={player.country || ""}
                                style={{ padding: "0.8rem", borderRadius: "8px", background: "rgba(10, 14, 23, 0.5)", border: "1px solid var(--border-color)", color: "white", width: "100%", textTransform: "uppercase" }}
                            />
                        </div>
                    </div>

                    {/* Team Dropdown */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label htmlFor="team_id" style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>Active Team</label>
                        <select
                            id="team_id"
                            name="team_id"
                            defaultValue={player.team_id || ""}
                            style={{ padding: "0.8rem", borderRadius: "8px", background: "rgba(10, 14, 23, 0.5)", border: "1px solid var(--border-color)", color: "white", width: "100%" }}
                        >
                            <option value="">-- Free Agent / Undefined --</option>
                            {teams && teams.map(team => (
                                <option key={team.id} value={team.id}>{team.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Image */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label htmlFor="image_url" style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>Profile Image URL</label>
                        <input
                            type="url"
                            id="image_url"
                            name="image_url"
                            defaultValue={player.image_url || ""}
                            style={{ padding: "0.8rem", borderRadius: "8px", background: "rgba(10, 14, 23, 0.5)", border: "1px solid var(--border-color)", color: "white", width: "100%" }}
                        />
                    </div>

                    {/* Custom Override Checkbox */}
                    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", padding: "1.5rem", background: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "8px", marginTop: "1rem" }}>
                        <input
                            type="checkbox"
                            id="is_custom"
                            name="is_custom"
                            defaultChecked={player.is_custom}
                            style={{ width: "20px", height: "20px", accentColor: "#8b5cf6", marginTop: "2px" }}
                        />
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            <label htmlFor="is_custom" style={{ fontWeight: 700, color: "var(--text-primary)", cursor: "pointer" }}>
                                Manual Edit Override <span style={{ color: "var(--accent-purple)" }}>(Recommended)</span>
                            </label>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0, lineHeight: 1.5 }}>
                                When checked, the automated PandaScore GitHub Action will completely ignore this player and will not overwrite your manual changes during its 6-hour sync.
                            </p>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                        <Link href="/admin/players" className="btn btn-secondary" style={{ padding: "0.8rem 1.5rem", textDecoration: "none", textAlign: "center", flex: 1 }}>
                            Cancel
                        </Link>
                        <button type="submit" className="btn btn-primary" style={{ padding: "0.8rem 2rem", flex: 2, fontSize: "1rem", fontWeight: 700 }}>
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
