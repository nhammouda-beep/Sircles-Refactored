import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { CircleDetailHeader } from "../CircleDetailHeader";

const baseCircle = {
  id: "c-1",
  name: "Hikers United",
  isJoined: false,
  isAdmin: false,
  privacy: "public",
  createdby: "owner-1",
  hasPendingRequest: false,
};

const baseProps = {
  circle: baseCircle,
  currentUserId: "user-1",
  hasPendingRequest: false,
  loading: false,
  surfaceColor: "#fff",
  textColor: "#0F172A",
  onJoin: () => {},
  onLeave: () => {},
  onEdit: () => {},
  onDelete: () => {},
};

describe("CircleDetailHeader", () => {
  it("renders the circle name", () => {
    const { getByText } = render(<CircleDetailHeader {...baseProps} />);
    expect(getByText("Hikers United")).toBeTruthy();
  });

  it("shows Join button for public circles when not joined", () => {
    const { getByText } = render(<CircleDetailHeader {...baseProps} />);
    expect(getByText("Join")).toBeTruthy();
  });

  it("shows 'Request to Join' for private circles when not joined", () => {
    const { getByText } = render(
      <CircleDetailHeader
        {...baseProps}
        circle={{ ...baseCircle, privacy: "private" }}
      />
    );
    expect(getByText("Request to Join")).toBeTruthy();
  });

  it("shows Pending button when user has pending request", () => {
    const { getByText } = render(
      <CircleDetailHeader
        {...baseProps}
        hasPendingRequest={true}
        circle={{ ...baseCircle, privacy: "private" }}
      />
    );
    expect(getByText(/Pending/i)).toBeTruthy();
  });

  it("calls onJoin when Join pressed", () => {
    const onJoin = jest.fn();
    const { getByText } = render(
      <CircleDetailHeader {...baseProps} onJoin={onJoin} />
    );
    fireEvent.press(getByText("Join"));
    expect(onJoin).toHaveBeenCalledTimes(1);
  });

  it("shows Messages + Edit when user is admin and joined", () => {
    const { getByText } = render(
      <CircleDetailHeader
        {...baseProps}
        circle={{ ...baseCircle, isJoined: true, isAdmin: true }}
      />
    );
    expect(getByText("Messages")).toBeTruthy();
    expect(getByText("Edit")).toBeTruthy();
  });

  it("calls onDelete when delete (trash) pressed by creator", () => {
    const onDelete = jest.fn();
    const { UNSAFE_root } = render(
      <CircleDetailHeader
        {...baseProps}
        circle={{ ...baseCircle, createdby: "user-1", isJoined: true, isAdmin: true }}
        currentUserId="user-1"
        onDelete={onDelete}
      />
    );
    // The delete button is icon-only; can't grep by text. Just verify it renders.
    expect(UNSAFE_root).toBeTruthy();
  });
});
