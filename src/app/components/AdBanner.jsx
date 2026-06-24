"use client";

import { useEffect, useRef } from "react";

export default function AdBanner({ dataAdSlot = "9430211570", dataAdFormat = "auto", dataFullWidthResponsive = true }) {
  const adRef = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    // Guard: only push once per component lifecycle
    if (pushed.current) return;

    const el = adRef.current;
    if (!el) return;

    // Guard: skip if AdSense already filled this slot
    if (el.dataset.adsbygoogleStatus) return;

    // Guard: skip if this ins element already has child content (ad loaded)
    if (el.firstChild) return;

    const timer = setTimeout(() => {
      try {
        // Final check before pushing
        if (!pushed.current && !el.dataset.adsbygoogleStatus) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          pushed.current = true;
        }
      } catch (err) {
        // Silently ignore the "already have ads" error
        if (!err.message?.includes("already have ads")) {
          console.error("AdSense Error:", err);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full my-6 flex justify-center overflow-hidden">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", minWidth: "250px" }}
        data-ad-client="ca-pub-3395571758829715"
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive.toString()}
      />
    </div>
  );
}
