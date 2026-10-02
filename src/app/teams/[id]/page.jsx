import {
  getTeamById,
  getTeamPlayers,
  getTeamTournaments,
  getTeamPerformanceStats,
  getTeamRecentMatches,
  getTeamOpponents,
} from "@/lib/queries";
import { checkTeamIndexable } from "@/lib/seo";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import PlayerCard from "../../components/PlayerCard";
import TeamStatsWidget from "@/app/components/TeamStatsWidget";
import AdContainer from "@/app/components/ads/AdContainer";
import DesktopSidebarLayout from "@/app/components/ads/DesktopSidebarLayout";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const [team, perfStats, activeTournaments, isIndexable] = await Promise.all([
    getTeamById(id),
    getTeamPerformanceStats(id),
    getTeamTournaments(id),
    checkTeamIndexable(id),
  ]);

  if (!team) return { title: "Team Not Found | KhelPediA" };

  const isThin = !isIndexable;
  const pageTitle = `${team.name} — Matches, Results, Tournaments & Statistics`;
  const fullTitle = `${pageTitle} | KhelPediA`;

  let description = `Follow ${team.name} esports team on KhelPediA.`;
  if (perfStats?.total_matches > 0 && activeTournaments?.length > 0) {
    description = `${team.name} has ${perfStats.total_matches.toLocaleString()} recorded competitive matches across ${activeTournaments.length} tournament events. View match results, win rate, head-to-head records, and team statistics on KhelPediA.`;
  } else if (perfStats?.total_matches > 0) {
    description = `${team.name} has ${perfStats.total_matches.toLocaleString()} recorded matches with a ${perfStats.win_rate}% win rate. View recent results and esports statistics on KhelPediA.`;
  } else {
    description = `Follow ${team.name} esports team on KhelPediA. View tournament appearances, roster, and esports profile.`;
  }

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: `https://khelpedia.org/teams/${id}`,
    },
    robots: isThin ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: fullTitle,
      description,
      type: "website",
      url: `https://khelpedia.org/teams/${id}`,
      images: team.logo_url ? [team.logo_url] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: team.logo_url ? [team.logo_url] : [],
    },
  };
}

export default async function TeamDetailPage({ params }) {
  const { id } = await params;

  const [
    team,
    roster,
    activeTournaments,
    perfStats,
    recentMatches,
    opponents,
    isIndexable,
  ] = await Promise.all([
    getTeamById(id),
    getTeamPlayers(id),
    getTeamTournaments(id),
    getTeamPerformanceStats(id),
    getTeamRecentMatches(id, 8),
    getTeamOpponents(id, 5),
    checkTeamIndexable(id),
  ]);

  if (!team) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: team.name,
    sport: "Esports",
    url: `https://khelpedia.org/teams/${team.id}`,
    ...(team.logo_url && { logo: team.logo_url }),
    ...(team.region && {
      location: {
        "@type": "Place",
        name: team.region,
      },
    }),
    description:
      team.description ||
      `${team.name} esports team profile, match results, and competitive statistics on KhelPediA.`,
  };

  const pageContent = (
    <div className="page-container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Team Header */}
      <div
        className="glass-card"
        style={{
          padding: "4rem 2rem",
          marginBottom: "3rem",
          textAlign: "center",
          background:
            "linear-gradient(135deg, rgba(26,31,46,0.9), rgba(139,92,246,0.15))",
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            margin: "0 auto 1.5rem",
            borderRadius: "24px",
            background: "var(--bg-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "3rem",
            fontWeight: 800,
            color: "var(--accent-purple)",
            boxShadow: "0 0 30px rgba(139,92,246,0.2)",
            border: "1px solid var(--border-color)",
            overflow: "hidden",
          }}
        >
          {team.logo_url ? (
            <img
              src={team.logo_url}
              alt={team.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                padding: "10px",
              }}
            />
          ) : null}
          <span style={{ display: team.logo_url ? "none" : "block" }}>
            {team.name.charAt(0).toUpperCase()}
          </span>
        </div>

        <h1 className="page-title">{team.name} Esports Team</h1>

        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            justifyContent: "center",
            marginTop: "1rem",
            flexWrap: "wrap",
          }}
        >
          <span
            className="badge"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--border-color)",
            }}
          >
            🌍 {team.region || "Global"}
          </span>
          {team.country && (
            <span
              className="badge"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border-color)",
              }}
            >
              🚩 {team.country}
            </span>
          )}
          {team.founded_year && (
            <span
              className="badge"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border-color)",
              }}
            >
              Est. {team.founded_year}
            </span>
          )}
        </div>

        {team.description && (
          <p
            style={{
              color: "var(--text-secondary)",
              maxWidth: "600px",
              margin: "1.5rem auto 0",
              lineHeight: 1.6,
            }}
          >
            {team.description}
          </p>
        )}
      </div>

      {/* Verified Team Performance Stats */}
      <TeamStatsWidget
        stats={perfStats}
        recentMatches={recentMatches}
        teamId={id}
      />

      {/* Team Ad Placement — Only rendered on indexable, non-thin profiles */}
      {isIndexable && (
        <AdContainer type="banner" placement="team_roster_break" />
      )}

      {/* About the Team (Editorial Lore) */}
      {team.editorial_content && (
        <section style={{ marginBottom: "3rem" }}>
          <h2
            className="section-title"
            style={{ fontSize: "1.25rem", marginBottom: "1rem" }}
          >
            About the Team
          </h2>
          <div
            className="glass-card"
            style={{
              padding: "2rem",
              lineHeight: 1.8,
              color: "var(--text-secondary)",
            }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: team.editorial_content }}
            />
          </div>
        </section>
      )}

      {/* Recent Match Results Section */}
      {recentMatches.length > 0 && (
        <section style={{ marginBottom: "3rem" }}>
          <div className="section-header">
            <div>
              <h2
                className="section-title"
                style={{ fontSize: "1.25rem", margin: 0 }}
              >
                Recent Match Results
              </h2>
              <p className="section-subtitle" style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                Latest competitive match outcomes and scores
              </p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {recentMatches.map((m) => {
              const isWinner = m.winner_id === id;
              const opponent = m.team1_id === id ? m.team2 : m.team1;
              const opponentId = m.team1_id === id ? m.team2_id : m.team1_id;
              const myScore = m.team1_id === id ? m.score1 : m.score2;
              const oppScore = m.team1_id === id ? m.score2 : m.score1;

              return (
                <div
                  key={m.id}
                  className="card"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1rem 1.5rem",
                    flexWrap: "wrap",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      minWidth: "180px",
                    }}
                  >
                    {m.tournament?.name && (
                      <Link
                        href={`/tournaments/${m.tournament_id}`}
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.82rem",
                          textDecoration: "none",
                          fontWeight: 600,
                        }}
                      >
                        🏆 {m.tournament.name}
                      </Link>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1.25rem",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        fontSize: "0.95rem",
                      }}
                    >
                      {team.name}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "center",
                        background: "var(--bg-secondary)",
                        padding: "0.35rem 0.9rem",
                        borderRadius: "8px",
                        fontFamily: '"Rajdhani", sans-serif',
                        fontWeight: 800,
                        fontSize: "1.1rem",
                      }}
                    >
                      <span
                        style={{
                          color: isWinner ? "#10b981" : "var(--text-primary)",
                        }}
                      >
                        {myScore ?? "-"}
                      </span>
                      <span style={{ color: "var(--text-muted)" }}>:</span>
                      <span
                        style={{
                          color:
                            !isWinner && m.winner_id
                              ? "#10b981"
                              : "var(--text-primary)",
                        }}
                      >
                        {oppScore ?? "-"}
                      </span>
                    </div>
                    {opponentId ? (
                      <Link
                        href={`/teams/${opponentId}`}
                        style={{
                          color: "var(--text-secondary)",
                          textDecoration: "none",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {opponent?.logo_url && (
                          <img
                            src={opponent.logo_url}
                            alt={opponent.name || "Opponent"}
                            width={20}
                            height={20}
                            style={{ objectFit: "contain" }}
                          />
                        )}
                        {opponent?.name || "Opponent"}
                      </Link>
                    ) : (
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.95rem",
                        }}
                      >
                        {opponent?.name || "Opponent"}
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <span
                      className="badge"
                      style={{
                        background: isWinner
                          ? "rgba(16, 185, 129, 0.15)"
                          : "rgba(239, 68, 68, 0.15)",
                        color: isWinner ? "#10b981" : "#ef4444",
                        border: `1px solid ${
                          isWinner
                            ? "rgba(16, 185, 129, 0.3)"
                            : "rgba(239, 68, 68, 0.3)"
                        }`,
                        fontSize: "0.75rem",
                      }}
                    >
                      {isWinner
                        ? "VICTORY"
                        : m.winner_id
                        ? "DEFEAT"
                        : "PENDING"}
                    </span>
                    <Link
                      href={`/matches/${m.id}`}
                      style={{
                        color: "var(--accent-cyan)",
                        fontSize: "0.85rem",
                        textDecoration: "none",
                        fontWeight: 600,
                      }}
                    >
                      Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Head-to-Head & Common Competitors */}
      {opponents.length > 0 && (
        <section style={{ marginBottom: "3rem" }}>
          <div className="section-header">
            <div>
              <h2
                className="section-title"
                style={{ fontSize: "1.25rem", margin: 0 }}
              >
                Top Competitors & Rivals
              </h2>
              <p
                className="section-subtitle"
                style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}
              >
                Head-to-head match history against frequent opponents
              </p>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "1rem",
            }}
          >
            {opponents.map((opp) => {
              const decided = opp.wins + opp.losses;
              const winPct =
                decided > 0
                  ? ((opp.wins / decided) * 100).toFixed(0)
                  : 0;

              return (
                <Link
                  key={opp.id}
                  href={`/teams/${opp.id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    className="glass-card"
                    style={{
                      padding: "1.25rem",
                      transition: "all 0.2s",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "1rem",
                      }}
                    >
                      {opp.logo_url ? (
                        <img
                          src={opp.logo_url}
                          alt={opp.name}
                          width={28}
                          height={28}
                          style={{ objectFit: "contain" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "6px",
                            background: "var(--bg-secondary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            fontSize: "0.75rem",
                          }}
                        >
                          {opp.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            color: "var(--text-primary)",
                          }}
                        >
                          {opp.name}
                        </div>
                        {opp.region && (
                          <div
                            style={{
                              color: "var(--text-muted)",
                              fontSize: "0.75rem",
                            }}
                          >
                            {opp.region}
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px solid var(--border-color)",
                        paddingTop: "0.75rem",
                        fontSize: "0.82rem",
                      }}
                    >
                      <span style={{ color: "var(--text-muted)" }}>
                        {opp.matches_played} Matches
                      </span>
                      <span
                        style={{
                          fontWeight: 700,
                          color:
                            opp.wins > opp.losses
                              ? "#10b981"
                              : opp.wins < opp.losses
                              ? "#ef4444"
                              : "var(--text-secondary)",
                        }}
                      >
                        {opp.wins}W - {opp.losses}L ({winPct}%)
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Roster & Tournament History Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            roster.length > 0 && activeTournaments.length > 0
              ? "1fr 1fr"
              : "1fr",
          gap: "3rem",
        }}
      >
        {/* Active Roster */}
        {roster.length > 0 && (
          <section>
            <div className="section-header">
              <h2 className="section-title">Active Roster</h2>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {roster.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </section>
        )}

        {/* Tournament History */}
        {activeTournaments.length > 0 && (
          <section>
            <div className="section-header">
              <div>
                <h2 className="section-title">Tournament Appearances</h2>
                <p
                  className="section-subtitle"
                  style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}
                >
                  Events and championships competed in
                </p>
              </div>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {activeTournaments.map((t) => (
                <Link
                  key={t.tournament_id}
                  href={`/tournaments/${t.tournament_id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    className="card"
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1rem 1.25rem",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: "1.05rem",
                          fontWeight: 700,
                          marginBottom: 4,
                          color: "var(--text-primary)",
                        }}
                      >
                        {t.tournaments?.name || t.name}
                      </h3>
                      <p
                        style={{
                          color: "var(--text-muted)",
                          fontSize: "0.8rem",
                          margin: 0,
                        }}
                      >
                        {t.tournaments?.games?.name || "Esports"}
                        {t.start_date &&
                          ` • ${new Date(t.start_date).getFullYear()}`}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {t.placement ? (
                        <span
                          className="badge"
                          style={{
                            background:
                              t.placement <= 3
                                ? "rgba(245, 158, 11, 0.15)"
                                : "var(--bg-secondary)",
                            color:
                              t.placement <= 3
                                ? "#f59e0b"
                                : "var(--text-muted)",
                            border:
                              t.placement <= 3
                                ? "1px solid rgba(245, 158, 11, 0.3)"
                                : "1px solid var(--border-color)",
                          }}
                        >
                          {t.placement === 1
                            ? "1st Place 🏆"
                            : t.placement === 2
                            ? "2nd Place 🥈"
                            : t.placement === 3
                            ? "3rd Place 🥉"
                            : `${t.placement}th Place`}
                        </span>
                      ) : (
                        <span
                          className={`badge badge-${
                            t.tournaments?.status || t.status || "upcoming"
                          }`}
                        >
                          {t.tournaments?.status || t.status || "Tracked"}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );

  if (isIndexable) {
    return (
      <DesktopSidebarLayout pageType="team" variant="standard">
        {pageContent}
      </DesktopSidebarLayout>
    );
  }

  return pageContent;
}
