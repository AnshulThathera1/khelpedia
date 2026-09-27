import { NextResponse } from 'next/server';
import { generateAIBlog } from '@/lib/generateAIBlog';

// Configuration for Next.js App Router (allow execution up to 5 minutes)
export const maxDuration = 300; 

export async function GET(request) {
    try {
        console.log("[CRON] Route hit");
        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            console.error("[CRON] Authentication failed");
            return new Response('Unauthorized', { status: 401 });
        }

        const result = await generateAIBlog();

        if (result.skipped) {
             return NextResponse.json({ success: true, message: "Skipped. No new articles.", ...result });
        }

        return NextResponse.json({ 
            success: true, 
            message: "Blog generated and published successfully!", 
            ...result 
        });

    } catch (error) {
        console.error("Cron Error:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
