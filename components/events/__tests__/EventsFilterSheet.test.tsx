import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { EventsFilterSheet } from "../EventsFilterSheet";

const baseProps = {
  visible: true,
  bg: "#fff",
  text: "#0F172A",
  primary: "#198F4B",
  circles: [
    { id: "c1", name: "Hiking" },
    { id: "c2", name: "Cooking" },
  ],
  selectedCircleId: "any" as const,
  onCircleChange: () => {},
  allInterests: [
    { id: "i1", title: "Outdoor" },
    { id: "i2", title: "Food" },
  ],
  selectedInterests: new Set<string>(),
  onToggleInterest: () => {},
  withPhoto: false,
  onTogglePhoto: () => {},
  rsvpFilter: "any" as const,
  onRsvpFilterChange: () => {},
  onClear: () => {},
  onClose: () => {},
};

describe("EventsFilterSheet", () => {
  it("renders Filters header", () => {
    const { getByText } = render(<EventsFilterSheet {...baseProps} />);
    expect(getByText("Filters")).toBeTruthy();
  });

  it("renders all circle filter chips including Any", () => {
    const { getAllByText, getByText } = render(
      <EventsFilterSheet {...baseProps} />
    );
    // "Any" appears twice (Circle row + RSVP row)
    expect(getAllByText("Any").length).toBeGreaterThanOrEqual(1);
    expect(getByText("Hiking")).toBeTruthy();
    expect(getByText("Cooking")).toBeTruthy();
  });

  it("renders all interest chips", () => {
    const { getByText } = render(<EventsFilterSheet {...baseProps} />);
    expect(getByText("Outdoor")).toBeTruthy();
    expect(getByText("Food")).toBeTruthy();
  });

  it("renders 'With photo' toggle", () => {
    const { getByText } = render(<EventsFilterSheet {...baseProps} />);
    expect(getByText("With photo")).toBeTruthy();
  });

  it("renders all RSVP filter options", () => {
    const { getByText } = render(<EventsFilterSheet {...baseProps} />);
    expect(getByText("Going")).toBeTruthy();
    expect(getByText("Maybe")).toBeTruthy();
    expect(getByText("Can't go")).toBeTruthy();
    expect(getByText("No response")).toBeTruthy();
  });

  it("calls onClear when Clear is pressed", () => {
    const onClear = jest.fn();
    const { getByText } = render(
      <EventsFilterSheet {...baseProps} onClear={onClear} />
    );
    fireEvent.press(getByText("Clear"));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Apply is pressed", () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <EventsFilterSheet {...baseProps} onClose={onClose} />
    );
    fireEvent.press(getByText("Apply"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onCircleChange when a circle chip is pressed", () => {
    const onCircleChange = jest.fn();
    const { getByText } = render(
      <EventsFilterSheet {...baseProps} onCircleChange={onCircleChange} />
    );
    fireEvent.press(getByText("Hiking"));
    expect(onCircleChange).toHaveBeenCalledWith("c1");
  });

  it("calls onToggleInterest when an interest chip is pressed", () => {
    const onToggleInterest = jest.fn();
    const { getByText } = render(
      <EventsFilterSheet {...baseProps} onToggleInterest={onToggleInterest} />
    );
    fireEvent.press(getByText("Outdoor"));
    expect(onToggleInterest).toHaveBeenCalledWith("i1");
  });
});
