export const metadata = {
    title: "Corrections Policy",
    description: "KhelPediA's policy for correcting errors and updating esports data.",
    alternates: {
        canonical: "/corrections-policy",
    }
};

export default function CorrectionsPolicyPage() {
    return (
        <div className="page-container" style={{ maxWidth: 800, margin: "0 auto", padding: "4rem 1rem" }}>
            <h1 className="page-title" style={{ marginBottom: "2rem" }}>Corrections Policy</h1>
            
            <div className="glass-card" style={{ padding: "2.5rem", color: "var(--text-secondary)", lineHeight: 1.8 }}>
                <p style={{ marginBottom: "1.5rem" }}>
                    At KhelPediA, we strive for 100% accuracy in our esports data and editorial coverage. However, given the fast-paced nature of competitive gaming and the massive volume of data we process, errors can sometimes occur. This policy outlines how we handle and correct those errors.
                </p>

                <h2 style={{ color: "var(--text-primary)", fontSize: "1.25rem", marginTop: "2rem", marginBottom: "1rem" }}>
                    1. Reporting an Error
                </h2>
                <p style={{ marginBottom: "1.5rem" }}>
                    If you spot an error—whether it's a factual inaccuracy in a news article, an incorrect match score, or an outdated team roster—we encourage our readers and the esports community to bring it to our attention. You can report errors by emailing us at <a href="mailto:contact@khelpedia.org" style={{ color: "var(--accent-cyan)", textDecoration: "none" }}>contact@khelpedia.org</a>. Please provide a link to the page and a brief description of the error.
                </p>

                <h2 style={{ color: "var(--text-primary)", fontSize: "1.25rem", marginTop: "2rem", marginBottom: "1rem" }}>
                    2. Editorial Corrections
                </h2>
                <p style={{ marginBottom: "1.5rem" }}>
                    For original editorial content (news, analyses, previews), if a factual error is discovered after publication, we will correct the text as quickly as possible. We will also append an "Editor's Note" or "Correction" at the bottom of the article detailing what was changed and when the correction was made, to maintain full transparency with our readers.
                </p>

                <h2 style={{ color: "var(--text-primary)", fontSize: "1.25rem", marginTop: "2rem", marginBottom: "1rem" }}>
                    3. Data Corrections
                </h2>
                <p style={{ marginBottom: "1.5rem" }}>
                    Our tournament brackets, match scores, and player statistics are frequently synced from official APIs. If you notice a data discrepancy, it is often resolved automatically during our next sync cycle. If an error persists due to a bug or incorrect upstream data, our technical team will manually override the database and resolve the issue. Due to the sheer volume of statistical data, we do not issue formal correction notes for automated data fixes.
                </p>

                <h2 style={{ color: "var(--text-primary)", fontSize: "1.25rem", marginTop: "2rem", marginBottom: "1rem" }}>
                    4. Retractions
                </h2>
                <p style={{ marginBottom: "1.5rem" }}>
                    In the rare event that an article is fundamentally flawed or based on false information, we may issue a full retraction. The article will be removed, and a retraction notice explaining the removal will take its place.
                </p>

                <p style={{ marginTop: "3rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    Last updated: July 2026
                </p>
            </div>
        </div>
    );
}
