"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Standard Adsterra Banner Zone Keys
const ZONE_KEYS = {
  "728x90": process.env.NEXT_PUBLIC_ADSTERRA_BANNER_728X90_KEY || "5f86b8ba897a34d202901f2a1670db55",
  "300x250": process.env.NEXT_PUBLIC_ADSTERRA_BANNER_300X250_KEY || "cc7bdff7f055d2ba8a47a30cca4735e6",
  "320x50": process.env.NEXT_PUBLIC_ADSTERRA_BANNER_320X50_KEY || "4f4ab1bbe05068164ef41d1096876079",
};

// Paths where ads must NEVER render
const EXCLUDED_PREFIXES = [
  "/admin",
  "/khelpedia-admin",
  "/auth",
  "/login",
  "/register",
  "/dashboard",
];

function generateSrcDoc(zoneKey, width, height) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      margin: 0;
      padding: 0;
      width: ${width}px;
      height: ${height}px;
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
      'key' : '${zoneKey}',
      'format' : 'iframe',
      'height' : ${height},
      'width' : ${width},
      'params' : {}
    };
  </script>
  <script type="text/javascript" src="https://www.highrevenueformat.com/${zoneKey}/invoke.js"></script>
</body>
</html>`;
}

/**
 * AdsterraBanner
 * Renders an isolated, responsive, and CLS-protected Adsterra banner unit.
 * Uses isolated iframe encapsulation (srcDoc) to prevent global window.atOptions
 * collisions and eliminate layout shifts (CLS).
 *
 * For size="responsive":
 * - Displays 728x90 Leaderboard on desktop/tablet (>=768px)
 * - Displays 320x50 Banner on mobile (<768px) via CSS media query
 */
export default function AdsterraBanner({
  size = "responsive",
  zoneKey = null,
  width: customWidth = null,
  height: customHeight = null,
  placement = "content_banner",
  className = "",
  style = {},
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const isAdsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED !== "false";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Safeguard: Never render on admin, auth, or internal dashboard paths
  const isExcludedPath = EXCLUDED_PREFIXES.some((prefix) =>
    pathname?.toLowerCase().startsWith(prefix)
  );

  if (!isAdsEnabled || isExcludedPath) {
    return null;
  }

  // Handle explicit fixed sizes
  if (size === "300x250") {
    const key = zoneKey || ZONE_KEYS["300x250"];
    return (
      <div
        data-ad-placement={placement}
        data-ad-size="300x250"
        className={`adsterra-banner-wrapper size-300x250 ${className}`}
        style={style}
      >
        <span className="adsterra-ad-label">Advertisement</span>
        <div className="adsterra-banner-frame-300x250">
          {mounted && (
            <iframe
              title={`Advertisement - 300x250 (${placement})`}
              srcDoc={generateSrcDoc(key, 300, 250)}
              width="300"
              height="250"
              tabIndex={-1}
              style={{ width: "300px", height: "250px", border: "none", overflow: "hidden", display: "block" }}
              scrolling="no"
            />
          )}
        </div>
      </div>
    );
  }

  if (size === "320x50") {
    const key = zoneKey || ZONE_KEYS["320x50"];
    return (
      <div
        data-ad-placement={placement}
        data-ad-size="320x50"
        className={`adsterra-banner-wrapper size-320x50 ${className}`}
        style={style}
      >
        <span className="adsterra-ad-label">Advertisement</span>
        <div className="adsterra-banner-frame-320x50">
          {mounted && (
            <iframe
              title={`Advertisement - 320x50 (${placement})`}
              srcDoc={generateSrcDoc(key, 320, 50)}
              width="320"
              height="50"
              tabIndex={-1}
              style={{ width: "320px", height: "50px", border: "none", overflow: "hidden", display: "block" }}
              scrolling="no"
            />
          )}
        </div>
      </div>
    );
  }

  if (size === "728x90") {
    const key = zoneKey || ZONE_KEYS["728x90"];
    return (
      <div
        data-ad-placement={placement}
        data-ad-size="728x90"
        className={`adsterra-banner-wrapper size-728x90 ${className}`}
        style={style}
      >
        <span className="adsterra-ad-label">Advertisement</span>
        <div className="adsterra-banner-frame-728x90">
          {mounted && (
            <iframe
              title={`Advertisement - 728x90 (${placement})`}
              srcDoc={generateSrcDoc(key, 728, 90)}
              width="728"
              height="90"
              tabIndex={-1}
              style={{ width: "728px", height: "90px", border: "none", overflow: "hidden", display: "block" }}
              scrolling="no"
            />
          )}
        </div>
      </div>
    );
  }

  // Responsive mode: CSS-swapped desktop 728x90 and mobile 320x50 with strictly reserved space
  const desktopKey = zoneKey || ZONE_KEYS["728x90"];
  const mobileKey = zoneKey || ZONE_KEYS["320x50"];

  return (
    <div
      data-ad-placement={placement}
      data-ad-size="responsive"
      className={`adsterra-banner-wrapper size-responsive ${className}`}
      style={style}
    >
      {/* Desktop / Tablet Container (>= 768px): 728x90 */}
      <div className="adsterra-banner-desktop">
        <span className="adsterra-ad-label">Advertisement</span>
        <div className="adsterra-banner-frame-728x90">
          {mounted && (
            <iframe
              title={`Advertisement - Desktop Leaderboard (${placement})`}
              srcDoc={generateSrcDoc(desktopKey, 728, 90)}
              width="728"
              height="90"
              tabIndex={-1}
              style={{ width: "728px", height: "90px", border: "none", overflow: "hidden", display: "block" }}
              scrolling="no"
            />
          )}
        </div>
      </div>

      {/* Mobile Container (< 768px): 320x50 */}
      <div className="adsterra-banner-mobile">
        <span className="adsterra-ad-label">Advertisement</span>
        <div className="adsterra-banner-frame-320x50">
          {mounted && (
            <iframe
              title={`Advertisement - Mobile Banner (${placement})`}
              srcDoc={generateSrcDoc(mobileKey, 320, 50)}
              width="320"
              height="50"
              tabIndex={-1}
              style={{ width: "320px", height: "50px", border: "none", overflow: "hidden", display: "block" }}
              scrolling="no"
            />
          )}
        </div>
      </div>
    </div>
  );
}
