import { getRelatedCommunityStories } from "@/lib/queries";
import Link from "next/link";
import Image from "next/image";

export default async function RelatedStories({ currentSlug, gameId, category }) {
  const stories = await getRelatedCommunityStories(currentSlug, gameId, category, 3);

  if (!stories || stories.length === 0) return null;

  return (
    <section
      className="related-stories-section"
      style={{ marginTop: "4rem", borderTop: "1px solid var(--border-color)", paddingTop: "3rem" }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .related-stories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 1.5rem;
          }
          @media (max-width: 768px) {
            .related-stories-section {
              margin-top: 2.75rem !important;
              padding-top: 2rem !important;
            }
            .related-stories-grid {
              gap: 1.25rem !important;
            }
          }
          @media (max-width: 639px) {
            .related-stories-grid {
              grid-template-columns: 1fr !important;
              gap: 1rem !important;
            }
            .related-story-image-box {
              height: 170px !important;
            }
          }
        `,
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "var(--accent-red)",
              fontFamily: '"Orbitron", sans-serif',
              display: "block",
              marginBottom: "0.25rem",
            }}
          >
            DISCOVER MORE
          </span>
          <h3
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              margin: 0,
              fontFamily: '"Rajdhani", sans-serif',
              textTransform: "uppercase",
            }}
          >
            More Community Stories
          </h3>
        </div>

        <Link
          href="/stories"
          style={{
            color: "var(--accent-cyan)",
            textDecoration: "none",
            fontSize: "0.85rem",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          View All Stories &rarr;
        </Link>
      </div>

      <div className="related-stories-grid">
        {stories.map((story) => (
          <Link
            key={story.slug}
            href={`/stories/${story.slug}`}
            className="card related-story-card"
            style={{
              textDecoration: "none",
              padding: 0,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              transition: "transform 0.2s ease, border-color 0.2s ease",
            }}
          >
            <div
              className="related-story-image-box"
              style={{
                width: "100%",
                height: "140px",
                position: "relative",
                background: "var(--bg-secondary)",
              }}
            >
              {story.cover_image ? (
                <Image
                  src={story.cover_image}
                  alt={story.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(135deg, rgba(255, 70, 85, 0.15), rgba(0, 189, 165, 0.15))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "2rem" }}>🎮</span>
                </div>
              )}
            </div>

            <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.72rem",
                  color: "var(--accent-cyan)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  marginBottom: "0.5rem",
                }}
              >
                <span>{story.game?.name || story.game_name || "Gaming"}</span>
                <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>{story.category}</span>
              </div>

              <h4
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  lineHeight: 1.3,
                  margin: 0,
                  fontFamily: '"Rajdhani", sans-serif',
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {story.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
