import { NextResponse } from 'next/server';
import { generateAIBlog } from '@/lib/generateAIBlog';

// Configuration for Next.js App Router (allow execution up to 5 minutes)
export const maxDuration = 300; 

export async function GET(request) {
    try {
        // 1. Verify cron secret to prevent unauthorized access
        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { slug } = await generateAIBlog();

        return NextResponse.json({ success: true, message: "Blog generated and published successfully!", slug: slug });

    } catch (error) {
        console.error("Cron Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
