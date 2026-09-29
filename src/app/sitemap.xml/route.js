import { query } from "@/lib/db";
import { TOURNAMENT_INDEXABLE_SQL, TEAM_INDEXABLE_SQL, PLAYER_INDEXABLE_SQL, BLOG_INDEXABLE_SQL } from "@/lib/seo";

export async function GET() {
  const baseUrl = "https://khelpedia.org";
  const limit = 1000;
  
  // Count indexable entities
  let tournaments = { rows: [{ count: 0 }] };
  let teams = { rows: [{ count: 0 }] };
  let players = { rows: [{ count: 0 }] };
  let blogs = { rows: [{ count: 0 }] };

  try {
    const res = await Promise.all([
      query(`SELECT COUNT(*) FROM tournaments t WHERE ${TOURNAMENT_INDEXABLE_SQL}`),
      query(`SELECT COUNT(*) FROM teams t WHERE ${TEAM_INDEXABLE_SQL}`),
      query(`SELECT COUNT(*) FROM players p WHERE ${PLAYER_INDEXABLE_SQL}`),
      query(`SELECT COUNT(*) FROM blogs b WHERE ${BLOG_INDEXABLE_SQL}`)
    ]);
    tournaments = res[0];
    teams = res[1];
    players = res[2];
    blogs = res[3];
  } catch (error) {
    console.error("sitemap.xml query error:", error);
  }

  const getChunks = (res) => Math.ceil((parseInt(res.rows[0]?.count, 10) || 0) / limit) || 1;

  const sitemaps = [
    { name: 'static', url: `${baseUrl}/sitemap/static/sitemap.xml` },
    { name: 'games', url: `${baseUrl}/sitemap/games/sitemap.xml` },
  ];

  // Add chunked sitemaps
  for (let i = 0; i < getChunks(blogs); i++) sitemaps.push({ name: `blogs-${i}`, url: `${baseUrl}/sitemap/blogs/sitemap/${i}.xml` });
  for (let i = 0; i < getChunks(tournaments); i++) sitemaps.push({ name: `tournaments-${i}`, url: `${baseUrl}/sitemap/tournaments/sitemap/${i}.xml` });
  for (let i = 0; i < getChunks(teams); i++) sitemaps.push({ name: `teams-${i}`, url: `${baseUrl}/sitemap/teams/sitemap/${i}.xml` });
  for (let i = 0; i < getChunks(players); i++) sitemaps.push({ name: `players-${i}`, url: `${baseUrl}/sitemap/players/sitemap/${i}.xml` });

  const today = new Date().toISOString().split('T')[0];
  const sitemapIndexXML = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    (sitemap) => `  <sitemap>
    <loc>${sitemap.url}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`
  )
  .join('\n')}
</sitemapindex>`;

  return new Response(sitemapIndexXML, {
    headers: {
      'Content-Type': 'text/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate',
    },
  });
}
