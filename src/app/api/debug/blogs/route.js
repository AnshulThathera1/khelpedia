import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    const supabase = await createClient();
    
    const { searchParams } = new URL(request.url);
    const withJoin = searchParams.get('join') === 'true';

    let query = supabase.from("blogs").select(withJoin ? "*, profiles:author_id(display_name, avatar_url)" : "*");
    
    const { data: blogs, error } = await query;
    
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ blogs, error });
}
