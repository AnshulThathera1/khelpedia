import Link from "next/link";

export default function CommunityPlayerCard({
  playerName,
  playerIgn,
  gameName,
  playerMode,
  playerUid,
  profileUrl,
}) {
  if (!playerName && !playerIgn) return null;

  return (
    <div
      className="card community-player-card"
      style={{
        margin: "3rem 0",
        padding: "2rem",
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        borderLeft: "4px solid var(--accent-cyan)",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media (max-width: 768px) {
            .community-player-card {
              padding: 1.5rem 1.25rem !important;
              margin: 2.25rem 0 !important;
            }
          }
          @media (max-width: 639px) {
            .community-player-card {
              padding: 1.25rem 1rem !important;
              margin: 1.75rem 0 !important;
            }
            .community-player-header {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 1rem !important;
            }
            .community-player-title {
              font-size: 1.35rem !important;
            }
            .community-player-btn {
              width: 100% !important;
              justify-content: center !important;
              text-align: center !important;
            }
          }
        `,
        }}
      />
      <div
        className="community-player-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "var(--accent-cyan)",
              marginBottom: "0.35rem",
              fontFamily: '"Orbitron", sans-serif',
            }}
          >
            PLAYER FEATURE
          </div>
          <h3
            className="community-player-title"
            style={{
              fontSize: "1.6rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              lineHeight: 1.2,
              margin: 0,
              fontFamily: '"Rajdhani", sans-serif',
            }}
          >
            {playerName}
            {playerIgn && (
              <span
                style={{
                  color: "var(--accent-red)",
                  marginLeft: "0.5rem",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  fontFamily: '"Outfit", "Segoe UI Symbol", "Apple Color Emoji", sans-serif',
                  wordBreak: "break-word",
                }}
              >
                &ldquo;{playerIgn}&rdquo;
              </span>
            )}
          </h3>
        </div>

        {/* Profile Link (only if a real verified profile URL exists) */}
        {profileUrl && (
          <Link
            href={profileUrl}
            className="btn btn-secondary community-player-btn"
            style={{
              textDecoration: "none",
              fontSize: "0.82rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              padding: "0.5rem 1rem",
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            View Profile &rarr;
          </Link>
        )}
      </div>

      {/* Meta tags */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          alignItems: "center",
          paddingTop: "0.75rem",
          borderTop: "1px solid var(--border-color)",
        }}
      >
        {gameName && (
          <div
            style={{
              background: "var(--bg-secondary)",
              padding: "0.35rem 0.75rem",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              border: "1px solid var(--border-color)",
            }}
          >
            <span style={{ color: "var(--text-muted)", marginRight: "4px" }}>Game:</span>
            {gameName}
          </div>
        )}

        {playerMode && (
          <div
            style={{
              background: "var(--bg-secondary)",
              padding: "0.35rem 0.75rem",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              border: "1px solid var(--border-color)",
            }}
          >
            <span style={{ color: "var(--text-muted)", marginRight: "4px" }}>Mode:</span>
            {playerMode}
          </div>
        )}

        {playerUid && (
          <div
            style={{
              background: "var(--bg-secondary)",
              padding: "0.35rem 0.75rem",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              border: "1px solid var(--border-color)",
              fontFamily: "monospace",
            }}
          >
            <span style={{ color: "var(--text-muted)", marginRight: "4px", fontFamily: "sans-serif" }}>UID:</span>
            {playerUid}
          </div>
        )}
      </div>
    </div>
  );
}
