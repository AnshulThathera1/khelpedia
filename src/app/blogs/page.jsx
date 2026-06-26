import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";

export const dynamic = 'force-dynamic';

export const metadata = {
    title: "Esports News, Analysis & Guides | KhelPediA",
    description: "Read the latest esports news, tournament previews, match analyses, meta guides, and in-depth team profiles. Original editorial content by the KhelPediA team.",
    openGraph: {
        title: "Esports News & Analysis | KhelPediA",
        description: "Original esports journalism — tournament coverage, player profiles, patch analysis, and competitive gaming insights.",
    },
};

export default async function BlogsIndexPage() {
    const supabase = await createClient();

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

    const featuredBlog = blogs.length > 0 ? blogs[0] : null;
    const remainingBlogs = blogs.length > 1 ? blogs.slice(1) : [];

    return (
        <div className="page-container">
            {/* Page Header */}
            <div className="page-header" style={{ marginBottom: "2rem" }}>
                <h1 className="page-title">News & Analysis</h1>
                <p className="page-description" style={{ maxWidth: "700px" }}>
                    Original esports journalism from the KhelPediA editorial team.
                    Tournament previews, match analyses, meta guides, roster changes,
                    and in-depth coverage across Valorant, CS2, BGMI, Dota 2, and more.
                </p>
            </div>

            {/* Featured Article */}
            {featuredBlog && (
                <section style={{ marginBottom: "4rem" }}>
                    <Link href={`/blogs/${featuredBlog.slug}`} style={{ textDecoration: "none" }}>
                        <div
                            className="card"
                            style={{
                                padding: 0,
                                overflow: "hidden",
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                minHeight: "320px",
                            }}
                        >
                            {/* Featured Image */}
                            <div style={{ position: "relative", background: "var(--bg-secondary)", minHeight: "320px" }}>
                                {featuredBlog.cover_image_url ? (
                                    <Image
                                        src={featuredBlog.cover_image_url}
                                        alt={featuredBlog.title}
                                        fill
                                        style={{ objectFit: "cover" }}
                                        priority
                                    />
                                ) : (
                                    <div style={{
                                        width: "100%",
                                        height: "100%",
                                        background: "linear-gradient(135deg, rgba(255,70,85,0.15), rgba(139,92,246,0.15))",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}>
                                        <span style={{ fontSize: "4rem" }}>📰</span>
                                    </div>
                                )}
                            </div>

                            {/* Featured Content */}
                            <div style={{ padding: "2.5rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
                                    <span style={{
                                        background: "rgba(255, 70, 85, 0.1)",
                                        color: "var(--accent-red)",
                                        padding: "0.25rem 0.75rem",
                                        fontSize: "0.7rem",
                                        fontWeight: 800,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.1em",
                                        border: "1px solid rgba(255, 70, 85, 0.2)",
                                    }}>
                                        FEATURED
                                    </span>
                                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                        {new Date(featuredBlog.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>

                                <h2 style={{
                                    fontSize: "1.75rem",
                                    fontWeight: 800,
                                    color: "var(--text-primary)",
                                    lineHeight: 1.2,
                                    marginBottom: "1rem",
                                    fontFamily: '"Rajdhani", sans-serif',
                                }}>
                                    {featuredBlog.title}
                                </h2>

                                <p style={{ color: "var(--text-muted)", fontSize: "1rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                                    {featuredBlog.excerpt}
                                </p>

                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "auto" }}>
                                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg-secondary)", overflow: "hidden", position: "relative" }}>
                                        {featuredBlog.profiles?.avatar_url ? (
                                            <Image src={featuredBlog.profiles.avatar_url} alt="author" fill style={{ objectFit: "cover" }} />
                                        ) : (
                                            <div style={{ width: "100%", height: "100%", background: "var(--gradient-primary)" }} />
                                        )}
                                    </div>
                                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                                        {featuredBlog.profiles?.display_name || "KhelPediA Staff"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                </section>
            )}

            {/* Remaining Articles */}
            {remainingBlogs.length > 0 && (
                <section>
                    <h2
                        className="section-title"
                        style={{ marginBottom: "1.5rem" }}
                    >
                        All Articles
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2rem" }}>
                        {remainingBlogs.map(blog => (
                            <Link href={`/blogs/${blog.slug}`} key={blog.id} className="blog-card-link" style={{ textDecoration: "none" }}>
                                <div className="glass-card blog-card" style={{ padding: 0, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column", transition: "transform 0.2s, box-shadow 0.2s" }}>
                                    <div style={{ height: "200px", width: "100%", background: "var(--bg-secondary)", position: "relative" }}>
                                        {blog.cover_image_url ? (
                                            <img src={blog.cover_image_url} alt={blog.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(45deg, rgba(14, 165, 233, 0.1), rgba(139, 92, 246, 0.1))" }}>
                                                <span style={{ fontSize: "2.5rem" }}>📰</span>
                                            </div>
                                        )}
                                    </div>

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
                        ))}
                    </div>
                </section>
            )}

            {/* Empty State */}
            {blogs.length === 0 && (
                <div style={{ textAlign: "center", padding: "4rem 2rem", background: "rgba(10, 14, 23, 0.5)", borderRadius: "var(--radius-lg)", border: "1px dashed rgba(148, 163, 184, 0.2)" }}>
                    <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>📰</span>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>No Articles Published Yet</h3>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Check back later for the latest esports news, tournament previews, and analysis.</p>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .blog-card:hover {
                    transform: translateY(-4px) !important;
                    box-shadow: 0 10px 30px rgba(14, 165, 233, 0.2) !important;
                }
                @media (max-width: 768px) {
                    .card[style*="grid-template-columns"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}} />
        </div>
    );
}
