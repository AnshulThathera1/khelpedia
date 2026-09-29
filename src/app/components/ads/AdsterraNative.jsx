"use client";

import { useEffect, useRef } from "react";

export default function AdsterraNative({ 
  scriptSrc = "https://pl31576901.profitablecreativeformat.com/f6a1d6b7a29abf9d3dc957e3de20a8da/invoke.js", 
  containerId = "container-f6a1d6b7a29abf9d3dc957e3de20a8da" 
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!scriptSrc || !containerRef.current) return;

    if (containerRef.current.querySelector("script")) return;

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = scriptSrc;

    const targetDiv = document.createElement("div");
    targetDiv.id = containerId;

    containerRef.current.appendChild(script);
    containerRef.current.appendChild(targetDiv);
  }, [scriptSrc, containerId]);

  if (!scriptSrc) return null;

  return (
    <div
      style={{
        margin: "2rem 0",
        textAlign: "center",
      }}
    >
      <span
        style={{
          fontSize: "0.7rem",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "0.5rem",
          display: "block",
        }}
      >
        Sponsored Content
      </span>
      <div ref={containerRef} />
    </div>
  );
}
