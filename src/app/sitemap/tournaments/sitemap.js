import { createClient } from "@/utils/supabase/server";

export default async function sitemap() {
  const supabase = await createClient();
  const baseUrl = "https://khelpedia.org";

  // Get dynamic tournaments — only include those with real data
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("id, updated_at, prize_pool, start_date, end_date")
    .not("prize_pool", "is", null)
    .gt("prize_pool", 0);

  return (tournaments || []).map((tournament) => ({
    url: `${baseUrl}/tournaments/${tournament.id}`,
    lastModified: tournament.updated_at ? new Date(tournament.updated_at) : new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));
}
