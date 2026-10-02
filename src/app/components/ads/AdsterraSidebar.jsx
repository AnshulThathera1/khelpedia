"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Standard Adsterra 300x250 Banner Zone Key
const ZONE_KEY = process.env.NEXT_PUBLIC_ADSTERRA_BANNER_300X250_KEY || "cc7bdff7f055d2ba8a47a30cca4735e6";

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
 * AdsterraSidebar
 * Reusable 300x250 desktop sidebar advertising slot.
 * Encapsulated inside an isolated iframe to prevent global window.atOptions collisions
 * when rendering dual (left and right) sidebar ads simultaneously.
 */
export default function AdsterraSidebar({
  placement = "sidebar_left",
  position = "left",
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
      width: 300px;
      height: 250px;
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
      'height' : 250,
      'width' : 300,
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="https://www.highrevenueformat.com/${ZONE_KEY}/invoke.js"></script>
</body>
</html>`;

  return (
    <div
      data-ad-placement={placement}
      data-ad-position={position}
      data-ad-size="300x250"
      className={`sidebar-ad-card ${className}`}
      style={style}
    >
      {/* Subtle, compliant disclosure label */}
      <div className="sidebar-ad-label">
        <span>Advertisement</span>
      </div>

      {/* Frame wrapper with strictly reserved 300x250 dimensions to eliminate CLS */}
      <div className="sidebar-ad-frame-wrapper">
        {mounted && (
          <iframe
            title={`Advertisement - ${position === "left" ? "Left" : "Right"} Sidebar`}
            srcDoc={iframeSrcDoc}
            width="300"
            height="250"
            tabIndex={-1}
            style={{
              width: "300px",
              height: "250px",
              minWidth: "300px",
              minHeight: "250px",
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
