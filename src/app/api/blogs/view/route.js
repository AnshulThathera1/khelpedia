import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request) {
    try {
        const { slug } = await request.json();
        if (!slug) return NextResponse.json({ error: "Slug is required" }, { status: 400 });

        const res = await query(
            `UPDATE blogs
             SET views = COALESCE(views, 0) + 1
             WHERE slug = $1
             RETURNING views`,
            [slug]
        );

        if (!res.rows[0]) {
            return NextResponse.json({ error: "Blog not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, views: res.rows[0].views });
    } catch (error) {
        console.error("View tracking error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
