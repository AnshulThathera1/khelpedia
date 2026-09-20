import { query } from "@/lib/db";

export default async function sitemap() {
  const baseUrl = "https://khelpedia.org";

  try {
    const res = await query(`
      SELECT p.id, p.slug, p.updated_at,
        (SELECT COUNT(*) FROM player_stats ps WHERE ps.player_id = p.id) AS stats_count
      FROM players p
      WHERE p.ign IS NOT NULL
      LIMIT 500
    `);

    return (res.rows || [])
      .filter((player) => parseInt(player.stats_count, 10) > 0)
      .map((player) => ({
        url: `${baseUrl}/players/${player.slug || player.id}`,
        lastModified: player.updated_at ? new Date(player.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      }));
  } catch (error) {
    console.error("Players sitemap error:", error);
    return [];
  }
}
