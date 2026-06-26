import Link from "next/link";

export const metadata = {
    title: "Contact Us | KhelPediA",
    description:
        "Get in touch with the KhelPediA team. Whether you have feedback, partnership inquiries, content corrections, or just want to say hello — we'd love to hear from you.",
    openGraph: {
        title: "Contact KhelPediA",
        description:
            "Reach out to the KhelPediA team for feedback, partnerships, content corrections, or general inquiries.",
    },
};

const contactMethods = [
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
        ),
        title: "Email Us",
        detail: "contact@khelpedia.org",
        href: "mailto:contact@khelpedia.org",
        description: "For general inquiries, feedback, or content corrections.",
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
        title: "Discord",
        detail: "Join our server",
        href: "#",
        description: "Chat with the team and the esports community.",
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
            </svg>
        ),
        title: "Twitter / X",
        detail: "@KhelPediA",
        href: "#",
        description: "Follow us for breaking esports news and updates.",
    },
];

const faqItems = [
    {
        question: "How can I contribute articles to KhelPediA?",
        answer: "We're always looking for passionate esports writers. Send us an email at contact@khelpedia.org with your writing samples and the titles you cover. We welcome tournament previews, match analyses, meta guides, and opinion pieces.",
    },
    {
        question: "I found incorrect data on a player or tournament page. How can I report it?",
        answer: "Please email us at contact@khelpedia.org with the specific page URL and the correction. Our editorial team verifies all submissions and updates the data as quickly as possible.",
    },
    {
        question: "Can I use KhelPediA data for my own content or research?",
        answer: "You're welcome to reference KhelPediA as a source with proper attribution. For API access or bulk data requests, please contact us to discuss partnership options.",
    },
    {
        question: "Do you cover mobile esports titles like BGMI and Free Fire?",
        answer: "Yes! KhelPediA covers both PC and mobile esports titles including BGMI, PUBG Mobile, Free Fire, Valorant, CS2, Dota 2, and more. We're continuously expanding our coverage.",
    },
];

export default function ContactPage() {
    return (
        <div className="page-container">
            {/* Header */}
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
                    GET IN <span style={{ color: "var(--accent-red)" }}>TOUCH</span>
                </h1>
                <p
                    style={{
                        color: "var(--text-secondary)",
                        fontSize: "1.15rem",
                        maxWidth: "600px",
                        margin: "0 auto",
                        lineHeight: 1.7,
                    }}
                >
                    Have a question, found a bug, or want to collaborate? We&apos;d love to
                    hear from you. Our team typically responds within 24–48 hours.
                </p>
            </div>

            {/* Contact Methods */}
            <section style={{ marginBottom: "5rem" }}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "1.5rem",
                    }}
                >
                    {contactMethods.map((method) => (
                        <a
                            key={method.title}
                            href={method.href}
                            style={{ textDecoration: "none" }}
                            target={method.href.startsWith("http") ? "_blank" : undefined}
                            rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        >
                            <div
                                className="card"
                                style={{
                                    padding: "2rem",
                                    textAlign: "center",
                                    height: "100%",
                                }}
                            >
                                <div
                                    style={{
                                        width: "56px",
                                        height: "56px",
                                        background: "rgba(255, 70, 85, 0.1)",
                                        border: "1px solid rgba(255, 70, 85, 0.2)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "0 auto 1.25rem",
                                        color: "var(--accent-red)",
                                    }}
                                >
                                    {method.icon}
                                </div>
                                <h3
                                    style={{
                                        fontFamily: '"Rajdhani", sans-serif',
                                        fontSize: "1.25rem",
                                        fontWeight: 700,
                                        textTransform: "uppercase",
                                        color: "var(--text-primary)",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    {method.title}
                                </h3>
                                <div
                                    style={{
                                        color: "var(--accent-cyan)",
                                        fontSize: "0.95rem",
                                        fontWeight: 600,
                                        marginBottom: "0.75rem",
                                    }}
                                >
                                    {method.detail}
                                </div>
                                <p
                                    style={{
                                        color: "var(--text-muted)",
                                        fontSize: "0.85rem",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {method.description}
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            </section>

            {/* Contact Categories */}
            <section style={{ marginBottom: "5rem" }}>
                <h2 className="section-title" style={{ marginBottom: "1.5rem" }}>
                    What Can We Help With?
                </h2>
                <div
                    className="glass-card"
                    style={{
                        padding: "2.5rem",
                        borderTop: "4px solid var(--accent-red)",
                    }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                            gap: "2rem",
                        }}
                    >
                        {[
                            {
                                emoji: "📝",
                                title: "Content Corrections",
                                text: "Found incorrect stats, wrong player info, or outdated tournament data? Let us know and we'll fix it promptly.",
                            },
                            {
                                emoji: "🤝",
                                title: "Partnerships",
                                text: "Tournament organizers, esports teams, and content creators — reach out to discuss collaboration opportunities.",
                            },
                            {
                                emoji: "✍️",
                                title: "Write for Us",
                                text: "We welcome guest contributors who are passionate about esports. Send your pitches and writing samples our way.",
                            },
                            {
                                emoji: "🐛",
                                title: "Bug Reports",
                                text: "Encountered a technical issue on the platform? Report it with a screenshot or description and we'll investigate.",
                            },
                        ].map((item) => (
                            <div key={item.title}>
                                <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
                                    {item.emoji}
                                </div>
                                <h3
                                    style={{
                                        fontFamily: '"Rajdhani", sans-serif',
                                        fontSize: "1.1rem",
                                        fontWeight: 700,
                                        textTransform: "uppercase",
                                        color: "var(--text-primary)",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    {item.title}
                                </h3>
                                <p
                                    style={{
                                        color: "var(--text-muted)",
                                        fontSize: "0.9rem",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {item.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section style={{ marginBottom: "5rem" }}>
                <h2 className="section-title" style={{ marginBottom: "1.5rem" }}>
                    Frequently Asked Questions
                </h2>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                    }}
                >
                    {faqItems.map((item) => (
                        <div
                            key={item.question}
                            className="glass-card"
                            style={{ padding: "1.5rem 2rem" }}
                        >
                            <h3
                                style={{
                                    fontFamily: '"Rajdhani", sans-serif',
                                    fontSize: "1.1rem",
                                    fontWeight: 700,
                                    color: "var(--text-primary)",
                                    marginBottom: "0.75rem",
                                }}
                            >
                                {item.question}
                            </h3>
                            <p
                                style={{
                                    color: "var(--text-muted)",
                                    fontSize: "0.95rem",
                                    lineHeight: 1.7,
                                }}
                            >
                                {item.answer}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Back Link */}
            <div style={{ textAlign: "center", paddingBottom: "2rem" }}>
                <Link
                    href="/"
                    style={{
                        color: "var(--accent-cyan)",
                        textDecoration: "none",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                    }}
                >
                    ← Back to Homepage
                </Link>
            </div>
        </div>
    );
}
