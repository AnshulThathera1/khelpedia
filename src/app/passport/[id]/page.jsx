import { createClient } from "@/utils/supabase/server";
import { getValorantProfile } from "@/app/actions/valorant";
import { getAccountByRiotId, getSummonerByPuuid, getLeagueEntriesBySummonerId } from "@/app/actions/lol";
import Link from "next/link";
import { Shield, Target, Trophy, Swords, Calendar } from "lucide-react";

export default async function PassportPage({ params }) {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Fetch User Profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).single();
    if (!profile) {
        return <div className="page-container text-center py-20 text-xl font-bold">Passport Not Found</div>;
    }

    // 2. Fetch Linked Accounts
    const { data: linkedAccounts } = await supabase.from("user_linked_accounts").select("*").eq("user_id", id);
    const riotAccount = linkedAccounts?.find(acc => acc.provider === "riot");

    // 3. Concurrently fetch Valorant and LoL stats if Riot account exists
    let valData = null;
    let lolData = null;
    let lolRank = null;

    if (riotAccount) {
        const { game_name, tag_line, region } = riotAccount;

        const [valRes, lolAccountRes] = await Promise.all([
            getValorantProfile(game_name, tag_line),
            getAccountByRiotId(game_name, tag_line, region)
        ]);

        if (valRes && !valRes.error) {
            valData = valRes;
        }

        if (lolAccountRes && lolAccountRes.data && !lolAccountRes.error) {
            const puuid = lolAccountRes.data.puuid;
            const summonerRes = await getSummonerByPuuid(puuid, region);
            if (summonerRes && summonerRes.data && !summonerRes.error) {
                lolData = summonerRes.data;
                const leagueRes = await getLeagueEntriesBySummonerId(summonerRes.data.id, region);
                if (leagueRes && leagueRes.data && !leagueRes.error) {
                    const soloQueue = leagueRes.data.find(entry => entry.queueType === "RANKED_SOLO_5x5");
                    if (soloQueue) lolRank = soloQueue;
                }
            }
        }
    }

    const valRankObj = valData?.tiersRes?.find(t => t.tier === valData?.playerStats?.summary?.currentRankTier);

    return (
        <div className="page-container" style={{ padding: "4rem 1rem", minHeight: "80vh" }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "2rem", marginBottom: "3rem" }}>
                    <div style={{ width: "120px", height: "120px", borderRadius: "50%", background: "var(--bg-secondary)", overflow: "hidden", border: "4px solid var(--border-color)", boxShadow: "0 0 40px rgba(0,0,0,0.5)" }}>
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt={profile.display_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>🎮</div>
                        )}
                    </div>
                    <div>
                        <h1 style={{ fontFamily: '"Rajdhani", sans-serif', fontSize: "3.5rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1, margin: "0 0 0.5rem 0" }}>
                            {profile.display_name || "Agent"}
                        </h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <Shield className="w-5 h-5 text-[var(--accent-purple)]" />
                            KhelPediA Verified Passport
                        </p>
                    </div>
                </div>

                {!riotAccount && (
                    <div className="glass-card" style={{ padding: "3rem", textAlign: "center" }}>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>No Game Accounts Linked</h2>
                        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>This user hasn't linked any game accounts to their Passport yet.</p>
                    </div>
                )}

                {riotAccount && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2rem" }}>
                        
                        {/* VALORANT CARD */}
                        <div className="glass-card" style={{ padding: "2rem", position: "relative", overflow: "hidden", borderTop: "4px solid #ff4655" }}>
                            <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.05 }}>
                                <Target className="w-64 h-64 text-[#ff4655]" />
                            </div>
                            
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", position: "relative", zIndex: 10 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <Target className="w-8 h-8 text-[#ff4655]" />
                                    <h2 style={{ fontSize: "1.8rem", fontWeight: 900, fontFamily: '"Rajdhani", sans-serif', textTransform: "uppercase", margin: 0 }}>VALORANT</h2>
                                </div>
                                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", background: "rgba(255,255,255,0.05)", padding: "4px 12px", borderRadius: "20px" }}>
                                    {riotAccount.game_name}#{riotAccount.tag_line}
                                </span>
                            </div>

                            {valData ? (
                                <div style={{ position: "relative", zIndex: 10 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem", background: "rgba(0,0,0,0.2)", padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
                                        {valRankObj ? (
                                            <img src={valRankObj.largeIcon} alt="Rank" style={{ width: "80px", height: "80px" }} />
                                        ) : (
                                            <div style={{ width: "80px", height: "80px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
                                        )}
                                        <div>
                                            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Current Rank</p>
                                            <p style={{ margin: 0, fontSize: "2rem", fontWeight: 900, fontFamily: '"Rajdhani", sans-serif', color: "#fff" }}>
                                                {valRankObj ? valRankObj.tierName : "Unranked"}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                        <div style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
                                            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Matches Played</p>
                                            <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>{valData.playerStats.summary.totalMatches}</p>
                                        </div>
                                        <div style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
                                            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Win Rate</p>
                                            <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>
                                                {valData.playerStats.summary.totalMatches > 0 ? Math.round((valData.playerStats.summary.wins / valData.playerStats.summary.totalMatches) * 100) : 0}%
                                            </p>
                                        </div>
                                        <div style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
                                            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Avg Combat Score</p>
                                            <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>{Math.round(valData.playerStats.summary.avgCombatScore)}</p>
                                        </div>
                                        <div style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
                                            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Headshot %</p>
                                            <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>{valData.playerStats.summary.avgHsPercent}%</p>
                                        </div>
                                    </div>
                                    
                                    <Link href={`/valorant/profile/${riotAccount.region}/${encodeURIComponent(riotAccount.game_name)}/${encodeURIComponent(riotAccount.tag_line)}`} className="btn btn-secondary mt-6" style={{ width: "100%", justifyContent: "center" }}>
                                        View Full VALORANT Profile
                                    </Link>
                                </div>
                            ) : (
                                <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>Could not load VALORANT stats. The player might not have played this act or the region is incorrect.</div>
                            )}
                        </div>

                        {/* LEAGUE OF LEGENDS CARD */}
                        <div className="glass-card" style={{ padding: "2rem", position: "relative", overflow: "hidden", borderTop: "4px solid #C89B3C" }}>
                            <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.05 }}>
                                <Trophy className="w-64 h-64 text-[#C89B3C]" />
                            </div>
                            
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", position: "relative", zIndex: 10 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <Trophy className="w-8 h-8 text-[#C89B3C]" />
                                    <h2 style={{ fontSize: "1.8rem", fontWeight: 900, fontFamily: '"Rajdhani", sans-serif', textTransform: "uppercase", margin: 0 }}>League of Legends</h2>
                                </div>
                                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", background: "rgba(255,255,255,0.05)", padding: "4px 12px", borderRadius: "20px" }}>
                                    {riotAccount.game_name}#{riotAccount.tag_line}
                                </span>
                            </div>

                            {lolData ? (
                                <div style={{ position: "relative", zIndex: 10 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem", background: "rgba(0,0,0,0.2)", padding: "1.5rem", borderRadius: "var(--radius-md)" }}>
                                        {lolRank ? (
                                            <div style={{ width: "80px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(200, 155, 60, 0.1)", borderRadius: "50%", border: "2px solid #C89B3C" }}>
                                                <span style={{ fontSize: "2rem", fontWeight: 900, color: "#C89B3C" }}>{lolRank.tier.charAt(0)}</span>
                                            </div>
                                        ) : (
                                            <div style={{ width: "80px", height: "80px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
                                        )}
                                        <div>
                                            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Ranked Solo/Duo</p>
                                            <p style={{ margin: 0, fontSize: "2rem", fontWeight: 900, fontFamily: '"Rajdhani", sans-serif', color: "#fff", textTransform: "capitalize" }}>
                                                {lolRank ? `${lolRank.tier} ${lolRank.rank}` : "Unranked"}
                                            </p>
                                            {lolRank && <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)" }}>{lolRank.leaguePoints} LP</p>}
                                        </div>
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                        <div style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
                                            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Summoner Level</p>
                                            <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>{lolData.summonerLevel}</p>
                                        </div>
                                        <div style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
                                            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Win Rate</p>
                                            <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>
                                                {lolRank && (lolRank.wins + lolRank.losses > 0) ? Math.round((lolRank.wins / (lolRank.wins + lolRank.losses)) * 100) : 0}%
                                            </p>
                                        </div>
                                        <div style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
                                            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Wins</p>
                                            <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#4ade80" }}>{lolRank ? lolRank.wins : 0}</p>
                                        </div>
                                        <div style={{ background: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
                                            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Losses</p>
                                            <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#f87171" }}>{lolRank ? lolRank.losses : 0}</p>
                                        </div>
                                    </div>
                                    
                                    <Link href={`/lol/profile/${riotAccount.region}/${encodeURIComponent(riotAccount.game_name)}/${encodeURIComponent(riotAccount.tag_line)}`} className="btn btn-secondary mt-6" style={{ width: "100%", justifyContent: "center" }}>
                                        View Full League Profile
                                    </Link>
                                </div>
                            ) : (
                                <div style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>Could not load League of Legends stats. Check if the region is correct.</div>
                            )}
                        </div>
                        
                    </div>
                )}
            </div>
        </div>
    );
}
