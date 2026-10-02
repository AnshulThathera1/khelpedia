import { getMatchById, getHeadToHeadStats } from "@/lib/queries";
import HeadToHeadWidget from "@/app/components/HeadToHeadWidget";
import AdContainer from "@/app/components/ads/AdContainer";
import DesktopSidebarLayout from "@/app/components/ads/DesktopSidebarLayout";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
    const { id } = await params;
    const match = await getMatchById(id);

    if (!match) return { title: "Match Not Found | KhelPediA" };

    const t1Name = match.team1?.name || "Team 1";
    const t2Name = match.team2?.name || "Team 2";
    const pageTitle = `${t1Name} vs ${t2Name} — Match Results & H2H Statistics`;
    const fullTitle = `${pageTitle} | KhelPediA`;
    const description = `View match results and head-to-head statistics for ${t1Name} vs ${t2Name} on KhelPediA.`;

    return {
        title: pageTitle,
        description,
        alternates: {
            canonical: `https://khelpedia.org/matches/${id}`,
        },
        robots: { index: true, follow: true },
        openGraph: {
            title: fullTitle,
            description,
            type: "website",
            url: `https://khelpedia.org/matches/${id}`,
        },
        twitter: {
            card: "summary_large_image",
            title: fullTitle,
            description,
        },
    };
}

export default async function MatchDetailPage({ params }) {
    const { id } = await params;
    const match = await getMatchById(id);

    if (!match) {
        notFound();
    }

    // Fetch Head-to-Head stats prior to this match
    let h2hStats = null;
    if (match.team1_id && match.team2_id) {
        h2hStats = await getHeadToHeadStats(match.team1_id, match.team2_id, match.played_at);
    }

    const formatDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'TBA';

    const t1Name = match.team1?.name || "TBD";
    const t2Name = match.team2?.name || "TBD";
    const isT1Winner = match.winner_id && match.winner_id === match.team1_id;
    const isT2Winner = match.winner_id && match.winner_id === match.team2_id;

    return (
        <DesktopSidebarLayout pageType="match" variant="compact">
            <div className="page-container" style={{ maxWidth: "900px" }}>
            {/* Tournament Breadcrumb */}
            {match.tournament?.name && (
                <div style={{ marginBottom: "2rem" }}>
                    <Link href={`/tournaments/${match.tournament_id}`} style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.9rem" }}>
                        &larr; {match.tournament.name}
                    </Link>
                </div>
            )}

            {/* Match Header Scorecard */}
            <div className="glass-card" style={{ padding: "3rem 2rem", marginBottom: "3rem", borderTop: "4px solid var(--accent-cyan)" }}>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <span className="badge" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-muted)", marginBottom: "0.5rem", display: "inline-block" }}>
                        {match.round || "Match"} {match.map ? `— ${match.map}` : ""}
                    </span>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                        Played on {formatDate(match.played_at)}
                    </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", gap: "2rem" }}>
                    {/* Team 1 */}
                    <div style={{ flex: 1, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        {match.team1?.logo_url ? (
                            <Image src={match.team1.logo_url} alt={t1Name} width={64} height={64} style={{ objectFit: "contain", marginBottom: "1rem" }} />
                        ) : (
                            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", fontWeight: 800 }}>
                                {t1Name.charAt(0)}
                            </div>
                        )}
                        {match.team1_id ? (
                            <Link href={`/teams/${match.team1_id}`} style={{ color: isT1Winner ? "var(--text-primary)" : "var(--text-muted)", fontWeight: isT1Winner ? 800 : 600, fontSize: "1.25rem", textDecoration: "none" }}>
                                {t1Name}
                            </Link>
                        ) : (
                            <span style={{ color: "var(--text-muted)", fontWeight: 600, fontSize: "1.25rem" }}>{t1Name}</span>
                        )}
                        {isT1Winner && <span style={{ color: "var(--accent-cyan)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", marginTop: "0.25rem" }}>WINNER</span>}
                    </div>

                    {/* Score Box */}
                    <div style={{ background: "var(--bg-secondary)", padding: "1rem 2rem", borderRadius: "16px", border: "1px solid var(--border-color)", textAlign: "center", fontFamily: '"Rajdhani", sans-serif' }}>
                        <div style={{ fontSize: "2.5rem", fontWeight: 900, display: "flex", gap: "1rem", alignItems: "center" }}>
                            <span style={{ color: isT1Winner ? "var(--accent-cyan)" : "var(--text-primary)" }}>{match.score1 ?? "-"}</span>
                            <span style={{ color: "var(--text-muted)", fontSize: "1.5rem" }}>:</span>
                            <span style={{ color: isT2Winner ? "var(--accent-cyan)" : "var(--text-primary)" }}>{match.score2 ?? "-"}</span>
                        </div>
                    </div>

                    {/* Team 2 */}
                    <div style={{ flex: 1, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        {match.team2?.logo_url ? (
                            <Image src={match.team2.logo_url} alt={t2Name} width={64} height={64} style={{ objectFit: "contain", marginBottom: "1rem" }} />
                        ) : (
                            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", fontWeight: 800 }}>
                                {t2Name.charAt(0)}
                            </div>
                        )}
                        {match.team2_id ? (
                            <Link href={`/teams/${match.team2_id}`} style={{ color: isT2Winner ? "var(--text-primary)" : "var(--text-muted)", fontWeight: isT2Winner ? 800 : 600, fontSize: "1.25rem", textDecoration: "none" }}>
                                {t2Name}
                            </Link>
                        ) : (
                            <span style={{ color: "var(--text-muted)", fontWeight: 600, fontSize: "1.25rem" }}>{t2Name}</span>
                        )}
                        {isT2Winner && <span style={{ color: "var(--accent-cyan)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", marginTop: "0.25rem" }}>WINNER</span>}
                    </div>
                </div>
            </div>

            {/* Head to Head History Widget — Only rendered when previous meetings exist */}
            <HeadToHeadWidget h2hStats={h2hStats} team1Name={t1Name} team2Name={t2Name} />

            {/* Post-Match Statistics Ad Break */}
            <AdContainer type="banner" placement="match_post_h2h_break" />
        </div>
        </DesktopSidebarLayout>
    );
}
