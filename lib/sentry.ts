import * as Sentry from "@sentry/react-native";

/**
 * Initialize Sentry error tracking.
 * No-op when EXPO_PUBLIC_SENTRY_DSN is not set, so dev builds without a DSN
 * just keep their existing console.error behavior.
 *
 * To enable in production:
 *   1. Create a Sentry project at sentry.io
 *   2. Add EXPO_PUBLIC_SENTRY_DSN=<your-dsn> to .env
 *   3. Rebuild the app
 */
export function initSentry() {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    if (__DEV__) {
      console.log("Sentry disabled — no EXPO_PUBLIC_SENTRY_DSN set");
    }
    return;
  }

  Sentry.init({
    dsn,
    enabled: !__DEV__, // never report from dev builds
    tracesSampleRate: 0.2, // 20% of transactions
    environment: __DEV__ ? "development" : "production",
    // Strip user PII by default; you can re-enable per event with setUser()
    sendDefaultPii: false,
  });
}

/**
 * Manually report an error to Sentry.
 * Falls through to console.error if Sentry is not initialized.
 */
export function reportError(error: unknown, context?: Record<string, any>) {
  console.error(error);
  if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, { extra: context });
  }
}

/**
 * Attach the current user to Sentry events for easier debugging.
 * Call when user logs in / out (pass null to clear).
 */
export function setSentryUser(user: { id: string; email?: string } | null) {
  if (!process.env.EXPO_PUBLIC_SENTRY_DSN) return;
  if (user) {
    Sentry.setUser({ id: user.id, email: user.email });
  } else {
    Sentry.setUser(null);
  }
}
