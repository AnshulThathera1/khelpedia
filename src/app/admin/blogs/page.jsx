import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import AdminDeleteButton from "../../components/AdminDeleteButton";

export const metadata = {
    title: "Manage Articles | KhelPediA Admin",
};

export default async function AdminBlogsPage() {
    const supabase = await createClient();

    // Fetch all blogs (both published and draft) for the admin
    const { data: blogs, error } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false });

    // Server Action to delete a blog
    async function deleteBlog(formData) {
        "use server";
        const id = formData.get("id");
        const supabaseServer = await createClient();
        await supabaseServer.from("blogs").delete().eq("id", id);
        revalidatePath("/admin/blogs");
        revalidatePath("/blogs");
    }

    // Server Action to toggle publish status
    async function togglePublish(formData) {
        "use server";
        const id = formData.get("id");
        const currentStatus = formData.get("status") === "true";
        const supabaseServer = await createClient();
        await supabaseServer
            .from("blogs")
            .update({ is_published: !currentStatus })
            .eq("id", id);
        revalidatePath("/admin/blogs");
        revalidatePath("/blogs");
    }

    return (
        <div className="page-container">
            <div className="page-header" style={{ marginBottom: "2.5rem", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                    <h1 className="page-title">Manage Articles</h1>
                    <p className="page-description" style={{ margin: 0 }}>
                        Create and publish esports news to the main feed.
                    </p>
                </div>
                <Link href="/admin/blogs/new" className="btn btn-primary" style={{ textDecoration: "none" }}>
                    + New Article
                </Link>
            </div>

            <div className="glass-card" style={{ padding: "0" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-color)", background: "rgba(10, 14, 23, 0.5)" }}>
                            <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase" }}>Article Title</th>
                            <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase" }}>Created</th>
                            <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase" }}>Status</th>
                            <th style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blogs && blogs.length > 0 ? (
                            blogs.map(blog => (
                                <tr key={blog.id} style={{ borderBottom: "1px solid rgba(148, 163, 184, 0.05)" }}>
                                    <td style={{ padding: "1rem 1.5rem" }}>
                                        <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.25rem" }}>{blog.title}</div>
                                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "monospace" }}>/{blog.slug}</div>
                                    </td>
                                    <td style={{ padding: "1rem 1.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                        {new Date(blog.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: "1rem 1.5rem" }}>
                                        <span style={{
                                            padding: "0.25rem 0.75rem",
                                            borderRadius: "12px",
                                            fontSize: "0.8rem",
                                            fontWeight: 600,
                                            background: blog.is_published ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                                            color: blog.is_published ? "#10b981" : "#f59e0b",
                                            border: `1px solid ${blog.is_published ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)"}`
                                        }}>
                                            {blog.is_published ? "Published" : "Draft"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1rem 1.5rem", textAlign: "right", display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                        {/* Toggle Publish Form */}
                                        <form action={togglePublish}>
                                            <input type="hidden" name="id" value={blog.id} />
                                            <input type="hidden" name="status" value={blog.is_published} />
                                            <button type="submit" className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
                                                {blog.is_published ? "Unpublish" : "Publish"}
                                            </button>
                                        </form>

                                        {/* Edit Link Target */}
                                        <Link href={`/admin/blogs/edit/${blog.id}`} className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem", textDecoration: "none" }}>
                                            Edit
                                        </Link>

                                        <AdminDeleteButton
                                            action={deleteBlog}
                                            id={blog.id}
                                            confirmMessage="Are you sure you want to delete this article?"
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ padding: "3rem 1.5rem", textAlign: "center", color: "var(--text-muted)" }}>
                                    No articles found. Click "New Article" to write your first esports news!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
