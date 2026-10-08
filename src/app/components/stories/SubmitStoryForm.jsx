"use client";

import { useState } from "react";
import { submitStoryAction } from "@/app/actions/submitStory";
import Link from "next/link";

export default function SubmitStoryForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const result = await submitStoryAction(formData);

    setLoading(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setErrorMessage(result.error || "Failed to submit story. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div
        className="card"
        style={{
          padding: "3.5rem 2rem",
          textAlign: "center",
          background: "var(--bg-card)",
          border: "1px solid rgba(0, 189, 165, 0.3)",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(0, 189, 165, 0.15)",
            color: "var(--accent-cyan)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            marginBottom: "1.5rem",
          }}
        >
          ✓
        </div>

        <h3
          style={{
            fontFamily: '"Rajdhani", sans-serif',
            fontSize: "2rem",
            fontWeight: 800,
            color: "var(--text-primary)",
            marginBottom: "0.75rem",
            textTransform: "uppercase",
          }}
        >
          Thank You for Sharing Your Story!
        </h3>

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "1.05rem",
            maxWidth: "540px",
            margin: "0 auto 2rem",
            lineHeight: 1.6,
          }}
        >
          Our editorial team reviews submissions on a rolling basis. If your journey is selected for a
          feature, an editor will contact you via email for confirmation and additional details.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/stories"
            className="btn btn-primary"
            style={{
              textDecoration: "none",
              padding: "0.7rem 1.6rem",
              fontWeight: 700,
              fontSize: "0.9rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Explore Community Stories &rarr;
          </Link>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="btn btn-secondary"
            style={{
              padding: "0.7rem 1.6rem",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            Submit Another Story
          </button>
        </div>
      </div>
    );
  }

  const labelStyle = {
    display: "block",
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "0.4rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const inputStyle = {
    width: "100%",
    padding: "0.75rem 1rem",
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
    fontSize: "1rem", // 16px to prevent iOS auto-zoom
    outline: "none",
    fontFamily: '"Outfit", sans-serif',
    borderRadius: "0px",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .form-row-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
          @media (max-width: 639px) {
            .form-row-grid {
              grid-template-columns: 1fr !important;
              gap: 1.25rem !important;
            }
            .submit-story-btn {
              width: 100% !important;
              justify-content: center !important;
              text-align: center !important;
              padding: 0.95rem 1.5rem !important;
            }
          }
        `,
        }}
      />
      {errorMessage && (
        <div
          style={{
            padding: "1rem 1.25rem",
            background: "rgba(255, 70, 85, 0.12)",
            border: "1px solid rgba(255, 70, 85, 0.3)",
            color: "var(--accent-red)",
            fontSize: "0.9rem",
            fontWeight: 600,
          }}
        >
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Grid: Name & Email */}
      <div className="form-row-grid">
        <div>
          <label htmlFor="submitter-name" style={labelStyle}>
            Your Name / Nickname <span style={{ color: "var(--accent-red)" }}>*</span>
          </label>
          <input
            id="submitter-name"
            name="name"
            type="text"
            required
            placeholder="Your name or nickname"
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="submitter-email" style={labelStyle}>
            Email Address <span style={{ color: "var(--accent-red)" }}>*</span>
          </label>
          <input
            id="submitter-email"
            name="email"
            type="email"
            required
            placeholder="e.g. player@example.com"
            style={inputStyle}
          />
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
            Used solely for editorial verification and outreach. Never made public.
          </span>
        </div>
      </div>

      {/* Grid: Game & IGN */}
      <div className="form-row-grid">
        <div>
          <label htmlFor="story-game" style={labelStyle}>
            Game <span style={{ color: "var(--accent-red)" }}>*</span>
          </label>
          <select
            id="story-game"
            name="game"
            required
            style={{ ...inputStyle, cursor: "pointer" }}
            defaultValue=""
          >
            <option value="" disabled>Select your game</option>
            <option value="Free Fire">Free Fire</option>
            <option value="VALORANT">VALORANT</option>
            <option value="BGMI">BGMI</option>
            <option value="CS2">CS2</option>
            <option value="League of Legends">League of Legends</option>
            <option value="Dota 2">Dota 2</option>
            <option value="PUBG Mobile">PUBG Mobile</option>
            <option value="Other">Other Game</option>
          </select>
        </div>

        <div>
          <label htmlFor="story-ign" style={labelStyle}>
            In-Game Name (IGN) & UID
          </label>
          <input
            id="story-ign"
            name="ign"
            type="text"
            placeholder="e.g. PlayerName#1234 or UID / In-Game ID"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Story Content */}
      <div>
        <label htmlFor="story-text" style={labelStyle}>
          Your Story / Journey <span style={{ color: "var(--accent-red)" }}>*</span>
        </label>
        <textarea
          id="story-text"
          name="story"
          required
          rows={7}
          placeholder="Tell us what happened: what milestones did you achieve, what challenges did you face (e.g. hardware, rank climbs, tournament runs, clan journey), and what does gaming mean to you?"
          style={{ ...inputStyle, resize: "vertical", minHeight: "160px" }}
        />
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
          Minimum 50 characters. Feel free to write in either English, Hindi, or your preferred language.
        </span>
      </div>

      {/* Proof / Verification */}
      <div>
        <label htmlFor="story-screenshots" style={labelStyle}>
          Screenshots / Verification Notes
        </label>
        <textarea
          id="story-screenshots"
          name="screenshots_notes"
          rows={3}
          placeholder="Links to screenshots, match history recordings, tournament brackets, or drive folders validating your milestone."
          style={{ ...inputStyle, resize: "vertical" }}
        />
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
          We only feature verified milestones. Paste links (Imgur, Google Drive, YouTube, Tracker) if available.
        </span>
      </div>

      {/* Grid: Socials & Username */}
      <div className="form-row-grid">
        <div>
          <label htmlFor="story-socials" style={labelStyle}>
            Social Profiles (Optional)
          </label>
          <input
            id="story-socials"
            name="social_links"
            type="text"
            placeholder="e.g. Twitter: @handle, Instagram, or Discord tag"
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="story-khelpedia-user" style={labelStyle}>
            KhelPediA Username (Optional)
          </label>
          <input
            id="story-khelpedia-user"
            name="khelpedia_username"
            type="text"
            placeholder="Your registered KhelPediA display name"
            style={inputStyle}
          />
        </div>
      </div>

      {/* Editorial Transparency Notices */}
      <div
        style={{
          padding: "1.25rem",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          fontSize: "0.82rem",
          color: "var(--text-muted)",
          lineHeight: 1.6,
        }}
      >
        <p style={{ margin: "0 0 0.5rem" }}>
          <strong style={{ color: "var(--text-primary)" }}>Editorial Disclaimers:</strong>
        </p>
        <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
          <li>Submitting a story does not guarantee publication.</li>
          <li>Stories are reviewed and may be edited for clarity, accuracy, and editorial style.</li>
          <li>Never share game account passwords, payment credentials, or private sensitive info.</li>
        </ul>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary submit-story-btn"
        style={{
          padding: "0.85rem 2rem",
          fontSize: "0.95rem",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
          alignSelf: "flex-start",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        {loading ? "Submitting..." : "Submit Story For Review →"}
      </button>
    </form>
  );
}
