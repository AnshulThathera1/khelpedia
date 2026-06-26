import Link from "next/link";

export const metadata = {
    title: "Privacy Policy | KhelPediA",
    description:
        "Read KhelPediA's Privacy Policy. Learn how we collect, use, store, and protect your personal information across our esports data platform.",
    openGraph: {
        title: "Privacy Policy | KhelPediA",
        description:
            "Understand how KhelPediA handles your personal data, including Riot Games API data, analytics, and advertising.",
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

export default function PrivacyPolicyPage() {
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
                    Privacy <span style={{ color: "var(--accent-red)" }}>Policy</span>
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    Last Updated: June 26, 2026
                </p>
            </div>

            {/* Table of Contents */}
            <nav
                className="glass-card"
                style={{ padding: "1.5rem 2rem", marginBottom: "3rem" }}
            >
                <h2
                    style={{
                        fontFamily: '"Rajdhani", sans-serif',
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "var(--text-primary)",
                        marginBottom: "1rem",
                    }}
                >
                    Table of Contents
                </h2>
                <ol
                    style={{
                        color: "var(--accent-cyan)",
                        paddingLeft: "1.5rem",
                        lineHeight: 2.2,
                        fontSize: "0.9rem",
                    }}
                >
                    <li>Information We Collect</li>
                    <li>Riot Games API & Opt-In Policy</li>
                    <li>How We Use Your Information</li>
                    <li>Data Storage & Retention</li>
                    <li>Cookies & Tracking Technologies</li>
                    <li>Google Analytics</li>
                    <li>Google AdSense & Advertising</li>
                    <li>Third-Party Services</li>
                    <li>Your Rights</li>
                    <li>Children&apos;s Privacy</li>
                    <li>Changes to This Policy</li>
                    <li>Contact Us</li>
                </ol>
            </nav>

            {/* 1. Information We Collect */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>1. Information We Collect</h2>
                <p style={paragraphStyle}>
                    KhelPediA collects information in several ways depending on how you
                    use the platform:
                </p>

                <h3
                    style={{
                        fontFamily: '"Rajdhani", sans-serif',
                        fontSize: "1.15rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: "0.5rem",
                    }}
                >
                    Account Information
                </h3>
                <p style={paragraphStyle}>
                    When you create an account or sign in using Riot Sign-On (RSO), we
                    collect your PUUID, Game Name, and Tagline as provided by the Riot
                    Games API. We may also store your email address and display name for
                    authentication purposes.
                </p>

                <h3
                    style={{
                        fontFamily: '"Rajdhani", sans-serif',
                        fontSize: "1.15rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: "0.5rem",
                    }}
                >
                    Gameplay Data
                </h3>
                <p style={paragraphStyle}>
                    For users who opt-in via RSO, we collect gameplay statistics
                    including match history, agent usage, competitive rank, and
                    performance metrics from the Riot Games API.
                </p>

                <h3
                    style={{
                        fontFamily: '"Rajdhani", sans-serif',
                        fontSize: "1.15rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: "0.5rem",
                    }}
                >
                    Automatically Collected Data
                </h3>
                <p style={paragraphStyle}>
                    When you visit KhelPediA, we automatically collect certain
                    information through cookies and analytics tools, including your IP
                    address (anonymized), browser type, device type, pages visited,
                    referring URL, and session duration. This data is collected via
                    Google Analytics and is used solely for improving the platform.
                </p>
            </section>

            {/* 2. Riot Games API */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>2. Riot Games API & Opt-In Policy</h2>
                <div
                    className="glass-card"
                    style={{
                        padding: "2rem",
                        borderTop: "4px solid var(--accent-cyan)",
                        marginBottom: "1rem",
                    }}
                >
                    <p
                        style={{
                            color: "var(--accent-cyan)",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            marginBottom: "1rem",
                        }}
                    >
                        Player Privacy & Consent
                    </p>
                    <p style={{ ...paragraphStyle, marginBottom: "1rem" }}>
                        We respect your privacy and comply fully with Riot Games&apos;
                        &quot;Opt-in&quot; requirements. We only store and display detailed
                        statistics for players who have:
                    </p>
                    <ul
                        style={{
                            color: "var(--text-secondary)",
                            paddingLeft: "1.5rem",
                            lineHeight: 2,
                            marginBottom: "1rem",
                        }}
                    >
                        <li>
                            Logged in via the official Riot Sign-On (RSO) portal
                        </li>
                        <li>
                            Explicitly consented to their stats being trackable on
                            KhelPediA
                        </li>
                    </ul>
                    <p style={{ ...paragraphStyle, marginBottom: 0 }}>
                        You can revoke this consent at any time by contacting us at{" "}
                        <a
                            href="mailto:contact@khelpedia.org"
                            style={{ color: "var(--accent-cyan)", textDecoration: "none" }}
                        >
                            contact@khelpedia.org
                        </a>{" "}
                        or by disconnecting your Riot account from KhelPediA.
                    </p>
                </div>
            </section>

            {/* 3. How We Use */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>3. How We Use Your Information</h2>
                <p style={paragraphStyle}>We use the information we collect to:</p>
                <ul
                    style={{
                        color: "var(--text-secondary)",
                        paddingLeft: "1.5rem",
                        lineHeight: 2.2,
                        marginBottom: "1rem",
                    }}
                >
                    <li>Provide and maintain the KhelPediA platform</li>
                    <li>Display your Valorant statistics (if opted-in via RSO)</li>
                    <li>Authenticate your identity and manage your account</li>
                    <li>Analyze usage patterns to improve site performance and content</li>
                    <li>Serve relevant advertisements through Google AdSense</li>
                    <li>Communicate with you about platform updates (if applicable)</li>
                    <li>Detect and prevent abuse, fraud, or technical issues</li>
                </ul>
                <p style={paragraphStyle}>
                    We do <strong style={{ color: "var(--text-primary)" }}>not</strong> sell
                    your personal data to third parties. We do{" "}
                    <strong style={{ color: "var(--text-primary)" }}>not</strong> share your
                    gaming data with other users unless you have explicitly opted-in.
                </p>
            </section>

            {/* 4. Data Storage */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>4. Data Storage & Retention</h2>
                <p style={paragraphStyle}>
                    Your data is stored securely on servers provided by Supabase
                    (PostgreSQL) and Vercel. We cache match history and account data to
                    improve performance and reduce API load. This cached data is updated
                    periodically.
                </p>
                <p style={paragraphStyle}>
                    If you request deletion of your data, we will remove all personally
                    identifiable information within 30 days. Anonymized, aggregated
                    statistics may be retained for analytical purposes.
                </p>
            </section>

            {/* 5. Cookies */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>5. Cookies & Tracking Technologies</h2>
                <p style={paragraphStyle}>
                    KhelPediA uses cookies to enhance your experience. These include
                    essential cookies (theme preferences, authentication), analytics
                    cookies (Google Analytics), and advertising cookies (Google AdSense).
                </p>
                <p style={paragraphStyle}>
                    For detailed information about the cookies we use and how to manage
                    them, please see our{" "}
                    <Link
                        href="/cookies"
                        style={{ color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 600 }}
                    >
                        Cookie Policy
                    </Link>
                    .
                </p>
            </section>

            {/* 6. Google Analytics */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>6. Google Analytics</h2>
                <p style={paragraphStyle}>
                    We use Google Analytics 4 (GA4) to collect anonymized data about how
                    visitors use KhelPediA. This includes page views, session duration,
                    bounce rate, and demographic information. Google Analytics uses
                    cookies and may transfer data to Google servers in the United States.
                </p>
                <p style={paragraphStyle}>
                    You can opt out of Google Analytics tracking by installing the{" "}
                    <a
                        href="https://tools.google.com/dlpage/gaoptout"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--accent-cyan)", textDecoration: "none" }}
                    >
                        Google Analytics Opt-Out Browser Add-on
                    </a>
                    .
                </p>
            </section>

            {/* 7. AdSense */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>7. Google AdSense & Advertising</h2>
                <p style={paragraphStyle}>
                    KhelPediA uses Google AdSense to display advertisements. Google may
                    use cookies and web beacons to serve ads based on your browsing
                    history on KhelPediA and other websites. This enables Google to show
                    you advertisements that are more relevant to your interests.
                </p>
                <p style={paragraphStyle}>
                    You can opt out of personalized advertising by visiting{" "}
                    <a
                        href="https://adssettings.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--accent-cyan)", textDecoration: "none" }}
                    >
                        Google Ad Settings
                    </a>
                    . Google&apos;s use of advertising cookies is governed by their own{" "}
                    <a
                        href="https://policies.google.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--accent-cyan)", textDecoration: "none" }}
                    >
                        Privacy Policy
                    </a>
                    .
                </p>
            </section>

            {/* 8. Third-Party */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>8. Third-Party Services</h2>
                <p style={paragraphStyle}>
                    KhelPediA integrates with the following third-party services, each
                    with their own privacy practices:
                </p>
                <ul
                    style={{
                        color: "var(--text-secondary)",
                        paddingLeft: "1.5rem",
                        lineHeight: 2.2,
                        marginBottom: "1rem",
                    }}
                >
                    <li><strong style={{ color: "var(--text-primary)" }}>Supabase</strong> — Database and authentication</li>
                    <li><strong style={{ color: "var(--text-primary)" }}>Vercel</strong> — Hosting and edge functions</li>
                    <li><strong style={{ color: "var(--text-primary)" }}>Riot Games API</strong> — Valorant player data</li>
                    <li><strong style={{ color: "var(--text-primary)" }}>PandaScore API</strong> — Tournament and match data</li>
                    <li><strong style={{ color: "var(--text-primary)" }}>Google Analytics</strong> — Website analytics</li>
                    <li><strong style={{ color: "var(--text-primary)" }}>Google AdSense</strong> — Advertising</li>
                </ul>
                <p style={paragraphStyle}>
                    We recommend reviewing each provider&apos;s privacy policy for a complete
                    understanding of how they handle data.
                </p>
            </section>

            {/* 9. Your Rights */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>9. Your Rights</h2>
                <p style={paragraphStyle}>
                    Depending on your jurisdiction, you may have the following rights
                    regarding your personal data:
                </p>
                <ul
                    style={{
                        color: "var(--text-secondary)",
                        paddingLeft: "1.5rem",
                        lineHeight: 2.2,
                        marginBottom: "1rem",
                    }}
                >
                    <li><strong style={{ color: "var(--text-primary)" }}>Access</strong> — Request a copy of the data we hold about you</li>
                    <li><strong style={{ color: "var(--text-primary)" }}>Correction</strong> — Request correction of inaccurate data</li>
                    <li><strong style={{ color: "var(--text-primary)" }}>Deletion</strong> — Request deletion of your personal data</li>
                    <li><strong style={{ color: "var(--text-primary)" }}>Portability</strong> — Request your data in a machine-readable format</li>
                    <li><strong style={{ color: "var(--text-primary)" }}>Objection</strong> — Object to processing of your personal data</li>
                </ul>
                <p style={paragraphStyle}>
                    To exercise any of these rights, please contact us at{" "}
                    <a
                        href="mailto:contact@khelpedia.org"
                        style={{ color: "var(--accent-cyan)", textDecoration: "none" }}
                    >
                        contact@khelpedia.org
                    </a>
                    . We will respond to your request within 30 days.
                </p>
            </section>

            {/* 10. Children */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>10. Children&apos;s Privacy</h2>
                <p style={paragraphStyle}>
                    KhelPediA is not directed at children under the age of 13. We do not
                    knowingly collect personal information from children under 13. If we
                    become aware that we have collected personal data from a child under
                    13, we will take steps to delete that information promptly.
                </p>
            </section>

            {/* 11. Changes */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>11. Changes to This Policy</h2>
                <p style={paragraphStyle}>
                    We may update this Privacy Policy from time to time. The &quot;Last
                    Updated&quot; date at the top of this page reflects the most recent
                    revision. We encourage you to review this page periodically to stay
                    informed about how we protect your information.
                </p>
            </section>

            {/* 12. Contact */}
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
                    12. Contact Us
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                    If you have any questions about this Privacy Policy, please contact
                    us at{" "}
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

            {/* Riot Disclaimer */}
            <section style={{ marginBottom: "2rem" }}>
                <p
                    style={{
                        color: "var(--text-muted)",
                        fontSize: "0.8rem",
                        fontStyle: "italic",
                        lineHeight: 1.7,
                        borderTop: "1px solid var(--border-color)",
                        paddingTop: "2rem",
                    }}
                >
                    KhelPediA isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views
                    or opinions of Riot Games or anyone officially involved in producing
                    or managing Riot Games properties. Riot Games, and all associated
                    properties are trademarks or registered trademarks of Riot Games, Inc.
                </p>
            </section>
        </div>
    );
}
