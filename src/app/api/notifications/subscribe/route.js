import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { subscription } = await request.json();
        console.log("Subscription payload:", subscription);

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
        }

        // Upsert subscription to avoid duplicates for the same browser
        const { error } = await supabase
            .from("push_subscriptions")
            .upsert({
                user_id: user.id,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys?.p256dh || subscription.p256dh,
                auth_key: subscription.keys?.auth || subscription.auth_key,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'endpoint'
            });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Subscription error:", error);
        return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
    }
}
