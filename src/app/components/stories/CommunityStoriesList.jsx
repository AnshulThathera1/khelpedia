"use client";

import { useState, useMemo } from "react";
import CommunityStoryCard from "./CommunityStoryCard";
import CommunityFilters from "./CommunityFilters";

export default function CommunityStoriesList({ stories = [] }) {
  const [selectedGame, setSelectedGame] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      // Game match
      if (selectedGame !== "All") {
        const gameName = (story.game?.name || story.game_name || "").toLowerCase();
        const filterGame = selectedGame.toLowerCase();
        if (filterGame === "other") {
          const knownGames = ["free fire", "valorant", "bgmi", "cs2", "league of legends", "dota 2"];
          if (knownGames.some((k) => gameName.includes(k))) return false;
        } else if (!gameName.includes(filterGame)) {
          return false;
        }
      }

      // Category match
      if (selectedCategory !== "All") {
        const cat = (story.category || "").toLowerCase();
        if (!cat.includes(selectedCategory.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [stories, selectedGame, selectedCategory]);

  return (
    <div>
      {/* Client Filter Controls */}
      <CommunityFilters
        activeGame={selectedGame}
        onSelectGame={setSelectedGame}
        activeCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Grid of Story Cards */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .community-stories-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 2rem;
          }
          @media (min-width: 640px) and (max-width: 1024px) {
            .community-stories-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 1.5rem !important;
            }
          }
          @media (max-width: 639px) {
            .community-stories-grid {
              grid-template-columns: 1fr !important;
              gap: 1.25rem !important;
            }
          }
        `,
        }}
      />
      {filteredStories.length > 0 ? (
        <div className="community-stories-grid">
          {filteredStories.map((story) => (
            <CommunityStoryCard key={story.id || story.slug} story={story} />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: "center",
            padding: "3.5rem 1.5rem",
            background: "var(--bg-secondary)",
            border: "1px dashed var(--border-color)",
          }}
        >
          <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "0.75rem" }}>
            🔍
          </span>
          <h4
            style={{
              fontSize: "1.2rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "0.5rem",
              fontFamily: '"Rajdhani", sans-serif',
            }}
          >
            No stories found matching your filter
          </h4>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1rem" }}>
            Try selecting another game or category to see more community journeys.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedGame("All");
              setSelectedCategory("All");
            }}
            className="btn btn-secondary"
            style={{
              padding: "0.4rem 1rem",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
