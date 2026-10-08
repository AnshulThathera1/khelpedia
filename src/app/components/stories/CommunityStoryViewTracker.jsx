"use client";

import { useEffect } from "react";

export default function CommunityStoryViewTracker({ slug }) {
  useEffect(() => {
    if (!slug) return;

    // Prevent double counting within session
    const storageKey = `viewed_story_${slug}`;
    if (sessionStorage.getItem(storageKey)) return;

    fetch("/api/stories/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    })
      .then((res) => {
        if (res.ok) {
          sessionStorage.setItem(storageKey, "true");
        }
      })
      .catch((err) => console.error("Error tracking story view:", err));
  }, [slug]);

  return null;
}
