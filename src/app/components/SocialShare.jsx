"use client";

import { Twitter, Facebook, Link as LinkIcon, MessageCircle } from "lucide-react";
import { useState } from "react";

export default function SocialShare({ url, title }) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle} - ${encodedUrl}`
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link");
    }
  };

  const buttonStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    color: "#fff",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "2rem", marginBottom: "2rem", flexWrap: "wrap" }}>
      <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>Share this article</span>
      <style dangerouslySetInnerHTML={{__html: `
        .social-btn { transition: all 0.2s ease; }
        .social-btn:hover { transform: translateY(-3px); }
      `}} />
      <div style={{ display: "flex", gap: "0.75rem" }}>
        {/* Twitter */}
        <a 
          href={shareLinks.twitter} 
          target="_blank" 
          rel="noopener noreferrer"
          className="social-btn"
          style={{ ...buttonStyle, background: "#1DA1F2" }}
          title="Share on Twitter"
        >
          <Twitter className="w-5 h-5" />
        </a>

        {/* Facebook */}
        <a 
          href={shareLinks.facebook} 
          target="_blank" 
          rel="noopener noreferrer"
          className="social-btn"
          style={{ ...buttonStyle, background: "#1877F2" }}
          title="Share on Facebook"
        >
          <Facebook className="w-5 h-5" />
        </a>

        {/* WhatsApp */}
        <a 
          href={shareLinks.whatsapp} 
          target="_blank" 
          rel="noopener noreferrer"
          className="social-btn"
          style={{ ...buttonStyle, background: "#25D366" }}
          title="Share on WhatsApp"
        >
          <MessageCircle className="w-5 h-5" />
        </a>

        {/* Copy Link */}
        <button 
          onClick={handleCopy}
          className="social-btn"
          style={{ ...buttonStyle, background: copied ? "#10B981" : "var(--bg-secondary)", border: "1px solid var(--border-color)", color: copied ? "#fff" : "var(--text-primary)" }}
          title="Copy Link"
        >
          <LinkIcon className="w-5 h-5" />
        </button>
      </div>
      {copied && <span style={{ fontSize: "0.85rem", color: "#10B981", fontWeight: 500, animation: "fadeIn 0.3s ease" }}>Link copied!</span>}
    </div>
  );
}
