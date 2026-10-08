import { query } from "@/lib/db";
import { COMMUNITY_STORY_INDEXABLE_SQL } from "@/lib/seo";

export async function generateSitemaps() {
  try {
    const limit = 1000;
    const res = await query(`SELECT COUNT(*) FROM community_stories cs WHERE ${COMMUNITY_STORY_INDEXABLE_SQL}`);
    const total = parseInt(res.rows[0]?.count, 10) || 0;
    const chunks = Math.ceil(total / limit);
    return Array.from({ length: chunks || 1 }, (_, i) => ({ id: i }));
  } catch (error) {
    console.error("Stories generateSitemaps error:", error);
    return [{ id: 0 }];
  }
}

export default async function sitemap({ id }) {
  const baseUrl = "https://khelpedia.org";
  const limit = 1000;
  const offset = id * limit;
  
  try {
    const sql = `
      SELECT cs.slug, cs.published_at, cs.updated_at, cs.created_at
      FROM community_stories cs
      WHERE ${COMMUNITY_STORY_INDEXABLE_SQL}
      ORDER BY cs.published_at DESC NULLS LAST, cs.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const res = await query(sql, [limit, offset]);
    
    return (res.rows || []).map((story) => ({
      url: `${baseUrl}/stories/${story.slug}`,
      lastModified: story.updated_at ? new Date(story.updated_at) : story.published_at ? new Date(story.published_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Stories sitemap error:", error);
    return [];
  }
}
