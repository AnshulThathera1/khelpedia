import React from 'react';

export default function TeamStatsWidget({ stats, recentMatches = [], teamId }) {
  if (!stats || stats.total_matches === 0) {
    return null;
  }

  return (
    <section style={{ marginBottom: "3rem" }}>
      <h2 className="section-title" style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
        Team Performance
      </h2>
      <div className="glass-card" style={{ padding: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
          <div>
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase" }}>Matches</span>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", fontFamily: '"Rajdhani", sans-serif' }}>
              {stats.total_matches}
            </div>
          </div>
          <div>
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase" }}>Wins</span>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#10b981", fontFamily: '"Rajdhani", sans-serif' }}>
              {stats.wins}
            </div>
          </div>
          <div>
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase" }}>Losses</span>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#ef4444", fontFamily: '"Rajdhani", sans-serif' }}>
              {stats.losses}
            </div>
          </div>
          {stats.unresolved_matches > 0 && (
            <div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase" }}>Unresolved</span>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-muted)", fontFamily: '"Rajdhani", sans-serif' }}>
                {stats.unresolved_matches}
              </div>
            </div>
          )}
          <div>
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase" }}>Win Rate</span>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-cyan)", fontFamily: '"Rajdhani", sans-serif' }}>
              {stats.win_rate}%
            </div>
          </div>
        </div>

        {/* Recent Form Pill Indicators */}
        {recentMatches.length > 0 && (
          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.25rem", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase" }}>Recent Form:</span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {recentMatches.map((m) => {
                const isWinner = m.winner_id === teamId;
                const isUnresolved = !m.winner_id;
                const outcome = isUnresolved ? '?' : (isWinner ? 'W' : 'L');
                const bgColor = isUnresolved ? 'rgba(255, 255, 255, 0.1)' : (isWinner ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)');
                const textColor = isUnresolved ? 'var(--text-muted)' : (isWinner ? '#10b981' : '#ef4444');
                const borderColor = isUnresolved ? 'var(--border-color)' : (isWinner ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)');

                return (
                  <span
                    key={m.id}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "6px",
                      background: bgColor,
                      color: textColor,
                      border: `1px solid ${borderColor}`,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      fontFamily: '"Rajdhani", sans-serif'
                    }}
                    title={isUnresolved ? 'Match Outcome Pending / Unresolved' : (isWinner ? 'Victory' : 'Defeat')}
                  >
                    {outcome}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
