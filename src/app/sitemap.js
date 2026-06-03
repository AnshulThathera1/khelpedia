import { createClient } from "@/utils/supabase/server";

export default async function sitemap() {
  const supabase = await createClient();
  const baseUrl = "https://khelpedia.vercel.app";

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

  // Static routes
  const routes = [
    '',
    '/tournaments',
    '/blogs',
    '/games',
    '/players',
    '/teams',
    '/valorant'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.8,
  }));

  return [...routes, ...blogUrls, ...tournamentUrls, ...gameUrls];
}
