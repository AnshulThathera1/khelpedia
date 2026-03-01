import { getTournamentById, getGames } from "@/lib/queries";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function EditTournamentPage({ params: paramsPromise }) {
    const { id } = await paramsPromise;
    const tournament = await getTournamentById(id);
    const games = await getGames();

    if (!tournament) {
        notFound();
    }

    async function updateTournament(formData) {
        "use server";
        const supabase = await createClient();

        const updateData = {
            name: formData.get("name"),
            slug: formData.get("slug"),
            game_id: formData.get("game_id"),
            status: formData.get("status"),
            tier: formData.get("tier"),
            region: formData.get("region"),
            prize_pool: parseInt(formData.get("prize_pool")) || 0,
            currency: formData.get("currency") || "USD",
            start_date: formData.get("start_date"),
            end_date: formData.get("end_date"),
            description: formData.get("description"),
            logo_url: formData.get("logo_url"),
            is_custom: true // Automatically flag as custom when edited manually
        };

        const { error } = await supabase
            .from("tournaments")
            .update(updateData)
            .eq("id", id);

        if (error) {
            console.error("Update error:", error);
            return;
        }

        revalidatePath("/admin/tournaments");
        revalidatePath(`/tournaments/${id}`);
        revalidatePath("/tournaments");
        redirect("/admin/tournaments");
    }

    return (
        <div className="page-container" style={{ maxWidth: "800px" }}>
            <div className="page-header">
                <Link href="/admin/tournaments" style={{ color: "var(--accent-cyan)", textDecoration: "none", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                    ← Back to List
                </Link>
                <h1 className="page-title">Edit Tournament</h1>
                <p className="page-description">Update details for "{tournament.name}"</p>
            </div>

            <div className="glass-card" style={{ padding: "2.5rem" }}>
                <form action={updateTournament} style={{ display: "grid", gap: "1.5rem" }}>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>Tournament Name</label>
                            <input
                                type="text"
                                name="name"
                                defaultValue={tournament.name}
                                required
                                className="filter-chip"
                                style={{ width: "100%", background: "rgba(255,255,255,0.02)", color: "white", padding: "0.8rem", outline: "none", border: "1px solid var(--border-color)" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>Slug (unique key)</label>
                            <input
                                type="text"
                                name="slug"
                                defaultValue={tournament.slug}
                                required
                                className="filter-chip"
                                style={{ width: "100%", background: "rgba(255,255,255,0.02)", color: "white", padding: "0.8rem", outline: "none", border: "1px solid var(--border-color)" }}
                            />
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>Game</label>
                            <select
                                name="game_id"
                                defaultValue={tournament.game_id}
                                className="filter-chip"
                                style={{ width: "100%", background: "var(--bg-secondary)", color: "white", padding: "0.8rem", outline: "none", border: "1px solid var(--border-color)" }}
                            >
                                {games.map(game => (
                                    <option key={game.id} value={game.id} style={{ background: "var(--bg-primary)" }}>{game.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>Status</label>
                            <select
                                name="status"
                                defaultValue={tournament.status}
                                className="filter-chip"
                                style={{ width: "100%", background: "var(--bg-secondary)", color: "white", padding: "0.8rem", outline: "none", border: "1px solid var(--border-color)" }}
                            >
                                <option value="upcoming" style={{ background: "var(--bg-primary)" }}>Upcoming</option>
                                <option value="live" style={{ background: "var(--bg-primary)" }}>Live</option>
                                <option value="completed" style={{ background: "var(--bg-primary)" }}>Completed</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>Tier</label>
                            <select
                                name="tier"
                                defaultValue={tournament.tier}
                                className="filter-chip"
                                style={{ width: "100%", background: "var(--bg-secondary)", color: "white", padding: "0.8rem", outline: "none", border: "1px solid var(--border-color)" }}
                            >
                                <option value="S">S-Tier</option>
                                <option value="A">A-Tier</option>
                                <option value="B">B-Tier</option>
                                <option value="C">C-Tier</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>Prize Pool (USD)</label>
                            <input
                                type="number"
                                name="prize_pool"
                                defaultValue={tournament.prize_pool}
                                className="filter-chip"
                                style={{ width: "100%", background: "rgba(255,255,255,0.02)", color: "white", padding: "0.8rem", outline: "none", border: "1px solid var(--border-color)" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>Region</label>
                            <input
                                type="text"
                                name="region"
                                defaultValue={tournament.region}
                                className="filter-chip"
                                style={{ width: "100%", background: "rgba(255,255,255,0.02)", color: "white", padding: "0.8rem", outline: "none", border: "1px solid var(--border-color)" }}
                            />
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>Start Date</label>
                            <input
                                type="date"
                                name="start_date"
                                defaultValue={tournament.start_date ? tournament.start_date.split('T')[0] : ''}
                                className="filter-chip"
                                style={{ width: "100%", background: "rgba(255,255,255,0.02)", color: "white", padding: "0.8rem", outline: "none", border: "1px solid var(--border-color)" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>End Date</label>
                            <input
                                type="date"
                                name="end_date"
                                defaultValue={tournament.end_date ? tournament.end_date.split('T')[0] : ''}
                                className="filter-chip"
                                style={{ width: "100%", background: "rgba(255,255,255,0.02)", color: "white", padding: "0.8rem", outline: "none", border: "1px solid var(--border-color)" }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>Event Logo URL</label>
                        <input
                            type="text"
                            name="logo_url"
                            defaultValue={tournament.logo_url}
                            placeholder="https://..."
                            className="filter-chip"
                            style={{ width: "100%", background: "rgba(255,255,255,0.02)", color: "white", padding: "0.8rem", outline: "none", border: "1px solid var(--border-color)" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>Description</label>
                        <textarea
                            name="description"
                            defaultValue={tournament.description}
                            rows={4}
                            className="filter-chip"
                            style={{ width: "100%", background: "rgba(255,255,255,0.02)", color: "white", padding: "0.8rem", outline: "none", border: "1px solid var(--border-color)", resize: "vertical" }}
                        />
                    </div>

                    <div style={{ padding: "1rem", background: "rgba(99, 102, 241, 0.05)", border: "1px solid rgba(99, 102, 241, 0.1)", borderRadius: "8px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        💡 Saving this form will automatically flag this tournament as <strong>"Manual Edit"</strong>, meaning the VLR scraper will not overwrite your changes.
                    </div>

                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: "1rem" }}>
                            Save Changes
                        </button>
                        <Link href="/admin/tournaments" className="btn btn-secondary" style={{ padding: "1rem", textDecoration: "none" }}>
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
