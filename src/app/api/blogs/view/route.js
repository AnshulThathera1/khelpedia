import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { slug } = await request.json();
        if (!slug) return NextResponse.json({ error: "Slug is required" }, { status: 400 });

        const supabase = await createClient();
        
        // Get current views
        const { data: blog, error: fetchError } = await supabase
            .from('blogs')
            .select('id, views')
            .eq('slug', slug)
            .single();
            
        if (fetchError || !blog) {
            return NextResponse.json({ error: "Blog not found" }, { status: 404 });
        }
        
        // Increment views
        const currentViews = blog.views || 0;
        const { error: updateError } = await supabase
            .from('blogs')
            .update({ views: currentViews + 1 })
            .eq('id', blog.id);
            
        if (updateError) {
            console.error("Error updating views:", updateError);
            return NextResponse.json({ error: "Failed to update views" }, { status: 500 });
        }
        
        return NextResponse.json({ success: true, views: currentViews + 1 });
    } catch (error) {
        console.error("View tracking error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
