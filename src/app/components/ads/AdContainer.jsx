"use client";

import AdsterraBanner from "./AdsterraBanner";
import AdsterraNative from "./AdsterraNative";
import AdsterraSocialBar from "./AdsterraSocialBar";
import AdsterraSidebar from "./AdsterraSidebar";
import AdsterraMobileBanner from "./AdsterraMobileBanner";
import DesktopSidebarLayout from "./DesktopSidebarLayout";

export {
  AdsterraBanner,
  AdsterraNative,
  AdsterraSocialBar,
  AdsterraSidebar,
  AdsterraMobileBanner,
  DesktopSidebarLayout,
};

/**
 * AdContainer
 * Unified ad container providing clean abstraction across all Adsterra formats.
 * Supports:
 * - type="banner" (responsive 728x90 on desktop / 320x50 on mobile)
 * - type="banner_728x90" or size="728x90"
 * - type="banner_300x250" or size="300x250"
 * - type="banner_320x50" or size="320x50"
 * - type="sidebar" or type="sidebar_300x250"
 * - type="native"
 * - type="socialbar"
 */
export default function AdContainer({
  type = "banner",
  size = null,
  placement = "content",
  position = "left",
  className = "",
  style = {},
}) {
  const isAdsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED !== "false";

  if (!isAdsEnabled) {
    return null;
  }

  // Handle explicit sidebar requests
  if (type === "sidebar" || type === "sidebar_300x250") {
    return (
      <AdsterraSidebar
        placement={placement}
        position={position}
        className={className}
        style={style}
      />
    );
  }

  // Handle explicit size request
  if (size === "320x50") {
    return (
      <AdsterraMobileBanner
        placement={placement}
        className={className}
        style={style}
      />
    );
  }

  if (size) {
    return (
      <AdsterraBanner
        size={size}
        placement={placement}
        className={className}
        style={style}
      />
    );
  }

  // Handle type-based requests
  if (type === "banner") {
    return (
      <AdsterraBanner
        size="responsive"
        placement={placement}
        className={className}
        style={style}
      />
    );
  }

  if (type === "banner_728x90") {
    return (
      <AdsterraBanner
        size="728x90"
        placement={placement}
        className={className}
        style={style}
      />
    );
  }

  if (type === "banner_300x250") {
    return (
      <AdsterraBanner
        size="300x250"
        placement={placement}
        className={className}
        style={style}
      />
    );
  }

  if (type === "banner_320x50" || type === "mobile_banner") {
    return (
      <AdsterraMobileBanner
        placement={placement}
        className={className}
        style={style}
      />
    );
  }

  if (type === "native") {
    return (
      <AdsterraNative
        placement={placement}
        className={className}
        style={style}
      />
    );
  }

  if (type === "socialbar") {
    if (process.env.NEXT_PUBLIC_ADSTERRA_SOCIALBAR_ENABLED !== "true") {
      return null;
    }
    return <AdsterraSocialBar />;
  }

  return null;
}
