import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import AdminDeleteButton from "../../components/AdminDeleteButton";

export const metadata = {
    title: "Manage Tournaments | KhelPediA Admin",
};

export default async function AdminTournamentsPage({ searchParams: searchParamsPromise }) {
    const searchParams = await searchParamsPromise;
    const supabase = await createClient();
    const query = searchParams.q || "";
    const page = parseInt(searchParams.page) || 1;
    const limit = 20;

    // Fetch tournaments
    let supabaseQuery = supabase
        .from("tournaments")
        .select(`
            *,
            games ( name )
        `, { count: "exact" })
        .order("is_custom", { ascending: false })
        .order("start_date", { ascending: false });

    if (query) {
        supabaseQuery = supabaseQuery.ilike("name", `%${query}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data: tournaments, count, error } = await supabaseQuery.range(from, to);

    const totalPages = Math.ceil((count || 0) / limit);

    // Server Action to toggle custom flag
    async function toggleCustomFlag(formData) {
        "use server";
        const id = formData.get("id");
        const currentStatus = formData.get("status") === "true";
        const supabaseServer = await createClient();
        await supabaseServer
            .from("tournaments")
            .update({ is_custom: !currentStatus })
            .eq("id", id);
        revalidatePath("/admin/tournaments");
        revalidatePath("/tournaments");
    }

    // Server Action to delete a tournament
    async function deleteTournament(formData) {
        "use server";
        const id = formData.get("id");
        const supabaseServer = await createClient();
        await supabaseServer.from("tournaments").delete().eq("id", id);
        revalidatePath("/admin/tournaments");
        revalidatePath("/tournaments");
    }

    return (
        <div className="page-container">
            <div className="page-header" style={{ marginBottom: "2.5rem", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <h1 className="page-title">Manage Tournaments</h1>
                    <p className="page-description" style={{ margin: 0 }}>
                        {count || 0} tournaments found. Adjust details or prevent scraper overrides.
                    </p>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <form method="GET" action="/admin/tournaments" style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                            type="text"
                            name="q"
                            defaultValue={query}
                            placeholder="Search tournaments..."
                            className="filter-chip"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "white", padding: "0.5rem 1rem", outline: "none" }}
                        />
                        <button type="submit" className="btn btn-secondary">Search</button>
                    </form>
                </div>
            </div>

            {/* Warning Banner */}
            <div style={{ padding: "1rem", background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "8px", marginBottom: "2rem", display: "flex", gap: "1rem" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 12 16 2l-4 9 9 4-13 1z" /><path d="M14.5 17.5 12 21h-7l1.5-4.5" /></svg>
                <div style={{ color: "var(--text-primary)", fontSize: "0.95rem", lineHeight: 1.5 }}>
                    <strong>Manual Override:</strong> Set a tournament to <strong>"Manual Edit"</strong> to prevent the VLR.gg scraper from resetting your custom changes (like prize pools or dates).
                </div>
            </div>

            <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-color)", background: "rgba(10, 14, 23, 0.5)" }}>
                            <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase" }}>Tournament</th>
                            <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase" }}>Game & Tier</th>
                            <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase" }}>Status</th>
                            <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase" }}>Config</th>
                            <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tournaments && tournaments.length > 0 ? (
                            tournaments.map(t => (
                                <tr key={t.id} style={{ borderBottom: "1px solid rgba(148, 163, 184, 0.05)" }}>
                                    <td style={{ padding: "1.25rem 1.5rem" }}>
                                        <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>{t.name}</div>
                                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{new Date(t.start_date).toLocaleDateString()} — {t.region}</div>
                                    </td>
                                    <td style={{ padding: "1.25rem 1.5rem" }}>
                                        <div style={{ color: "var(--accent-cyan)", fontWeight: 600, fontSize: "0.9rem" }}>{t.games?.name}</div>
                                        <div style={{ display: "inline-block", background: "rgba(99, 102, 241, 0.1)", color: "#6366f1", fontSize: "0.7rem", fontWeight: 800, padding: "2px 6px", borderRadius: "4px", marginTop: "4px" }}>
                                            {t.tier} TIER
                                        </div>
                                    </td>
                                    <td style={{ padding: "1.25rem 1.5rem" }}>
                                        <span className={`badge badge-${t.status}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1.25rem 1.5rem" }}>
                                        <span style={{
                                            padding: "0.25rem 0.75rem",
                                            borderRadius: "12px",
                                            fontSize: "0.75rem",
                                            fontWeight: 700,
                                            background: t.is_custom ? "rgba(245, 158, 11, 0.1)" : "rgba(148, 163, 184, 0.05)",
                                            color: t.is_custom ? "#f59e0b" : "var(--text-muted)",
                                            border: `1px solid ${t.is_custom ? "rgba(245, 158, 11, 0.3)" : "rgba(148, 163, 184, 0.1)"}`
                                        }}>
                                            {t.is_custom ? "MANUAL" : "AUTO"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1.25rem 1.5rem", textAlign: "right" }}>
                                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                            <form action={toggleCustomFlag}>
                                                <input type="hidden" name="id" value={t.id} />
                                                <input type="hidden" name="status" value={t.is_custom} />
                                                <button type="submit" className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
                                                    {t.is_custom ? "Unlock" : "Lock"}
                                                </button>
                                            </form>
                                            <Link href={`/admin/tournaments/edit/${t.id}`} className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", textDecoration: "none" }}>
                                                Edit
                                            </Link>
                                            <AdminDeleteButton
                                                action={deleteTournament}
                                                id={t.id}
                                                label="Del"
                                                confirmMessage="Delete this tournament?"
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>No tournaments found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Simple Pagination */}
            {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "2rem" }}>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const p = i + 1;
                        return (
                            <Link
                                key={p}
                                href={`/admin/tournaments?q=${query}&page=${p}`}
                                className={`filter-chip ${page === p ? 'active' : ''}`}
                            >
                                {p}
                            </Link>
                        );
                    })}
                    {totalPages > 5 && <span style={{ color: "var(--text-muted)" }}>...</span>}
                </div>
            )}
        </div>
    );
}
