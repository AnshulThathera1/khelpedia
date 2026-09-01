import { createClient } from "@/utils/supabase/server";

export default async function sitemap() {
  const supabase = await createClient();
  const baseUrl = "https://khelpedia.org";

  // Get dynamic games
  const { data: games } = await supabase
    .from("games")
    .select("slug");

  return (games || []).map((game) => ({
    url: `${baseUrl}/games/${game.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
}
