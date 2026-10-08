"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const EXCLUDED_PREFIXES = [
  "/admin",
  "/khelpedia-admin",
  "/auth",
  "/login",
  "/register",
  "/dashboard",
];

const DEFAULT_SOCIALBAR_SRC =
  process.env.NEXT_PUBLIC_ADSTERRA_SOCIALBAR_SRC ||
  "https://pl31576900.profitableratecpmnetwork.com/fb/a6/fd/fba6fd5b304561dbcb1a5a3013ef09ea.js";

/**
 * AdsterraSocialBar
 * Injects Adsterra Smart Social Bar script safely on non-admin/non-auth pages.
 */
export default function AdsterraSocialBar({
  scriptSrc = DEFAULT_SOCIALBAR_SRC,
}) {
  const pathname = usePathname();
  const isAdsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED !== "false";
  // Explicit kill-switch: Social Bar overlay is disabled by default to preserve UX & prevent navigation blocking
  const isSocialBarEnabled = process.env.NEXT_PUBLIC_ADSTERRA_SOCIALBAR_ENABLED === "true";

  // Safeguard: Never render or inject Social Bar on admin, auth, or internal dashboard paths
  const isExcludedPath = EXCLUDED_PREFIXES.some((prefix) =>
    pathname?.toLowerCase().startsWith(prefix)
  );

  useEffect(() => {
    if (!isAdsEnabled || !isSocialBarEnabled || isExcludedPath || !scriptSrc) {
      return;
    }

    // Prevent duplicate script injection
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);
    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = scriptSrc;
    script.async = true;

    document.head.appendChild(script);
  }, [isAdsEnabled, isExcludedPath, scriptSrc]);

  return null;
}
