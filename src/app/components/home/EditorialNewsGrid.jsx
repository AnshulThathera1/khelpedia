"use client";

import Link from "next/link";
import { Chip, Button } from "@nextui-org/react";
import { ArrowRight, Clock, User, Sparkles } from "lucide-react";

export default function EditorialNewsGrid({ blogs = [] }) {
  if (!blogs || blogs.length === 0) return null;

  const leadStory = blogs[0];
  const secondaryStories = blogs.slice(1, 4);
  const deepDives = blogs.slice(4, 7);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <section aria-label="Editorial News and Analysis" style={{ marginBottom: "5rem" }}>
      {/* Section Header */}
      <div className="section-header">
        <div>
          <div className="tactical-kicker tactical-kicker-cyan">
            <Sparkles size={13} />
            <span>// 02. EDITORIAL DISPATCH</span>
          </div>
          <h2 className="section-title">Latest News & Analysis</h2>
          <p className="section-subtitle">Original reporting, post-match breakdowns, and meta analytics from our editorial team</p>
        </div>
        <Button
          as={Link}
          href="/blogs"
          size="sm"
          variant="light"
          endContent={<ArrowRight size={14} />}
          style={{
            color: "var(--accent-red)",
            fontFamily: "var(--font-rajdhani), sans-serif",
            fontWeight: 800,
            fontSize: "0.85rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            padding: "0 12px",
            height: "36px"
          }}
        >
          All Articles
        </Button>
      </div>

      {/* Primary Asymmetric Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: "1.75rem",
          marginBottom: "1.75rem"
        }}
      >
        {/* ================= LEFT: LEAD FEATURE STORY (7 COLS) ================= */}
        {leadStory && (
          <div
            style={{
              gridColumn: "span 12"
            }}
            className="lg:col-span-7 col-span-12"
          >
            <Link
              href={`/blogs/${leadStory.slug}`}
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                overflow: "hidden",
                transition: "all 0.25s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent-red)";
                e.currentTarget.style.transform = "translateY(-3px)";
                const img = e.currentTarget.querySelector(".lead-story-image");
                if (img) img.style.transform = "scale(1.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.transform = "translateY(0)";
                const img = e.currentTarget.querySelector(".lead-story-image");
                if (img) img.style.transform = "scale(1)";
              }}
            >
              {/* Cover Image Container */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "300px",
                  overflow: "hidden",
                  background: "#0E131C"
                }}
              >
                {leadStory.cover_image_url ? (
                  <img
                    className="lead-story-image"
                    src={leadStory.cover_image_url}
                    alt={leadStory.title}
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "linear-gradient(135deg, #141A26, #080B10)"
                    }}
                  >
                    <span style={{ fontSize: "3rem", opacity: 0.3 }}>🎮</span>
                  </div>
                )}

                {/* Subtle Image Vignette */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(180deg, transparent 40%, rgba(14, 19, 28, 0.95) 100%)"
                  }}
                />

                {/* Category Chip */}
                <div style={{ position: "absolute", top: "1rem", left: "1rem", zIndex: 10 }}>
                  <Chip
                    size="sm"
                    color="danger"
                    variant="solid"
                    classNames={{
                      base: "bg-[#FF4655] shadow-lg",
                      content: "text-white font-black uppercase text-[10px] tracking-widest font-['Rajdhani']"
                    }}
                  >
                    Featured Story
                  </Chip>
                </div>
              </div>

              {/* Story Details */}
              <div style={{ padding: "1.75rem", display: "flex", flexDirection: "column", flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    marginBottom: "0.75rem"
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <User size={13} color="var(--accent-cyan)" />
                    {leadStory.profiles?.display_name || "Editorial Staff"}
                  </span>
                  <span>•</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={13} />
                    {formatDate(leadStory.created_at)}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    fontSize: "clamp(1.4rem, 2vw, 1.85rem)",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    lineHeight: 1.2,
                    textTransform: "uppercase",
                    letterSpacing: "0.02em",
                    marginBottom: "0.75rem"
                  }}
                >
                  {leadStory.title}
                </h3>

                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.95rem",
                    lineHeight: 1.6,
                    margin: 0,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}
                >
                  {leadStory.excerpt}
                </p>

                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: "1.25rem",
                    color: "var(--accent-red)",
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  Read Full Dispatch <ArrowRight size={13} />
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* ================= RIGHT: CURATED SECONDARY STACK (5 COLS) ================= */}
        <div
          style={{
            gridColumn: "span 12",
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
          }}
          className="lg:col-span-5 col-span-12"
        >
          {secondaryStories.map((story) => (
            <Link
              key={story.id}
              href={`/blogs/${story.slug}`}
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "grid",
                gridTemplateColumns: "110px 1fr",
                gap: "1rem",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                padding: "0.85rem",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(0, 245, 212, 0.4)";
                e.currentTarget.style.background = "var(--bg-card-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.background = "var(--bg-secondary)";
              }}
            >
              {/* Thumbnail */}
              <div
                style={{
                  width: "110px",
                  height: "85px",
                  borderRadius: "5px",
                  overflow: "hidden",
                  background: "var(--bg-card)"
                }}
              >
                {story.cover_image_url ? (
                  <img
                    src={story.cover_image_url}
                    alt={story.title}
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem"
                    }}
                  >
                    📰
                  </div>
                )}
              </div>

              {/* Story Content */}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "4px"
                  }}
                >
                  <Chip
                    size="sm"
                    variant="flat"
                    classNames={{
                      base: "bg-[#00F5D4]/15 border border-[#00F5D4]/35 h-4 px-1.5",
                      content: "text-[#00F5D4] font-black uppercase text-[9px] tracking-wider font-['Rajdhani']"
                    }}
                  >
                    Breaking
                  </Chip>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                    {formatDate(story.created_at)}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    fontSize: "0.98rem",
                    fontWeight: 700,
                    lineHeight: 1.25,
                    color: "var(--text-primary)",
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.01em",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}
                >
                  {story.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Curated Deep Dives Grid (Row of 3 cards) */}
      {deepDives.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.25rem"
          }}
        >
          {deepDives.map((story) => (
            <Link
              key={story.id}
              href={`/blogs/${story.slug}`}
              style={{
                textDecoration: "none",
                color: "inherit",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent-amber)";
                e.currentTarget.style.background = "var(--bg-card-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.background = "var(--bg-secondary)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px"
                }}
              >
                <Chip
                  size="sm"
                  variant="flat"
                  classNames={{
                    base: "bg-[#E5A93C]/15 border border-[#E5A93C]/35 h-4 px-1.5",
                    content: "text-[#E5A93C] font-black uppercase text-[9px] tracking-wider font-['Rajdhani']"
                  }}
                >
                  Editor&apos;s Pick
                </Chip>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                  {formatDate(story.created_at)}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  fontSize: "1.05rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  margin: "0 0 8px 0",
                  lineHeight: 1.3,
                  textTransform: "uppercase",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}
              >
                {story.title}
              </h3>

              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.82rem",
                  lineHeight: 1.5,
                  margin: 0,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}
              >
                {story.excerpt}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
