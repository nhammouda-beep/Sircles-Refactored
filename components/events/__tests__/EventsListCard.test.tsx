import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { EventsListCard } from "../EventsListCard";

const baseEvent = {
  id: "e-1",
  title: "Yoga Class",
  description: "Bring a mat",
  date: "2026-08-01",
  time: "08:00",
  location: "Park Pavilion",
  going_count: 12,
  maybe_count: 3,
  not_going_count: 1,
  userRsvpStatus: null,
  event_interests: [
    { interests: { id: "i1", title: "Yoga", category: "Wellness" } },
    { interests: { id: "i2", title: "Fitness", category: "Wellness" } },
    { interests: { id: "i3", title: "Outdoor", category: "Wellness" } },
  ],
};

const baseProps = {
  event: baseEvent as any,
  isRTL: false,
  isDeletable: false,
  onPress: () => {},
  onEdit: () => {},
  onDelete: () => {},
  onRsvp: () => {},
};

describe("EventsListCard", () => {
  it("renders the event title", () => {
    const { getByText } = render(<EventsListCard {...baseProps} />);
    expect(getByText("Yoga Class")).toBeTruthy();
  });

  it("renders the event description", () => {
    const { getByText } = render(<EventsListCard {...baseProps} />);
    expect(getByText("Bring a mat")).toBeTruthy();
  });

  it("renders date, time, and location", () => {
    const { getByText } = render(<EventsListCard {...baseProps} />);
    expect(getByText("2026-08-01")).toBeTruthy();
    expect(getByText("08:00")).toBeTruthy();
    expect(getByText("Park Pavilion")).toBeTruthy();
  });

  it("renders first 2 interest chips + count for the rest", () => {
    const { getByText } = render(<EventsListCard {...baseProps} />);
    expect(getByText("Yoga")).toBeTruthy();
    expect(getByText("Fitness")).toBeTruthy();
    expect(getByText("+1 more")).toBeTruthy();
  });

  it("renders RSVP buttons with counts", () => {
    const { getByText } = render(<EventsListCard {...baseProps} />);
    expect(getByText("Going (12)")).toBeTruthy();
    expect(getByText("Maybe (3)")).toBeTruthy();
    expect(getByText("Cannot Go (1)")).toBeTruthy();
  });

  it("calls onRsvp with going when Going pressed", () => {
    const onRsvp = jest.fn();
    const { getByText } = render(
      <EventsListCard {...baseProps} onRsvp={onRsvp} />
    );
    fireEvent.press(getByText("Going (12)"));
    expect(onRsvp).toHaveBeenCalledWith("e-1", "going");
  });

  it("calls onPress with the event when card tapped", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <EventsListCard {...baseProps} onPress={onPress} />
    );
    fireEvent.press(getByText("Yoga Class"));
    // The whole card is touchable; tapping the title bubbles to it
    expect(onPress).toHaveBeenCalled();
  });

  it("shows General when no circle is associated", () => {
    const { getByText } = render(
      <EventsListCard {...baseProps} event={{ ...baseEvent, circleid: undefined } as any} />
    );
    expect(getByText("• General")).toBeTruthy();
  });

  it("shows circle name when circle is associated", () => {
    const { getByText } = render(
      <EventsListCard
        {...baseProps}
        event={{
          ...baseEvent,
          circleid: "c1",
          circleName: "Morning Yoga Crew",
        } as any}
      />
    );
    expect(getByText("• Morning Yoga Crew")).toBeTruthy();
  });
});
