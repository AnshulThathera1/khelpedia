"use client";

import { useEffect } from "react";

export default function AdBanner({ dataAdSlot, dataAdFormat = "auto", dataFullWidthResponsive = true }) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense Error:", err);
    }
  }, []);

  return (
    <div className="w-full my-6 flex justify-center overflow-hidden">
      <ins
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
