export default function CommunityStatsHighlight({
  stats = [],
  title = "Career & Milestone Highlights",
  notes = "Statistics shown are based on screenshots provided to KhelPediA by the player.",
  subtitle = null,
}) {
  if (!stats || !Array.isArray(stats) || stats.length === 0) return null;

  return (
    <div
      className="card community-stats-box"
      style={{
        margin: "3rem 0",
        padding: "2rem",
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        borderLeft: "4px solid var(--accent-red)",
        position: "relative",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .community-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
            gap: 1.25rem;
          }
          @media (max-width: 768px) {
            .community-stats-box {
              padding: 1.5rem 1.25rem !important;
              margin: 2.25rem 0 !important;
            }
          }
          @media (max-width: 639px) {
            .community-stats-box {
              padding: 1.25rem 0.85rem !important;
              margin: 1.75rem 0 !important;
            }
            .community-stats-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 0.65rem !important;
            }
            .community-stat-card {
              padding: 0.85rem 0.4rem !important;
            }
            .community-stat-value {
              font-size: 1.45rem !important;
            }
            .community-stat-label {
              font-size: 0.68rem !important;
            }
          }
        `,
        }}
      />
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            fontSize: "0.72rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "var(--accent-red)",
            marginBottom: "0.35rem",
            fontFamily: '"Orbitron", sans-serif',
          }}
        >
          TELEMETRY & RECORDED STATS
        </div>
        <h3
          style={{
            fontSize: "1.4rem",
            fontWeight: 800,
            color: "var(--text-primary)",
            margin: 0,
            fontFamily: '"Rajdhani", sans-serif',
          }}
        >
          {title}
        </h3>
        {subtitle && (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "0.35rem 0 0" }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Grid of Stat Items */}
      <div
        className="community-stats-grid"
        style={{
          marginBottom: notes ? "1.5rem" : 0,
        }}
      >
        {stats.map((stat, idx) => (
          <div
            key={stat.label || idx}
            className="community-stat-card"
            style={{
              background: "var(--bg-secondary)",
              padding: "1.25rem 1rem",
              border: "1px solid var(--border-color)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              transition: "transform 0.2s ease, border-color 0.2s ease",
            }}
          >
            <div
              className="community-stat-value"
              style={{
                fontFamily: '"Rajdhani", sans-serif',
                fontSize: "1.85rem",
                fontWeight: 800,
                color: "var(--accent-cyan)",
                lineHeight: 1.1,
                marginBottom: "0.35rem",
              }}
            >
              {stat.value}
            </div>
            <div
              className="community-stat-label"
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {stat.label}
            </div>
            {stat.subtext && (
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  marginTop: "0.2rem",
                }}
              >
                {stat.subtext}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Verification / Editorial Note */}
      {notes && (
        <div
          style={{
            paddingTop: "1rem",
            borderTop: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.5rem",
            color: "var(--text-muted)",
            fontSize: "0.82rem",
            lineHeight: 1.5,
          }}
        >
          <span style={{ color: "var(--accent-orange)", fontSize: "0.9rem" }}>ℹ</span>
          <span>{notes}</span>
        </div>
      )}
    </div>
  );
}
