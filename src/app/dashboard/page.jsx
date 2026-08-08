"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerPushNotifications } from "@/lib/push";

export default function DashboardPage() {
    const supabase = createClient();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [riotAccount, setRiotAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pushStatus, setPushStatus] = useState("idle");
    const [linkForm, setLinkForm] = useState({ gameName: "", tagLine: "", region: "kr" });
    const [linkStatus, setLinkStatus] = useState({ loading: false, error: null, success: false });
    const router = useRouter();

    useEffect(() => {
        async function loadData() {
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError || !user) {
                    console.error("Dashboard: No user session found", userError);
                    router.push("/login");
                    return;
                }
                setUser(user);

                // Fetch Profile and Riot Account in parallel
                const [profileRes, riotRes] = await Promise.all([
                    supabase.from("profiles").select("*").eq("id", user.id).single(),
                    supabase.from("user_linked_accounts").select("*").eq("user_id", user.id).eq("provider", "riot").single()
                ]);

                if (profileRes.error && profileRes.error.code !== "PGRST116") {
                    console.error("Dashboard: Profile fetch error", profileRes.error);
                }
                setProfile(profileRes.data);

                if (riotRes.data) {
                    setRiotAccount(riotRes.data);
                }
            } catch (err) {
                console.error("Dashboard: Unexpected error", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [router]);

    const toggleNotification = async (field, value) => {
        const { error } = await supabase
            .from("profiles")
            .update({ [field]: value })
            .eq("id", user.id);

        if (!error) {
            setProfile({ ...profile, [field]: value });
        }
    };

    const handleEnablePush = async () => {
        setPushStatus("registering");
        const sub = await registerPushNotifications();
        if (sub) {
            setPushStatus("success");
            setProfile({ ...profile, push_notifications: true });
        } else {
            setPushStatus("error");
        }
    };

    const handleLinkAccount = async (e) => {
        e.preventDefault();
        setLinkStatus({ loading: true, error: null, success: false });
        
        if (!linkForm.gameName || !linkForm.tagLine) {
            setLinkStatus({ loading: false, error: "Game Name and Tag Line are required", success: false });
            return;
        }

        const { data, error } = await supabase
            .from("user_linked_accounts")
            .insert({
                user_id: user.id,
                provider: "riot",
                game_name: linkForm.gameName,
                tag_line: linkForm.tagLine,
                region: linkForm.region
            })
            .select()
            .single();

        if (error) {
            setLinkStatus({ loading: false, error: error.message, success: false });
        } else {
            setRiotAccount(data);
            setLinkStatus({ loading: false, error: null, success: true });
            setLinkForm({ gameName: "", tagLine: "", region: "kr" });
        }
    };

    if (loading) return <div className="page-container">Loading Headquarters...</div>;
    if (!user) return null; // Prevent crash during redirect

    return (
        <div className="page-container">
            <div className="page-header" style={{ textAlign: "center", marginBottom: "4rem" }}>
                <h1 className="page-title" style={{ fontSize: "3.5rem", fontWeight: 900, fontFamily: '"Rajdhani", sans-serif', textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>Commander Dashboard</h1>
                <p className="page-description" style={{ fontSize: "1.1rem", color: "var(--text-secondary)", maxWidth: "800px", margin: "0 auto 1.5rem" }}>
                    Welcome back. Your central command for connected accounts and personal stats.
                </p>
                <Link 
                    href={`/passport/${user.id}`} 
                    className="btn btn-primary"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.75rem 1.5rem",
                        fontSize: "1rem",
                        fontWeight: 700,
                        background: "linear-gradient(90deg, var(--accent-purple), var(--accent-cyan))",
                        borderColor: "transparent"
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    View My Esports Passport
                </Link>
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
                            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>{user.user_metadata?.full_name || user.user_metadata?.name || "Agent"}</h3>
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

                {/* Notification Preferences */}
                <div className="glass-card" style={{ padding: "2rem" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent-cyan)" }}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                        Notification Intel
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)" }}>Email Briefings</p>
                                <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>Receive tournament news and updates</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={profile?.email_notifications || false}
                                onChange={(e) => toggleNotification('email_notifications', e.target.checked)}
                                style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "var(--accent-cyan)" }}
                            />
                        </div>

                        <div style={{ padding: "1rem", background: "rgba(10, 14, 23, 0.5)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)" }}>Browser Push</p>
                                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>Get live alerts for match starts</p>
                                </div>
                                <input
                                    type="checkbox"
                                    disabled={!profile}
                                    checked={profile?.push_notifications || false}
                                    onChange={(e) => toggleNotification('push_notifications', e.target.checked)}
                                    style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "var(--accent-cyan)" }}
                                />
                            </div>

                            <button
                                onClick={handleEnablePush}
                                disabled={pushStatus === "success"}
                                className={`btn btn-${pushStatus === "success" ? "secondary" : "primary"}`}
                                style={{ width: "100%", fontSize: "0.85rem", padding: "0.5rem" }}
                            >
                                {pushStatus === "idle" && "Authorize Push Notifications"}
                                {pushStatus === "registering" && "Securely Registering..."}
                                {pushStatus === "success" && "✓ Push Protocol Online"}
                                {pushStatus === "error" && "Registration Failed - Try Again"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* API Connections Card */}
                <div className="glass-card" style={{ padding: "2rem" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.5rem", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent-purple)" }}><rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>
                        Connected Accounts
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {/* Riot Games Connection */}
                        <div style={{ 
                            padding: "1.25rem", 
                            background: "rgba(255, 70, 85, 0.05)", 
                            borderRadius: "var(--radius-md)", 
                            border: "1px solid rgba(255, 70, 85, 0.2)",
                            position: "relative",
                            overflow: "hidden"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff4655" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2L2 12L12 22L22 12L12 2Z" />
                                    </svg>
                                    <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem" }}>Riot Games</span>
                                </div>
                                {riotAccount ? (
                                    <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "#4ade80", textTransform: "uppercase", letterSpacing: "0.05em", background: "rgba(74, 222, 128, 0.1)", padding: "4px 10px", borderRadius: "20px", border: "1px solid rgba(74, 222, 128, 0.2)" }}>
                                        Verified
                                    </span>
                                ) : (
                                    <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                        Not Linked
                                    </span>
                                )}
                            </div>
                            
                            {riotAccount ? (
                                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <p style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>
                                            {riotAccount.game_name}<span style={{ opacity: 0.5 }}>#{riotAccount.tag_line}</span>
                                        </p>
                                    </div>
                                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", background: "rgba(0,0,0,0.2)", padding: "0.4rem 0.8rem", borderRadius: "var(--radius-md)" }}>
                                        Region: <span style={{ color: "#fff", textTransform: "uppercase" }}>{riotAccount.region}</span>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleLinkAccount} style={{ marginTop: "1rem" }}>
                                    <p style={{ margin: "0 0 1rem 0", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                                        Link your Riot account to unlock your unified KhelPediA Esports Passport for League of Legends and VALORANT.
                                    </p>
                                    
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                                        <div>
                                            <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Game Name</label>
                                            <input 
                                                type="text" 
                                                placeholder="Faker"
                                                value={linkForm.gameName}
                                                onChange={e => setLinkForm({...linkForm, gameName: e.target.value})}
                                                style={{ width: "100%", padding: "0.6rem", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "var(--radius-sm)", color: "#fff" }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Tag Line</label>
                                            <input 
                                                type="text" 
                                                placeholder="KR1"
                                                value={linkForm.tagLine}
                                                onChange={e => setLinkForm({...linkForm, tagLine: e.target.value})}
                                                style={{ width: "100%", padding: "0.6rem", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "var(--radius-sm)", color: "#fff" }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: "1rem" }}>
                                        <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Primary League of Legends Region</label>
                                        <select 
                                            value={linkForm.region}
                                            onChange={e => setLinkForm({...linkForm, region: e.target.value})}
                                            style={{ width: "100%", padding: "0.6rem", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "var(--radius-sm)", color: "#fff" }}
                                        >
                                            <option value="na1">North America (NA)</option>
                                            <option value="euw1">Europe West (EUW)</option>
                                            <option value="kr">Korea (KR)</option>
                                            <option value="ap">Asia Pacific (AP)</option>
                                        </select>
                                    </div>

                                    {linkStatus.error && (
                                        <div style={{ fontSize: "0.8rem", color: "#f87171", marginBottom: "1rem" }}>{linkStatus.error}</div>
                                    )}

                                    <button 
                                        type="submit"
                                        disabled={linkStatus.loading}
                                        className="btn btn-primary" 
                                        style={{ 
                                            width: "100%", 
                                            background: "#ff4655", 
                                            borderColor: "#ff4655",
                                            fontSize: "0.85rem",
                                            padding: "0.6rem",
                                            opacity: linkStatus.loading ? 0.7 : 1
                                        }}
                                    >
                                        {linkStatus.loading ? "Linking..." : "Link Riot Account"}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Other placeholders */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", background: "rgba(10, 14, 23, 0.5)", borderRadius: "var(--radius-md)", border: "1px dashed var(--border-color)", opacity: 0.6 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-muted)" }} />
                                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>Steam / OpenDota</span>
                            </div>
                            <button style={{ background: "transparent", border: "none", color: "var(--accent-cyan)", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>Connect</button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .btn-secondary { color: #f87171; border-color: rgba(248, 113, 113, 0.2); background: rgba(248, 113, 113, 0.05); }
                .btn-secondary:hover { background: rgba(248, 113, 113, 0.1); border-color: rgba(248, 113, 113, 0.4); }
            `}</style>
        </div>
    );
}
