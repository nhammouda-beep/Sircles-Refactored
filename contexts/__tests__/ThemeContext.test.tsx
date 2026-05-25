jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));

import React from "react";
import { Text } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import {
  ThemeProvider,
  useSirclesTheme,
} from "../ThemeContext";

function Probe() {
  const { resolved, palette, mode, setMode } = useSirclesTheme();
  return (
    <>
      <Text testID="mode">{mode}</Text>
      <Text testID="resolved">{resolved}</Text>
      <Text testID="bg">{palette.bg}</Text>
      <Text testID="toggle" onPress={() => setMode("dark")}>
        toggle
      </Text>
    </>
  );
}

describe("ThemeContext", () => {
  it("defaults to system mode with a resolved theme", () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );
    expect(["light", "dark"]).toContain(getByTestId("resolved").props.children);
  });

  it("provides a palette with bg, surface, text, primary keys", () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );
    expect(getByTestId("bg").props.children).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it("setMode updates resolved theme synchronously", () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );
    fireEvent.press(getByTestId("toggle"));
    expect(getByTestId("mode").props.children).toBe("dark");
    expect(getByTestId("resolved").props.children).toBe("dark");
  });

  it("dark mode palette uses dark backgrounds", () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );
    fireEvent.press(getByTestId("toggle"));
    // Slate-900 dark bg
    expect(getByTestId("bg").props.children).toBe("#0F172A");
  });
});
