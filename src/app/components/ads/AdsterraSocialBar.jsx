"use client";

import { useEffect } from "react";

export default function AdsterraSocialBar({ 
  scriptSrc = process.env.NEXT_PUBLIC_ADSTERRA_SOCIALBAR_SRC || "https://pl31576900.profitableratecpmnetwork.com/fb/a6/fd/fba6fd5b304561dbcb1a5a3013ef09ea.js" 
}) {
  useEffect(() => {
    if (!scriptSrc) return;
    if (document.querySelector(`script[src="${scriptSrc}"]`)) return;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = scriptSrc;
    script.async = true;

    document.body.appendChild(script);
  }, [scriptSrc]);

  return null;
}
