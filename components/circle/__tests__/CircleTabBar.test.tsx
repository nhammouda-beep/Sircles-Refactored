import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { CircleTabBar } from "../CircleTabBar";

describe("CircleTabBar", () => {
  it("always shows the Feed tab", () => {
    const { getByText } = render(
      <CircleTabBar
        activeTab="feed"
        isJoined={false}
        isAdmin={false}
        surfaceColor="#fff"
        onTabChange={() => {}}
      />
    );
    expect(getByText("Feed")).toBeTruthy();
  });

  it("hides Events and Members tabs when not joined", () => {
    const { queryByText } = render(
      <CircleTabBar
        activeTab="feed"
        isJoined={false}
        isAdmin={false}
        surfaceColor="#fff"
        onTabChange={() => {}}
      />
    );
    expect(queryByText("Events")).toBeNull();
    expect(queryByText("Members")).toBeNull();
  });

  it("shows Events and Members tabs when joined", () => {
    const { getByText } = render(
      <CircleTabBar
        activeTab="feed"
        isJoined={true}
        isAdmin={false}
        surfaceColor="#fff"
        onTabChange={() => {}}
      />
    );
    expect(getByText("Events")).toBeTruthy();
    expect(getByText("Members")).toBeTruthy();
  });

  it("hides Admin tab for non-admins", () => {
    const { queryByText } = render(
      <CircleTabBar
        activeTab="feed"
        isJoined={true}
        isAdmin={false}
        surfaceColor="#fff"
        onTabChange={() => {}}
      />
    );
    expect(queryByText("Admin")).toBeNull();
  });

  it("shows Admin tab for admins", () => {
    const { getByText } = render(
      <CircleTabBar
        activeTab="feed"
        isJoined={true}
        isAdmin={true}
        surfaceColor="#fff"
        onTabChange={() => {}}
      />
    );
    expect(getByText("Admin")).toBeTruthy();
  });

  it("calls onTabChange with the tapped tab key", () => {
    const onTabChange = jest.fn();
    const { getByText } = render(
      <CircleTabBar
        activeTab="feed"
        isJoined={true}
        isAdmin={true}
        surfaceColor="#fff"
        onTabChange={onTabChange}
      />
    );
    fireEvent.press(getByText("Members"));
    expect(onTabChange).toHaveBeenCalledWith("members");
  });
});
