import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
    title: "My Dashboard | KhelPediA",
    description: "Your personal esports dashboard and configured Riot API connections.",
};

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect("/login");
    }

    return (
        <div className="page-container">
            <div className="page-header" style={{ marginBottom: "2rem" }}>
                <h1 className="page-title">Commander Dashboard</h1>
                <p className="page-description">
                    Welcome back. Your central command for connected accounts and personal stats.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
                {/* Account Settings Card */}
                <div className="glass-card" style={{ padding: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                        <div style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            background: "var(--bg-secondary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid var(--border-color)",
                            overflow: "hidden"
                        }}>
                            {user.user_metadata?.avatar_url ? (
                                <img src={user.user_metadata.avatar_url} alt="Avatar" style={{ width: "100%", height: "100%" }} />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)" }}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            )}
                        </div>
                        <div>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>{user.user_metadata?.custom_claims?.global_name || user.user_metadata?.name || "Agent"}</h3>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>{user.email}</p>
                        </div>
                    </div>

                    <div style={{ background: "rgba(10, 14, 23, 0.5)", borderRadius: "var(--radius-md)", padding: "1rem", border: "1px solid var(--border-color)" }}>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
                            <strong style={{ color: "var(--text-primary)" }}>Account ID:</strong> <br />
                            <span style={{ wordBreak: "break-all", fontFamily: "monospace", opacity: 0.8 }}>{user.id}</span>
                        </p>
                    </div>

                    <form action="/auth/signout" method="post" style={{ marginTop: "1.5rem" }}>
                        <button className="btn btn-secondary" style={{ width: "100%", padding: "0.75rem", color: "#f87171", borderColor: "rgba(248, 113, 113, 0.2)", background: "rgba(248, 113, 113, 0.05)" }}>
                            Sign Out Protocol
                        </button>
                    </form>
                </div>

                {/* API Connections Card */}
                <div className="glass-card" style={{ padding: "2rem" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent-purple)" }}><rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>
                        Connected Accounts
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", background: "rgba(10, 14, 23, 0.5)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 10px #4ade80" }} />
                                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Riot Games (Mock)</span>
                            </div>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", background: "var(--bg-secondary)", padding: "2px 8px", borderRadius: "12px" }}>Active</span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", background: "rgba(10, 14, 23, 0.5)", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-color)", opacity: 0.6 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-muted)" }} />
                                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Steam / OpenDota</span>
                            </div>
                            <button style={{ background: "transparent", border: "none", color: "var(--accent-cyan)", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>Connect</button>
                        </div>
                    </div>

                    <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                        Once your Riot API Production application is fully approved, this dashboard will dynamically pull and display your verified personal match history and headshot percentages using your Riot Sign-On tokens.
                    </p>
                </div>
            </div>
        </div>
    );
}

