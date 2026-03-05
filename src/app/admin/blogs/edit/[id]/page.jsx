import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const metadata = {
    title: "Edit Article | KhelPediA Admin",
};

export default async function EditBlogPage({ params }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: blog, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !blog) {
        notFound();
    }

    async function updateBlog(formData) {
        "use server";
        const title = formData.get("title");
        const slug = formData.get("slug").toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
        const excerpt = formData.get("excerpt");
        const content = formData.get("content");
        const coverImageUrl = formData.get("cover_image_url");
        const isPublished = formData.get("is_published") === "on";

        const supabaseServer = await createClient();
        const { error: updateError } = await supabaseServer
            .from("blogs")
            .update({
                title,
                slug,
                excerpt,
                content,
                cover_image_url: coverImageUrl,
                is_published: isPublished,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (updateError) {
            console.error("Failed to update blog:", updateError);
            redirect(`/admin/blogs/edit/${id}?error=update_failed`);
        }

        revalidatePath("/admin/blogs");
        revalidatePath("/blogs");
        revalidatePath(`/blogs/${slug}`);
        redirect("/admin/blogs");
    }

    return (
        <div className="page-container" style={{ maxWidth: "800px" }}>
            <div className="page-header" style={{ marginBottom: "2.5rem" }}>
                <Link href="/admin/blogs" style={{ color: "var(--accent-cyan)", textDecoration: "none", fontSize: "0.9rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                    &larr; Back to Articles
                </Link>
                <h1 className="page-title">Edit Article</h1>
                <p className="page-description">
                    Update your content or change the publishing status.
                </p>
            </div>

            <div className="glass-card" style={{ padding: "2.5rem" }}>
                <form action={updateBlog} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    {/* Title */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label htmlFor="title" style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>Article Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            defaultValue={blog.title}
                            required
                            style={{ padding: "0.8rem", borderRadius: "8px", background: "rgba(10, 14, 23, 0.5)", border: "1px solid var(--border-color)", color: "white", width: "100%", fontSize: "1rem" }}
                        />
                    </div>

                    {/* Slug */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label htmlFor="slug" style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>URL Slug</label>
                        <input
                            type="text"
                            id="slug"
                            name="slug"
                            defaultValue={blog.slug}
                            required
                            style={{ padding: "0.8rem", borderRadius: "8px", background: "rgba(10, 14, 23, 0.5)", border: "1px solid var(--border-color)", color: "white", width: "100%", fontFamily: "monospace" }}
                        />
                    </div>

                    {/* Published Toggle */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                        <input
                            type="checkbox"
                            id="is_published"
                            name="is_published"
                            defaultChecked={blog.is_published}
                            style={{ width: "18px", height: "18px", cursor: "pointer" }}
                        />
                        <label htmlFor="is_published" style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem", cursor: "pointer" }}>
                            Published (Visible to everyone)
                        </label>
                    </div>

                    {/* Cover Image */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label htmlFor="cover_image_url" style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>Cover Image URL</label>
                        <input
                            type="url"
                            id="cover_image_url"
                            name="cover_image_url"
                            defaultValue={blog.cover_image_url}
                            placeholder="https://example.com/image.jpg"
                            style={{ padding: "0.8rem", borderRadius: "8px", background: "rgba(10, 14, 23, 0.5)", border: "1px solid var(--border-color)", color: "white", width: "100%" }}
                        />
                    </div>

                    {/* Excerpt */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label htmlFor="excerpt" style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>Short Excerpt</label>
                        <textarea
                            id="excerpt"
                            name="excerpt"
                            defaultValue={blog.excerpt}
                            required
                            rows={3}
                            style={{ padding: "0.8rem", borderRadius: "8px", background: "rgba(10, 14, 23, 0.5)", border: "1px solid var(--border-color)", color: "white", width: "100%", resize: "vertical" }}
                        />
                    </div>

                    {/* Main Content */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label htmlFor="content" style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>Article Body (HTML/Markdown)</label>
                        <textarea
                            id="content"
                            name="content"
                            defaultValue={blog.content}
                            required
                            rows={15}
                            style={{ padding: "0.8rem", borderRadius: "8px", background: "rgba(10, 14, 23, 0.5)", border: "1px solid var(--border-color)", color: "white", width: "100%", resize: "vertical", fontFamily: "monospace", fontSize: "0.9rem" }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                        <Link href="/admin/blogs" className="btn btn-secondary" style={{ padding: "0.8rem 1.5rem", textDecoration: "none", textAlign: "center", flex: 1 }}>
                            Cancel
                        </Link>
                        <button type="submit" className="btn btn-primary" style={{ padding: "0.8rem 2rem", flex: 2, fontSize: "1rem", fontWeight: 700 }}>
                            Save Changes
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
