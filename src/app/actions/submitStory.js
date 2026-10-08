"use server";

import { createClient } from "@/utils/supabase/server";
import { query } from "@/lib/db";

export async function submitStoryAction(formData) {
  try {
    const name = (formData.get("name") || "").trim();
    const email = (formData.get("email") || "").trim();
    const game = (formData.get("game") || "").trim();
    const ign = (formData.get("ign") || "").trim();
    const story = (formData.get("story") || "").trim();
    const screenshots_notes = (formData.get("screenshots_notes") || "").trim();
    const social_links = (formData.get("social_links") || "").trim();
    const khelpedia_username = (formData.get("khelpedia_username") || "").trim();

    // Validation
    if (!name || name.length < 2) {
      return { success: false, error: "Please enter your full name or preferred display name." };
    }

    if (!email || !email.includes("@")) {
      return { success: false, error: "Please provide a valid email address so our editors can reach you." };
    }

    if (!game) {
      return { success: false, error: "Please specify the game related to your story." };
    }

    if (!story || story.length < 50) {
      return {
        success: false,
        error: "Please share a few more details about your story (at least 50 characters).",
      };
    }

    // Get authenticated user ID if logged in
    let userId = null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    } catch (authError) {
      // Allow guest submissions
    }

    // Insert into database
    await query(
      `INSERT INTO community_story_submissions (
        name, email, game, ign, story, screenshots_notes, social_links, khelpedia_username, user_id, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')`,
      [
        name,
        email,
        game,
        ign || null,
        story,
        screenshots_notes || null,
        social_links || null,
        khelpedia_username || null,
        userId,
      ]
    );

    // Send Discord Notification if webhook is configured
    try {
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
      if (webhookUrl) {
        const payload = {
          embeds: [
            {
              title: "🎮 New Community Story Submission Received!",
              description: `**Player / Submitter:** ${name}\n**Email:** ${email}\n**Game:** ${game}\n**IGN:** ${ign || "N/A"}\n\n**Story Excerpt:**\n> ${story.slice(0, 300)}${story.length > 300 ? "..." : ""}\n\n**Proof / Verification:**\n${screenshots_notes || "None provided"}`,
              color: 3447003, // Cyan/Blue
              timestamp: new Date().toISOString(),
            },
          ],
          username: "KhelPediA Community Editorial",
        };

        fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch((e) => console.error("Discord story notify error:", e));
      }
    } catch (e) {
      console.error("Failed to trigger Discord story notification:", e);
    }

    return { success: true };
  } catch (error) {
    console.error("submitStoryAction error:", error);
    return { success: false, error: "An unexpected error occurred while submitting. Please try again." };
  }
}
