import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { JoinRequestCard } from "../JoinRequestCard";

const baseRequest = {
  id: "req-1",
  message: "Please let me in!",
  creationdate: "2026-01-01T00:00:00Z",
  users: { name: "Carol", avatar_url: null },
};

describe("JoinRequestCard", () => {
  it("renders requester name", () => {
    const { getByText } = render(
      <JoinRequestCard
        request={baseRequest}
        surfaceColor="#fff"
        isRTL={false}
        onAction={() => {}}
      />
    );
    expect(getByText("Carol")).toBeTruthy();
  });

  it("renders the request message in quotes when present", () => {
    const { getByText } = render(
      <JoinRequestCard
        request={baseRequest}
        surfaceColor="#fff"
        isRTL={false}
        onAction={() => {}}
      />
    );
    expect(getByText('"Please let me in!"')).toBeTruthy();
  });

  it("omits message block when message is null", () => {
    const { queryByText } = render(
      <JoinRequestCard
        request={{ ...baseRequest, message: null }}
        surfaceColor="#fff"
        isRTL={false}
        onAction={() => {}}
      />
    );
    expect(queryByText(/Please let me in/)).toBeNull();
  });

  it("calls onAction with accept when Accept pressed", () => {
    const onAction = jest.fn();
    const { getByText } = render(
      <JoinRequestCard
        request={baseRequest}
        surfaceColor="#fff"
        isRTL={false}
        onAction={onAction}
      />
    );
    fireEvent.press(getByText("Accept"));
    expect(onAction).toHaveBeenCalledWith("req-1", "accept");
  });

  it("calls onAction with reject when Reject pressed", () => {
    const onAction = jest.fn();
    const { getByText } = render(
      <JoinRequestCard
        request={baseRequest}
        surfaceColor="#fff"
        isRTL={false}
        onAction={onAction}
      />
    );
    fireEvent.press(getByText("Reject"));
    expect(onAction).toHaveBeenCalledWith("req-1", "reject");
  });
});
