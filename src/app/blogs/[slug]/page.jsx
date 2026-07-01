import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AdBanner from "@/app/components/AdBanner";
import SocialShare from "@/app/components/SocialShare";
import RelatedArticles from "@/app/components/RelatedArticles";
import ViewTracker from "@/app/components/ViewTracker";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
    const supabase = await createClient();
    const resolvedParams = await params;

    const { data: blog } = await supabase
        .from("blogs")
        .select("title, excerpt, cover_image_url, created_at, updated_at")
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
            publishedTime: blog.created_at,
            modifiedTime: blog.updated_at || blog.created_at,
            authors: ["KhelPediA"],
        },
        twitter: {
            card: "summary_large_image",
            title: blog.title,
            description: blog.excerpt,
            images: images,
        }
    };
}

function getReadingTime(htmlContent) {
    if (!htmlContent) return 1;
    const text = htmlContent.replace(/<[^>]*>/g, '');
    const wordCount = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200));
}

export default async function BlogPostPage({ params }) {
    const supabase = await createClient();
    const resolvedParams = await params;

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

    const readingTime = getReadingTime(blog.content);
    const publishDate = new Date(blog.created_at);
    const updateDate = blog.updated_at ? new Date(blog.updated_at) : null;
    const wasUpdated = updateDate && updateDate.getTime() !== publishDate.getTime();

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: blog.title,
        description: blog.excerpt,
        image: blog.cover_image_url ? [blog.cover_image_url] : [],
        datePublished: blog.created_at,
        dateModified: blog.updated_at || blog.created_at,
        author: [{
            '@type': 'Person',
            name: "KhelPediA Staff",
            url: `https://khelpedia.org`
        }],
        publisher: {
            '@type': 'Organization',
            name: 'KhelPediA',
            url: 'https://khelpedia.org',
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://khelpedia.org/blogs/${blog.slug}`,
        },
        wordCount: blog.content ? blog.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length : 0,
    };

    const isDev = process.env.NODE_ENV === "development";
    const origin = isDev ? "http://localhost:3000" : "https://khelpedia.org";
    const currentUrl = `${origin}/blogs/${blog.slug}`;

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
                {/* Category + Date + Reading Time */}
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                    <span style={{ background: "rgba(14, 165, 233, 0.1)", color: "var(--accent-cyan)", padding: "0.3rem 0.8rem", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700, border: "1px solid rgba(14, 165, 233, 0.2)" }}>
                        ESPORTS NEWS
                    </span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>•</span>
                    <time style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                        {publishDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </time>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>•</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        {readingTime} min read
                    </span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>•</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                        {blog.views || 0} views
                    </span>
                </div>

                <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.2, marginBottom: "1.5rem", fontFamily: '"Rajdhani", sans-serif' }}>
                    {blog.title}
                </h1>

                {/* Last Updated Notice */}
                {wasUpdated && (
                    <div style={{
                        background: "rgba(14, 165, 233, 0.05)",
                        border: "1px solid rgba(14, 165, 233, 0.15)",
                        padding: "0.5rem 1rem",
                        marginBottom: "1.5rem",
                        fontSize: "0.8rem",
                        color: "var(--accent-cyan)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" /></svg>
                        Updated {updateDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                )}

                {/* Author Info */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--bg-secondary)", overflow: "hidden", border: "2px solid var(--border-color)", position: "relative" }}>
                        <div style={{ width: "100%", height: "100%", background: "var(--gradient-primary)" }} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>KhelPediA Staff</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Esports Writer & Analyst</div>
                    </div>
                </div>

                <SocialShare url={currentUrl} title={blog.title} />
            </header>

            {/* Optional Cover Image */}
            {blog.cover_image_url && (
                <div style={{ width: "100%", height: "400px", borderRadius: "12px", overflow: "hidden", marginBottom: "3rem", boxShadow: "0 20px 40px rgba(0,0,0,0.3)", position: "relative" }}>
                    <Image src={blog.cover_image_url} alt={blog.title} fill style={{ objectFit: "cover" }} priority />
                </div>
            )}

            {/* Article Content */}
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

            {/* Article Footer - Author Bio */}
            <div style={{
                marginTop: "4rem",
                padding: "2rem",
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                display: "flex",
                gap: "1.25rem",
                alignItems: "flex-start",
            }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--bg-secondary)", overflow: "hidden", border: "2px solid var(--border-color)", flexShrink: 0, position: "relative" }}>
                    <div style={{ width: "100%", height: "100%", background: "var(--gradient-primary)" }} />
                </div>
                <div>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--accent-cyan)", marginBottom: "0.25rem" }}>Written by</div>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "1.1rem", marginBottom: "0.5rem" }}>KhelPediA Staff</div>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>
                        Esports writer and analyst covering competitive gaming across multiple titles. Follow our latest coverage on the{" "}
                        <Link href="/blogs" style={{ color: "var(--accent-cyan)", textDecoration: "none" }}>KhelPediA News</Link> page.
                    </p>
                </div>
            </div>

            {/* Related Articles Component */}
            <RelatedArticles currentSlug={blog.slug} />

            <ViewTracker slug={blog.slug} />

            {/* Ad Banner at bottom */}
            <AdBanner />

            {/* Blog Content Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .blog-content h2 { color: var(--text-primary); font-size: 1.8rem; margin: 2rem 0 1rem; font-family: "Rajdhani", sans-serif; font-weight: 700; }
                .blog-content h3 { color: var(--text-primary); font-size: 1.4rem; margin: 1.5rem 0 0.8rem; font-family: "Rajdhani", sans-serif; font-weight: 700; }
                .blog-content p { margin-bottom: 1.5rem; }
                .blog-content a { color: var(--accent-cyan); text-decoration: none; }
                .blog-content a:hover { text-decoration: underline; }
                .blog-content ul, .blog-content ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
                .blog-content li { margin-bottom: 0.5rem; }
                .blog-content blockquote { border-left: 4px solid var(--accent-cyan); padding: 1rem; font-style: italic; background: rgba(14, 165, 233, 0.05); border-radius: 4px; margin: 1.5rem 0; }
                .blog-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 1.5rem 0; }
                .blog-content strong { color: var(--text-primary); }
            `}} />
        </article>
    );
}
