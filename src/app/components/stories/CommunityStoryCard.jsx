import Link from "next/link";
import Image from "next/image";

export default function CommunityStoryCard({ story }) {
  if (!story) return null;

  const readingTime = story.content
    ? Math.max(1, Math.ceil(story.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length / 200))
    : 3;

  const formattedDate = story.published_at
    ? new Date(story.published_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : story.created_at
    ? new Date(story.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const gameName = story.game?.name || story.game_name || "Gaming";
  const categoryName = story.category || "Community Story";

  return (
    <article
      className="card community-story-card"
      style={{
        padding: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        border: "1px solid var(--border-color)",
        background: "var(--bg-card)",
        transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .story-card-content {
            padding: 1.5rem;
          }
          .story-card-title {
            font-size: 1.25rem;
            line-height: 1.3;
          }
          .story-card-author-name {
            max-width: 180px;
          }
          @media (max-width: 768px) {
            .story-card-content {
              padding: 1.15rem !important;
            }
            .story-card-title {
              font-size: 1.15rem !important;
            }
            .story-card-author-name {
              max-width: 130px !important;
            }
          }
          @media (max-width: 480px) {
            .story-card-author-name {
              max-width: 110px !important;
            }
          }
        `,
        }}
      />
      {/* Cover Image Container with fixed aspect ratio */}
      <Link
        href={`/stories/${story.slug}`}
        style={{
          display: "block",
          position: "relative",
          width: "100%",
          paddingTop: "56.25%", // 16:9 aspect ratio
          backgroundColor: "var(--bg-secondary)",
          overflow: "hidden",
        }}
        tabIndex={-1}
        aria-hidden="true"
      >
        {story.cover_image ? (
          <Image
            src={story.cover_image}
            alt={story.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: "cover", transition: "transform 0.3s ease" }}
            className="story-card-image"
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, rgba(255, 70, 85, 0.12), rgba(0, 189, 165, 0.12))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "2.5rem" }}>🎮</span>
            <span
              style={{
                fontSize: "0.75rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                fontWeight: 700,
              }}
            >
              Community Story
            </span>
          </div>
        )}

        {/* Badges on top of cover image */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
            zIndex: 2,
          }}
        >
          <span
            style={{
              background: "rgba(15, 25, 35, 0.9)",
              backdropFilter: "blur(8px)",
              color: "var(--accent-cyan)",
              padding: "0.25rem 0.6rem",
              fontSize: "0.68rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              border: "1px solid rgba(0, 189, 165, 0.3)",
            }}
          >
            {gameName}
          </span>
          <span
            style={{
              background: "rgba(15, 25, 35, 0.9)",
              backdropFilter: "blur(8px)",
              color: "var(--text-primary)",
              padding: "0.25rem 0.6rem",
              fontSize: "0.68rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              border: "1px solid var(--border-color)",
            }}
          >
            {categoryName}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div
        className="story-card-content"
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.65rem",
            fontSize: "0.8rem",
            color: "var(--text-muted)",
          }}
        >
          {formattedDate && <span>{formattedDate}</span>}
          {formattedDate && <span>•</span>}
          <span>{readingTime} min read</span>
        </div>

        <h3
          className="story-card-title"
          style={{
            fontWeight: 800,
            color: "var(--text-primary)",
            marginBottom: "0.75rem",
            fontFamily: '"Rajdhani", sans-serif',
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
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
        </h3>

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.92rem",
            lineHeight: 1.6,
            marginBottom: "1.25rem",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            flex: 1,
          }}
        >
          {story.excerpt}
        </p>

        {/* Footer Meta */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "0.85rem",
            borderTop: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              minWidth: 0,
              flex: 1,
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "var(--gradient-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "0.7rem",
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {(story.player_name || story.author_name || "K")[0]}
            </div>
            <span
              className="story-card-author-name"
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "inline-block",
              }}
              title={story.player_name ? `Featuring ${story.player_name}` : story.author_name || "KhelPediA"}
            >
              {story.player_name ? `Featuring ${story.player_name}` : story.author_name || "KhelPediA"}
            </span>
          </div>

          <Link
            href={`/stories/${story.slug}`}
            style={{
              color: "var(--accent-red)",
              textDecoration: "none",
              fontSize: "0.82rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Read Story &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
}
