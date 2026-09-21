import { query } from "@/lib/db";

export default async function sitemap() {
  const baseUrl = "https://khelpedia.org";

  try {
    const res = await query("SELECT id, created_at, start_date FROM tournaments WHERE prize_pool IS NOT NULL AND prize_pool > 0");
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
