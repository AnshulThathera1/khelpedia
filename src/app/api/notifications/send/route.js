import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import webpush from "web-push";
import { query } from "@/lib/db";

const resend = new Resend(process.env.RESEND_API_KEY);

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:support@khelpedia.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

export async function POST(request) {
    const supabase = await createClient();
    
    // 1. Verify Authentication via Supabase Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify Admin Status in PostgreSQL profiles table
    const profileRes = await query("SELECT is_admin FROM profiles WHERE id = $1 LIMIT 1", [user.id]);
    const profile = profileRes.rows[0];

    if (!profile?.is_admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { title, body, url, type, target } = await request.json(); // type: 'email' | 'push' | 'both'

        // 3. Fetch Target Users from PostgreSQL
        const sql = target === 'admins'
            ? "SELECT id, email, email_notifications, push_notifications FROM profiles WHERE is_admin = true"
            : "SELECT id, email, email_notifications, push_notifications FROM profiles";
        
        const usersRes = await query(sql);
        const users = usersRes.rows || [];

        const results = { email: 0, push: 0, errors: [] };
        if (users.length === 0) return NextResponse.json({ success: true, results });

        // 4. Send Emails via Resend
        if (type === 'email' || type === 'both') {
            const emailTargets = users.filter(u => u.email_notifications && u.email).map(u => u.email);
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

        // 5. Send Push Notifications via Web-Push
        if (type === 'push' || type === 'both') {
            const userIds = users.filter(u => u.push_notifications).map(u => u.id);
            if (userIds.length > 0) {
                const subRes = await query(
                    "SELECT * FROM push_subscriptions WHERE user_id = ANY($1)",
                    [userIds]
                );
                const subscriptions = subRes.rows || [];

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
