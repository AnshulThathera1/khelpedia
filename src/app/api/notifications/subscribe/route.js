import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { subscription } = await request.json();

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
        }

        const p256dh = subscription.keys?.p256dh || subscription.p256dh;
        const authKey = subscription.keys?.auth || subscription.auth_key;

        // Upsert subscription to PostgreSQL to avoid duplicates for the same browser
        await query(
            `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth_key, updated_at)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (endpoint) DO UPDATE SET
               user_id = EXCLUDED.user_id,
               p256dh = EXCLUDED.p256dh,
               auth_key = EXCLUDED.auth_key,
               updated_at = EXCLUDED.updated_at`,
            [user.id, subscription.endpoint, p256dh, authKey, new Date().toISOString()]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Subscription error:", error);
        return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
    }
}
