/**
 * Tests for the DSN-gated Sentry wrapper.
 * Mock @sentry/react-native so we never make real network calls.
 */
jest.mock("@sentry/react-native", () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  setUser: jest.fn(),
}));

import * as Sentry from "@sentry/react-native";
import { initSentry, reportError, setSentryUser } from "../sentry";

const initMock = Sentry.init as jest.Mock;
const captureMock = Sentry.captureException as jest.Mock;
const setUserMock = Sentry.setUser as jest.Mock;

describe("sentry wrapper", () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;
  const originalDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  beforeEach(() => {
    initMock.mockClear();
    captureMock.mockClear();
    setUserMock.mockClear();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
    if (originalDsn === undefined) {
      delete process.env.EXPO_PUBLIC_SENTRY_DSN;
    } else {
      process.env.EXPO_PUBLIC_SENTRY_DSN = originalDsn;
    }
  });

  describe("initSentry", () => {
    it("does NOT call Sentry.init when DSN is not set", () => {
      delete process.env.EXPO_PUBLIC_SENTRY_DSN;
      initSentry();
      expect(initMock).not.toHaveBeenCalled();
    });

    it("calls Sentry.init with the DSN when set", () => {
      process.env.EXPO_PUBLIC_SENTRY_DSN = "https://abc@sentry.io/123";
      initSentry();
      expect(initMock).toHaveBeenCalledTimes(1);
      const args = initMock.mock.calls[0][0];
      expect(args.dsn).toBe("https://abc@sentry.io/123");
      expect(args.sendDefaultPii).toBe(false);
    });
  });

  describe("reportError", () => {
    it("always logs to console", () => {
      delete process.env.EXPO_PUBLIC_SENTRY_DSN;
      reportError(new Error("boom"));
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("does NOT call captureException when DSN is missing", () => {
      delete process.env.EXPO_PUBLIC_SENTRY_DSN;
      reportError(new Error("boom"));
      expect(captureMock).not.toHaveBeenCalled();
    });

    it("calls Sentry.captureException with extra context when DSN is set", () => {
      process.env.EXPO_PUBLIC_SENTRY_DSN = "https://abc@sentry.io/123";
      const err = new Error("boom");
      reportError(err, { screen: "Home" });
      expect(captureMock).toHaveBeenCalledWith(err, {
        extra: { screen: "Home" },
      });
    });
  });

  describe("setSentryUser", () => {
    it("does nothing when DSN is missing", () => {
      delete process.env.EXPO_PUBLIC_SENTRY_DSN;
      setSentryUser({ id: "u1", email: "u@example.com" });
      expect(setUserMock).not.toHaveBeenCalled();
    });

    it("calls Sentry.setUser with id + email when given a user", () => {
      process.env.EXPO_PUBLIC_SENTRY_DSN = "https://abc@sentry.io/123";
      setSentryUser({ id: "u1", email: "u@example.com" });
      expect(setUserMock).toHaveBeenCalledWith({
        id: "u1",
        email: "u@example.com",
      });
    });

    it("calls Sentry.setUser(null) when user is null (logout)", () => {
      process.env.EXPO_PUBLIC_SENTRY_DSN = "https://abc@sentry.io/123";
      setSentryUser(null);
      expect(setUserMock).toHaveBeenCalledWith(null);
    });
  });
});
