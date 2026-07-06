"use server";

import { createClient } from "@/utils/supabase/server";

export async function submitReviewAction(formData) {
  try {
    const supabase = await createClient();
    
    // Get current user if any
    const { data: { user } } = await supabase.auth.getUser();

    const rating = parseInt(formData.get("rating"), 10);
    const feedback_text = formData.get("feedback_text") || null;
    const name = formData.get("name") || null;
    const email = formData.get("email") || null;

    if (!rating || rating < 1 || rating > 5) {
      return { success: false, error: "Invalid rating. Must be between 1 and 5." };
    }

    const reviewData = {
      rating,
      feedback_text,
      name,
      email,
      user_type: user ? "registered" : "guest",
      user_id: user ? user.id : null,
    };

    const { error } = await supabase
      .from("site_reviews")
      .insert(reviewData);

    if (error) {
      console.error("Error inserting review:", error);
      return { success: false, error: "Failed to submit review. Please try again later." };
    }

    // --- Send Discord Notification ---
    try {
      const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
      if (webhookUrl) {
        let stars = "⭐".repeat(rating);
        let description = `**Rating:** ${rating}/5 ${stars}\n\n`;
        if (feedback_text) description += `**Feedback:**\n> ${feedback_text}\n\n`;
        
        description += `**User Type:** ${reviewData.user_type}\n`;
        if (name) description += `**Name:** ${name}\n`;
        if (email) description += `**Email:** ${email}\n`;
        if (reviewData.user_id) description += `**User ID:** ${reviewData.user_id}\n`;

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
