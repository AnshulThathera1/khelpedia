import { createClient } from "@/utils/supabase/server";

export default async function sitemap() {
  const supabase = await createClient();
  const baseUrl = "https://khelpedia.org";

  // Get dynamic teams
  const { data: teams } = await supabase
    .from("teams")
    .select("id, updated_at")
    .limit(500);

  return (teams || []).map((team) => ({
    url: `${baseUrl}/teams/${team.id}`,
    lastModified: team.updated_at ? new Date(team.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));
}
