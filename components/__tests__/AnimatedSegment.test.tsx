import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { AnimatedSegment } from "../AnimatedSegment";

const options = [
  { key: "all", label: "All" },
  { key: "my", label: "My" },
];

describe("AnimatedSegment", () => {
  it("renders all option labels", () => {
    const { getByText } = render(
      <AnimatedSegment options={options} value="all" onChange={() => {}} />
    );
    expect(getByText("All")).toBeTruthy();
    expect(getByText("My")).toBeTruthy();
  });

  it("calls onChange with the tapped option key", () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <AnimatedSegment options={options} value="all" onChange={onChange} />
    );
    fireEvent.press(getByText("My"));
    expect(onChange).toHaveBeenCalledWith("my");
  });

  it("does not crash when value does not match any option", () => {
    const { getByText } = render(
      <AnimatedSegment options={options} value="nonexistent" onChange={() => {}} />
    );
    expect(getByText("All")).toBeTruthy();
  });

  it("supports 3+ options", () => {
    const threeOpts = [
      { key: "a", label: "Apple" },
      { key: "b", label: "Banana" },
      { key: "c", label: "Cherry" },
    ];
    const { getByText } = render(
      <AnimatedSegment options={threeOpts} value="b" onChange={() => {}} />
    );
    expect(getByText("Apple")).toBeTruthy();
    expect(getByText("Banana")).toBeTruthy();
    expect(getByText("Cherry")).toBeTruthy();
  });
});
