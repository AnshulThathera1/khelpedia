import { query } from "@/lib/db";
import { BLOG_INDEXABLE_SQL } from "@/lib/seo";

export async function generateSitemaps() {
  const limit = 1000;
  const res = await query(`SELECT COUNT(*) FROM blogs b WHERE ${BLOG_INDEXABLE_SQL}`);
  const total = parseInt(res.rows[0].count, 10) || 0;
  const chunks = Math.ceil(total / limit);
  return Array.from({ length: chunks || 1 }, (_, i) => ({ id: i }));
}

export default async function sitemap({ id }) {
  const baseUrl = "https://khelpedia.org";
  const limit = 1000;
  const offset = id * limit;
  
  try {
    const sql = `
      SELECT b.slug, b.created_at, b.updated_at
      FROM blogs b
      WHERE ${BLOG_INDEXABLE_SQL}
      ORDER BY b.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const res = await query(sql, [limit, offset]);
    
    return (res.rows || []).map((blog) => ({
      url: `${baseUrl}/blogs/${blog.slug}`,
      lastModified: blog.updated_at ? new Date(blog.updated_at) : blog.created_at ? new Date(blog.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Blogs sitemap error:", error);
    return [];
  }
}
