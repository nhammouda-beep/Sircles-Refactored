import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface SirclesPalette {
  primary: string;       // brand green — same in both modes
  bg: string;            // screen background
  surface: string;       // card/elevated surface
  text: string;          // primary text
  subtle: string;        // secondary text
  border: string;        // borders, dividers
  tabBar: string;        // bottom tab bar background
  danger: string;
  warning: string;
  success: string;
}

const LIGHT: SirclesPalette = {
  primary: "#198F4B",
  bg: "#FFFFFF",
  surface: "#FFFFFF",
  text: "#0F172A",
  subtle: "#6B7280",
  border: "#E5E7EB",
  tabBar: "#FFFFFF",
  danger: "#EF4444",
  warning: "#F59E0B",
  success: "#10B981",
};

const DARK: SirclesPalette = {
  primary: "#22C55E",      // slightly brighter green for contrast on dark
  bg: "#0F172A",           // slate-900
  surface: "#1E293B",      // slate-800
  text: "#F1F5F9",         // slate-100
  subtle: "#94A3B8",       // slate-400
  border: "#334155",       // slate-700
  tabBar: "#0F172A",
  danger: "#F87171",
  warning: "#FBBF24",
  success: "#34D399",
};

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  resolved: ResolvedTheme;
  palette: SirclesPalette;
}

const STORAGE_KEY = "@sircles/theme-mode";

const ThemeContext = createContext<ThemeContextValue>({
  mode: "system",
  setMode: () => {},
  resolved: "light",
  palette: LIGHT,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");

  // Load persisted preference on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === "light" || saved === "dark" || saved === "system") {
          setModeState(saved);
        }
      } catch {}
    })();
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m).catch(() => {});
  };

  const resolved: ResolvedTheme =
    mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;

  const palette = resolved === "dark" ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ mode, setMode, resolved, palette }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useSirclesTheme() {
  return useContext(ThemeContext);
}
