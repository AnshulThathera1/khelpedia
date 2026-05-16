"use client";

import { usePathname } from "next/navigation";
import AppNavbar from "./navbar";
import AdminNavbar from "./AdminNavbar";
import Footer from "./footer";

export default function LayoutWrapper({ user, children }) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <>
      {isAdminPage ? <AdminNavbar /> : <AppNavbar user={user} />}
      <main style={{ minHeight: "100vh", paddingTop: isAdminPage ? "140px" : "100px" }}>
        {children}
      </main>
      {!isAdminPage && <Footer />}
    </>
  );
}
