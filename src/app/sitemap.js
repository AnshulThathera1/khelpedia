import { createClient } from "@/utils/supabase/server";

export default async function sitemap() {
  const supabase = await createClient();
  const baseUrl = "https://khelpedia.org";

  // Get dynamic blogs
  const { data: blogs } = await supabase
    .from("blogs")
    .select("slug, updated_at")
    .eq("is_published", true);

  // Get dynamic tournaments
  const { data: tournaments } = await supabase
    .from("tournaments")
    .select("id, updated_at");

  // Get dynamic games
  const { data: games } = await supabase
    .from("games")
    .select("slug");

  // Get dynamic players
  const { data: players } = await supabase
    .from("players")
    .select("id, slug, updated_at")
    .limit(500);

  // Get dynamic teams
  const { data: teams } = await supabase
    .from("teams")
    .select("id, updated_at")
    .limit(500);

  const blogUrls = (blogs || []).map((blog) => ({
    url: `${baseUrl}/blogs/${blog.slug}`,
    lastModified: blog.updated_at ? new Date(blog.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const tournamentUrls = (tournaments || []).map((tournament) => ({
    url: `${baseUrl}/tournaments/${tournament.id}`,
    lastModified: tournament.updated_at ? new Date(tournament.updated_at) : new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  const gameUrls = (games || []).map((game) => ({
    url: `${baseUrl}/games/${game.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const playerUrls = (players || []).map((player) => ({
    url: `${baseUrl}/players/${player.slug || player.id}`,
    lastModified: player.updated_at ? new Date(player.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const teamUrls = (teams || []).map((team) => ({
    url: `${baseUrl}/teams/${team.id}`,
    lastModified: team.updated_at ? new Date(team.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // Static routes — includes all new trust pages
  const routes = [
    '',
    '/tournaments',
    '/blogs',
    '/games',
    '/players',
    '/teams',
    '/valorant',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/cookies',
    '/disclaimer',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'monthly',
    priority: route === '' ? 1 : route === '/blogs' ? 0.9 : 0.7,
  }));

  return [...routes, ...blogUrls, ...tournamentUrls, ...gameUrls, ...playerUrls, ...teamUrls];
}
