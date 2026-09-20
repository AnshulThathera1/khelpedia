"use server";

import { createClient } from "@/utils/supabase/server";
import { query } from "@/lib/db";

export async function submitReviewAction(formData) {
  try {
    const supabase = await createClient();
    
    // Get current user if any via Supabase Auth
    const { data: { user } } = await supabase.auth.getUser();

    const rating = parseInt(formData.get("rating"), 10);
    const feedback_text = formData.get("feedback_text") || null;
    const name = formData.get("name") || null;
    const email = formData.get("email") || null;

    if (!rating || rating < 1 || rating > 5) {
      return { success: false, error: "Invalid rating. Must be between 1 and 5." };
    }

    const userType = user ? "registered" : "guest";
    const userId = user ? user.id : null;

    try {
      await query(
        `INSERT INTO site_reviews (rating, feedback_text, name, email, user_type, user_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [rating, feedback_text, name, email, userType, userId]
      );
    } catch (insertError) {
      console.error("Error inserting review:", insertError);
      return { success: false, error: "Failed to submit review. Please try again later." };
    }

    // --- Send Discord Notification ---
    try {
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
      if (webhookUrl) {
        let stars = "⭐".repeat(rating);
        let description = `**Rating:** ${rating}/5 ${stars}\n\n`;
        if (feedback_text) description += `**Feedback:**\n> ${feedback_text}\n\n`;
        
        description += `**User Type:** ${userType}\n`;
        if (name) description += `**Name:** ${name}\n`;
        if (email) description += `**Email:** ${email}\n`;
        if (userId) description += `**User ID:** ${userId}\n`;

        const payload = {
          content: null,
          embeds: [
            {
              title: "🌟 New Site Review Received!",
              description: description,
              color: 14143488, // A gold/yellow color
              timestamp: new Date().toISOString()
            }
          ],
          username: "KhelPediA Reviews",
        };

        // Fire and forget fetch
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(e => console.error("Discord review notify fetch error:", e));
      }
    } catch (e) {
      console.error("Failed to prepare Discord payload:", e);
    }

    return { success: true };
  } catch (error) {
    console.error("Submit review error:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}
