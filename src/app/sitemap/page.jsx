import Link from "next/link";
import { getCommunityStories } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "HTML Sitemap | KhelPediA",
  description:
    "Sitemap of KhelPediA. Find direct links to all our major sections, games, community player stories, legal pages, and esports coverage.",
  alternates: {
    canonical: "https://khelpedia.org/sitemap",
  },
};

export default async function HTMLSitemap() {
  const stories = await getCommunityStories();

  const sections = [
    {
      title: "Main Content",
      links: [
        { href: "/", label: "Home" },
        { href: "/blogs", label: "News & Articles" },
        { href: "/stories", label: "Community Stories" },
        { href: "/submit-story", label: "Submit a Story" },
        { href: "/tournaments", label: "Tournaments" },
        { href: "/teams", label: "Teams" },
        { href: "/players", label: "Players" },
        { href: "/games", label: "Games" },
      ],
    },
    {
      title: "Community Stories",
      links: [
        { href: "/stories", label: "Community Stories Hub" },
        { href: "/submit-story", label: "Submit Your Story" },
        ...stories.map((s) => ({
          href: `/stories/${s.slug}`,
          label: `${s.title} (${s.game?.name || s.game_name || "Gaming"})`,
        })),
      ],
    },
    {
      title: "Games",
      links: [
        { href: "/games/valorant", label: "Valorant" },
        { href: "/games/cs2", label: "CS2" },
        { href: "/games/bgmi", label: "BGMI" },
        { href: "/games/dota-2", label: "Dota 2" },
      ],
    },
    {
      title: "Company & Policies",
      links: [
        { href: "/about", label: "About Us" },
        { href: "/contact", label: "Contact Us" },
        { href: "/editorial-policy", label: "Editorial Policy" },
        { href: "/corrections-policy", label: "Corrections Policy" },
        { href: "/disclaimer", label: "Disclaimer" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/privacy-policy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Service" },
        { href: "/cookie-policy", label: "Cookie Policy" },
      ],
    },
    {
      title: "XML Sitemaps",
      links: [
        { href: "/sitemap.xml", label: "Master Sitemap Index (sitemap.xml)" },
        { href: "/sitemap/stories/sitemap/0.xml", label: "Community Stories XML Sitemap" },
        { href: "/sitemap/blogs/sitemap/0.xml", label: "News & Articles XML Sitemap" },
        { href: "/sitemap/static/sitemap.xml", label: "Static Pages XML Sitemap" },
      ],
    },
  ];

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "2.5rem 1.5rem 5rem" }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .sitemap-link:hover {
            color: var(--accent-cyan) !important;
          }
        `,
        }}
      />
      <h1
        style={{
          fontFamily: '"Orbitron", sans-serif',
          fontSize: "clamp(2rem, 4vw, 2.75rem)",
          color: "var(--text-primary)",
          marginBottom: "0.75rem",
          borderBottom: "2px solid var(--border-color)",
          paddingBottom: "1rem",
        }}
      >
        HTML Sitemap
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "3rem", fontSize: "1.05rem", lineHeight: 1.6 }}>
        Navigate through KhelPediA using the structured directory below to discover verified community player stories, esports news, tournament brackets, and platform policies.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2rem",
        }}
      >
        {sections.map((section) => (
          <div
            key={section.title}
            style={{
              background: "var(--bg-secondary)",
              padding: "2rem",
              borderRadius: "4px",
              border: "1px solid var(--border-color)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h2
              style={{
                fontFamily: '"Rajdhani", sans-serif',
                fontSize: "1.4rem",
                color: "var(--accent-red)",
                marginBottom: "1.25rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {section.title}
            </h2>
            <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    style={{
                      color: "var(--text-primary)",
                      textDecoration: "none",
                      fontSize: "0.95rem",
                      lineHeight: 1.4,
                      transition: "color 0.2s",
                      display: "inline-block",
                    }}
                    className="sitemap-link"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
