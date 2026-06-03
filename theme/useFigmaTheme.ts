import { useSirclesTheme } from "@/contexts/ThemeContext";
import { figmaColors, figmaSpacing, figmaRadii, figmaType, figmaShadow } from "./figmaTokens";

export function useFigmaTheme() {
  const { resolved, mode, setMode } = useSirclesTheme();
  const palette = resolved === "dark" ? figmaColors.dark : figmaColors.light;
  return {
    palette,
    spacing: figmaSpacing,
    radii: figmaRadii,
    type: figmaType,
    shadow: figmaShadow,
    mode,
    setMode,
    resolved,
  };
}
