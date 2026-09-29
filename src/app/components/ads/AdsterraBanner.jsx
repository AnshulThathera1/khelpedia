"use client";

import { useEffect, useRef } from "react";

export default function AdsterraBanner({ zoneKey, width = 300, height = 250 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!zoneKey || !containerRef.current) return;

    // Prevent duplicate script insertion
    if (containerRef.current.querySelector("script")) return;

    const confScript = document.createElement("script");
    confScript.type = "text/javascript";
    confScript.innerHTML = `
      atOptions = {
        'key' : '${zoneKey}',
        'format' : 'iframe',
        'height' : ${height},
        'width' : ${width},
        'params' : {}
      };
    `;

    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = `https://www.highrevenueformat.com/${zoneKey}/invoke.js`;
    invokeScript.async = true;

    containerRef.current.appendChild(confScript);
    containerRef.current.appendChild(invokeScript);
  }, [zoneKey, width, height]);

  if (!zoneKey) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justify: "center",
        margin: "2rem 0",
        minHeight: `${height + 20}px`,
      }}
    >
      <span
        style={{
          fontSize: "0.7rem",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "0.5rem",
        }}
      >
        Advertisement
      </span>
      <div ref={containerRef} style={{ width: `${width}px`, minHeight: `${height}px` }} />
    </div>
  );
}
