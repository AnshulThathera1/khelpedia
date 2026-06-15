import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AdBanner from "@/app/components/AdBanner";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
    const supabase = await createClient();
    const resolvedParams = await params;

    const { data: blog } = await supabase
        .from("blogs")
        .select("title, excerpt, cover_image_url")
        .eq("slug", resolvedParams.slug)
        .eq("is_published", true)
        .single();

    if (!blog) return { title: "Article Not Found | KhelPediA" };

    const images = blog.cover_image_url ? [blog.cover_image_url] : [];

    return {
        title: `${blog.title} | KhelPediA News`,
        description: blog.excerpt,
        openGraph: {
            title: blog.title,
            description: blog.excerpt,
            type: "article",
            images: images,
        },
        twitter: {
            card: "summary_large_image",
            title: blog.title,
            description: blog.excerpt,
            images: images,
        }
    };
}

export default async function BlogPostPage({ params }) {
    const supabase = await createClient();
    const resolvedParams = await params;

    // Fetch the single article without profile join
    const { data: blog, error } = await supabase
        .from("blogs")
        .select(`*`)
        .eq("slug", resolvedParams.slug)
        .eq("is_published", true)
        .single();

    if (error || !blog) {
        notFound();
    }

    // Fetch profile separately
    if (blog.author_id) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, avatar_url")
            .eq("id", blog.author_id)
            .single();
        blog.profiles = profile || null;
    }

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: blog.title,
        image: blog.cover_image_url ? [blog.cover_image_url] : [],
        datePublished: blog.created_at,
        dateModified: blog.updated_at || blog.created_at,
        author: [{
            '@type': 'Person',
            name: blog.profiles?.display_name || "KhelPediA Staff",
            url: `https://khelpedia.vercel.app`
        }]
    };

    return (
        <article style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "4rem 1.5rem",
        }}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Link href="/blogs" style={{ color: "var(--accent-cyan)", textDecoration: "none", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
                &larr; Back to News
            </Link>

            {/* Article Header */}
            <header style={{ marginBottom: "3rem" }}>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1.5rem" }}>
                    <span style={{ background: "rgba(14, 165, 233, 0.1)", color: "var(--accent-cyan)", padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700, border: "1px solid rgba(14, 165, 233, 0.2)" }}>
                        ESPORTS NEWS
                    </span>
                    <time style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                        {new Date(blog.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </time>
                </div>

                <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2, marginBottom: "1.5rem", fontFamily: '"Rajdhani", sans-serif' }}>
                    {blog.title}
                </h1>

                {/* Author Info */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--bg-secondary)", overflow: "hidden", border: "2px solid var(--border-color)", position: "relative" }}>
                        {blog.profiles?.avatar_url ? (
                            <Image src={blog.profiles.avatar_url} alt={blog.profiles.display_name} fill style={{ objectFit: "cover" }} />
                        ) : (
                            <div style={{ width: "100%", height: "100%", background: "var(--gradient-primary)" }} />
                        )}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{blog.profiles?.display_name || "KhelPediA Staff"}</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Platform Administrator</div>
                    </div>
                </div>
            </header>

            {/* Optional Cover Image */}
            {blog.cover_image_url && (
                <div style={{ width: "100%", height: "400px", borderRadius: "12px", overflow: "hidden", marginBottom: "3rem", boxShadow: "0 20px 40px rgba(0,0,0,0.3)", position: "relative" }}>
                    <Image src={blog.cover_image_url} alt={blog.title} fill style={{ objectFit: "cover" }} priority />
                </div>
            )}

            {/* Article Content - Rendered safely using dangerouslySetInnerHTML */}
            <div
                className="blog-content"
                style={{
                    color: "var(--text-muted)",
                    fontSize: "1.1rem",
                    lineHeight: 1.8,
                    fontFamily: "var(--font-system)"
                }}
                dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Ad Banner at bottom of article */}
            <AdBanner />

            {/* Simple CSS injected to style the raw HTML content output */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .blog-content h2 { color: var(--text-primary); font-size: 1.8rem; margin: 2rem 0 1rem; font-family: "Rajdhani", sans-serif; font-weight: 700; }
                .blog-content h3 { color: var(--text-primary); font-size: 1.4rem; margin: 1.5rem 0 0.8rem; font-family: "Rajdhani", sans-serif; font-weight: 700; }
                .blog-content p { margin-bottom: 1.5rem; }
                .blog-content a { color: var(--accent-cyan); text-decoration: none; }
                .blog-content a:hover { text-decoration: underline; }
                .blog-content ul, .blog-content ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
                .blog-content li { margin-bottom: 0.5rem; }
                .blog-content blockquote { border-left: 4px solid var(--accent-cyan); padding-left: 1rem; font-style: italic; background: rgba(14, 165, 233, 0.05); padding: 1rem; border-radius: 4px; border-left: 4px solid var(--accent-cyan); margin: 1.5rem 0; }
            `}} />
        </article>
    );
}

