import { query } from "@/lib/db";

export default async function sitemap() {
  const baseUrl = "https://khelpedia.org";

  try {
    const res = await query("SELECT id, created_at FROM teams LIMIT 500");
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
