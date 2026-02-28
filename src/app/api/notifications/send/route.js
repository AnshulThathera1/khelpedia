import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import webpush from "web-push";

const resend = new Resend(process.env.RESEND_API_KEY);

webpush.setVapidDetails(
    'mailto:support@khelpedia.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

export async function POST(request) {
    const supabase = await createClient();
    
    // 1. Verify Admin Status
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user?.id).single();

    if (!profile?.is_admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { title, body, url, type, target } = await request.json(); // type: 'email' | 'push' | 'both'

        // 2. Fetch Target Users
        let query = supabase.from("profiles").select("id, email, email_notifications, push_notifications");
        if (target === 'admins') query = query.eq("is_admin", true);
        
        const { data: users } = await query;

        const results = { email: 0, push: 0, errors: [] };
        if (!users) return NextResponse.json({ success: true, results });

        // 3. Send Emails via Resend
        if (type === 'email' || type === 'both') {
            const emailTargets = users.filter(u => u.email_notifications).map(u => u.email);
            if (emailTargets.length > 0) {
                const { error } = await resend.emails.send({
                    from: "KhelPediA <notifications@khelpedia.com>",
                    to: emailTargets,
                    subject: title,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0e17; color: #fff; border-radius: 12px;">
                            <h1 style="color: #06d6a0;">${title}</h1>
                            <p style="font-size: 16px; line-height: 1.6;">${body}</p>
                            <a href="${url || 'https://khelpedia.com'}" style="display: inline-block; background: #06d6a0; color: #000; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 20px;">View Update</a>
                        </div>
                    `
                });
                if (!error) results.email = emailTargets.length;
                else results.errors.push(`Email error: ${error.message}`);
            }
        }

        // 4. Send Push Notifications via Web-Push
        if (type === 'push' || type === 'both') {
            const userIds = users.filter(u => u.push_notifications).map(u => u.id);
            const { data: subscriptions } = await supabase
                .from("push_subscriptions")
                .select("*")
                .in("user_id", userIds);

            if (subscriptions) {
                const pushPromises = subscriptions.map(sub => {
                    const pushSubscription = {
                        endpoint: sub.endpoint,
                        keys: {
                            auth: sub.auth_key,
                            p256dh: sub.p256dh
                        }
                    };

                    return webpush.sendNotification(
                        pushSubscription,
                        JSON.stringify({ title, body, url: url || '/' })
                    ).catch(err => {
                        console.error("Push delivery failed for", sub.endpoint, err);
                        // Optional: remove stale subscription if status === 410
                    });
                });

                await Promise.all(pushPromises);
                results.push = subscriptions.length;
            }
        }

        return NextResponse.json({ success: true, results });
    } catch (error) {
        console.error("Broadcast error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
