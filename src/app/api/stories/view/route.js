import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request) {
  try {
    const { slug } = await request.json();
    if (!slug) return NextResponse.json({ error: "Slug is required" }, { status: 400 });

    const res = await query(
      `UPDATE community_stories
       SET views = COALESCE(views, 0) + 1
       WHERE slug = $1 AND status = 'published'
       RETURNING views`,
      [slug]
    );

    if (!res.rows[0]) {
      return NextResponse.json({ error: "Story not found or not published" }, { status: 404 });
    }

    return NextResponse.json({ success: true, views: res.rows[0].views });
  } catch (error) {
    console.error("Story view tracking error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
