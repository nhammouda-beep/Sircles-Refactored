import { useSirclesTheme } from "@/contexts/ThemeContext";

export function useColorScheme(): "light" | "dark" {
  return useSirclesTheme().resolved;
}
