import { query } from "@/lib/db";
import { TEAM_INDEXABLE_SQL } from "@/lib/seo";

export async function generateSitemaps() {
  const limit = 1000;
  const res = await query(`SELECT COUNT(*) FROM teams t WHERE ${TEAM_INDEXABLE_SQL}`);
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
      SELECT t.id, t.created_at
      FROM teams t
      WHERE ${TEAM_INDEXABLE_SQL}
      ORDER BY t.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const res = await query(sql, [limit, offset]);
    
    return (res.rows || []).map((team) => ({
      url: `${baseUrl}/teams/${team.id}`,
      lastModified: team.created_at ? new Date(team.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Teams sitemap error:", error);
    return [];
  }
}
