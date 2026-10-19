"use client";

import { createContext, useContext, useEffect } from "react";
import { NextUIProvider } from "@nextui-org/react";

const ThemeContext = createContext({
  theme: "dark",
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }) {
  useEffect(() => {
    document.documentElement.className = "dark";
    try {
      localStorage.setItem("khelpedia-theme", "dark");
    } catch {}
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "dark", toggleTheme: () => {} }}>
      <NextUIProvider>
        {children}
      </NextUIProvider>
    </ThemeContext.Provider>
  );
}

