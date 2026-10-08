"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Standard Adsterra 320x50 Banner Zone Key
const ZONE_KEY =
  process.env.NEXT_PUBLIC_ADSTERRA_BANNER_320X50_KEY ||
  "4f4ab1bbe05068164ef41d1096876079";

// Paths where ads must NEVER render
const EXCLUDED_PREFIXES = [
  "/admin",
  "/khelpedia-admin",
  "/auth",
  "/login",
  "/register",
  "/dashboard",
];

/**
 * AdsterraMobileBanner
 * Reusable 320x50 mobile advertising slot.
 * Encapsulated inside an isolated iframe to prevent global window.atOptions collisions
 * when rendering multiple banner ads on the same page.
 */
export default function AdsterraMobileBanner({
  placement = "mobile_banner",
  className = "",
  style = {},
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const isAdsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED !== "false";
  const isExcludedPath = EXCLUDED_PREFIXES.some((prefix) =>
    pathname?.toLowerCase().startsWith(prefix)
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isAdsEnabled || isExcludedPath) {
    return null;
  }

  // Self-contained document for isolated iframe execution
  const iframeSrcDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      margin: 0;
      padding: 0;
      width: 320px;
      height: 50px;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      background: transparent;
    }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key' : '${ZONE_KEY}',
      'format' : 'iframe',
      'height' : 50,
      'width' : 320,
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="https://www.highrevenueformat.com/${ZONE_KEY}/invoke.js"></script>
</body>
</html>`;

  return (
    <div
      data-ad-placement={placement}
      data-ad-size="320x50"
      className={`mobile-ad-banner-wrapper ${className}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        maxWidth: "100%",
        minHeight: "72px",
        margin: "1rem 0",
        overflow: "hidden",
        position: "relative",
        clear: "both",
        ...style,
      }}
    >
      {/* Subtle, compliant disclosure label */}
      <div
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "var(--text-muted, #71717a)",
          textTransform: "uppercase",
          marginBottom: "4px",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          gap: "5px",
        }}
      >
        <span>Advertisement</span>
      </div>

      {/* Frame wrapper with strictly reserved 320x50 dimensions to eliminate CLS */}
      <div
        style={{
          width: "320px",
          height: "50px",
          minWidth: "320px",
          minHeight: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          background: "rgba(0, 0, 0, 0.08)",
          borderRadius: "4px",
        }}
      >
        {mounted && (
          <iframe
            title={`Advertisement - Mobile Banner (${placement})`}
            srcDoc={iframeSrcDoc}
            width="320"
            height="50"
            tabIndex={-1}
            style={{
              width: "320px",
              height: "50px",
              minWidth: "320px",
              minHeight: "50px",
              border: "none",
              overflow: "hidden",
              display: "block",
            }}
            scrolling="no"
          />
        )}
      </div>
    </div>
  );
}
