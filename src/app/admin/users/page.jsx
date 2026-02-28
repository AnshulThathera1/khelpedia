import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export const metadata = {
    title: "User Management | KhelPediA Admin",
};

export default async function AdminUsersPage() {
    const supabase = await createClient();

    // Fetch all user profiles
    const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

    // Server Action to toggle admin status
    async function toggleAdmin(formData) {
        "use server";
        const id = formData.get("id");
        const currentIsAdmin = formData.get("is_admin") === "true";

        const supabaseServer = await createClient();

        // Prevent admins from removing their own admin status (safety check)
        const { data: { user } } = await supabaseServer.auth.getUser();
        if (user && user.id === id) {
            console.error("Cannot remove your own admin status");
            return;
        }

        await supabaseServer
            .from("profiles")
            .update({ is_admin: !currentIsAdmin })
            .eq("id", id);

        revalidatePath("/admin/users");
    }

    return (
        <div className="page-container">
            <div className="page-header" style={{ marginBottom: "2.5rem" }}>
                <h1 className="page-title">User Management</h1>
                <p className="page-description">
                    View all registered users, their login providers, and manage administrative privileges.
                </p>
            </div>

            <div className="glass-card" style={{ padding: "0" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-color)", background: "rgba(10, 14, 23, 0.5)" }}>
                            <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase" }}>User</th>
                            <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase" }}>Email</th>
                            <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase" }}>Provider</th>
                            <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase" }}>Role</th>
                            <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {profiles && profiles.length > 0 ? (
                            profiles.map(profile => (
                                <tr key={profile.id} style={{ borderBottom: "1px solid rgba(148, 163, 184, 0.05)" }}>
                                    <td style={{ padding: "1rem 1.5rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg-secondary)", overflow: "hidden" }}>
                                                {profile.avatar_url ? (
                                                    <img src={profile.avatar_url} alt={profile.display_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                ) : (
                                                    <div style={{ width: "100%", height: "100%", background: "var(--gradient-primary)" }} />
                                                )}
                                            </div>
                                            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{profile.display_name || "New User"}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                        {profile.email}
                                    </td>
                                    <td style={{ padding: "1rem 1.5rem" }}>
                                        <span style={{
                                            padding: "0.2rem 0.6rem",
                                            borderRadius: "12px",
                                            fontSize: "0.75rem",
                                            fontWeight: 700,
                                            textTransform: "uppercase",
                                            background: "rgba(255,255,255,0.05)",
                                            color: "var(--text-primary)",
                                            border: "1px solid rgba(255,255,255,0.1)"
                                        }}>
                                            {profile.provider || "Unknown"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1rem 1.5rem" }}>
                                        <span style={{
                                            padding: "0.25rem 0.75rem",
                                            borderRadius: "12px",
                                            fontSize: "0.8rem",
                                            fontWeight: 600,
                                            background: profile.is_admin ? "rgba(239, 68, 68, 0.1)" : "rgba(148, 163, 184, 0.1)",
                                            color: profile.is_admin ? "#ef4444" : "var(--text-muted)",
                                            border: `1px solid ${profile.is_admin ? "rgba(239, 68, 68, 0.2)" : "rgba(148, 163, 184, 0.2)"}`
                                        }}>
                                            {profile.is_admin ? "Admin" : "User"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                                        <form action={toggleAdmin}>
                                            <input type="hidden" name="id" value={profile.id} />
                                            <input type="hidden" name="is_admin" value={profile.is_admin.toString()} />
                                            <button
                                                type="submit"
                                                className="btn btn-secondary"
                                                style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}
                                            >
                                                {profile.is_admin ? "Revoke Admin" : "Make Admin"}
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" style={{ padding: "3rem 1.5rem", textAlign: "center", color: "var(--text-muted)" }}>
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
