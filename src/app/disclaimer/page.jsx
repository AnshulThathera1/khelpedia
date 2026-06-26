import Link from "next/link";

export const metadata = {
    title: "Disclaimer | KhelPediA",
    description:
        "Read the KhelPediA disclaimer regarding data accuracy, third-party affiliations, and intellectual property. KhelPediA is an independent esports data platform.",
    openGraph: {
        title: "Disclaimer | KhelPediA",
        description:
            "Important disclaimers regarding KhelPediA's data sources, affiliations, and intellectual property.",
    },
};

const headingStyle = {
    fontFamily: '"Rajdhani", sans-serif',
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    marginBottom: "1rem",
    paddingBottom: "0.75rem",
    borderBottom: "1px solid var(--border-color)",
};

const paragraphStyle = {
    color: "var(--text-secondary)",
    fontSize: "1rem",
    lineHeight: 1.8,
    marginBottom: "1rem",
};

const sectionStyle = {
    marginBottom: "3rem",
};

export default function DisclaimerPage() {
    return (
        <div className="page-container" style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem 1.5rem" }}>
            {/* Header */}
            <div style={{ marginBottom: "3rem" }}>
                <h1
                    style={{
                        fontFamily: '"Rajdhani", sans-serif',
                        fontSize: "clamp(2rem, 4vw, 3rem)",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "var(--text-primary)",
                        marginBottom: "0.75rem",
                    }}
                >
                    <span style={{ color: "var(--accent-red)" }}>Disclaimer</span>
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    Last Updated: June 26, 2026
                </p>
            </div>

            {/* General Disclaimer */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>1. General Information</h2>
                <p style={paragraphStyle}>
                    The information provided on KhelPediA (https://khelpedia.org) is for
                    general informational and entertainment purposes only. While we strive
                    to keep the information up-to-date and accurate, we make no
                    representations or warranties of any kind, express or implied, about
                    the completeness, accuracy, reliability, suitability, or availability
                    of the information, products, services, or related graphics contained
                    on the website.
                </p>
                <p style={paragraphStyle}>
                    Any reliance you place on such information is therefore strictly at
                    your own risk. In no event shall KhelPediA be liable for any loss or
                    damage arising from the use of this website.
                </p>
            </section>

            {/* No Affiliation */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>2. No Affiliation with Game Publishers</h2>
                <div
                    className="glass-card"
                    style={{
                        padding: "2rem",
                        borderTop: "4px solid var(--accent-red)",
                    }}
                >
                    <p
                        style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.95rem",
                            lineHeight: 1.8,
                            marginBottom: "1rem",
                        }}
                    >
                        KhelPediA is an <strong style={{ color: "var(--text-primary)" }}>independent, fan-operated platform</strong>.
                        We are not affiliated with, endorsed by, or officially connected to
                        any of the following companies or their subsidiaries:
                    </p>
                    <ul
                        style={{
                            color: "var(--text-muted)",
                            paddingLeft: "1.5rem",
                            lineHeight: 2.2,
                            marginBottom: "1rem",
                        }}
                    >
                        <li>
                            <strong style={{ color: "var(--text-secondary)" }}>Riot Games, Inc.</strong> — Valorant, League of Legends
                        </li>
                        <li>
                            <strong style={{ color: "var(--text-secondary)" }}>Valve Corporation</strong> — Counter-Strike 2 (CS2), Dota 2
                        </li>
                        <li>
                            <strong style={{ color: "var(--text-secondary)" }}>Krafton, Inc.</strong> — BGMI, PUBG Mobile
                        </li>
                        <li>
                            <strong style={{ color: "var(--text-secondary)" }}>Garena (Sea Limited)</strong> — Free Fire
                        </li>
                        <li>
                            <strong style={{ color: "var(--text-secondary)" }}>Any other game publisher</strong> whose titles are featured on this platform
                        </li>
                    </ul>
                    <p
                        style={{
                            color: "var(--text-muted)",
                            fontSize: "0.85rem",
                            fontStyle: "italic",
                        }}
                    >
                        All game names, logos, images, and trademarks are the property of
                        their respective owners. Their use on KhelPediA is for
                        informational purposes only and does not imply endorsement.
                    </p>
                </div>
            </section>

            {/* Data Accuracy */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>3. Data Accuracy</h2>
                <p style={paragraphStyle}>
                    KhelPediA aggregates esports data from multiple sources including the
                    PandaScore API, the Riot Games API, and manual curation by our
                    editorial team. While we take every reasonable step to ensure data
                    accuracy, the nature of live esports means information can change
                    rapidly.
                </p>
                <p style={paragraphStyle}>
                    Tournament results, player statistics, team rosters, and prize pool
                    figures are provided &quot;as-is&quot; and may occasionally contain errors or
                    delays. We encourage users to verify critical information through
                    official sources when accuracy is essential (for example, in
                    journalistic or financial contexts).
                </p>
                <p style={paragraphStyle}>
                    If you find any inaccurate data on KhelPediA, please{" "}
                    <Link
                        href="/contact"
                        style={{ color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 600 }}
                    >
                        contact us
                    </Link>{" "}
                    and we will review and correct it as soon as possible.
                </p>
            </section>

            {/* Third-Party APIs */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>4. Third-Party APIs & Services</h2>
                <p style={paragraphStyle}>
                    KhelPediA uses third-party APIs to retrieve esports data. Our use of
                    these APIs is governed by the respective API providers&apos; terms of
                    service. Specifically:
                </p>
                <div
                    className="glass-card"
                    style={{
                        padding: "1.5rem 2rem",
                        marginBottom: "1rem",
                    }}
                >
                    <h3
                        style={{
                            fontFamily: '"Rajdhani", sans-serif',
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            marginBottom: "0.5rem",
                        }}
                    >
                        Riot Games API
                    </h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                        KhelPediA isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views
                        or opinions of Riot Games or anyone officially involved in
                        producing or managing Riot Games properties. Riot Games, and all
                        associated properties are trademarks or registered trademarks of
                        Riot Games, Inc. We comply fully with Riot Games&apos; &quot;Opt-in&quot; policy
                        for player data — detailed statistics are only shown for players
                        who have explicitly consented via Riot Sign-On (RSO).
                    </p>
                </div>
                <div
                    className="glass-card"
                    style={{ padding: "1.5rem 2rem" }}
                >
                    <h3
                        style={{
                            fontFamily: '"Rajdhani", sans-serif',
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            marginBottom: "0.5rem",
                        }}
                    >
                        PandaScore API
                    </h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                        Tournament and match data is sourced in part from PandaScore. We
                        use this data in accordance with their API terms and credit them
                        as a data source. PandaScore is a trademark of PandaScore SAS.
                    </p>
                </div>
            </section>

            {/* External Links */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>5. External Links</h2>
                <p style={paragraphStyle}>
                    KhelPediA may contain links to external websites or services that are
                    not operated by us. We have no control over, and assume no
                    responsibility for, the content, privacy policies, or practices of
                    any third-party websites. We encourage you to read the terms and
                    privacy policies of any external site you visit through links on
                    KhelPediA.
                </p>
            </section>

            {/* Intellectual Property */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>6. Intellectual Property</h2>
                <p style={paragraphStyle}>
                    Original content published on KhelPediA — including articles,
                    analyses, guides, and editorial commentary — is the intellectual
                    property of KhelPediA and its contributors unless otherwise stated.
                    You may reference our content with proper attribution and a link
                    back to the original article.
                </p>
                <p style={paragraphStyle}>
                    Game logos, player images, tournament branding, and other media used
                    on KhelPediA belong to their respective copyright holders and are used
                    under fair use for informational and editorial purposes.
                </p>
            </section>

            {/* No Gambling */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>7. No Gambling or Betting Advice</h2>
                <p style={paragraphStyle}>
                    KhelPediA does not provide gambling, betting, or wagering advice.
                    Any match predictions, team rankings, or tournament analyses
                    published on this platform are for informational and entertainment
                    purposes only and should not be construed as betting recommendations.
                </p>
            </section>

            {/* Contact */}
            <section
                className="glass-card"
                style={{
                    padding: "2rem 2.5rem",
                    borderTop: "4px solid var(--accent-red)",
                    marginBottom: "3rem",
                }}
            >
                <h2
                    style={{
                        fontFamily: '"Rajdhani", sans-serif',
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: "0.75rem",
                    }}
                >
                    Questions About This Disclaimer?
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                    If you have any questions or concerns, please reach out to us at{" "}
                    <a
                        href="mailto:contact@khelpedia.org"
                        style={{ color: "var(--accent-cyan)", textDecoration: "none" }}
                    >
                        contact@khelpedia.org
                    </a>{" "}
                    or visit our{" "}
                    <Link
                        href="/contact"
                        style={{ color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 600 }}
                    >
                        Contact page
                    </Link>
                    .
                </p>
            </section>
        </div>
    );
}
