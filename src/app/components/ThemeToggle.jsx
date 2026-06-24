"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle({ size = 40 }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: "none",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        padding: 0,
      }}
    >
      {/* Glow Background */}
      <motion.div
        animate={{
          background: isDark
            ? "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%)",
          boxShadow: isDark
            ? "0 0 20px rgba(99,102,241,0.15), inset 0 0 15px rgba(99,102,241,0.05)"
            : "0 0 20px rgba(251,191,36,0.2), inset 0 0 15px rgba(251,191,36,0.08)",
        }}
        transition={{ duration: 0.5 }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: isDark
            ? "1px solid rgba(99,102,241,0.2)"
            : "1px solid rgba(251,191,36,0.3)",
        }}
      />

      {/* SVG Canvas */}
      <motion.svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{ position: "relative", zIndex: 1 }}
      >
        {/* Sun Rays — fade out in dark mode */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 12 + Math.cos(rad) * 8;
          const y1 = 12 + Math.sin(rad) * 8;
          const x2 = 12 + Math.cos(rad) * 10;
          const y2 = 12 + Math.sin(rad) * 10;
          return (
            <motion.line
              key={`ray-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isDark ? "#818cf8" : "#fbbf24"}
              strokeWidth={2}
              strokeLinecap="round"
              animate={{
                opacity: isDark ? 0 : 1,
                scale: isDark ? 0 : 1,
              }}
              transition={{ duration: 0.3, delay: isDark ? 0 : i * 0.03 }}
            />
          );
        })}

        {/* Main Circle (Sun/Moon body) */}
        <motion.circle
          cx={12}
          cy={12}
          r={5}
          animate={{
            fill: isDark ? "#818cf8" : "#fbbf24",
            r: isDark ? 5 : 5,
          }}
          transition={{ duration: 0.4 }}
        />

        {/* Moon Crescent Mask — appears in dark mode */}
        <motion.circle
          cx={isDark ? 15 : 20}
          cy={isDark ? 9 : 5}
          r={isDark ? 4 : 0}
          animate={{
            cx: isDark ? 15 : 20,
            cy: isDark ? 9 : 5,
            r: isDark ? 4 : 0,
          }}
          fill="var(--bg-primary)"
          transition={{ duration: 0.4 }}
        />

        {/* Stars — appear in dark mode */}
        {[
          { cx: 4, cy: 5, delay: 0.1 },
          { cx: 20, cy: 18, delay: 0.2 },
          { cx: 6, cy: 19, delay: 0.15 },
        ].map((star, i) => (
          <motion.circle
            key={`star-${i}`}
            cx={star.cx}
            cy={star.cy}
            r={1}
            fill="#818cf8"
            animate={{
              opacity: isDark ? [0, 1, 0.6, 1] : 0,
              scale: isDark ? 1 : 0,
            }}
            transition={{
              opacity: {
                duration: 2,
                repeat: Infinity,
                delay: star.delay,
              },
              scale: { duration: 0.3, delay: star.delay },
            }}
          />
        ))}
      </motion.svg>
    </motion.button>
  );
}
