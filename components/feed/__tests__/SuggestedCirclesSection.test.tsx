import React from "react";
import { render } from "@testing-library/react-native";
import { SuggestedCirclesSection } from "../SuggestedCirclesSection";

const baseProps = {
  suggestedCircles: [
    { id: "c1", name: "Foodies", description: "All about food" },
    { id: "c2", name: "Runners", description: "Running enthusiasts" },
  ],
  onJoin: () => {},
  onDismiss: () => {},
  onSnooze: () => {},
};

describe("SuggestedCirclesSection", () => {
  it("renders the section heading", () => {
    const { getByText } = render(<SuggestedCirclesSection {...baseProps} />);
    expect(getByText("Circles of Your Interest")).toBeTruthy();
  });

  it("renders See All footer", () => {
    const { getByText } = render(<SuggestedCirclesSection {...baseProps} />);
    expect(getByText("See All")).toBeTruthy();
  });

  it("renders an empty section when no circles are suggested", () => {
    const { getByText } = render(
      <SuggestedCirclesSection {...baseProps} suggestedCircles={[]} />
    );
    // Section header is always shown; just verify it renders without crashing
    expect(getByText("Circles of Your Interest")).toBeTruthy();
  });
});
