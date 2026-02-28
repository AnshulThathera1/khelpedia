import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
    title: "Admin CMS Dashboard | KhelPediA",
    description: "Restricted administrative controls.",
};

export default async function AdminDashboardPage() {
    const supabase = await createClient();

    // Fetch some basic stats for the dashboard
    const { count: blogCount } = await supabase
        .from("blogs")
        .select("*", { count: "exact", head: true });

    return (
        <div className="page-container">
            <div className="page-header" style={{ marginBottom: "2.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                    <div style={{ padding: "0.4rem 1rem", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderRadius: "20px", fontSize: "0.85rem", fontWeight: 700, border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                        RESTRICTED ACCESS
                    </div>
                </div>
                <h1 className="page-title">Content Management System</h1>
                <p className="page-description">
                    Create news articles, manage custom verified players, and moderate the KhelPediA platform.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>

                {/* Manage Blogs Tile */}
                <div className="glass-card" style={{ padding: "2rem", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                        </div>
                        <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>{blogCount || 0}</span>
                    </div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>Esports News & Blogs</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", flex: 1, marginBottom: "1.5rem" }}>Write and publish articles, tournament summaries, and announcements to the main news feed.</p>
                    <Link href="/admin/blogs" className="btn btn-secondary" style={{ width: "100%", textAlign: "center", padding: "0.8rem", textDecoration: "none" }}>
                        Manage Articles
                    </Link>
                </div>

                {/* Manage Custom Players Tile */}
                <div className="glass-card" style={{ padding: "2rem", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6" /><path d="M22 11h-6" /></svg>
                        </div>
                    </div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>Manage Players</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", flex: 1, marginBottom: "1.5rem" }}>Manually add new rising esports athletes or edit existing API-synced players with manual overrides.</p>
                    <Link href="/admin/players" className="btn btn-secondary" style={{ width: "100%", textAlign: "center", padding: "0.8rem", textDecoration: "none" }}>
                        Manage Players
                    </Link>
                </div>

                {/* Manage Users Tile */}
                <div className="glass-card" style={{ padding: "2rem", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        </div>
                    </div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>User Management</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", flex: 1, marginBottom: "1.5rem" }}>View all registered users, their login providers, and manage administrative privileges.</p>
                    <Link href="/admin/users" className="btn btn-secondary" style={{ width: "100%", textAlign: "center", padding: "0.8rem", textDecoration: "none" }}>
                        Manage Users
                    </Link>
                </div>

                {/* Marketing & Notifications Tile */}
                <div className="glass-card" style={{ padding: "2rem", display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(14, 165, 233, 0.1)", border: "1px solid rgba(14, 165, 233, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                        </div>
                    </div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>Marketing & Broadcasts</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", flex: 1, marginBottom: "1.5rem" }}>Send global push notifications and marketing emails to your users for tournament updates.</p>
                    <Link href="/admin/marketing" className="btn btn-secondary" style={{ width: "100%", textAlign: "center", padding: "0.8rem", textDecoration: "none" }}>
                        Open Campaign Manager
                    </Link>
                </div>

            </div>
        </div>
    );
}
