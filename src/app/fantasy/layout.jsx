import Link from "next/link";
import { Users, Trophy } from "lucide-react";

export default function FantasyLayout({ children }) {
    return (
        <div style={{ minHeight: "100vh" }}>
            <div className="page-container" style={{ paddingBottom: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
                    <div>
                        <h1 style={{ fontFamily: '"Rajdhani", sans-serif', fontSize: "3rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", lineHeight: 1, margin: "0 0 0.5rem 0" }}>
                            KhelPediA Pick'Ems
                        </h1>
                        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", margin: 0 }}>
                            Build your ultimate cross-game Esports organization.
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <Link href="/fantasy" className="btn" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", borderRadius: "var(--radius-md)" }}>
                            <Trophy className="w-4 h-4 text-[var(--accent-purple)]" />
                            League Hub
                        </Link>
                        <Link href="/fantasy/draft" className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", borderRadius: "var(--radius-md)", background: "var(--accent-cyan)", borderColor: "var(--accent-cyan)", color: "#000" }}>
                            <Users className="w-4 h-4" />
                            Manage Roster
                        </Link>
                    </div>
                </div>
            </div>
            
            {/* Page Content */}
            {children}
        </div>
    );
}
