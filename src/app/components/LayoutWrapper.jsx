"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import AppNavbar from "./navbar";
import AdminNavbar from "./AdminNavbar";
import Footer from "./footer";
import ThemeProvider from "./ThemeProvider";

const FeedbackWidget = dynamic(() => import("./FeedbackWidget"), { ssr: false });
const AIChatBot = dynamic(() => import("./AIChatBot"), { ssr: false });
const CookieConsent = dynamic(() => import("./CookieConsent"), { ssr: false });

export default function LayoutWrapper({ user, children }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");
  const lastPathRef = useRef(null);

  useEffect(() => {
    // Don't notify for admin dashboard pages
    if (pathname.startsWith("/admin")) return;

    // Only notify if path changed (avoids duplicate alerts on re-render)
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;

    // Filter out bots, crawlers, and headless browsers
    const ua = navigator.userAgent.toLowerCase();
    const isBot = /bot|crawler|spider|crawling|headless|lighthouse|discord|preview|google|bing|yandex|yahoo|slurp/i.test(ua);

    if (!isBot) {
      fetch('/api/notify-discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pathname })
      }).catch(err => console.error("Failed to notify discord", err));
    }
  }, [pathname]);

  return (
    <ThemeProvider>
      {isAdminPage ? <AdminNavbar /> : <AppNavbar user={user} />}
      <main style={{ minHeight: "100vh", paddingTop: isAdminPage ? "140px" : "100px" }}>
        {children}
      </main>
      {!isAdminPage && <Footer />}
      {!isAdminPage && <FeedbackWidget user={user} />}
      {!isAdminPage && <AIChatBot />}
      {!isAdminPage && <CookieConsent />}
    </ThemeProvider>
  );
}
