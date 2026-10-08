import Link from "next/link";
import { getCommunityStories } from "@/lib/queries";
import CommunityStoryFeatured from "@/app/components/stories/CommunityStoryFeatured";
import CommunityStoriesList from "@/app/components/stories/CommunityStoriesList";
import AdContainer from "@/app/components/ads/AdContainer";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title: "Community Stories",
    description:
      "Real stories, journeys and experiences from players, teams and the gaming community. Genuine interviews, competitive milestones, and grassroots gaming features.",
    alternates: {
      canonical: "https://khelpedia.org/stories",
    },
    openGraph: {
      title: "Community Stories | KhelPediA",
      description:
        "Real stories, journeys and experiences from players, teams and the gaming community.",
      url: "https://khelpedia.org/stories",
      type: "website",
      siteName: "KhelPediA",
    },
    twitter: {
      card: "summary_large_image",
      title: "Community Stories | KhelPediA",
      description:
        "Real stories, journeys and experiences from players, teams and the gaming community.",
    },
  };
}

export default async function CommunityStoriesPage() {
  const stories = await getCommunityStories();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Community Stories | KhelPediA",
    description:
      "Real stories, journeys and experiences from players, teams and the gaming community.",
    url: "https://khelpedia.org/stories",
    publisher: {
      "@type": "Organization",
      name: "KhelPediA",
      url: "https://khelpedia.org",
      logo: "https://khelpedia.org/icon.png",
    },
    breadcrumb: {
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
      ],
    },
  };

  // Find featured story if any
  const featuredStory =
    stories.length > 0 ? stories.find((s) => s.featured) || stories[0] : null;


  return (
    <div
      className="page-container stories-page-container"
      style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem 5rem" }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media (min-width: 640px) and (max-width: 1024px) {
            .stories-page-container {
              padding: 1.75rem 1.25rem 4rem !important;
            }
          }
          @media (max-width: 639px) {
            .stories-page-container {
              padding: 1rem 0.85rem 3rem !important;
            }
            .stories-hero-header {
              margin-bottom: 2rem !important;
              padding-bottom: 1.5rem !important;
            }
            .stories-hero-title {
              font-size: 2rem !important;
              line-height: 1.15 !important;
              margin-bottom: 0.85rem !important;
            }
            .stories-hero-desc {
              font-size: 0.95rem !important;
              line-height: 1.55 !important;
            }
            .stories-hero-cta-banner {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 0.75rem !important;
            }
            .stories-hero-cta-btn {
              width: 100% !important;
              justify-content: center !important;
            }
            .stories-section-title {
              font-size: 1.4rem !important;
            }
            .stories-disclaimer {
              padding: 1rem !important;
              margin-top: 2.5rem !important;
            }
          }
        `,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: "1.75rem" }}>
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
          }}
        >
          <li>
            <Link href="/" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
              Home
            </Link>
          </li>
          <li aria-hidden="true">&rarr;</li>
          <li style={{ color: "var(--accent-red)", fontWeight: 700 }}>
            Community Stories
          </li>
        </ol>
      </nav>

      {/* Hero Header */}
      <header
        className="stories-hero-header"
        style={{
          marginBottom: "3.5rem",
          paddingBottom: "2.5rem",
          borderBottom: "1px solid var(--border-color)",
          position: "relative",
        }}
      >
        <div style={{ maxWidth: "800px" }}>
          <div
            style={{
              fontSize: "0.78rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "var(--accent-red)",
              fontFamily: '"Orbitron", sans-serif',
              marginBottom: "0.75rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                background: "var(--accent-red)",
                display: "inline-block",
                transform: "rotate(45deg)",
              }}
            />
            COMMUNITY STORIES
          </div>

          <h1
            className="stories-hero-title"
            style={{
              fontFamily: '"Rajdhani", sans-serif',
              fontSize: "clamp(2.5rem, 5vw, 3.75rem)",
              fontWeight: 800,
              color: "var(--text-primary)",
              lineHeight: 1.1,
              letterSpacing: "0.02em",
              marginBottom: "1.25rem",
              textTransform: "uppercase",
            }}
          >
            Real Players. <span style={{ color: "var(--accent-red)" }}>Real Journeys.</span>
          </h1>

          <p
            className="stories-hero-desc"
            style={{
              color: "var(--text-secondary)",
              fontSize: "1.15rem",
              lineHeight: 1.7,
              margin: 0,
              maxWidth: "680px",
            }}
          >
            Discover the people and experiences behind the games — from personal milestones and
            competitive journeys to the stories that make gaming communities unique.
          </p>
        </div>

        {/* Submit Story CTA Banner in Hero */}
        <div
          className="stories-hero-cta-banner"
          style={{
            marginTop: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/submit-story"
            className="btn btn-primary stories-hero-cta-btn"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "0.7rem 1.6rem",
              fontWeight: 700,
              fontSize: "0.88rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Submit Your Story &rarr;
          </Link>
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Got an incredible milestone or community experience? Share it with KhelPediA.
          </span>
        </div>
      </header>

      {/* Featured Story (if stories are published) */}
      {featuredStory && (
        <CommunityStoryFeatured story={featuredStory} />
      )}

      {/* Story Grid & Filters (if stories are published) */}
      {stories.length > 0 ? (
        <section>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <h2
              className="stories-section-title"
              style={{
                fontFamily: '"Rajdhani", sans-serif',
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                margin: 0,
                textTransform: "uppercase",
              }}
            >
              All Community Stories
            </h2>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Showing {stories.length} published stories
            </span>
          </div>

          <CommunityStoriesList stories={stories} />

          {/* Tasteful editorial banner ad after grid */}
          <div style={{ marginTop: "4rem" }}>
            <AdContainer type="banner" placement="stories_landing_bottom" />
          </div>
        </section>
      ) : (
        /* Empty State (when 0 stories are published) */
        <section
          style={{
            textAlign: "center",
            padding: "5rem 2rem",
            background: "var(--bg-card)",
            border: "1px dashed var(--border-color)",
            marginTop: "1rem",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "rgba(255, 70, 85, 0.1)",
              border: "1px solid rgba(255, 70, 85, 0.3)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.2rem",
              marginBottom: "1.5rem",
            }}
          >
            🎮
          </div>

          <h2
            style={{
              fontFamily: '"Rajdhani", sans-serif',
              fontSize: "2.2rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              marginBottom: "0.75rem",
              textTransform: "uppercase",
            }}
          >
            Stories are coming soon.
          </h2>

          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1.1rem",
              maxWidth: "600px",
              margin: "0 auto 2.5rem",
              lineHeight: 1.6,
            }}
          >
            We&apos;re talking to players, teams and members of the gaming community to bring their
            journeys to KhelPediA. Genuine player narratives, milestone breakdowns, and grassroots
            experiences will be published right here.
          </p>

          <div
            style={{
              display: "inline-flex",
              flexDirection: "column",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            <Link
              href="/submit-story"
              className="btn btn-primary"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "0.75rem 1.8rem",
                fontWeight: 700,
                fontSize: "0.9rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Have a Gaming Story to Share? &rarr;
            </Link>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Tell us about your achievements, clan, or competitive journey.
            </span>
          </div>
        </section>
      )}

      {/* Editorial Disclaimer */}
      <footer
        className="stories-disclaimer"
        style={{
          marginTop: "4rem",
          padding: "1.5rem",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          color: "var(--text-muted)",
          fontSize: "0.82rem",
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: "var(--text-primary)" }}>Editorial Standards:</strong> Community
        stories represent individual player and team narratives submitted to or interviewed by
        KhelPediA. Statistics displayed within features reflect verified gameplay records or
        direct screenshots provided by subjects. For editorial questions or corrections, please
        refer to our{" "}
        <Link href="/editorial-policy" style={{ color: "var(--accent-cyan)", textDecoration: "none" }}>
          Editorial Policy
        </Link>
        .
      </footer>
    </div>
  );
}
