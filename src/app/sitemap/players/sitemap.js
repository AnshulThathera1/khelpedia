import { query } from "@/lib/db";
import { PLAYER_INDEXABLE_SQL } from "@/lib/seo";

export async function generateSitemaps() {
  const limit = 1000;
  const res = await query(`SELECT COUNT(*) FROM players p WHERE ${PLAYER_INDEXABLE_SQL}`);
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
      SELECT p.id, p.slug, p.created_at
      FROM players p
      WHERE ${PLAYER_INDEXABLE_SQL}
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const res = await query(sql, [limit, offset]);
    
    return (res.rows || []).map((player) => ({
        url: `${baseUrl}/players/${player.slug || player.id}`,
        lastModified: player.created_at ? new Date(player.created_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      }));
  } catch (error) {
    console.error("Players sitemap error:", error);
    return [];
  }
}
