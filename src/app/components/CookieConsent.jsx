"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("khelpedia-cookie-consent");
    if (!consent) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  const acceptCookies = () => {
    localStorage.setItem("khelpedia-cookie-consent", "true");
    setShow(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border-color)",
        padding: "1rem",
        zIndex: 9999,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
      }}
    >
      <div style={{ flex: 1, minWidth: "250px" }}>
        <p
          style={{
            margin: 0,
            fontSize: "0.9rem",
            color: "var(--text-primary)",
            lineHeight: 1.5,
          }}
        >
          We use cookies to improve your experience, serve personalized ads, and analyze our traffic. By clicking &quot;Accept&quot;, you consent to our use of cookies as described in our{" "}
          <Link
            href="/privacy"
            style={{ color: "var(--accent-cyan)", textDecoration: "none" }}
          >
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link
            href="/cookies"
            style={{ color: "var(--accent-cyan)", textDecoration: "none" }}
          >
            Cookie Policy
          </Link>.
        </p>
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          onClick={acceptCookies}
          style={{
            background: "var(--accent-red)",
            color: "#fff",
            border: "none",
            padding: "0.5rem 1.5rem",
            borderRadius: "4px",
            fontFamily: '"Orbitron", sans-serif',
            fontWeight: "bold",
            cursor: "pointer",
            transition: "opacity 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
