"use client";

import { useState } from "react";
import { Search, Plus, Trash2, Crosshair, Target, Shield, Zap, UserPlus } from "lucide-react";
import { removePlayer, verifyAndDraftPlayer } from "@/app/actions/fantasy";

export default function DraftBoard({ myTeam }) {
    const [gameFilter, setGameFilter] = useState("valorant");
    const [riotId, setRiotId] = useState("");
    const [isScouting, setIsScouting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    
    // Draft state
    const [activeSlot, setActiveSlot] = useState(null); // 1-5

    const handleScoutAndDraft = async (e) => {
        e.preventDefault();
        
        if (!activeSlot) {
            setErrorMsg("Please select an empty slot on the left first.");
            return;
        }
        
        if (!riotId.includes("#")) {
            setErrorMsg("Invalid format. Please use GameName#TagLine (e.g. Jethiya#021)");
            return;
        }

        setErrorMsg("");
        setIsScouting(true);
        
        const [gameName, tagLine] = riotId.split("#");
        
        const res = await verifyAndDraftPlayer(myTeam.id, gameFilter, gameName.trim(), tagLine.trim(), activeSlot);
        
        if (res.error) {
            setErrorMsg(res.error);
        } else {
            setActiveSlot(null);
            setRiotId("");
        }
        
        setIsScouting(false);
    };

    const handleRemove = async (slotIndex) => {
        await removePlayer(myTeam.id, slotIndex);
    };

    const getGameColor = (slug) => {
        switch(slug) {
            case 'valorant': return '#ff4655';
            case 'cs2': return '#f59e0b';
            case 'dota-2': return '#ef4444';
            case 'bgmi': return '#3b82f6';
            default: return 'var(--accent-cyan)';
        }
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: "2rem" }}>
            
            {/* LEFT: Current Roster */}
            <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem" }}>Your Roster</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                    Select an empty slot below, then use the scouting tool on the right to draft a player. Max 2 players per game.
                </p>

                {errorMsg && (
                    <div style={{ background: "rgba(248,113,113,0.1)", color: "#f87171", padding: "1rem", borderRadius: "var(--radius-sm)", marginBottom: "1rem", fontSize: "0.85rem", border: "1px solid rgba(248,113,113,0.2)" }}>
                        {errorMsg}
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {[1, 2, 3, 4, 5].map(slot => {
                        const drafted = myTeam.rosters?.find(r => r.slot_index === slot);
                        const isActive = activeSlot === slot;
                        
                        return (
                            <div 
                                key={slot}
                                onClick={() => !drafted && setActiveSlot(slot)}
                                style={{
                                    border: isActive ? "2px solid var(--accent-cyan)" : "1px solid rgba(255,255,255,0.1)",
                                    background: isActive ? "rgba(10, 14, 23, 0.8)" : "rgba(255,255,255,0.02)",
                                    padding: "1rem",
                                    borderRadius: "var(--radius-md)",
                                    cursor: drafted ? "default" : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    transition: "all 0.2s"
                                }}
                            >
                                {drafted ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", width: "100%" }}>
                                        <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(0,0,0,0.5)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${getGameColor(drafted.player.stats?.[0]?.game?.slug)}` }}>
                                            {drafted.player.image_url ? (
                                                <img src={drafted.player.image_url} alt={drafted.player.ign} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            ) : (
                                                <span style={{ fontSize: "1rem", color: "var(--text-muted)" }}>?</span>
                                            )}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontWeight: 700, fontSize: "1.1rem", color: "#fff" }}>{drafted.player.ign}</p>
                                            <div style={{ display: "flex", gap: "0.5rem", marginTop: "4px" }}>
                                                <span style={{ fontSize: "0.7rem", color: getGameColor(drafted.player.stats?.[0]?.game?.slug), background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: "10px", textTransform: "uppercase", fontWeight: 700 }}>
                                                    {drafted.player.stats?.[0]?.game?.slug}
                                                </span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleRemove(slot); }}
                                            style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer", padding: "0.5rem" }}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", width: "100%" }}>
                                        <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: isActive ? "2px dashed var(--accent-cyan)" : "2px dashed rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <span style={{ fontSize: "1.2rem", color: isActive ? "var(--accent-cyan)" : "var(--text-muted)", fontWeight: 700 }}>{slot}</span>
                                        </div>
                                        <p style={{ margin: 0, fontWeight: 600, color: isActive ? "#fff" : "var(--text-muted)" }}>
                                            {isActive ? "Ready to Scout..." : "Empty Slot"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* RIGHT: Dynamic Scouting Interface */}
            <div className="glass-card" style={{ padding: "0", display: "flex", flexDirection: "column", height: "fit-content" }}>
                
                <div style={{ padding: "2rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                        <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "var(--accent-cyan)", display: "flex", alignItems: "center", justifyContent: "center", color: "#000" }}>
                            <Crosshair className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Scout New Talent</h3>
                            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.9rem" }}>Draft ANY player in the world to your active slot.</p>
                        </div>
                    </div>

                    <form onSubmit={handleScoutAndDraft} style={{ marginTop: "2rem" }}>
                        
                        <div style={{ marginBottom: "1.5rem" }}>
                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-muted)" }}>1. Select Esports Title</label>
                            <select 
                                value={gameFilter}
                                onChange={e => setGameFilter(e.target.value)}
                                style={{ width: "100%", padding: "1rem", background: "rgba(0,0,0,0.3)", border: `1px solid ${getGameColor(gameFilter)}`, borderRadius: "var(--radius-sm)", color: "#fff", fontSize: "1rem", fontWeight: 600 }}
                            >
                                <option value="valorant">Valorant (Live API)</option>
                                <option value="cs2" disabled>CS2 (Coming Soon)</option>
                                <option value="dota-2" disabled>Dota 2 (Coming Soon)</option>
                                <option value="bgmi" disabled>BGMI (Coming Soon)</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: "2rem" }}>
                            <label style={{ display: "block", fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-muted)" }}>2. Enter Player Game ID</label>
                            <div style={{ position: "relative" }}>
                                <Search className="w-5 h-5 text-[var(--text-muted)]" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
                                <input 
                                    type="text"
                                    placeholder="e.g., Jethiya#021"
                                    value={riotId}
                                    onChange={e => setRiotId(e.target.value)}
                                    disabled={!activeSlot || isScouting}
                                    style={{ width: "100%", padding: "1rem 1rem 1rem 3rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "var(--radius-sm)", color: "#fff", fontSize: "1.1rem" }}
                                />
                            </div>
                            {!activeSlot && (
                                <p style={{ color: "var(--accent-purple)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                                    ↑ Click an empty slot on the left first to enable scouting.
                                </p>
                            )}
                        </div>

                        <button 
                            type="submit"
                            disabled={!activeSlot || isScouting || !riotId}
                            className="btn btn-primary"
                            style={{ 
                                width: "100%", 
                                justifyContent: "center", 
                                padding: "1rem",
                                fontSize: "1.1rem",
                                fontWeight: 700,
                                background: isScouting ? "rgba(255,255,255,0.1)" : "var(--accent-cyan)",
                                color: isScouting ? "var(--text-muted)" : "#000",
                                border: "none"
                            }}
                        >
                            {isScouting ? (
                                <>Scouting Player Data...</>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5 mr-2" />
                                    Verify & Draft Player
                                </>
                            )}
                        </button>
                    </form>
                </div>
                
                <div style={{ padding: "1.5rem", background: "rgba(255,255,255,0.02)" }}>
                    <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "1rem", textTransform: "uppercase" }}>How it works</h4>
                    <ul style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: 0, paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <li>We connect directly to the <strong>Riot Games API</strong> to verify the player exists.</li>
                        <li>If the player is valid, they are instantly added to our global database and drafted to your team.</li>
                        <li>Their real-world stats (K/D, Win Rate) will be used to calculate your weekly Fantasy Points!</li>
                    </ul>
                </div>

            </div>
            
        </div>
    );
}
