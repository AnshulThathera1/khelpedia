import { query } from "@/lib/db";

export default async function sitemap() {
  const baseUrl = "https://khelpedia.org";
  try {
    const res = await query("SELECT slug, updated_at FROM blogs WHERE is_published = true");
    return (res.rows || []).map((blog) => ({
      url: `${baseUrl}/blogs/${blog.slug}`,
      lastModified: blog.updated_at ? new Date(blog.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Blogs sitemap error:", error);
    return [];
  }
}
