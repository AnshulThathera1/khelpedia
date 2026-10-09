"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { sendGTMEvent } from "@next/third-parties/google";

/**
 * GTMPageViewTracker
 * 
 * Handles Next.js App Router client-side (SPA) navigation tracking for Google Tag Manager.
 * 
 * How it works:
 * 1. Skips the initial page load (since GTM's container initialization script fires the first pageview).
 * 2. On subsequent client-side route transitions (when pathname or searchParams change),
 *    sends a structured 'page_view' event to window.dataLayer.
 * 3. Tags and triggers in GTM listening to custom event 'page_view' or History Change will fire accurately.
 */
export default function GTMPageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Avoid double-firing on initial page load (GTM container load handles initial view)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const searchString = searchParams?.toString();
    const url = pathname + (searchString ? `?${searchString}` : "");

    // Allow Next.js document title to update on client navigation
    const timeoutId = setTimeout(() => {
      sendGTMEvent({
        event: "page_view",
        page_path: url,
        page_location: typeof window !== "undefined" ? window.location.href : url,
        page_title: typeof document !== "undefined" ? document.title : "",
      });
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [pathname, searchParams]);

  return null;
}
