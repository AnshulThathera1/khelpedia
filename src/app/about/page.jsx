import Link from "next/link";

export const metadata = {
    title: "About Us | KhelPediA",
    description:
        "Learn about KhelPediA — the ultimate esports encyclopedia. Our mission, the team behind the platform, and how we deliver real-time tournament tracking, player analytics, and team insights.",
    openGraph: {
        title: "About KhelPediA — The Esports Encyclopedia",
        description:
            "KhelPediA is the epicenter of global esports. Discover our mission, our team, and what makes us the most comprehensive esports data platform.",
    },
};

const stats = [
    { label: "Games Tracked", value: "10+", icon: "🎮" },
    { label: "Tournaments Monitored", value: "500+", icon: "🏆" },
    { label: "Pro Players Profiled", value: "2,000+", icon: "👤" },
    { label: "Teams Catalogued", value: "800+", icon: "⚔️" },
];

const values = [
    {
        title: "Comprehensive Coverage",
        description:
            "From tier-one LAN majors to regional qualifiers, we track tournaments across every competitive title — Valorant, CS2, BGMI, Dota 2, Free Fire, PUBG Mobile, and more.",
        icon: "🌍",
    },
    {
        title: "Real-Time Data",
        description:
            "Our platform ingests live data from official APIs and trusted sources, ensuring you get up-to-the-minute scores, standings, and roster changes as they happen.",
        icon: "⚡",
    },
    {
        title: "Original Analysis",
        description:
            "Beyond raw statistics, our editorial team publishes tournament previews, meta guides, patch analyses, and in-depth team profiles to give you context behind the numbers.",
        icon: "📝",
    },
    {
        title: "Community First",
        description:
            "KhelPediA is built by esports fans, for esports fans. We believe competitive gaming data should be accessible, well-organized, and free for everyone.",
        icon: "🤝",
    },
];

const dataSources = [
    {
        name: "PandaScore API",
        description: "Global tournament brackets, match results, and team rosters across all major esports titles.",
    },
    {
        name: "Riot Games API",
        description: "Official Valorant match data, player statistics, and competitive rankings via Riot Sign-On (RSO) integration.",
    },
    {
        name: "Community & Manual Curation",
        description: "Our editorial team verifies data, adds context, and covers regional tournaments that automated sources may miss.",
    },
];

export default function AboutPage() {
    return (
        <div className="page-container">
            {/* Page Header */}
            <div className="page-header" style={{ marginBottom: "4rem", textAlign: "center" }}>
                <h1
                    className="page-title"
                    style={{
                        fontFamily: '"Rajdhani", sans-serif',
                        fontSize: "clamp(2.5rem, 5vw, 4rem)",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        lineHeight: 1.1,
                        marginBottom: "1.5rem",
                    }}
                >
                    THE <span style={{ color: "var(--accent-red)" }}>ESPORTS</span>{" "}
                    ENCYCLOPEDIA
                </h1>
                <p
                    style={{
                        color: "var(--text-secondary)",
                        fontSize: "1.15rem",
                        maxWidth: "700px",
                        margin: "0 auto",
                        lineHeight: 1.7,
                    }}
                >
                    KhelPediA is a comprehensive esports data platform that combines
                    real-time tournament tracking, in-depth player analytics, and
                    original editorial content to serve the global competitive gaming
                    community.
                </p>
            </div>

            {/* Stats Bar */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "1.5rem",
                    marginBottom: "5rem",
                }}
            >
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="glass-card"
                        style={{
                            padding: "2rem 1.5rem",
                            textAlign: "center",
                        }}
                    >
                        <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
                            {stat.icon}
                        </div>
                        <div
                            style={{
                                fontSize: "2rem",
                                fontWeight: 900,
                                fontFamily: '"Rajdhani", sans-serif',
                                color: "var(--accent-red)",
                                lineHeight: 1,
                                marginBottom: "0.5rem",
                            }}
                        >
                            {stat.value}
                        </div>
                        <div
                            style={{
                                color: "var(--text-muted)",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                            }}
                        >
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Our Mission */}
            <section style={{ marginBottom: "5rem" }}>
                <h2
                    className="section-title"
                    style={{ marginBottom: "1.5rem" }}
                >
                    Our Mission
                </h2>
                <div
                    className="glass-card"
                    style={{
                        padding: "3rem 2.5rem",
                        borderTop: "4px solid var(--accent-red)",
                    }}
                >
                    <p
                        style={{
                            color: "var(--text-secondary)",
                            fontSize: "1.1rem",
                            lineHeight: 1.8,
                            marginBottom: "1.5rem",
                        }}
                    >
                        Esports is the fastest-growing entertainment industry in the
                        world, yet finding reliable, well-organized competitive gaming
                        data remains surprisingly difficult. Tournament schedules are
                        scattered across dozens of sites, player stats are locked behind
                        paywalls, and roster changes break faster than anyone can track.
                    </p>
                    <p
                        style={{
                            color: "var(--text-secondary)",
                            fontSize: "1.1rem",
                            lineHeight: 1.8,
                            marginBottom: "1.5rem",
                        }}
                    >
                        <strong style={{ color: "var(--text-primary)" }}>
                            KhelPediA exists to solve that problem.
                        </strong>{" "}
                        We are building the definitive esports encyclopedia — a single
                        platform where fans, analysts, journalists, and teams can find
                        everything they need about competitive gaming. From live
                        tournament brackets to historical performance data, from breaking
                        roster news to deep-dive analytical articles, KhelPediA aims to
                        be the Wikipedia of esports.
                    </p>
                    <p
                        style={{
                            color: "var(--text-secondary)",
                            fontSize: "1.1rem",
                            lineHeight: 1.8,
                        }}
                    >
                        The name <strong style={{ color: "var(--text-primary)" }}>KhelPediA</strong> combines
                        &quot;Khel&quot; (खेल — the Hindi word for &quot;game&quot; or &quot;sport&quot;) with
                        &quot;Pedia&quot; (from encyclopedia), reflecting our goal to be a
                        globally inclusive knowledge base rooted in the spirit of
                        competitive play.
                    </p>
                </div>
            </section>

            {/* What We Offer */}
            <section style={{ marginBottom: "5rem" }}>
                <h2
                    className="section-title"
                    style={{ marginBottom: "1.5rem" }}
                >
                    What We Offer
                </h2>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "1.5rem",
                    }}
                >
                    {values.map((value) => (
                        <div
                            key={value.title}
                            className="card"
                            style={{ padding: "2rem" }}
                        >
                            <div
                                style={{
                                    fontSize: "2rem",
                                    marginBottom: "1rem",
                                }}
                            >
                                {value.icon}
                            </div>
                            <h3
                                style={{
                                    fontFamily: '"Rajdhani", sans-serif',
                                    fontSize: "1.3rem",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                    marginBottom: "0.75rem",
                                    color: "var(--text-primary)",
                                }}
                            >
                                {value.title}
                            </h3>
                            <p
                                style={{
                                    color: "var(--text-muted)",
                                    fontSize: "0.95rem",
                                    lineHeight: 1.7,
                                }}
                            >
                                {value.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Data Sources */}
            <section style={{ marginBottom: "5rem" }}>
                <h2
                    className="section-title"
                    style={{ marginBottom: "1.5rem" }}
                >
                    Our Data Sources
                </h2>
                <p
                    style={{
                        color: "var(--text-secondary)",
                        fontSize: "1rem",
                        lineHeight: 1.7,
                        marginBottom: "2rem",
                        maxWidth: "700px",
                    }}
                >
                    Accuracy is at the core of everything we do. We aggregate data from
                    multiple trusted sources and verify it through manual curation to
                    ensure the information you see on KhelPediA is reliable and
                    up-to-date.
                </p>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                    }}
                >
                    {dataSources.map((source, index) => (
                        <div
                            key={source.name}
                            className="glass-card"
                            style={{
                                padding: "1.5rem 2rem",
                                display: "flex",
                                gap: "1.5rem",
                                alignItems: "flex-start",
                            }}
                        >
                            <div
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    background: "rgba(255, 70, 85, 0.1)",
                                    border: "1px solid rgba(255, 70, 85, 0.2)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    fontFamily: '"Rajdhani", sans-serif',
                                    fontWeight: 800,
                                    color: "var(--accent-red)",
                                    fontSize: "1.1rem",
                                }}
                            >
                                {index + 1}
                            </div>
                            <div>
                                <h3
                                    style={{
                                        fontFamily: '"Rajdhani", sans-serif',
                                        fontSize: "1.15rem",
                                        fontWeight: 700,
                                        color: "var(--text-primary)",
                                        marginBottom: "0.25rem",
                                    }}
                                >
                                    {source.name}
                                </h3>
                                <p
                                    style={{
                                        color: "var(--text-muted)",
                                        fontSize: "0.9rem",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {source.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* The Team */}
            <section style={{ marginBottom: "5rem" }}>
                <h2
                    className="section-title"
                    style={{ marginBottom: "1.5rem" }}
                >
                    The Team
                </h2>
                <div
                    className="glass-card"
                    style={{
                        padding: "3rem 2.5rem",
                        borderTop: "4px solid var(--accent-cyan)",
                    }}
                >
                    <p
                        style={{
                            color: "var(--text-secondary)",
                            fontSize: "1.05rem",
                            lineHeight: 1.8,
                            marginBottom: "1.5rem",
                        }}
                    >
                        KhelPediA is built and maintained by a small, passionate team of
                        esports enthusiasts and software engineers. We&apos;re gamers first
                        and developers second — which means we build the tools and
                        content we wish existed when we were looking up tournament
                        brackets at 3 AM.
                    </p>
                    <p
                        style={{
                            color: "var(--text-secondary)",
                            fontSize: "1.05rem",
                            lineHeight: 1.8,
                            marginBottom: "1.5rem",
                        }}
                    >
                        Our editorial team covers multiple esports titles and produces
                        original content including tournament previews, post-match
                        analyses, meta guides, and roster change reports. Every article
                        on KhelPediA is written or reviewed by someone who genuinely
                        follows the competitive scene.
                    </p>
                    <p
                        style={{
                            color: "var(--text-secondary)",
                            fontSize: "1.05rem",
                            lineHeight: 1.8,
                        }}
                    >
                        Want to join us or contribute?{" "}
                        <Link
                            href="/contact"
                            style={{
                                color: "var(--accent-cyan)",
                                textDecoration: "none",
                                fontWeight: 600,
                            }}
                        >
                            Get in touch →
                        </Link>
                    </p>
                </div>
            </section>

            {/* CTA */}
            <section
                style={{
                    textAlign: "center",
                    padding: "4rem 2rem",
                    marginBottom: "2rem",
                }}
            >
                <h2
                    style={{
                        fontFamily: '"Rajdhani", sans-serif',
                        fontSize: "2rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        marginBottom: "1rem",
                    }}
                >
                    Ready to Explore?
                </h2>
                <p
                    style={{
                        color: "var(--text-muted)",
                        marginBottom: "2rem",
                        fontSize: "1rem",
                    }}
                >
                    Dive into live tournaments, discover top players, and stay updated
                    with the latest esports news.
                </p>
                <div
                    style={{
                        display: "flex",
                        gap: "1rem",
                        justifyContent: "center",
                        flexWrap: "wrap",
                    }}
                >
                    <Link href="/tournaments" className="btn-primary">
                        Browse Tournaments
                    </Link>
                    <Link href="/blogs" className="btn-secondary">
                        Read Our Articles
                    </Link>
                </div>
            </section>
        </div>
    );
}
