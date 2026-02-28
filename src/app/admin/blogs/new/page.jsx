import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
    title: "Draft New Article | KhelPediA Admin",
};

export default async function NewBlogPage() {

    async function createBlog(formData) {
        "use server";
        const title = formData.get("title");
        const slug = formData.get("slug");
        const excerpt = formData.get("excerpt");
        const content = formData.get("content");
        const coverImageUrl = formData.get("cover_image_url");

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) redirect("/login");

        const { error } = await supabase.from("blogs").insert([{
            title,
            slug,
            excerpt,
            content,
            cover_image_url: coverImageUrl,
            author_id: user.id,
            is_published: false,
        }]);

        if (error) {
            console.error("Failed to create blog:", error);
            // In a real app, return error state. For now, redirect back to blogs with error pattern
            redirect("/admin/blogs?error=creation_failed");
        }

        redirect("/admin/blogs");
    }

    return (
        <div className="page-container" style={{ maxWidth: "800px" }}>
            <div className="page-header" style={{ marginBottom: "2.5rem" }}>
                <Link href="/admin/blogs" style={{ color: "var(--accent-cyan)", textDecoration: "none", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                    &larr; Back to Articles
                </Link>
                <h1 className="page-title">Draft New Article</h1>
                <p className="page-description">
                    Write your esports news. The article will be saved as a draft by default.
                </p>
            </div>

            <div className="glass-card" style={{ padding: "2.5rem" }}>
                <form action={createBlog} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    {/* Title */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label htmlFor="title" style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>Article Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            placeholder="e.g. Sentinels Secure VCT Masters Victory"
                            style={{ padding: "0.8rem", borderRadius: "8px", background: "rgba(10, 14, 23, 0.5)", border: "1px solid var(--border-color)", color: "white", width: "100%", fontSize: "1rem" }}
                        />
                    </div>

                    {/* Slug */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label htmlFor="slug" style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>URL Slug <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(e.g. sentinels-win-masters)</span></label>
                        <input
                            type="text"
                            id="slug"
                            name="slug"
                            required
                            placeholder="sentinels-win-masters"
                            style={{ padding: "0.8rem", borderRadius: "8px", background: "rgba(10, 14, 23, 0.5)", border: "1px solid var(--border-color)", color: "white", width: "100%", fontFamily: "monospace" }}
                        />
                    </div>

                    {/* Cover Image */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label htmlFor="cover_image_url" style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>Cover Image URL (Optional)</label>
                        <input
                            type="url"
                            id="cover_image_url"
                            name="cover_image_url"
                            placeholder="https://example.com/image.jpg"
                            style={{ padding: "0.8rem", borderRadius: "8px", background: "rgba(10, 14, 23, 0.5)", border: "1px solid var(--border-color)", color: "white", width: "100%" }}
                        />
                    </div>

                    {/* Excerpt */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label htmlFor="excerpt" style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>Short Excerpt <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(Appears on the homepage feed)</span></label>
                        <textarea
                            id="excerpt"
                            name="excerpt"
                            required
                            rows={3}
                            placeholder="A brief summary of the article..."
                            style={{ padding: "0.8rem", borderRadius: "8px", background: "rgba(10, 14, 23, 0.5)", border: "1px solid var(--border-color)", color: "white", width: "100%", resize: "vertical" }}
                        />
                    </div>

                    {/* Main Content */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label htmlFor="content" style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>Article Body <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(Supports HTML / Markdown)</span></label>
                        <textarea
                            id="content"
                            name="content"
                            required
                            rows={15}
                            placeholder="<h2>The Grand Finals</h2><p>It was a massive game...</p>"
                            style={{ padding: "0.8rem", borderRadius: "8px", background: "rgba(10, 14, 23, 0.5)", border: "1px solid var(--border-color)", color: "white", width: "100%", resize: "vertical", fontFamily: "monospace", fontSize: "0.9rem" }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                        <Link href="/admin/blogs" className="btn btn-secondary" style={{ padding: "0.8rem 1.5rem", textDecoration: "none", textAlign: "center", flex: 1 }}>
                            Cancel
                        </Link>
                        <button type="submit" className="btn btn-primary" style={{ padding: "0.8rem 2rem", flex: 2, fontSize: "1rem", fontWeight: 700 }}>
                            Save Draft
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
