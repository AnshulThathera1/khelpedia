import Link from "next/link";

export const metadata = {
    title: "Cookie Policy | KhelPediA",
    description:
        "Learn about the cookies KhelPediA uses, including analytics, advertising, and preference cookies, and how you can manage them.",
    openGraph: {
        title: "Cookie Policy | KhelPediA",
        description:
            "Understand how KhelPediA uses cookies to improve your browsing experience.",
    },
};

const sectionStyle = {
    marginBottom: "3rem",
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

const cookieTypes = [
    {
        name: "Essential Cookies",
        description:
            "These cookies are strictly necessary for the website to function. They include your theme preference (dark/light mode) stored in localStorage, and authentication session cookies for logged-in users.",
        examples: "Theme preference (khelpedia-theme), Supabase auth session",
        canDisable: false,
    },
    {
        name: "Analytics Cookies",
        description:
            "We use Google Analytics (GA4) to understand how visitors interact with KhelPediA. These cookies collect anonymized data about page views, session duration, and traffic sources. This helps us improve the platform and create content our readers actually want.",
        examples: "_ga, _ga_H4XKWJEZEY",
        canDisable: true,
    },
    {
        name: "Advertising Cookies",
        description:
            "Google AdSense may set cookies to serve personalized advertisements based on your browsing history. These cookies help fund KhelPediA and keep the platform free for all users. You can opt out of personalized ads through Google's Ad Settings.",
        examples: "Cookies set by googlesyndication.com, doubleclick.net",
        canDisable: true,
    },
];

export default function CookiePolicyPage() {
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
                    Cookie <span style={{ color: "var(--accent-red)" }}>Policy</span>
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    Last Updated: June 26, 2026
                </p>
            </div>

            {/* Introduction */}
            <section style={sectionStyle}>
                <p style={paragraphStyle}>
                    KhelPediA uses cookies and similar technologies to enhance your
                    browsing experience, analyze site traffic, and serve relevant
                    content. This Cookie Policy explains what cookies are, how we use
                    them, and how you can manage your preferences.
                </p>
                <p style={paragraphStyle}>
                    By continuing to use KhelPediA, you consent to the use of cookies as
                    described in this policy. You can change your cookie preferences at
                    any time using the instructions provided below.
                </p>
            </section>

            {/* What Are Cookies */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>What Are Cookies?</h2>
                <p style={paragraphStyle}>
                    Cookies are small text files that are stored on your device (computer,
                    tablet, or smartphone) when you visit a website. They are widely used
                    to make websites work efficiently, remember your preferences, and
                    provide information to the site owners. Cookies do not contain
                    personal information like your name or email address unless you have
                    specifically provided that information to the website.
                </p>
            </section>

            {/* Types of Cookies We Use */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>Cookies We Use</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {cookieTypes.map((cookie) => (
                        <div
                            key={cookie.name}
                            className="glass-card"
                            style={{ padding: "1.5rem 2rem" }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "0.75rem",
                                }}
                            >
                                <h3
                                    style={{
                                        fontFamily: '"Rajdhani", sans-serif',
                                        fontSize: "1.15rem",
                                        fontWeight: 700,
                                        color: "var(--text-primary)",
                                    }}
                                >
                                    {cookie.name}
                                </h3>
                                <span
                                    className="badge"
                                    style={{
                                        background: cookie.canDisable
                                            ? "rgba(14, 165, 233, 0.1)"
                                            : "rgba(255, 70, 85, 0.1)",
                                        color: cookie.canDisable
                                            ? "var(--accent-cyan)"
                                            : "var(--accent-red)",
                                        border: `1px solid ${cookie.canDisable ? "rgba(14, 165, 233, 0.2)" : "rgba(255, 70, 85, 0.2)"}`,
                                        fontSize: "0.7rem",
                                    }}
                                >
                                    {cookie.canDisable ? "Optional" : "Required"}
                                </span>
                            </div>
                            <p
                                style={{
                                    color: "var(--text-muted)",
                                    fontSize: "0.95rem",
                                    lineHeight: 1.7,
                                    marginBottom: "0.75rem",
                                }}
                            >
                                {cookie.description}
                            </p>
                            <p
                                style={{
                                    color: "var(--text-muted)",
                                    fontSize: "0.8rem",
                                    fontStyle: "italic",
                                }}
                            >
                                <strong style={{ color: "var(--text-secondary)" }}>Examples: </strong>
                                {cookie.examples}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Managing Cookies */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>Managing Your Cookies</h2>
                <p style={paragraphStyle}>
                    You can control and manage cookies in several ways. Please note that
                    removing or blocking cookies may impact your user experience and
                    some features of KhelPediA may no longer function as intended.
                </p>

                <div
                    className="glass-card"
                    style={{
                        padding: "1.5rem 2rem",
                        marginBottom: "1rem",
                        borderTop: "4px solid var(--accent-cyan)",
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
                        Browser Settings
                    </h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                        Most web browsers allow you to manage cookies through their settings.
                        You can set your browser to block cookies, delete existing cookies, or
                        notify you when a cookie is being set. Refer to your browser&apos;s help
                        section for instructions specific to your browser.
                    </p>
                </div>

                <div
                    className="glass-card"
                    style={{
                        padding: "1.5rem 2rem",
                        borderTop: "4px solid var(--accent-cyan)",
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
                        Google Ad Personalization
                    </h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                        To opt out of personalized advertising by Google, visit{" "}
                        <a
                            href="https://adssettings.google.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--accent-cyan)", textDecoration: "none" }}
                        >
                            Google Ad Settings
                        </a>
                        . You can also visit{" "}
                        <a
                            href="https://optout.aboutads.info"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "var(--accent-cyan)", textDecoration: "none" }}
                        >
                            aboutads.info
                        </a>{" "}
                        to opt out of interest-based advertising from participating companies.
                    </p>
                </div>
            </section>

            {/* Third Party */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>Third-Party Cookies</h2>
                <p style={paragraphStyle}>
                    Some cookies on KhelPediA are set by third-party services that appear
                    on our pages. We do not control these cookies. The third-party
                    providers include:
                </p>
                <ul style={{ color: "var(--text-muted)", paddingLeft: "1.5rem", marginBottom: "1rem", lineHeight: 2 }}>
                    <li><strong style={{ color: "var(--text-secondary)" }}>Google Analytics</strong> — for traffic analysis and site improvement</li>
                    <li><strong style={{ color: "var(--text-secondary)" }}>Google AdSense</strong> — for displaying advertisements</li>
                    <li><strong style={{ color: "var(--text-secondary)" }}>Supabase</strong> — for user authentication and data storage</li>
                    <li><strong style={{ color: "var(--text-secondary)" }}>Vercel</strong> — for hosting and performance analytics</li>
                </ul>
                <p style={paragraphStyle}>
                    Please refer to these providers&apos; respective privacy policies for more
                    information about their cookie practices.
                </p>
            </section>

            {/* Changes */}
            <section style={sectionStyle}>
                <h2 style={headingStyle}>Changes to This Policy</h2>
                <p style={paragraphStyle}>
                    We may update this Cookie Policy from time to time to reflect changes
                    in our practices or applicable regulations. The &quot;Last Updated&quot; date
                    at the top of this page indicates when the policy was last revised.
                    We encourage you to review this page periodically.
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
                    Questions?
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                    If you have any questions about our use of cookies, please{" "}
                    <Link
                        href="/contact"
                        style={{ color: "var(--accent-cyan)", textDecoration: "none", fontWeight: 600 }}
                    >
                        contact us
                    </Link>{" "}
                    or email us at{" "}
                    <a
                        href="mailto:contact@khelpedia.org"
                        style={{ color: "var(--accent-cyan)", textDecoration: "none" }}
                    >
                        contact@khelpedia.org
                    </a>
                    .
                </p>
            </section>
        </div>
    );
}
