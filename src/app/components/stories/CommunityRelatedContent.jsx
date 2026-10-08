import Link from "next/link";

export default function CommunityRelatedContent({ game, playerProfile }) {
  const gameSlug = game?.slug;
  const gameName = game?.name || "Esports";

  const links = [];

  if (gameSlug) {
    links.push({
      href: `/games/${gameSlug}`,
      title: `${gameName} Hub`,
      description: `Explore tournaments, teams, and live standings for ${gameName}.`,
      tag: "GAME HUB",
    });
  }

  if (playerProfile) {
    links.push({
      href: `/players/${playerProfile.slug || playerProfile.id}`,
      title: `${playerProfile.ign} Pro Profile`,
      description: `View verified stats, tournament history, and match records.`,
      tag: "PRO PLAYER",
    });
  }

  links.push({
    href: "/tournaments",
    title: "Esports Tournaments",
    description: "Track live, upcoming, and completed championship events worldwide.",
    tag: "TOURNAMENTS",
  });

  links.push({
    href: "/blogs",
    title: "News & Analysis",
    description: "Read competitive guides, meta breakdowns, and tournament previews.",
    tag: "EDITORIAL",
  });

  return (
    <div
      className="card community-related-content"
      style={{
        margin: "3rem 0",
        padding: "2rem",
        background: "var(--bg-card)",
        border: "1px solid var(--border-color)",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .community-related-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1rem;
          }
          @media (max-width: 768px) {
            .community-related-content {
              padding: 1.5rem 1.25rem !important;
              margin: 2.25rem 0 !important;
            }
            .community-related-grid {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
          @media (max-width: 639px) {
            .community-related-content {
              padding: 1.25rem 1rem !important;
              margin: 1.75rem 0 !important;
            }
            .community-related-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `,
        }}
      />
      <div style={{ marginBottom: "1.25rem" }}>
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "var(--accent-cyan)",
            fontFamily: '"Orbitron", sans-serif',
            display: "block",
            marginBottom: "0.25rem",
          }}
        >
          EXPLORE KHELPEDIA
        </span>
        <h3
          style={{
            fontSize: "1.3rem",
            fontWeight: 800,
            color: "var(--text-primary)",
            margin: 0,
            fontFamily: '"Rajdhani", sans-serif',
          }}
        >
          Related Coverage & Hubs
        </h3>
      </div>

      <div className="community-related-grid">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              textDecoration: "none",
              padding: "1rem",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
              transition: "transform 0.2s ease, border-color 0.2s ease",
            }}
          >
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 800,
                color: "var(--accent-red)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {link.tag}
            </span>
            <span
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                fontFamily: '"Rajdhani", sans-serif',
              }}
            >
              {link.title}
            </span>
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                lineHeight: 1.4,
              }}
            >
              {link.description}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
