"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Standard Adsterra Banner Zone Keys
const ZONE_KEYS = {
  "728x90": process.env.NEXT_PUBLIC_ADSTERRA_BANNER_728X90_KEY || "5f86b8ba897a34d202901f2a1670db55",
  "300x250": process.env.NEXT_PUBLIC_ADSTERRA_BANNER_300X250_KEY || "cc7bdff7f055d2ba8a47a30cca4735e6",
  "320x50": process.env.NEXT_PUBLIC_ADSTERRA_BANNER_320X50_KEY || "4f4ab1bbe05068164ef41d1096876079",
};

// Paths where ads must NEVER render (Phase 11 & 13 safeguards)
const EXCLUDED_PREFIXES = [
  "/admin",
  "/khelpedia-admin",
  "/auth",
  "/login",
  "/register",
  "/dashboard",
];

/**
 * AdsterraBanner
 * Renders an isolated, responsive, and CLS-protected Adsterra banner unit.
 * Supports: size="728x90" | "300x250" | "320x50" | "responsive"
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
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  const isAdsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED !== "false";

  // Detect viewport size dynamically without mounting hidden duplicate scripts
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const media = window.matchMedia("(min-width: 768px)");
      setIsDesktop(media.matches);

      const handleMediaChange = (e) => {
        setIsDesktop(e.matches);
      };

      media.addEventListener("change", handleMediaChange);
      return () => media.removeEventListener("change", handleMediaChange);
    }
  }, []);

  // Safeguard: Never render on admin, auth, or internal dashboard paths
  const isExcludedPath = EXCLUDED_PREFIXES.some((prefix) =>
    pathname?.toLowerCase().startsWith(prefix)
  );

  // Determine active dimensions and zone key
  let width = customWidth;
  let height = customHeight;
  let activeKey = zoneKey;

  if (size === "728x90") {
    width = width || 728;
    height = height || 90;
    activeKey = activeKey || ZONE_KEYS["728x90"];
  } else if (size === "300x250") {
    width = width || 300;
    height = height || 250;
    activeKey = activeKey || ZONE_KEYS["300x250"];
  } else if (size === "320x50") {
    width = width || 320;
    height = height || 50;
    activeKey = activeKey || ZONE_KEYS["320x50"];
  } else {
    // "responsive" Leaderboard: 728x90 on >=768px, 320x50 on <768px
    if (isDesktop) {
      width = width || 728;
      height = height || 90;
      activeKey = activeKey || ZONE_KEYS["728x90"];
    } else {
      width = width || 320;
      height = height || 50;
      activeKey = activeKey || ZONE_KEYS["320x50"];
    }
  }

  // Load the Adsterra script into the container cleanly
  useEffect(() => {
    if (!mounted || !isAdsEnabled || isExcludedPath || !activeKey || !containerRef.current) {
      return;
    }

    const container = containerRef.current;

    // Check if this container already has this specific zone script
    if (container.getAttribute("data-loaded-zone") === activeKey) {
      return;
    }

    // Clean container before injecting to avoid duplicate scripts on breakpoint switch
    container.innerHTML = "";
    container.setAttribute("data-loaded-zone", activeKey);

    const confScript = document.createElement("script");
    confScript.type = "text/javascript";
    confScript.innerHTML = `
      atOptions = {
        'key' : '${activeKey}',
        'format' : 'iframe',
        'height' : ${height},
        'width' : ${width},
        'params' : {}
      };
    `;

    const invokeScript = document.createElement("script");
    invokeScript.type = "text/javascript";
    invokeScript.src = `https://www.highrevenueformat.com/${activeKey}/invoke.js`;
    invokeScript.async = true;

    container.appendChild(confScript);
    container.appendChild(invokeScript);

    return () => {
      // Cleanup on unmount or breakpoint switch
      container.innerHTML = "";
      container.removeAttribute("data-loaded-zone");
    };
  }, [mounted, isAdsEnabled, isExcludedPath, activeKey, width, height]);

  if (!isAdsEnabled || isExcludedPath) {
    return null;
  }

  // Reserve container dimensions to eliminate Cumulative Layout Shift (CLS)
  const reservedHeight = height ? height + 24 : 114;
  const reservedWidth = width ? `${width}px` : "100%";

  return (
    <div
      data-ad-placement={placement}
      data-ad-size={`${width}x${height}`}
      className={`adsterra-banner-wrapper ${className}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        margin: "2.5rem 0",
        minHeight: `${reservedHeight}px`,
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
        position: "relative",
        clear: "both",
        ...style,
      }}
    >
      {/* Standard non-intrusive ad disclosure label */}
      <span
        style={{
          fontSize: "0.68rem",
          fontWeight: 600,
          color: "var(--text-muted, #71717a)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "0.4rem",
          userSelect: "none",
        }}
      >
        Advertisement
      </span>

      {/* Script injection target container with exact reserved dimensions */}
      <div
        ref={containerRef}
        style={{
          width: reservedWidth,
          maxWidth: "100%",
          minHeight: `${height || 90}px`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      />
    </div>
  );
}
