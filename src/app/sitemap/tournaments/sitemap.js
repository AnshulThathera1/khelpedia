import { query } from "@/lib/db";
import { TOURNAMENT_INDEXABLE_SQL } from "@/lib/seo";

export async function generateSitemaps() {
  try {
    const limit = 1000;
    const res = await query(`SELECT COUNT(*) FROM tournaments t WHERE ${TOURNAMENT_INDEXABLE_SQL}`);
    const total = parseInt(res.rows[0].count, 10) || 0;
    const chunks = Math.ceil(total / limit);
    return Array.from({ length: chunks || 1 }, (_, i) => ({ id: i }));
  } catch (error) {
    console.error("Tournaments generateSitemaps error:", error);
    return [{ id: 0 }];
  }
}

export default async function sitemap({ id }) {
  const baseUrl = "https://khelpedia.org";
  const limit = 1000;
  const offset = id * limit;
  
  try {
    const sql = `
      SELECT t.id, t.created_at, t.start_date
      FROM tournaments t
      WHERE ${TOURNAMENT_INDEXABLE_SQL}
      ORDER BY t.start_date DESC NULLS LAST
      LIMIT $1 OFFSET $2
    `;
    const res = await query(sql, [limit, offset]);
    
    return (res.rows || []).map((tournament) => ({
      url: `${baseUrl}/tournaments/${tournament.id}`,
      lastModified: tournament.created_at ? new Date(tournament.created_at) : tournament.start_date ? new Date(tournament.start_date) : new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    }));
  } catch (error) {
    console.error("Tournaments sitemap error:", error);
    return [];
  }
}
