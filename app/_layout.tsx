import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import "react-native-reanimated";

import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider as SirclesThemeProvider, useSirclesTheme } from "@/contexts/ThemeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { initSentry } from "@/lib/sentry";

import { PaperProvider, MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { en, registerTranslation } from "react-native-paper-dates";

registerTranslation("en", en);
initSentry();

const MyCustomLightTheme = {
  ...MD3LightTheme,
  colors: { ...MD3LightTheme.colors, primary: "#198F4B" },
};

const MyCustomDarkTheme = {
  ...MD3DarkTheme,
  colors: { ...MD3DarkTheme.colors, primary: "#22C55E" },
};

function ThemedNavigation({ children }: { children: React.ReactNode }) {
  const { resolved } = useSirclesTheme();
  const navTheme =
    resolved === "dark" ? NavigationDarkTheme : NavigationDefaultTheme;
  const paperTheme =
    resolved === "dark" ? MyCustomDarkTheme : MyCustomLightTheme;
  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={navTheme}>{children}</ThemeProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
    <SirclesThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <ThemedNavigation>
            <Stack>
              {/* ...Your screens... */}
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen
                name="setup-password"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="admin" options={{ headerShown: false }} />
              <Stack.Screen
                name="circle/[id]"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="settings" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
              <Stack.Screen
                name="onboarding"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="splash" options={{ headerShown: false }} />
              <Stack.Screen name="interests" options={{ headerShown: false }} />
              <Stack.Screen name="post/[id]" options={{ headerShown: false }} />
            </Stack>
          </ThemedNavigation>
        </LanguageProvider>
      </AuthProvider>
    </SirclesThemeProvider>
    </ErrorBoundary>
  );
}
