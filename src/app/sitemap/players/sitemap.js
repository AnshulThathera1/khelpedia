import { createClient } from "@/utils/supabase/server";

export default async function sitemap() {
  const supabase = await createClient();
  const baseUrl = "https://khelpedia.org";

  // Get dynamic players — only include those that have stats (non-empty profiles)
  const { data: players } = await supabase
    .from("players")
    .select("id, slug, updated_at, ign, player_stats(id)")
    .not("ign", "is", null)
    .limit(500);

  // Only include players that have at least one stats record
  return (players || [])
    .filter((player) => player.player_stats && player.player_stats.length > 0)
    .map((player) => ({
      url: `${baseUrl}/players/${player.slug || player.id}`,
      lastModified: player.updated_at ? new Date(player.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));
}
