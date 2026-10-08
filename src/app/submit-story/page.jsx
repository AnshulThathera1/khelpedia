import Link from "next/link";
import SubmitStoryForm from "@/app/components/stories/SubmitStoryForm";

export const metadata = {
  title: "Submit a Gaming Story | KhelPediA",
  description:
    "Have a gaming story to share? Tell us about your gaming journey, achievement, team, tournament or experience. Selected submissions may be featured on KhelPediA.",
  alternates: {
    canonical: "https://khelpedia.org/submit-story",
  },
  openGraph: {
    title: "Submit a Gaming Story | KhelPediA",
    description:
      "Share your esports milestones, clan journeys, and competitive experiences with the KhelPediA community.",
    url: "https://khelpedia.org/submit-story",
    type: "website",
    siteName: "KhelPediA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Submit a Gaming Story | KhelPediA",
    description:
      "Share your gaming journey or tournament story with KhelPediA.",
  },
};

export default function SubmitStoryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Submit a Gaming Story | KhelPediA",
    description:
      "Tell us about your gaming journey, achievement, team, tournament or experience. Selected submissions may be featured on KhelPediA.",
    url: "https://khelpedia.org/submit-story",
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
          name: "Submit a Story",
          item: "https://khelpedia.org/submit-story",
        },
      ],
    },
  };

  return (
    <div className="page-container submit-story-container" style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem 5rem" }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .submit-story-card {
            padding: 2.5rem;
          }
          .submit-story-faq-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
          @media (max-width: 768px) {
            .submit-story-container {
              padding: 1.5rem 1.25rem 4rem !important;
            }
            .submit-story-card {
              padding: 1.75rem 1.25rem !important;
            }
          }
          @media (max-width: 639px) {
            .submit-story-container {
              padding: 1rem 0.85rem 3rem !important;
            }
            .submit-story-card {
              padding: 1.25rem 1rem !important;
              margin-bottom: 2rem !important;
            }
            .submit-story-faq-grid {
              grid-template-columns: 1fr !important;
              gap: 1rem !important;
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
          <li>
            <Link href="/stories" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
              Community Stories
            </Link>
          </li>
          <li aria-hidden="true">&rarr;</li>
          <li style={{ color: "var(--accent-red)", fontWeight: 700 }}>
            Submit a Story
          </li>
        </ol>
      </nav>

      {/* Hero Header */}
      <header
        style={{
          marginBottom: "2.5rem",
          paddingBottom: "1.75rem",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
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
          COMMUNITY SUBMISSIONS
        </div>

        <h1
          style={{
            fontFamily: '"Rajdhani", sans-serif',
            fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
            fontWeight: 800,
            color: "var(--text-primary)",
            lineHeight: 1.15,
            letterSpacing: "0.02em",
            marginBottom: "1rem",
            textTransform: "uppercase",
          }}
        >
          Have a Gaming Story to Share?
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "1.1rem",
            lineHeight: 1.6,
            margin: 0,
            maxWidth: "720px",
          }}
        >
          Tell us about your gaming journey, achievement, team, tournament or experience.
          Selected submissions may be featured on KhelPediA.
        </p>
      </header>

      {/* Form Card */}
      <div
        className="card submit-story-card"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-card)",
          marginBottom: "3rem",
        }}
      >
        <SubmitStoryForm />
      </div>

      {/* Editorial Standards & Submission FAQ */}
      <section className="submit-story-faq-grid">
        <div
          style={{
            padding: "1.5rem",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 800,
              color: "var(--accent-cyan)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "0.5rem",
            }}
          >
            What Stories Fit Best?
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6, margin: 0 }}>
            Personal gameplay milestones, underdog tournament runs, clan founding narratives,
            or grassroots community organizers bringing players together.
          </p>
        </div>

        <div
          style={{
            padding: "1.5rem",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div
            style={{
              fontSize: "0.75rem",
              fontWeight: 800,
              color: "var(--accent-red)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "0.5rem",
            }}
          >
            Verification Process
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.6, margin: 0 }}>
            To protect reader trust and avoid fabricated claims, all stories undergo editorial review.
            We reach out via email to verify screenshots, match IDs, or player identity before publishing.
          </p>
        </div>
      </section>
    </div>
  );
}
