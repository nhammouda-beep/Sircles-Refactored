import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { CircleEventCard } from "../CircleEventCard";

const baseEvent = {
  id: "e-1",
  title: "Book Club Meet",
  description: "We'll discuss chapter 5",
  date: "2026-09-10",
  time: "18:00",
  location: "Library Annex",
  creator: { name: "Frank" },
  going_count: 8,
  maybe_count: 2,
  no_going_count: 1,
  event_interests: [
    { interests: { id: "i1", title: "Reading" } },
  ],
};

const baseProps = {
  event: baseEvent,
  surfaceColor: "#fff",
  backgroundColor: "#fafafa",
  successColor: "#10b981",
  canEdit: false,
  canDelete: false,
  onEdit: () => {},
  onDelete: () => {},
  onRsvp: () => {},
};

describe("CircleEventCard", () => {
  it("renders title and creator name", () => {
    const { getByText } = render(<CircleEventCard {...baseProps} />);
    expect(getByText("Book Club Meet")).toBeTruthy();
    expect(getByText("Created by Frank")).toBeTruthy();
  });

  it("renders description and location", () => {
    const { getByText } = render(<CircleEventCard {...baseProps} />);
    expect(getByText("We'll discuss chapter 5")).toBeTruthy();
    expect(getByText("Library Annex")).toBeTruthy();
  });

  it("renders RSVP buttons with counts", () => {
    const { getByText } = render(<CircleEventCard {...baseProps} />);
    expect(getByText("Going (8)")).toBeTruthy();
    expect(getByText("Maybe (2)")).toBeTruthy();
    expect(getByText("Can't Go (1)")).toBeTruthy();
  });

  it("renders interest tag", () => {
    const { getByText } = render(<CircleEventCard {...baseProps} />);
    expect(getByText("Reading")).toBeTruthy();
  });

  it("calls onRsvp with status when Going pressed", () => {
    const onRsvp = jest.fn();
    const { getByText } = render(
      <CircleEventCard {...baseProps} onRsvp={onRsvp} />
    );
    fireEvent.press(getByText("Going (8)"));
    expect(onRsvp).toHaveBeenCalledWith("e-1", "going");
  });

  it("falls back to 'Unknown' when creator name missing", () => {
    const { getByText } = render(
      <CircleEventCard {...baseProps} event={{ ...baseEvent, creator: {} }} />
    );
    expect(getByText("Created by Unknown")).toBeTruthy();
  });
});
