import { createClient } from "@/utils/supabase/server";
import { getActiveLeague, getUserFantasyTeam, getGlobalLeaderboard, createFantasyTeam } from "@/app/actions/fantasy";
import Link from "next/link";
import { PlusCircle, Trophy, Medal, Crown } from "lucide-react";
import { redirect } from "next/navigation";

export default async function FantasyDashboardPage() {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
        return (
            <div className="page-container" style={{ textAlign: "center", paddingTop: "4rem" }}>
                <h2>You must be logged in to play KhelPediA Pick'Ems.</h2>
                <Link href="/login" className="btn btn-primary mt-4">Login</Link>
            </div>
        );
    }

    const { data: activeLeague, error: leagueError } = await getActiveLeague();
    
    if (!activeLeague) {
        return <div className="page-container">No active fantasy league at the moment.</div>;
    }

    const { data: myTeam } = await getUserFantasyTeam(userData.user.id, activeLeague.id);
    const { data: leaderboard } = await getGlobalLeaderboard(activeLeague.id);

    return (
        <div className="page-container" style={{ paddingTop: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                
                {/* Left Column: My Team / Dashboard */}
                <div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Trophy className="w-5 h-5 text-[var(--accent-purple)]" />
                        My Organization
                    </h2>

                    {!myTeam ? (
                        <div className="glass-card" style={{ padding: "3rem", textAlign: "center", border: "1px dashed rgba(255,255,255,0.2)" }}>
                            <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "1rem" }}>You don't have a team yet!</h3>
                            <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
                                Create your org name and start drafting players across different esports titles to compete in the {activeLeague.name}.
                            </p>
                            <form action={async (formData) => {
                                "use server";
                                const name = formData.get("teamName");
                                await createFantasyTeam(name, activeLeague.id);
                                redirect("/fantasy/draft");
                            }}>
                                <input 
                                    name="teamName" 
                                    placeholder="e.g. Sentinels 2.0" 
                                    required 
                                    style={{ width: "100%", padding: "0.75rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--radius-sm)", color: "#fff", marginBottom: "1rem" }}
                                />
                                <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Register Organization
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
                            <div style={{ padding: "2rem", background: "linear-gradient(to right, rgba(10, 14, 23, 0.9), rgba(10, 14, 23, 0.5))", borderBottom: "1px solid var(--border-color)" }}>
                                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Team Name</p>
                                <h3 style={{ fontSize: "2rem", fontWeight: 900, fontFamily: '"Rajdhani", sans-serif', color: "#fff", margin: 0 }}>
                                    {myTeam.name}
                                </h3>
                                <div style={{ marginTop: "1.5rem", display: "inline-block", background: "rgba(255,255,255,0.05)", padding: "0.5rem 1rem", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.1)" }}>
                                    <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Total Points: </span>
                                    <span style={{ color: "var(--accent-cyan)", fontWeight: 800, fontSize: "1.2rem" }}>{myTeam.total_points}</span>
                                </div>
                            </div>
                            
                            <div style={{ padding: "1.5rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                    <h4 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>Active Roster</h4>
                                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{myTeam.rosters?.length || 0} / 5 Selected</span>
                                </div>
                                
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    {[1, 2, 3, 4, 5].map(slot => {
                                        const drafted = myTeam.rosters?.find(r => r.slot_index === slot);
                                        return (
                                            <div key={slot} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                                {drafted ? (
                                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(0,0,0,0.5)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                            {drafted.player.image_url ? (
                                                                <img src={drafted.player.image_url} alt={drafted.player.ign} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                            ) : (
                                                                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>?</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p style={{ margin: 0, fontWeight: 700, fontSize: "1rem", color: "#fff" }}>{drafted.player.ign}</p>
                                                            <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>{drafted.player.stats?.[0]?.game?.name}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", opacity: 0.5 }}>
                                                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1px dashed var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{slot}</span>
                                                        </div>
                                                        <p style={{ margin: 0, fontWeight: 600, fontSize: "0.9rem", color: "var(--text-muted)" }}>Empty Slot</p>
                                                    </div>
                                                )}
                                                
                                                {drafted && (
                                                    <div style={{ textAlign: "right" }}>
                                                        <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "var(--accent-cyan)" }}>+{drafted.points_earned}</p>
                                                        <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--text-muted)" }}>pts</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Global Leaderboard */}
                <div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Medal className="w-5 h-5 text-[var(--accent-cyan)]" />
                        Global Leaderboard
                    </h2>
                    
                    <div className="glass-card" style={{ padding: "0", overflow: "hidden" }}>
                        <div style={{ padding: "1rem 1.5rem", background: "rgba(0,0,0,0.3)", borderBottom: "1px solid var(--border-color)", display: "grid", gridTemplateColumns: "3rem 1fr 4rem", gap: "1rem" }}>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>RANK</span>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>TEAM</span>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textAlign: "right" }}>POINTS</span>
                        </div>
                        
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            {leaderboard && leaderboard.length > 0 ? (
                                leaderboard.map((team, index) => (
                                    <div key={team.id} style={{ 
                                        padding: "1rem 1.5rem", 
                                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                                        display: "grid", 
                                        gridTemplateColumns: "3rem 1fr 4rem", 
                                        gap: "1rem",
                                        alignItems: "center",
                                        background: index === 0 ? "rgba(200, 155, 60, 0.05)" : "transparent"
                                    }}>
                                        <div style={{ fontWeight: 800, fontSize: "1.2rem", color: index === 0 ? "#C89B3C" : (index === 1 ? "#A0AEC0" : (index === 2 ? "#CD7F32" : "var(--text-muted)")) }}>
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                {team.name}
                                                {index === 0 && <Crown className="w-4 h-4 text-[#C89B3C]" />}
                                            </p>
                                            <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>Manager: {team.user?.display_name || 'Agent'}</p>
                                        </div>
                                        <div style={{ fontWeight: 800, color: "var(--accent-cyan)", textAlign: "right" }}>
                                            {team.total_points}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                                    No teams have registered for this league yet. Be the first!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
