"use client";

const GAMES = [
  "All Stories",
  "Free Fire",
  "VALORANT",
  "BGMI",
  "CS2",
  "League of Legends",
  "Dota 2",
  "Other",
];

const CATEGORIES = [
  "All Categories",
  "Player Story",
  "Community Interview",
  "Team Story",
  "Tournament Story",
  "Creator Story",
  "Gaming Journey",
];

export default function CommunityFilters({
  activeGame,
  onSelectGame,
  activeCategory,
  onSelectCategory,
}) {
  return (
    <div
      style={{
        marginBottom: "2.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .community-filter-row {
            display: flex;
            gap: 0.5rem;
            overflow-x: auto;
            padding-bottom: 6px;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .community-filter-row::-webkit-scrollbar {
            display: none;
          }
          @media (min-width: 640px) {
            .community-filter-row {
              flex-wrap: wrap;
              overflow-x: visible;
              padding-bottom: 0;
            }
          }
          .community-filter-btn {
            white-space: nowrap;
            flex-shrink: 0;
            touch-action: manipulation;
            border-radius: 2px;
          }
        `,
        }}
      />
      {/* Game Filters Bar */}
      <div>
        <div
          style={{
            fontSize: "0.72rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--text-muted)",
            marginBottom: "0.5rem",
          }}
        >
          Filter by Game
        </div>
        <div className="community-filter-row">
          {GAMES.map((game) => {
            const isSelected =
              activeGame === game ||
              (activeGame === "All" && game === "All Stories");
            return (
              <button
                key={game}
                type="button"
                className="community-filter-btn"
                onClick={() => {
                  if (isSelected && game !== "All Stories") {
                    onSelectGame("All");
                  } else {
                    onSelectGame(game === "All Stories" ? "All" : game);
                  }
                }}
                style={{
                  background: isSelected ? "var(--accent-red)" : "var(--bg-card)",
                  color: isSelected ? "#fff" : "var(--text-secondary)",
                  border: isSelected
                    ? "1px solid var(--accent-red)"
                    : "1px solid var(--border-color)",
                  padding: "0.4rem 0.9rem",
                  fontSize: "0.82rem",
                  fontWeight: isSelected ? 800 : 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: '"Outfit", sans-serif',
                }}
              >
                {game}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Filters Bar */}
      <div>
        <div
          style={{
            fontSize: "0.72rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--text-muted)",
            marginBottom: "0.5rem",
          }}
        >
          Filter by Category
        </div>
        <div className="community-filter-row">
          {CATEGORIES.map((cat) => {
            const isSelected =
              activeCategory === cat ||
              (activeCategory === "All" && cat === "All Categories");
            return (
              <button
                key={cat}
                type="button"
                className="community-filter-btn"
                onClick={() => {
                  if (isSelected && cat !== "All Categories") {
                    onSelectCategory("All");
                  } else {
                    onSelectCategory(cat === "All Categories" ? "All" : cat);
                  }
                }}
                style={{
                  background: isSelected ? "var(--accent-cyan)" : "var(--bg-card)",
                  color: isSelected ? "#0f1923" : "var(--text-secondary)",
                  border: isSelected
                    ? "1px solid var(--accent-cyan)"
                    : "1px solid var(--border-color)",
                  padding: "0.35rem 0.8rem",
                  fontSize: "0.8rem",
                  fontWeight: isSelected ? 800 : 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontFamily: '"Outfit", sans-serif',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
