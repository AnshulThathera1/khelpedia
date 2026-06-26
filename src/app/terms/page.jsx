import Link from "next/link";

export const metadata = {
    title: "Terms of Service | KhelPediA",
    description:
        "Read KhelPediA's Terms of Service. By using our esports data platform, you agree to these terms governing your access, conduct, and use of our services.",
    openGraph: {
        title: "Terms of Service | KhelPediA",
        description:
            "Terms governing your use of KhelPediA, including user conduct, intellectual property, and Riot Games API compliance.",
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

export default function TermsOfServicePage() {
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
                    Terms of <span style={{ color: "var(--accent-red)" }}>Service</span>
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    Last Updated: June 26, 2026
                </p>
            </div>

            {/* 1. Acceptance */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>1. Acceptance of Terms</h2>
                <p style={paragraphStyle}>
                    By accessing or using KhelPediA (&quot;the Platform&quot;), you agree to be
                    bound by these Terms of Service (&quot;Terms&quot;) and all applicable laws
                    and regulations. If you do not agree with any of these terms, you
                    should not use KhelPediA.
                </p>
                <p style={paragraphStyle}>
                    These Terms apply to all visitors, users, and others who access or
                    use the Platform, including users who contribute content such as
                    articles, comments, or corrections.
                </p>
            </section>

            {/* 2. Description of Service */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>2. Description of Service</h2>
                <p style={paragraphStyle}>
                    KhelPediA is a free, fan-operated esports data platform that
                    provides:
                </p>
                <ul
                    style={{
                        color: "var(--text-secondary)",
                        paddingLeft: "1.5rem",
                        lineHeight: 2.2,
                        marginBottom: "1rem",
                    }}
                >
                    <li>Real-time tournament tracking and match results</li>
                    <li>Professional player profiles, statistics, and rankings</li>
                    <li>Esports team information and roster tracking</li>
                    <li>Valorant player statistics via Riot Games API integration</li>
                    <li>Original editorial content including news, analysis, and guides</li>
                    <li>Game-specific pages for multiple esports titles</li>
                </ul>
                <p style={paragraphStyle}>
                    The Platform is provided &quot;as-is&quot; and &quot;as-available&quot; without any
                    warranties of any kind.
                </p>
            </section>

            {/* 3. User Accounts */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>3. User Accounts</h2>
                <p style={paragraphStyle}>
                    Some features of KhelPediA require you to create an account. When you
                    create an account, you agree to:
                </p>
                <ul
                    style={{
                        color: "var(--text-secondary)",
                        paddingLeft: "1.5rem",
                        lineHeight: 2.2,
                        marginBottom: "1rem",
                    }}
                >
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Notify us immediately of any unauthorized access</li>
                    <li>Accept responsibility for all activities under your account</li>
                </ul>
                <p style={paragraphStyle}>
                    We reserve the right to suspend or terminate accounts that violate
                    these Terms.
                </p>
            </section>

            {/* 4. Riot Games */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>4. Riot Games Compliance & Opt-In Policy</h2>
                <div
                    className="glass-card"
                    style={{
                        padding: "2rem",
                        borderTop: "4px solid var(--accent-red)",
                        marginBottom: "1rem",
                    }}
                >
                    <p
                        style={{
                            color: "var(--accent-red)",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            marginBottom: "1rem",
                        }}
                    >
                        Important Notice for Valorant Players
                    </p>
                    <p style={{ ...paragraphStyle, marginBottom: "1rem" }}>
                        KhelPediA uses the Riot Games API in compliance with Riot
                        Games&apos; policies. We implement an <strong style={{ color: "var(--text-primary)" }}>&quot;Opt-in&quot;</strong> policy
                        for player data:
                    </p>
                    <ul
                        style={{
                            color: "var(--text-secondary)",
                            paddingLeft: "1.5rem",
                            lineHeight: 2.2,
                            marginBottom: "1rem",
                        }}
                    >
                        <li>
                            Detailed statistics and match history are only displayed for
                            players who have explicitly opted-in by signing in via Riot
                            Sign-On (RSO)
                        </li>
                        <li>
                            If you have not signed up for KhelPediA via RSO, your detailed
                            information will not be made available to other users
                        </li>
                        <li>
                            By signing in with your Riot Account, you authorize KhelPediA
                            to store and display your gameplay data in accordance with
                            these Terms
                        </li>
                    </ul>
                    <p style={{ ...paragraphStyle, marginBottom: 0 }}>
                        You may revoke this authorization at any time by contacting us at{" "}
                        <a
                            href="mailto:contact@khelpedia.org"
                            style={{ color: "var(--accent-cyan)", textDecoration: "none" }}
                        >
                            contact@khelpedia.org
                        </a>
                        .
                    </p>
                </div>
            </section>

            {/* 5. User Conduct */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>5. User Conduct</h2>
                <p style={paragraphStyle}>
                    When using KhelPediA, you agree not to:
                </p>
                <ul
                    style={{
                        color: "var(--text-secondary)",
                        paddingLeft: "1.5rem",
                        lineHeight: 2.2,
                        marginBottom: "1rem",
                    }}
                >
                    <li>Use the Platform for any unlawful purpose</li>
                    <li>
                        Attempt to gain unauthorized access to any part of the Platform
                        or its infrastructure
                    </li>
                    <li>
                        Scrape, data-mine, or use automated tools to extract data from
                        KhelPediA without prior written consent
                    </li>
                    <li>
                        Interfere with or disrupt the Platform or servers connected to it
                    </li>
                    <li>
                        Impersonate any person or entity, or falsely claim affiliation
                        with any person or entity
                    </li>
                    <li>
                        Upload or transmit viruses, malware, or any other harmful code
                    </li>
                    <li>
                        Use the Platform to harass, abuse, or threaten others
                    </li>
                </ul>
            </section>

            {/* 6. Intellectual Property */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>6. Intellectual Property</h2>
                <p style={paragraphStyle}>
                    Original content published on KhelPediA — including articles,
                    analysis, editorial commentary, and website design — is the
                    intellectual property of KhelPediA unless otherwise stated.
                </p>
                <p style={paragraphStyle}>
                    Game names, logos, character names, player images, and tournament
                    branding belong to their respective copyright holders (Riot Games,
                    Valve, Krafton, Garena, etc.) and are used on KhelPediA under fair
                    use for informational and editorial purposes. Their inclusion does
                    not imply endorsement.
                </p>
                <p style={paragraphStyle}>
                    You may reference KhelPediA content with proper attribution and a
                    link back to the original page. Bulk reproduction or commercial use
                    of our content requires prior written permission.
                </p>
            </section>

            {/* 7. Use of Data */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>7. Use of Data</h2>
                <p style={paragraphStyle}>
                    We use the data provided by the Riot Games API and other sources to
                    provide you with insights, statistics, and match history analysis.
                    We do not sell your personal gaming data to third parties.
                </p>
                <p style={paragraphStyle}>
                    For full details about how we collect, use, and protect your data,
                    please review our{" "}
                    <Link
                        href="/privacy"
                        style={{ color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 600 }}
                    >
                        Privacy Policy
                    </Link>
                    .
                </p>
            </section>

            {/* 8. Content Disclaimer */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>8. Content Disclaimer</h2>
                <p style={paragraphStyle}>
                    KhelPediA provides esports data for informational and entertainment
                    purposes only. While we strive for accuracy, we cannot guarantee
                    that all information is complete, up-to-date, or error-free.
                    Tournament results, player statistics, and prize pool amounts are
                    subject to change and may contain discrepancies.
                </p>
                <p style={paragraphStyle}>
                    Any match predictions, team rankings, or analytical opinions
                    published on KhelPediA are for editorial purposes only and should not
                    be construed as gambling or betting advice. See our{" "}
                    <Link
                        href="/disclaimer"
                        style={{ color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 600 }}
                    >
                        Disclaimer
                    </Link>{" "}
                    for more details.
                </p>
            </section>

            {/* 9. Limitation of Liability */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>9. Limitation of Liability</h2>
                <p style={paragraphStyle}>
                    To the fullest extent permitted by applicable law, KhelPediA and its
                    team shall not be liable for any indirect, incidental, special,
                    consequential, or punitive damages, including but not limited to
                    loss of data, revenue, or profits, arising out of or in connection
                    with your use of the Platform.
                </p>
                <p style={paragraphStyle}>
                    The Platform is provided on an &quot;as-is&quot; and &quot;as-available&quot; basis.
                    We do not warrant that the Platform will be uninterrupted, secure,
                    or free of errors.
                </p>
            </section>

            {/* 10. Advertising */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>10. Advertising</h2>
                <p style={paragraphStyle}>
                    KhelPediA displays advertisements through Google AdSense and may
                    include other advertising partners in the future. By using the
                    Platform, you acknowledge that advertisements will be displayed
                    alongside content. These ads are served by third-party networks and
                    are governed by their own terms and privacy policies.
                </p>
            </section>

            {/* 11. Changes */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>11. Changes to These Terms</h2>
                <p style={paragraphStyle}>
                    We reserve the right to modify these Terms at any time. Changes will
                    be effective immediately upon posting to this page. The &quot;Last
                    Updated&quot; date at the top reflects the most recent revision. Your
                    continued use of KhelPediA after changes are posted constitutes
                    acceptance of the revised Terms.
                </p>
            </section>

            {/* 12. Governing Law */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>12. Governing Law</h2>
                <p style={paragraphStyle}>
                    These Terms shall be governed by and construed in accordance with the
                    laws of India, without regard to its conflict of law provisions. Any
                    disputes arising from these Terms shall be resolved through good-faith
                    negotiation or, if necessary, through the appropriate courts.
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
                    Questions About These Terms?
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                    If you have any questions about these Terms of Service, please
                    contact us at{" "}
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
