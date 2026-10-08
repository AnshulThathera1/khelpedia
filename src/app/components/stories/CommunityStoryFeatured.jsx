import Link from "next/link";
import Image from "next/image";

export default function CommunityStoryFeatured({ story }) {
  if (!story) return null;

  const readingTime = story.content
    ? Math.max(1, Math.ceil(story.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length / 200))
    : 4;

  const formattedDate = story.published_at
    ? new Date(story.published_at).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : story.created_at
    ? new Date(story.created_at).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const gameName = story.game?.name || story.game_name || "Gaming";
  const categoryName = story.category || "Community Story";

  return (
    <section style={{ marginBottom: "4rem" }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media (max-width: 960px) {
            .community-featured-card {
              grid-template-columns: 1fr !important;
            }
            .community-featured-image-box {
              min-height: 280px !important;
              height: 320px !important;
            }
            .community-featured-content {
              padding: 2rem 1.5rem !important;
            }
            .community-featured-title {
              font-size: 1.75rem !important;
              margin-bottom: 0.85rem !important;
            }
            .community-featured-excerpt {
              font-size: 1rem !important;
              margin-bottom: 1.5rem !important;
            }
          }
          @media (max-width: 639px) {
            .community-featured-image-box {
              min-height: 220px !important;
              height: 240px !important;
            }
            .community-featured-content {
              padding: 1.25rem 1rem !important;
            }
            .community-featured-title {
              font-size: 1.35rem !important;
              line-height: 1.25 !important;
              margin-bottom: 0.65rem !important;
            }
            .community-featured-excerpt {
              font-size: 0.92rem !important;
              line-height: 1.55 !important;
              margin-bottom: 1.25rem !important;
              display: -webkit-box;
              -webkit-line-clamp: 3;
              -webkit-box-orient: vertical;
              overflow: hidden;
            }
            .community-featured-footer {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 1rem !important;
            }
            .community-featured-cta {
              width: 100% !important;
              justify-content: center !important;
            }
          }
        `,
        }}
      />
      <div
        className="card community-featured-card"
        style={{
          padding: 0,
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          border: "1px solid var(--border-color)",
          background: "var(--bg-card)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* Cover Image */}
        <div
          className="community-featured-image-box"
          style={{
            position: "relative",
            minHeight: "380px",
            background: "var(--bg-secondary)",
            overflow: "hidden",
          }}
        >
          {story.cover_image ? (
            <Image
              src={story.cover_image}
              alt={story.title}
              fill
              priority
              style={{ objectFit: "cover" }}
              sizes="(max-width: 900px) 100vw, 60vw"
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, rgba(255, 70, 85, 0.18), rgba(0, 189, 165, 0.18))",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
                padding: "2rem",
              }}
            >
              <span style={{ fontSize: "4.5rem" }}>🏆</span>
              <span
                style={{
                  fontFamily: '"Orbitron", sans-serif',
                  letterSpacing: "0.2em",
                  fontSize: "0.85rem",
                  color: "var(--accent-red)",
                  textTransform: "uppercase",
                  fontWeight: 800,
                }}
              >
                Featured Story
              </span>
            </div>
          )}

          {/* Overlay game badge */}
          <div
            style={{
              position: "absolute",
              top: "1.25rem",
              left: "1.25rem",
              display: "flex",
              gap: "8px",
              zIndex: 2,
            }}
          >
            <span
              style={{
                background: "rgba(15, 25, 35, 0.9)",
                backdropFilter: "blur(10px)",
                color: "var(--accent-cyan)",
                padding: "0.35rem 0.85rem",
                fontSize: "0.75rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                border: "1px solid rgba(0, 189, 165, 0.3)",
              }}
            >
              {gameName}
            </span>
          </div>
        </div>

        {/* Content Details */}
        <div
          className="community-featured-content"
          style={{
            padding: "2.5rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "1rem",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                background: "rgba(255, 70, 85, 0.12)",
                color: "var(--accent-red)",
                padding: "0.3rem 0.8rem",
                fontSize: "0.72rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                border: "1px solid rgba(255, 70, 85, 0.3)",
              }}
            >
              FEATURED STORY
            </span>
            <span
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text-secondary)",
                padding: "0.3rem 0.75rem",
                fontSize: "0.72rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                border: "1px solid var(--border-color)",
              }}
            >
              {categoryName}
            </span>
            {formattedDate && (
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                {formattedDate}
              </span>
            )}
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              • {readingTime} min read
            </span>
          </div>

          <h2
            className="community-featured-title"
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              lineHeight: 1.2,
              color: "var(--text-primary)",
              marginBottom: "1rem",
              fontFamily: '"Rajdhani", sans-serif',
            }}
          >
            <Link
              href={`/stories/${story.slug}`}
              style={{
                color: "inherit",
                textDecoration: "none",
              }}
            >
              {story.title}
            </Link>
          </h2>

          <p
            className="community-featured-excerpt"
            style={{
              color: "var(--text-secondary)",
              fontSize: "1.05rem",
              lineHeight: 1.6,
              marginBottom: "1.75rem",
            }}
          >
            {story.excerpt}
          </p>

          <div
            className="community-featured-footer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "auto",
              paddingTop: "1.25rem",
              borderTop: "1px solid var(--border-color)",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--gradient-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: 800,
                }}
              >
                {(story.player_name || story.author_name || "K")[0]}
              </div>
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  {story.player_name ? `Featuring ${story.player_name}` : story.author_name || "KhelPediA Staff"}
                </div>
                {story.player_ign && (
                  <div style={{ fontSize: "0.75rem", color: "var(--accent-cyan)", fontWeight: 600 }}>
                    IGN: {story.player_ign}
                  </div>
                )}
              </div>
            </div>

            <Link
              href={`/stories/${story.slug}`}
              className="btn btn-primary community-featured-cta"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "0.65rem 1.5rem",
                fontWeight: 700,
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Read Story &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
