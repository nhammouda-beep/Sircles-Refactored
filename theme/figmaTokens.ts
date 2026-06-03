/**
 * Design tokens extracted from the Alumni Portal Figma file
 * (figma.com/proto/XQdFzAoC94yPQM87tlfeGA/Alum-App).
 *
 * Applied to Sircles as a visual refresh — branding stays "Sircles",
 * data model stays the same. Only the visual layer (colors, typography,
 * spacing, radii, shadows) is sourced from the Figma.
 */

export const figmaColors = {
  light: {
    // Surfaces
    bg: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceMuted: "#F1F5F9",

    // Text
    text: "#0F172A",
    textMuted: "#64748B",
    textSubtle: "#94A3B8",
    textInverse: "#FFFFFF",

    // Brand
    primary: "#1E40AF",
    primaryStrong: "#1D3FAE",
    primarySoft: "#DBEAFE",
    primaryOn: "#FFFFFF",

    // Accents
    accent: "#3B82F6",
    accentSoft: "#EFF6FF",

    // Status
    success: "#16A34A",
    successSoft: "#DCFCE7",
    warning: "#F59E0B",
    warningSoft: "#FEF3C7",
    danger: "#DC2626",
    dangerSoft: "#FEE2E2",

    // Lines
    border: "#E2E8F0",
    borderStrong: "#CBD5E1",
    divider: "#F1F5F9",

    // Overlays
    overlayDark: "rgba(15, 23, 42, 0.45)",
    overlayLight: "rgba(255, 255, 255, 0.85)",

    // Tab bar
    tabBar: "#FFFFFF",
    tabBarActive: "#1E40AF",
    tabBarInactive: "#94A3B8",
  },
  dark: {
    bg: "#0B1220",
    surface: "#111827",
    surfaceMuted: "#1F2937",

    text: "#F8FAFC",
    textMuted: "#94A3B8",
    textSubtle: "#64748B",
    textInverse: "#0F172A",

    primary: "#60A5FA",
    primaryStrong: "#3B82F6",
    primarySoft: "#1E3A8A",
    primaryOn: "#0F172A",

    accent: "#93C5FD",
    accentSoft: "#1E40AF",

    success: "#22C55E",
    successSoft: "#14532D",
    warning: "#FBBF24",
    warningSoft: "#78350F",
    danger: "#F87171",
    dangerSoft: "#7F1D1D",

    border: "#1F2937",
    borderStrong: "#334155",
    divider: "#111827",

    overlayDark: "rgba(0, 0, 0, 0.65)",
    overlayLight: "rgba(15, 23, 42, 0.85)",

    tabBar: "#0B1220",
    tabBarActive: "#60A5FA",
    tabBarInactive: "#64748B",
  },
};

export const figmaSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
};

export const figmaRadii = {
  none: 0,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  pill: 999,
};

export const figmaType = {
  // Inter / system sans-serif weights and sizes used in the Figma
  display: { fontSize: 32, lineHeight: 38, fontWeight: "700" as const },
  h1: { fontSize: 24, lineHeight: 30, fontWeight: "700" as const },
  h2: { fontSize: 20, lineHeight: 26, fontWeight: "700" as const },
  h3: { fontSize: 17, lineHeight: 22, fontWeight: "600" as const },
  body: { fontSize: 15, lineHeight: 22, fontWeight: "400" as const },
  bodyBold: { fontSize: 15, lineHeight: 22, fontWeight: "600" as const },
  small: { fontSize: 13, lineHeight: 18, fontWeight: "400" as const },
  smallBold: { fontSize: 13, lineHeight: 18, fontWeight: "600" as const },
  caption: { fontSize: 11, lineHeight: 16, fontWeight: "500" as const },
  button: { fontSize: 15, lineHeight: 20, fontWeight: "600" as const },
};

export const figmaShadow = {
  none: {},
  sm: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};

export type FigmaPalette = typeof figmaColors.light;
