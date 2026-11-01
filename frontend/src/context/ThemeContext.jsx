import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({
  isDarkMode: true,
  toggleDarkMode: () => {},
  setDarkMode: () => {}
});

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("sms_theme");
      if (saved) return saved === "dark";
      return true; // Default to dark mode
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      const root = document.documentElement;
      if (isDarkMode) {
        root.classList.add("dark");
        root.style.colorScheme = "dark";
        localStorage.setItem("sms_theme", "dark");
      } else {
        root.classList.remove("dark");
        root.style.colorScheme = "light";
        localStorage.setItem("sms_theme", "light");
      }
    } catch (e) {
      console.warn("Could not save theme to localStorage", e);
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
  const setDarkMode = (val) => setIsDarkMode(!!val);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
