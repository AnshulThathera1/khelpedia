import { query } from "@/lib/db";

export default async function sitemap() {
  const baseUrl = "https://khelpedia.org";
  try {
    const res = await query("SELECT slug FROM games");
    return (res.rows || []).map((game) => ({
      url: `${baseUrl}/games/${game.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Games sitemap error:", error);
    return [];
  }
}
