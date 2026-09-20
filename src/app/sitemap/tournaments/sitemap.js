import { query } from "@/lib/db";

export default async function sitemap() {
  const baseUrl = "https://khelpedia.org";

  try {
    const res = await query("SELECT id, updated_at FROM tournaments WHERE prize_pool IS NOT NULL AND prize_pool > 0");
    return (res.rows || []).map((tournament) => ({
      url: `${baseUrl}/tournaments/${tournament.id}`,
      lastModified: tournament.updated_at ? new Date(tournament.updated_at) : new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    }));
  } catch (error) {
    console.error("Tournaments sitemap error:", error);
    return [];
  }
}
