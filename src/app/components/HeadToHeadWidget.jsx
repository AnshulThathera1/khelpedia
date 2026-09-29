import React from 'react';

export default function HeadToHeadWidget({ h2hStats, team1Name = 'Team 1', team2Name = 'Team 2' }) {
  if (!h2hStats || h2hStats.total_h2h === 0) {
    return null;
  }

  return (
    <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem", fontFamily: '"Rajdhani", sans-serif' }}>
        Head-to-Head Record
      </h3>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
        <div style={{ textAlign: "left" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600 }}>{team1Name}</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--accent-cyan)", fontFamily: '"Rajdhani", sans-serif' }}>
            {h2hStats.team1_wins} wins
          </div>
        </div>
        <div style={{ textAlign: "center", background: "var(--bg-secondary)", padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
          <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase", display: "block" }}>Meetings</span>
          <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", fontFamily: '"Rajdhani", sans-serif' }}>
            {h2hStats.total_h2h}
          </span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600 }}>{team2Name}</div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--accent-cyan)", fontFamily: '"Rajdhani", sans-serif' }}>
            {h2hStats.team2_wins} wins
          </div>
        </div>
      </div>
    </div>
  );
}
