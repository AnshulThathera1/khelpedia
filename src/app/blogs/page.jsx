import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export const dynamic = 'force-dynamic';

export const metadata = {
    title: "Esports News & Updates | KhelPediA",
    description: "The latest news, patch notes, and tournament coverage in the esports world.",
};

export default async function BlogsIndexPage() {
    const supabase = await createClient();

    // Fetch blogs without profile join to prevent schema error
    const { data: blogsData, error } = await supabase
        .from("blogs")
        .select(`
            id, title, slug, excerpt, cover_image_url, created_at, author_id
        `)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching blogs:", error);
    }

    let blogs = blogsData || [];

    if (blogs.length > 0) {
        const authorIds = [...new Set(blogs.map(b => b.author_id))];
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, display_name, avatar_url")
            .in("id", authorIds);

        const profileMap = (profiles || []).reduce((acc, p) => {
            acc[p.id] = p;
            return acc;
        }, {});

        blogs = blogs.map(blog => ({
            ...blog,
            profiles: profileMap[blog.author_id] || null
        }));
    }

    return (
        <div className="page-container">
            <div className="page-header" style={{ marginBottom: "3rem" }}>
                <h1 className="page-title">News & Updates</h1>
                <p className="page-description">
                    The latest roster changes, tournament summaries, and patch notes.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2rem" }}>
                {blogs && blogs.length > 0 ? (
                    blogs.map(blog => (
                        <Link href={`/blogs/${blog.slug}`} key={blog.id} className="blog-card-link" style={{ textDecoration: "none" }}>
                            <div className="glass-card blog-card" style={{ padding: 0, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column", transition: "transform 0.2s, box-shadow 0.2s" }}>
                                {/* Blog Cover Image */}
                                <div style={{ height: "200px", width: "100%", background: "var(--bg-secondary)", position: "relative" }}>
                                    {blog.cover_image_url ? (
                                        <img src={blog.cover_image_url} alt={blog.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(45deg, rgba(14, 165, 233, 0.1), rgba(139, 92, 246, 0.1))" }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: "rgba(148, 163, 184, 0.2)" }}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8l-4 4v14a2 2 0 0 0 2 2z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /><path d="m20 17-1.89-1.89a1.5 1.5 0 0 0-2.12 0L14 17l-3.39-3.39a1.5 1.5 0 0 0-2.12 0L6 16" /></svg>
                                        </div>
                                    )}
                                </div>

                                {/* Article Details */}
                                <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flex: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", fontSize: "0.8rem", color: "var(--accent-cyan)", fontWeight: 600 }}>
                                        <span>NEWS</span>
                                        <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>{new Date(blog.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.75rem", lineHeight: 1.3 }}>
                                        {blog.title}
                                    </h2>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "1.5rem", flex: 1 }}>
                                        {blog.excerpt}
                                    </p>

                                    {/* Author Profile */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid rgba(148, 163, 184, 0.1)" }}>
                                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg-secondary)", overflow: "hidden" }}>
                                            {blog.profiles?.avatar_url ? (
                                                <img src={blog.profiles.avatar_url} alt="author" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            ) : (
                                                <div style={{ width: "100%", height: "100%", background: "var(--gradient-primary)" }} />
                                            )}
                                        </div>
                                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                                            {blog.profiles?.display_name || "KhelPediA Staff"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem 2rem", background: "rgba(10, 14, 23, 0.5)", borderRadius: "var(--radius-lg)", border: "1px dashed rgba(148, 163, 184, 0.2)" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: "var(--text-muted)", margin: "0 auto 1rem" }}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8l-4 4v14a2 2 0 0 0 2 2z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>No Articles Published Yet</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Check back later for the latest esports news and updates.</p>
                    </div>
                )}
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .blog-card:hover {
                    transform: translateY(-4px) !important;
                    box-shadow: 0 10px 30px rgba(14, 165, 233, 0.2) !important;
                }
            `}} />
        </div>
    );
}

