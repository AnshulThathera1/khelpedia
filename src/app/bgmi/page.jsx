import { getBGMIPageData } from "@/lib/bgmiQueries.js";
import DesktopSidebarLayout from "@/app/components/ads/DesktopSidebarLayout";
import BGMIHero from "./components/BGMIHero";
import BGMITelemetryBar from "./components/BGMITelemetryBar";
import BGMITournamentRadar from "./components/BGMITournamentRadar";
import BGMIFeaturedTournament from "./components/BGMIFeaturedTournament";
import BGMITeamLeaderboard from "./components/BGMITeamLeaderboard";
import BGMIPlayerSpotlight from "./components/BGMIPlayerSpotlight";
import BGMIMatchFeed from "./components/BGMIMatchFeed";
import BGMIEditorialNews from "./components/BGMIEditorialNews";
import BGMIQuickHub from "./components/BGMIQuickHub";

export const revalidate = 1800; // Cache for 30 minutes with ISR

export const metadata = {
  title: "BGMI Esports — Tournaments, Teams & Match Telemetry | KhelPediA",
  description: "Your premier BGMI intelligence command center. Track live tournaments, team rosters, match telemetry across Erangel and Miramar, player stats, and competitive editorial analysis.",
  alternates: {
    canonical: "https://khelpedia.org/bgmi",
  },
  openGraph: {
    title: "BGMI Esports — Tournaments, Teams & Match Telemetry | KhelPediA",
    description: "Real-time BGMI tournament brackets, team rosters, player records, and competitive match telemetry.",
    url: "https://khelpedia.org/bgmi",
    siteName: "KhelPediA",
    type: "website",
    images: [
      {
        url: "https://khelpedia.org/images/bgmi-hero-banner.jpg",
        width: 1920,
        height: 1080,
        alt: "BGMI Esports Arena",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BGMI Esports — Tournaments, Teams & Match Telemetry | KhelPediA",
    description: "Real-time BGMI tournament brackets, team rosters, player records, and competitive match telemetry.",
    images: ["https://khelpedia.org/images/bgmi-hero-banner.jpg"],
  },
};

export default async function BGMIPage() {
  const data = await getBGMIPageData();

  // Factual JSON-LD Structured Data for Esports Hub
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "BGMI Competitive Arena — KhelPediA",
    description: "Battlegrounds Mobile India esports command center. Track tournaments, team rosters, match results, player performance, and competitive news.",
    url: "https://khelpedia.org/bgmi",
    publisher: {
      "@type": "Organization",
      name: "KhelPediA",
      url: "https://khelpedia.org",
      logo: "https://khelpedia.org/icon.png",
    },
    about: {
      "@type": "VideoGame",
      name: "Battlegrounds Mobile India",
      alternateName: "BGMI",
      genre: "Battle Royale",
      publisher: {
        "@type": "Organization",
        name: "Krafton",
      },
    },
  };

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 01: Tactical Command Center Hero with Artwork Backdrop */}
      <BGMIHero 
        stats={data.stats} 
        featuredTournament={data.featuredTournament} 
      />

      {/* 02: Platform Telemetry HUD Metrics Bar */}
      <BGMITelemetryBar stats={data.stats} />

      {/* 03: Main Content Area Protected by Desktop Sidebar Layout */}
      <DesktopSidebarLayout pageType="bgmi" variant="standard">
        <div className="page-container" style={{ paddingTop: "1rem" }}>
          
          {/* Section: Tournament Radar with 4-State Interactive Filters */}
          <BGMITournamentRadar tournaments={data.tournaments} />

          {/* Section: Featured Championship Spotlight */}
          {data.featuredTournament && (
            <BGMIFeaturedTournament tournament={data.featuredTournament} />
          )}

          {/* Section: Dual Pro Column (Featured Teams & Player Spotlight) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12" style={{ marginBottom: "5rem" }}>
            <BGMITeamLeaderboard teams={data.teams} />
            <BGMIPlayerSpotlight players={data.players} />
          </div>

          {/* Section: Verified Match Outcomes Telemetry */}
          {data.matches && data.matches.length > 0 && (
            <BGMIMatchFeed matches={data.matches} />
          )}

          {/* Section: Editorial News & Meta Breakdowns */}
          {data.blogs && data.blogs.length > 0 && (
            <BGMIEditorialNews blogs={data.blogs} />
          )}

          {/* Section: Fast Access Intelligence Hubs */}
          <BGMIQuickHub />

        </div>
      </DesktopSidebarLayout>
    </>
  );
}
