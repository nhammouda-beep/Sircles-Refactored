import React from "react";
import { render } from "@testing-library/react-native";
import { EventCard } from "../EventCard";

const baseEvent = {
  id: "event-1",
  title: "Summer Picnic",
  description: "Bring snacks",
  date: "2026-07-15",
  time: "14:00",
  location: "Central Park",
  creationdate: "2026-01-01T00:00:00Z",
  createdby: "user-1",
  circle: { name: "Outdoor Lovers" },
  event_interests: [
    { interests: { id: "i1", title: "Hiking" } },
    { interests: { id: "i2", title: "Food" } },
  ],
};

const noopTimeAgo = (_: any) => "1h ago";
const noopFormatTime = (t?: string) => t || "";

describe("EventCard", () => {
  it("renders event title", () => {
    const { getByText } = render(
      <EventCard
        event={baseEvent}
        isOwner={false}
        onMenu={() => {}}
        formatTimeAgo={noopTimeAgo}
        formatTime={noopFormatTime}
      />
    );
    expect(getByText("Summer Picnic")).toBeTruthy();
  });

  it("renders circle name as header title", () => {
    const { getByText } = render(
      <EventCard
        event={baseEvent}
        isOwner={false}
        onMenu={() => {}}
        formatTimeAgo={noopTimeAgo}
        formatTime={noopFormatTime}
      />
    );
    expect(getByText("Outdoor Lovers")).toBeTruthy();
  });

  it("renders the description when present", () => {
    const { getByText } = render(
      <EventCard
        event={baseEvent}
        isOwner={false}
        onMenu={() => {}}
        formatTimeAgo={noopTimeAgo}
        formatTime={noopFormatTime}
      />
    );
    expect(getByText("Bring snacks")).toBeTruthy();
  });

  it("renders location with map pin", () => {
    const { getByText } = render(
      <EventCard
        event={baseEvent}
        isOwner={false}
        onMenu={() => {}}
        formatTimeAgo={noopTimeAgo}
        formatTime={noopFormatTime}
      />
    );
    expect(getByText("📍 Central Park")).toBeTruthy();
  });

  it("renders interest chips", () => {
    const { getByText } = render(
      <EventCard
        event={baseEvent}
        isOwner={false}
        onMenu={() => {}}
        formatTimeAgo={noopTimeAgo}
        formatTime={noopFormatTime}
      />
    );
    expect(getByText("Hiking")).toBeTruthy();
    expect(getByText("Food")).toBeTruthy();
  });

  it("falls back to 'Untitled Event' when title is missing", () => {
    const { getByText } = render(
      <EventCard
        event={{ ...baseEvent, title: null as any }}
        isOwner={false}
        onMenu={() => {}}
        formatTimeAgo={noopTimeAgo}
        formatTime={noopFormatTime}
      />
    );
    expect(getByText("Untitled Event")).toBeTruthy();
  });

  it("uses circleName fallback when circle.name is missing", () => {
    const { getByText } = render(
      <EventCard
        event={{ ...baseEvent, circle: null, circleName: "Backup Name" }}
        isOwner={false}
        onMenu={() => {}}
        formatTimeAgo={noopTimeAgo}
        formatTime={noopFormatTime}
      />
    );
    expect(getByText("Backup Name")).toBeTruthy();
  });

  it("shows 'TBD' when date is missing", () => {
    const { getByText } = render(
      <EventCard
        event={{ ...baseEvent, date: null as any, time: undefined }}
        isOwner={false}
        onMenu={() => {}}
        formatTimeAgo={noopTimeAgo}
        formatTime={noopFormatTime}
      />
    );
    expect(getByText(/TBD/)).toBeTruthy();
  });
});
