import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const searchStr = searchParams.get("q");

  if (!searchStr || searchStr.length < 2) {
    return NextResponse.json({ results: { players: [], teams: [], blogs: [] } });
  }

  try {
    const searchTerm = `%${searchStr}%`;
    const [playersRes, teamsRes, blogsRes] = await Promise.all([
      query(
        "SELECT id, ign, name, slug, image_url FROM players WHERE ign ILIKE $1 OR name ILIKE $1 LIMIT 5",
        [searchTerm]
      ),
      query(
        "SELECT id, name, slug, logo_url FROM teams WHERE name ILIKE $1 LIMIT 5",
        [searchTerm]
      ),
      query(
        "SELECT id, title, slug, cover_image_url FROM blogs WHERE title ILIKE $1 AND is_published = true LIMIT 5",
        [searchTerm]
      )
    ]);

    return NextResponse.json({
      results: {
        players: playersRes.rows || [],
        teams: teamsRes.rows || [],
        blogs: blogsRes.rows || [],
      },
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ results: { players: [], teams: [], blogs: [] } }, { status: 500 });
  }
}
