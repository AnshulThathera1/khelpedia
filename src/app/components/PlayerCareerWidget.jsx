import React from 'react';

export default function PlayerCareerWidget({ stats }) {
  if (!stats || !stats.matches_played || stats.matches_played === 0) {
    return null;
  }

  const kdRatio = (stats.kills != null && stats.deaths != null) 
    ? (stats.kills / Math.max(stats.deaths, 1)).toFixed(2) 
    : null;

  const statItems = [
    { label: "Matches Played", value: stats.matches_played, show: stats.matches_played > 0 },
    { label: "K/D Ratio", value: kdRatio, show: kdRatio != null },
    { label: "Win Rate", value: stats.win_rate != null ? `${stats.win_rate}%` : null, show: stats.win_rate != null && stats.win_rate > 0 },
    { label: "Headshot %", value: stats.headshot_pct != null ? `${stats.headshot_pct}%` : null, show: stats.headshot_pct != null && stats.headshot_pct > 0 },
    { label: "Avg Damage", value: stats.avg_damage, show: stats.avg_damage != null && stats.avg_damage > 0 },
    { label: "Rating", value: stats.rating, show: stats.rating != null && stats.rating > 0 }
  ].filter(item => item.show && item.value != null);

  if (statItems.length === 0) return null;

  return (
    <section style={{ marginBottom: "3rem" }}>
      <h2 className="section-title" style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
        Verified Statistics
      </h2>
      <div className="glass-card" style={{ padding: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1.5rem" }}>
          {statItems.map((item) => (
            <div key={item.label}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase" }}>{item.label}</span>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-cyan)", fontFamily: '"Rajdhani", sans-serif' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
