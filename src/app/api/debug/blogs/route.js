import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const withJoin = searchParams.get('join') === 'true';

        const sql = withJoin
            ? `SELECT b.*,
                 json_build_object('display_name', p.display_name, 'avatar_url', p.avatar_url) AS profiles
               FROM blogs b
               LEFT JOIN profiles p ON b.author_id = p.id`
            : `SELECT * FROM blogs`;

        const res = await query(sql);
        return NextResponse.json({ blogs: res.rows || [], error: null });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
