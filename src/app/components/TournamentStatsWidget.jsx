import React from 'react';

export default function TournamentStatsWidget({ stats }) {
  if (!stats || stats.match_count === 0) {
    return null;
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : null;

  return (
    <section style={{ marginBottom: "3rem" }}>
      <h2 className="section-title" style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
        Tournament Metrics
      </h2>
      <div className="glass-card" style={{ padding: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1.5rem" }}>
          <div>
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase" }}>Tracked Matches</span>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-cyan)", fontFamily: '"Rajdhani", sans-serif' }}>
              {stats.match_count}
            </div>
          </div>
          {stats.maps_played > 0 && (
            <div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase" }}>Recorded Maps</span>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", fontFamily: '"Rajdhani", sans-serif' }}>
                {stats.maps_played}
              </div>
            </div>
          )}
          {stats.last_match_played && (
            <div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase" }}>Latest Activity</span>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "0.4rem" }}>
                {formatDate(stats.last_match_played)}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
