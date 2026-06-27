"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import AppNavbar from "./navbar";
import AdminNavbar from "./AdminNavbar";
import Footer from "./footer";
import ThemeProvider from "./ThemeProvider";

export default function LayoutWrapper({ user, children }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");
  const notifiedRef = useRef(false);

  useEffect(() => {
    // Only notify once per session/mount to avoid spam
    if (!notifiedRef.current) {
      notifiedRef.current = true;
      
      // Filter out bots, crawlers, and headless browsers
      const ua = navigator.userAgent.toLowerCase();
      const isBot = /bot|crawler|spider|crawling|headless|lighthouse|discord|preview|google|bing|yandex|yahoo|slurp/i.test(ua);
      
      if (!isBot) {
        fetch('/api/notify-discord', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: window.location.pathname })
        }).catch(err => console.error("Failed to notify discord", err));
      }
    }
  }, []);

  return (
    <ThemeProvider>
      {isAdminPage ? <AdminNavbar /> : <AppNavbar user={user} />}
      <main style={{ minHeight: "100vh", paddingTop: isAdminPage ? "140px" : "100px" }}>
        {children}
      </main>
      {!isAdminPage && <Footer />}
    </ThemeProvider>
  );
}
