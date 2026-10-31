"use client";

import Link from "next/link";
import { Newspaper, ArrowRight, Clock, User, Sparkles } from "lucide-react";

export default function BGMIEditorialNews({ blogs = [] }) {
  if (!blogs || blogs.length === 0) return null;

  const leadStory = blogs[0];
  const supportingStories = blogs.slice(1, 4);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <section id="news" aria-label="BGMI News and Editorial Coverage" style={{ marginBottom: "5rem" }}>
      <div className="section-header">
        <div>
          <div className="tactical-kicker" style={{ color: "var(--accent-cyan)" }}>
            <Sparkles size={14} color="var(--accent-cyan)" />
            <span>// 07. EDITORIAL INTEL</span>
          </div>
          <h2 className="section-title">BGMI News, Guides & Analysis</h2>
          <p className="section-subtitle">
            Original reporting, tactical meta guides, and tournament breakdown analysis
          </p>
        </div>

        <Link
          href="/blogs"
          style={{
            color: "var(--accent-cyan)",
            textDecoration: "none",
            fontWeight: 800,
            fontSize: "0.85rem",
            fontFamily: "var(--font-rajdhani), sans-serif",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          All Articles <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Lead Story (7 cols) */}
        {leadStory && (
          <div className="lg:col-span-7">
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
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent-cyan)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Cover Image Container */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "260px",
                  background: "linear-gradient(180deg, #151d2a 0%, #0e131c 100%)",
                  overflow: "hidden",
                }}
              >
                {leadStory.cover_image_url ? (
                  <img
                    src={leadStory.cover_image_url}
                    alt={leadStory.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.4s ease",
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[var(--bg-card)]">
                    <Newspaper size={48} color="var(--border-color)" />
                  </div>
                )}

                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    background: "rgba(0, 245, 212, 0.9)",
                    color: "#080b10",
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    fontSize: "0.72rem",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    padding: "2px 8px",
                    borderRadius: "3px",
                  }}
                >
                  FEATURED INTEL
                </div>
              </div>

              {/* Lead Body */}
              <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mb-2 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {formatDate(leadStory.created_at)}
                  </span>
                  <span>•</span>
                  <span>BGMI Tactical</span>
                </div>

                <h3
                  style={{
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    fontSize: "1.45rem",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    lineHeight: 1.25,
                    marginBottom: "0.75rem",
                  }}
                >
                  {leadStory.title}
                </h3>

                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.55,
                    marginBottom: "1.25rem",
                  }}
                  className="line-clamp-3"
                >
                  {leadStory.excerpt || "In-depth competitive coverage from the KhelPediA esports intelligence desk."}
                </p>

                <div
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "0.85rem",
                    borderTop: "1px solid var(--border-subtle)",
                    fontSize: "0.82rem",
                    fontWeight: 800,
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    color: "var(--accent-cyan)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  <span>Read Full Analysis</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Supporting Stories (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {supportingStories.map((story) => (
            <Link
              key={story.id}
              href={`/blogs/${story.slug}`}
              style={{
                textDecoration: "none",
                color: "inherit",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                padding: "1.1rem 1.25rem",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent-cyan)";
                e.currentTarget.style.transform = "translateX(3px)";
                e.currentTarget.style.background = "var(--bg-card-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.transform = "translateX(0)";
                e.currentTarget.style.background = "var(--bg-secondary)";
              }}
            >
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-1.5">
                <span className="text-[var(--accent-cyan)] font-bold uppercase tracking-wider font-['Rajdhani']">
                  {story.category || "Competitive"}
                </span>
                <span>•</span>
                <span>{formatDate(story.created_at)}</span>
              </div>

              <h4
                style={{
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  fontSize: "1.05rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  lineHeight: 1.3,
                  marginBottom: "0.4rem",
                }}
                className="line-clamp-2"
              >
                {story.title}
              </h4>

              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.45,
                }}
                className="line-clamp-2"
              >
                {story.excerpt}
              </p>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
