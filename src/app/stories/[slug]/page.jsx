import { getCommunityStoryBySlug } from "@/lib/queries";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import DesktopSidebarLayout from "@/app/components/ads/DesktopSidebarLayout";
import AdContainer from "@/app/components/ads/AdContainer";
import SocialShare from "@/app/components/SocialShare";
import CommunityStatsHighlight from "@/app/components/stories/CommunityStatsHighlight";
import CommunityPlayerCard from "@/app/components/stories/CommunityPlayerCard";
import CommunityRelatedContent from "@/app/components/stories/CommunityRelatedContent";
import RelatedStories from "@/app/components/stories/RelatedStories";
import CommunityStoryViewTracker from "@/app/components/stories/CommunityStoryViewTracker";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const story = await getCommunityStoryBySlug(resolvedParams.slug);

  if (!story || story.status !== "published") {
    return {
      title: "Story Not Found | KhelPediA",
      robots: { index: false, follow: false },
    };
  }

  const pageTitle = story.seo_title || story.title;
  const description = story.seo_description || story.excerpt;
  const canonicalUrl = `https://khelpedia.org/stories/${story.slug}`;
  const images = story.og_image || story.cover_image ? [story.og_image || story.cover_image] : [];

  return {
    title: pageTitle,
    description: description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${pageTitle} | KhelPediA`,
      description: description,
      type: "article",
      url: canonicalUrl,
      images: images,
      publishedTime: story.published_at || story.created_at,
      modifiedTime: story.updated_at || story.published_at || story.created_at,
      authors: [story.author_name || "KhelPediA Editorial"],
      siteName: "KhelPediA",
    },
    twitter: {
      card: "summary_large_image",
      title: `${pageTitle} | KhelPediA`,
      description: description,
      images: images,
    },
  };
}

function getReadingTime(htmlContent) {
  if (!htmlContent) return 3;
  const text = htmlContent.replace(/<[^>]*>/g, "");
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Editorial content segmentation for safe, unintrusive monetization:
 * - Ads only split at closing </p> tags
 * - Never placed between headings and first paragraph
 * - Short (<500 words): no inline ad, 1 conclusion banner
 * - Medium (500-1100 words): 1 native ad in middle, 1 conclusion banner
 * - Long (>1100 words): 1 banner at 1/3, 1 native at 2/3, 1 conclusion banner
 */
function renderSegmentedStoryContent(htmlContent) {
  if (!htmlContent) return null;

  const textOnly = htmlContent.replace(/<[^>]*>/g, " ");
  const wordCount = textOnly.trim().split(/\s+/).filter(Boolean).length;

  const pRegex = /<\/p>/gi;
  const splitIndices = [];
  let match;
  while ((match = pRegex.exec(htmlContent)) !== null) {
    splitIndices.push(match.index + match[0].length);
  }

  const contentStyle = {
    color: "var(--text-secondary)",
    fontSize: "1.1rem",
    lineHeight: 1.85,
    fontFamily: '"Outfit", sans-serif',
  };

  // Case 1: Short article (< 500 words or < 4 paragraphs)
  if (wordCount < 500 || splitIndices.length < 4) {
    return (
      <>
        <div
          className="story-body-content"
          style={contentStyle}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
        <div style={{ margin: "2.5rem 0" }}>
          <AdContainer type="banner" placement="story_content_end" />
        </div>
      </>
    );
  }

  // Case 2: Medium article (500 - 1100 words)
  if (wordCount < 1100 || splitIndices.length < 8) {
    const midPointIndex = Math.floor(splitIndices.length / 2);
    const splitPos = splitIndices[midPointIndex];
    const part1 = htmlContent.slice(0, splitPos);
    const part2 = htmlContent.slice(splitPos);

    return (
      <>
        <div
          className="story-body-content"
          style={contentStyle}
          dangerouslySetInnerHTML={{ __html: part1 }}
        />

        <div style={{ margin: "2.5rem 0" }}>
          <AdContainer type="native" placement="story_inline_native" />
        </div>

        <div
          className="story-body-content"
          style={contentStyle}
          dangerouslySetInnerHTML={{ __html: part2 }}
        />

        <div style={{ margin: "2.5rem 0" }}>
          <AdContainer type="banner" placement="story_content_end" />
        </div>
      </>
    );
  }

  // Case 3: Long article (> 1100 words and >= 8 paragraphs)
  const cut1Index = Math.floor(splitIndices.length / 3);
  const cut2Index = Math.floor((splitIndices.length * 2) / 3);
  const pos1 = splitIndices[cut1Index];
  const pos2 = splitIndices[cut2Index];

  const part1 = htmlContent.slice(0, pos1);
  const part2 = htmlContent.slice(pos1, pos2);
  const part3 = htmlContent.slice(pos2);

  return (
    <>
      <div
        className="story-body-content"
        style={contentStyle}
        dangerouslySetInnerHTML={{ __html: part1 }}
      />

      <div style={{ margin: "2.5rem 0" }}>
        <AdContainer type="banner" placement="story_inline_banner" />
      </div>

      <div
        className="story-body-content"
        style={contentStyle}
        dangerouslySetInnerHTML={{ __html: part2 }}
      />

      <div style={{ margin: "2.5rem 0" }}>
        <AdContainer type="native" placement="story_inline_native" />
      </div>

      <div
        className="story-body-content"
        style={contentStyle}
        dangerouslySetInnerHTML={{ __html: part3 }}
      />

      <div style={{ margin: "2.5rem 0" }}>
        <AdContainer type="banner" placement="story_content_end" />
      </div>
    </>
  );
}

export default async function CommunityStoryDetailPage({ params }) {
  const resolvedParams = await params;
  const story = await getCommunityStoryBySlug(resolvedParams.slug);

  // Security & Publishing safeguard: Drafts and nonexistent stories return 404
  if (!story || story.status !== "published") {
    notFound();
  }

  const readingTime = getReadingTime(story.content);
  const publishDate = story.published_at ? new Date(story.published_at) : new Date(story.created_at);
  const updateDate = story.updated_at ? new Date(story.updated_at) : null;
  const wasUpdated = updateDate && Math.abs(updateDate.getTime() - publishDate.getTime()) > 86400000;

  const currentUrl = `https://khelpedia.org/stories/${story.slug}`;
  const gameName = story.game?.name || story.game_name || "Gaming";
  const categoryName = story.category || "Community Story";

  // Parse stats_highlight if stored as JSON string or object
  let statsList = [];
  if (story.stats_highlight) {
    if (typeof story.stats_highlight === "string") {
      try {
        statsList = JSON.parse(story.stats_highlight);
      } catch (e) {
        statsList = [];
      }
    } else if (Array.isArray(story.stats_highlight)) {
      statsList = story.stats_highlight;
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: story.title,
    description: story.excerpt,
    image: story.cover_image ? [story.cover_image] : [],
    datePublished: story.published_at || story.created_at,
    dateModified: story.updated_at || story.published_at || story.created_at,
    author: [
      {
        "@type": "Person",
        name: story.author_profile?.display_name || story.author_name || "KhelPediA Editorial",
        url: "https://khelpedia.org",
      },
    ],
    publisher: {
      "@type": "Organization",
      name: "KhelPediA",
      url: "https://khelpedia.org",
      logo: "https://khelpedia.org/icon.png",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": currentUrl,
    },
  };

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://khelpedia.org",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Community Stories",
        item: "https://khelpedia.org/stories",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: story.title,
        item: currentUrl,
      },
    ],
  };

  return (
    <DesktopSidebarLayout pageType="community_story" variant="compact">
      <article className="story-detail-article">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
        />

        {/* 1. Breadcrumbs */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: "2rem" }}>
          <ol
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              listStyle: "none",
              padding: 0,
              margin: 0,
              fontSize: "0.85rem",
              color: "var(--text-muted)",
              flexWrap: "wrap",
            }}
          >
            <li>
              <Link href="/" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
                Home
              </Link>
            </li>
            <li aria-hidden="true">&rarr;</li>
            <li>
              <Link href="/stories" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
                Community Stories
              </Link>
            </li>
            <li aria-hidden="true">&rarr;</li>
            <li
              className="story-breadcrumb-current"
              style={{
                color: "var(--accent-red)",
                fontWeight: 600,
                maxWidth: "320px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {story.title}
            </li>
          </ol>
        </nav>

        {/* Back Link */}
        <Link
          href="/stories"
          style={{
            color: "var(--accent-cyan)",
            textDecoration: "none",
            fontSize: "0.88rem",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "2rem",
            fontWeight: 700,
          }}
        >
          &larr; Back to Community Stories
        </Link>

        {/* 2. Story Header */}
        <header style={{ marginBottom: "2.5rem" }}>
          {/* Eyebrow & Badges */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
              marginBottom: "1.25rem",
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
                letterSpacing: "0.12em",
                border: "1px solid rgba(255, 70, 85, 0.25)",
              }}
            >
              COMMUNITY STORY
            </span>
            <span
              style={{
                background: "rgba(0, 189, 165, 0.12)",
                color: "var(--accent-cyan)",
                padding: "0.3rem 0.8rem",
                fontSize: "0.72rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                border: "1px solid rgba(0, 189, 165, 0.25)",
              }}
            >
              {gameName}
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
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 800,
              color: "var(--text-primary)",
              lineHeight: 1.15,
              marginBottom: "1.25rem",
              fontFamily: '"Rajdhani", sans-serif',
              letterSpacing: "0.02em",
            }}
          >
            {story.title}
          </h1>

          {/* Subtitle / Deck */}
          {story.subtitle && (
            <p
              style={{
                fontSize: "1.2rem",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                marginBottom: "1.5rem",
                fontWeight: 400,
              }}
            >
              {story.subtitle}
            </p>
          )}

          {/* Metadata Bar */}
          <div
            className="story-detail-meta-bar"
            style={{
              paddingTop: "1.25rem",
              paddingBottom: "1.25rem",
              borderTop: "1px solid var(--border-color)",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            {/* Author / Subject info */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "var(--gradient-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "1rem",
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {(story.player_name || story.author_name || "K")[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem" }}>
                  {story.player_name ? `Story Featuring ${story.player_name}` : story.author_name || "KhelPediA Editorial"}
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Reported by {story.author_name || "KhelPediA Editorial"}
                </div>
              </div>
            </div>

            {/* Date, Reading time, and Views */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                flexWrap: "wrap",
              }}
            >
              <time dateTime={publishDate.toISOString()}>
                {publishDate.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <span>•</span>
              <span>{readingTime} min read</span>
              {story.views > 0 && (
                <>
                  <span>•</span>
                  <span>{story.views} views</span>
                </>
              )}
            </div>
          </div>

          {/* Updated date notice */}
          {wasUpdated && updateDate && (
            <div
              style={{
                marginTop: "1rem",
                padding: "0.4rem 0.8rem",
                background: "rgba(0, 189, 165, 0.08)",
                border: "1px solid rgba(0, 189, 165, 0.2)",
                fontSize: "0.8rem",
                color: "var(--accent-cyan)",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              Updated:{" "}
              {updateDate.toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          )}

          {/* Social Share Bar */}
          <SocialShare url={currentUrl} title={story.title} />
        </header>

        {/* 3. Hero Cover Image */}
        {story.cover_image && (
          <div className="story-detail-cover">
            <Image
              src={story.cover_image}
              alt={story.title}
              fill
              priority
              style={{ objectFit: "cover" }}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 840px"
            />
          </div>
        )}

        {/* 4. Article Content with Dynamic In-Content Monetization */}
        {renderSegmentedStoryContent(story.content)}

        {/* 5. Statistics Highlight Component (Optional/Data-Driven) */}
        {statsList.length > 0 && (
          <CommunityStatsHighlight
            stats={statsList}
            title={story.player_name ? `${story.player_name} — Recorded Statistics` : "Milestone Highlights"}
            notes={story.verification_notes || "Statistics shown are based on screenshots provided to KhelPediA by the player."}
          />
        )}

        {/* 6. Player Information Card (Optional/Data-Driven) */}
        {(story.player_name || story.player_ign) && (
          <CommunityPlayerCard
            playerName={story.player_name}
            playerIgn={story.player_ign}
            gameName={gameName}
            playerMode={story.player_mode}
            playerUid={story.player_uid}
            profileUrl={story.player_profile ? `/players/${story.player_profile.slug || story.player_profile.id}` : null}
          />
        )}

        {/* 7. Editorial & Verification Disclosure Box */}
        <div
          style={{
            marginTop: "3rem",
            padding: "1.5rem",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--accent-red)",
              marginBottom: "0.5rem",
              fontFamily: '"Orbitron", sans-serif',
            }}
          >
            EDITORIAL POLICY & VERIFICATION NOTICE
          </div>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            This article is an editorial feature published in accordance with the{" "}
            <Link href="/editorial-policy" style={{ color: "var(--accent-cyan)", textDecoration: "none" }}>
              KhelPediA Editorial Policy
            </Link>
            . Player accomplishments, IGN records, and telemetry milestones are reviewed by our editorial team prior to publication.
            If you have corrections or additional information, please submit a note via our{" "}
            <Link href="/corrections-policy" style={{ color: "var(--accent-cyan)", textDecoration: "none" }}>
              Corrections Policy
            </Link>
            .
          </p>
        </div>

        {/* 8. Related KhelPediA Content */}
        <CommunityRelatedContent
          game={story.game}
          playerProfile={story.player_profile}
        />

        {/* 9. Related Community Stories */}
        <RelatedStories
          currentSlug={story.slug}
          gameId={story.game_id}
          category={story.category}
        />

        {/* 10. Back to Stories link */}
        <div style={{ marginTop: "3rem", textAlign: "center" }}>
          <Link
            href="/stories"
            className="btn btn-secondary"
            style={{
              textDecoration: "none",
              padding: "0.75rem 2rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            &larr; Back to All Community Stories
          </Link>
        </div>

        {/* View tracker */}
        <CommunityStoryViewTracker slug={story.slug} />

        {/* Story Content Rich Typography & Responsive Layout Styles */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            .story-detail-article {
              max-width: 840px;
              margin: 0 auto;
              padding: 2rem 1.5rem 5rem;
            }
            .story-detail-cover {
              width: 100%;
              height: 440px;
              position: relative;
              margin-bottom: 3rem;
              background: var(--bg-secondary);
              border: 1px solid var(--border-color);
              box-shadow: 0 15px 35px rgba(0,0,0,0.3);
              overflow: hidden;
            }
            .story-detail-meta-bar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              flex-wrap: wrap;
              gap: 1rem;
            }
            .story-body-content h2 {
              color: var(--text-primary);
              font-size: 1.85rem;
              margin: 2.5rem 0 1rem;
              font-family: "Rajdhani", sans-serif;
              font-weight: 800;
              line-height: 1.25;
            }
            .story-body-content h3 {
              color: var(--text-primary);
              font-size: 1.45rem;
              margin: 2rem 0 0.85rem;
              font-family: "Rajdhani", sans-serif;
              font-weight: 700;
              line-height: 1.3;
            }
            .story-body-content p {
              margin-bottom: 1.6rem;
            }
            .story-body-content a {
              color: var(--accent-cyan);
              text-decoration: none;
            }
            .story-body-content a:hover {
              text-decoration: underline;
            }
            .story-body-content ul, .story-body-content ol {
              margin-bottom: 1.6rem;
              padding-left: 1.75rem;
            }
            .story-body-content li {
              margin-bottom: 0.6rem;
            }
            .story-body-content blockquote {
              border-left: 4px solid var(--accent-red);
              padding: 1.25rem 1.5rem;
              font-style: italic;
              font-size: 1.15rem;
              color: var(--text-primary);
              background: rgba(255, 70, 85, 0.06);
              margin: 2.2rem 0;
            }
            .story-body-content img {
              max-width: 100%;
              height: auto;
              border: 1px solid var(--border-color);
            }
            .story-body-content figure {
              margin: 2.25rem 0;
              padding: 0;
            }
            .story-body-content figure img {
              width: 100%;
              height: auto;
              display: block;
              margin: 0 0 0.5rem 0;
            }
            .story-figure-portrait {
              max-width: 380px !important;
              margin: 2.25rem auto !important;
            }
            .story-body-content figcaption {
              font-size: 0.82rem;
              color: var(--text-muted);
              line-height: 1.5;
              padding: 0.4rem 0.75rem;
              border-left: 3px solid var(--accent-cyan);
              background: rgba(0, 189, 165, 0.05);
              font-family: "Outfit", sans-serif;
            }
            .story-body-content table {
              width: 100%;
              border-collapse: collapse;
              display: table;
              margin: 1.75rem 0;
            }
            .story-body-content th {
              background: var(--bg-secondary);
              color: var(--text-primary);
              font-family: "Rajdhani", sans-serif;
              font-weight: 700;
              font-size: 0.92rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              padding: 0.75rem 1rem;
              border: 1px solid var(--border-color);
              text-align: left;
            }
            .story-body-content td {
              padding: 0.75rem 1rem;
              border: 1px solid var(--border-color);
              color: var(--text-secondary);
              font-size: 0.92rem;
            }
            .story-body-content tr:nth-child(even) {
              background: rgba(255, 255, 255, 0.02);
            }
            .story-body-content pre, .story-body-content code {
              max-width: 100%;
              overflow-x: auto;
            }
            .story-body-content strong {
              color: var(--text-primary);
              font-weight: 700;
            }

            /* Tablet Breakpoint (640px - 1024px) */
            @media (min-width: 640px) and (max-width: 1024px) {
              .story-detail-article {
                padding: 1.75rem 1.25rem 4rem;
              }
              .story-detail-cover {
                height: 340px !important;
                margin-bottom: 2.25rem !important;
              }
            }

            /* Mobile Breakpoint (< 640px) */
            @media (max-width: 639px) {
              .story-detail-article {
                padding: 1rem 0.85rem 3rem !important;
              }
              .story-detail-cover {
                height: 230px !important;
                margin-bottom: 1.75rem !important;
              }
              .story-detail-meta-bar {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 0.85rem !important;
              }
              .story-breadcrumb-current {
                max-width: 160px !important;
              }
              .story-body-content {
                font-size: 1.02rem !important;
                line-height: 1.75 !important;
              }
              .story-body-content h2 {
                font-size: 1.45rem !important;
                margin: 2rem 0 0.85rem !important;
              }
              .story-body-content h3 {
                font-size: 1.22rem !important;
                margin: 1.5rem 0 0.65rem !important;
              }
              .story-body-content blockquote {
                padding: 1rem 1.15rem !important;
                font-size: 1.02rem !important;
                margin: 1.5rem 0 !important;
              }
            }
          `,
          }}
        />
      </article>
    </DesktopSidebarLayout>
  );
}
