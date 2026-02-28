import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json({ results: { players: [], teams: [], blogs: [] } });
  }

  const supabase = await createClient();

  // Search Players
  const { data: players } = await supabase
    .from("players")
    .select("id, ign, name, slug, image_url")
    .or(`ign.ilike.%${query}%,name.ilike.%${query}%`)
    .limit(5);

  // Search Teams
  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, slug, logo_url")
    .ilike("name", `%${query}%`)
    .limit(5);

  // Search Blogs
  const { data: blogs } = await supabase
    .from("blogs")
    .select("id, title, slug, cover_image_url")
    .ilike("title", `%${query}%`)
    .eq("is_published", true)
    .limit(5);

  return NextResponse.json({
    results: {
      players: players || [],
      teams: teams || [],
      blogs: blogs || [],
    },
  });
}
