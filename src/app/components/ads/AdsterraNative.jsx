"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const EXCLUDED_PREFIXES = [
  "/admin",
  "/khelpedia-admin",
  "/auth",
  "/login",
  "/register",
  "/dashboard",
];

const DEFAULT_NATIVE_SRC =
  process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_SRC ||
  "https://pl31576901.profitableratecpmnetwork.com/f6a1d6b7a29abf9d3dc957e3de20a8da/invoke.js";

const DEFAULT_CONTAINER_ID =
  process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_CONTAINER ||
  "container-f6a1d6b7a29abf9d3dc957e3de20a8da";

/**
 * AdsterraNative
 * Renders Adsterra Native Recommendation widget with CLS protection.
 * Provider container ID: container-f6a1d6b7a29abf9d3dc957e3de20a8da
 */
export default function AdsterraNative({
  scriptSrc = DEFAULT_NATIVE_SRC,
  containerId = DEFAULT_CONTAINER_ID,
  placement = "native_recommendation",
  className = "",
  style = {},
}) {
  const pathname = usePathname();
  const wrapperRef = useRef(null);

  const isAdsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED !== "false";

  // Safeguard: Never render on admin or auth paths
  const isExcludedPath = EXCLUDED_PREFIXES.some((prefix) =>
    pathname?.toLowerCase().startsWith(prefix)
  );

  useEffect(() => {
    if (!isAdsEnabled || isExcludedPath || !scriptSrc || !wrapperRef.current) {
      return;
    }

    const wrapper = wrapperRef.current;

    // Prevent duplicate script insertion
    if (wrapper.querySelector("script") || document.getElementById(containerId)) {
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    script.src = scriptSrc;

    const targetDiv = document.createElement("div");
    targetDiv.id = containerId;

    wrapper.appendChild(script);
    wrapper.appendChild(targetDiv);

    return () => {
      // Clean up target div on unmount
      if (targetDiv.parentNode) {
        targetDiv.parentNode.removeChild(targetDiv);
      }
    };
  }, [isAdsEnabled, isExcludedPath, scriptSrc, containerId]);

  if (!isAdsEnabled || isExcludedPath) {
    return null;
  }

  return (
    <div
      data-ad-placement={placement}
      className={`adsterra-native-wrapper ${className}`}
      style={{
        margin: "3rem 0",
        width: "100%",
        minHeight: "160px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        clear: "both",
        ...style,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "840px",
          borderTop: "1px solid var(--border-color, rgba(255, 255, 255, 0.08))",
          paddingTop: "1rem",
          marginBottom: "0.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "0.68rem",
            fontWeight: 700,
            color: "var(--text-muted, #71717a)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            userSelect: "none",
          }}
        >
          Sponsored Recommendations
        </span>
      </div>

      <div
        ref={wrapperRef}
        style={{
          width: "100%",
          maxWidth: "840px",
          minHeight: "140px",
        }}
      />
    </div>
  );
}
