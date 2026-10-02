"use client";

import AdsterraSidebar from "./AdsterraSidebar";

/**
 * DesktopSidebarLayout
 * Wraps content in a 3-column desktop layout:
 * [ LEFT 300x250 SIDEBAR ] [ MAIN CONTENT ] [ RIGHT 300x250 SIDEBAR ]
 *
 * Responsive Guardrails:
 * - Hidden on Mobile (< 768px) and Tablet (768px - 1024px).
 * - Hidden on Standard Laptops (< 1536px / 1680px) to prevent squeezing the main content.
 * - Activates only when viewport has sufficient physical width:
 *   - variant="compact" (Articles, Matches, Players): activates at min-width: 1536px
 *   - variant="standard" (Homepage, Tournaments, Teams, Games): activates at min-width: 1680px
 * - Content-first priority: Main content is never compressed.
 */
export default function DesktopSidebarLayout({
  children,
  leftAd = true,
  rightAd = true,
  variant = "standard", // "standard" (>= 1680px) | "compact" (>= 1536px)
  sticky = true,
  pageType = "general",
  className = "",
  style = {},
}) {
  return (
    <div
      className={`desktop-sidebar-layout variant-${variant} ${className}`}
      data-page-type={pageType}
      style={style}
    >
      {/* Left Desktop Sidebar Slot */}
      {leftAd && (
        <aside
          aria-label="Left sidebar advertisement"
          className="desktop-sidebar-col desktop-sidebar-col-left"
        >
          <div className={sticky ? "desktop-sidebar-sticky" : ""}>
            <AdsterraSidebar
              placement={`${pageType}_sidebar_left`}
              position="left"
            />
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="desktop-sidebar-main">
        {children}
      </div>

      {/* Right Desktop Sidebar Slot */}
      {rightAd && (
        <aside
          aria-label="Right sidebar advertisement"
          className="desktop-sidebar-col desktop-sidebar-col-right"
        >
          <div className={sticky ? "desktop-sidebar-sticky" : ""}>
            <AdsterraSidebar
              placement={`${pageType}_sidebar_right`}
              position="right"
            />
          </div>
        </aside>
      )}
    </div>
  );
}
