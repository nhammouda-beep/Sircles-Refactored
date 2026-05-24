// Mock the Sentry SDK before importing anything that uses it (transitively
// imported by ErrorBoundary via @/lib/sentry).
jest.mock("@sentry/react-native", () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  setUser: jest.fn(),
}));

import React from "react";
import { Text } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import { ErrorBoundary } from "../ErrorBoundary";

// Silence the inevitable error noise in test output
let consoleErrorSpy: jest.SpyInstance;
beforeEach(() => {
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  consoleErrorSpy.mockRestore();
});

function Boom({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("Kaboom");
  return <Text>safe content</Text>;
}

describe("ErrorBoundary", () => {
  it("renders children when no error", () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Boom shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(getByText("safe content")).toBeTruthy();
  });

  it("shows default fallback UI when a child throws", () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Boom shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(getByText("Something went wrong")).toBeTruthy();
    expect(getByText("Kaboom")).toBeTruthy();
    expect(getByText("Try Again")).toBeTruthy();
  });

  it("uses the provided fallback when given", () => {
    const { getByText, queryByText } = render(
      <ErrorBoundary fallback={<Text>my custom fallback</Text>}>
        <Boom shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(getByText("my custom fallback")).toBeTruthy();
    expect(queryByText("Something went wrong")).toBeNull();
  });

  it("Try Again button is rendered and pressable", () => {
    const { getByText } = render(
      <ErrorBoundary>
        <Boom shouldThrow={true} />
      </ErrorBoundary>
    );
    // The button exists and pressing it doesn't crash. Full reset behavior
    // is hard to assert here because the same child instance will re-throw
    // on the next render — exercised manually with key/remount in real use.
    expect(() => fireEvent.press(getByText("Try Again"))).not.toThrow();
  });

  it("shows generic message when error has no message", () => {
    function ThrowEmpty() {
      // eslint-disable-next-line no-throw-literal
      throw new Error("");
    }
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowEmpty />
      </ErrorBoundary>
    );
    expect(getByText("An unexpected error occurred")).toBeTruthy();
  });
});
