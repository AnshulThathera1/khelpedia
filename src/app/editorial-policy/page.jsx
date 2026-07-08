export const metadata = {
    title: "Editorial Policy",
    description: "KhelPediA's editorial policy and commitment to accurate, unbiased esports coverage.",
    alternates: {
        canonical: "/editorial-policy",
    }
};

export default function EditorialPolicyPage() {
    return (
        <div className="page-container" style={{ maxWidth: 800, margin: "0 auto", padding: "4rem 1rem" }}>
            <h1 className="page-title" style={{ marginBottom: "2rem" }}>Editorial Policy</h1>
            
            <div className="glass-card" style={{ padding: "2.5rem", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                <p style={{ marginBottom: "1.5rem" }}>
                    At KhelPediA, our mission is to provide the most comprehensive, accurate, and engaging esports coverage in the industry. To achieve this, our editorial team adheres to strict guidelines designed to maintain the highest standards of journalism and data integrity.
                </p>

                <h2 style={{ color: "var(--text-primary)", fontSize: "1.25rem", marginTop: "2rem", marginBottom: "1rem" }}>
                    1. Accuracy and Data Integrity
                </h2>
                <p style={{ marginBottom: "1.5rem" }}>
                    Our statistical data is sourced directly from official game developer APIs (such as Riot Games), trusted third-party providers (like HLTV), and community-driven databases (Liquipedia). We cross-reference data to ensure maximum accuracy before publishing tournament brackets, match results, and player statistics.
                </p>

                <h2 style={{ color: "var(--text-primary)", fontSize: "1.25rem", marginTop: "2rem", marginBottom: "1rem" }}>
                    2. Objective Reporting
                </h2>
                <p style={{ marginBottom: "1.5rem" }}>
                    Our original editorial content—including tournament previews, team analyses, and meta guides—is written by experienced esports analysts. We strive to remain unbiased in our coverage, separating objective reporting from opinion pieces, which are clearly labeled as such.
                </p>

                <h2 style={{ color: "var(--text-primary)", fontSize: "1.25rem", marginTop: "2rem", marginBottom: "1rem" }}>
                    3. AI and Automated Content
                </h2>
                <p style={{ marginBottom: "1.5rem" }}>
                    We utilize artificial intelligence to assist in compiling vast amounts of esports data into readable overviews for our tournament, team, and player pages. However, all AI-assisted content is rigorously reviewed, fact-checked, and edited by our human editorial team prior to publication to ensure it meets our quality standards.
                </p>

                <h2 style={{ color: "var(--text-primary)", fontSize: "1.25rem", marginTop: "2rem", marginBottom: "1rem" }}>
                    4. Independence
                </h2>
                <p style={{ marginBottom: "1.5rem" }}>
                    KhelPediA is an independent publication. Our editorial decisions are not influenced by sponsors, game developers, or esports organizations. Any sponsored content or advertisements are clearly demarcated from our editorial coverage.
                </p>

                <p style={{ marginTop: "3rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    Last updated: July 2026
                </p>
            </div>
        </div>
    );
}
