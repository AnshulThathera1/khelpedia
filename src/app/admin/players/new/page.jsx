import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
    title: "Add New Player | KhelPediA Admin",
};

export default async function NewPlayerPage() {
    const supabase = await createClient();

    // Fetch teams for the select dropdown
    const { data: teams } = await supabase.from("teams").select("id, name").order("name");

    async function createPlayer(formData) {
        "use server";
        const name = formData.get("name");
        const ign = formData.get("ign");
        const slug = formData.get("slug");
        const role = formData.get("role");
        const country = formData.get("country");
        const image_url = formData.get("image_url");
        const team_id = formData.get("team_id") || null;

        // Brand new players created here are always Custom
        const is_custom = true;

        const supabaseServer = await createClient();

        await supabaseServer.from("players").insert([{
            name,
            ign,
            slug,
            role,
            country,
            image_url,
            team_id,
            is_custom
        }]);

        redirect("/admin/players");
    }

    return (
        <div className="page-container" style={{ maxWidth: "800px" }}>
            <div className="page-header" style={{ marginBottom: "2.5rem" }}>
                <Link href="/admin/players" style={{ color: "var(--accent-cyan)", textDecoration: "none", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                    &larr; Back to Players
                </Link>
                <h1 className="page-title">Add Custom Player</h1>
                <p className="page-description">
                    Manually add rising stars to the platform. Players created here are permanently marked as "Custom" to prevent the Pandascore API from accidentally overwriting or deleting them.
                </p>
            </div>

            <div className="glass-card" style={{ padding: "2.5rem" }}>
                <form action={createPlayer} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    {/* IGN & Real Name */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <label htmlFor="ign" style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>In-Game Name (IGN)</label>
                            <input
                                type="text"
                                id="ign"
                                name="ign"
                                required
                                placeholder="e.g. TenZ"
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
                                placeholder="e.g. Tyson Ngo"
                                style={{ padding: "0.8rem", borderRadius: "8px", background: "rgba(10, 14, 23, 0.5)", border: "1px solid var(--border-color)", color: "white", width: "100%" }}
                            />
                        </div>
                    </div>

                    {/* Slug */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label htmlFor="slug" style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>URL Slug <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(Must be unique, e.g. tenz-tyson-ngo)</span></label>
                        <input
                            type="text"
                            id="slug"
                            name="slug"
                            required
                            placeholder="tenz-tyson-ngo"
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
                                placeholder="e.g. Duelist, IGL"
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
                                placeholder="US"
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
                            placeholder="https://example.com/avatar.png"
                            style={{ padding: "0.8rem", borderRadius: "8px", background: "rgba(10, 14, 23, 0.5)", border: "1px solid var(--border-color)", color: "white", width: "100%" }}
                        />
                    </div>

                    {/* Readonly Status */}
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center", padding: "1.2rem", background: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "8px", marginTop: "1rem" }}>
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#8b5cf6", boxShadow: "0 0 10px #8b5cf6" }} />
                        <span style={{ fontWeight: 600, color: "var(--accent-purple)", fontSize: "0.95rem" }}>
                            This player will automatically be granted the <strong>"Manual Edit Override"</strong> flag to prevent API interference.
                        </span>
                    </div>

                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                        <Link href="/admin/players" className="btn btn-secondary" style={{ padding: "0.8rem 1.5rem", textDecoration: "none", textAlign: "center", flex: 1 }}>
                            Cancel
                        </Link>
                        <button type="submit" className="btn btn-primary" style={{ padding: "0.8rem 2rem", flex: 2, fontSize: "1rem", fontWeight: 700 }}>
                            Add Platform Player
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
