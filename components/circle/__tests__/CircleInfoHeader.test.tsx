import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { CircleInfoHeader } from "../CircleInfoHeader";

const baseCircle = {
  description: "A circle for nature lovers",
  memberCount: 42,
  privacy: "public",
  circle_profile_url: null,
  isAdmin: false,
  interests: ["Hiking", "Photography"],
};

const baseProps = {
  circle: baseCircle,
  surfaceColor: "#fff",
  backgroundColor: "#fafafa",
  textColor: "#0F172A",
  onImagePick: () => {},
};

describe("CircleInfoHeader", () => {
  it("renders the description", () => {
    const { getByText } = render(<CircleInfoHeader {...baseProps} />);
    expect(getByText("A circle for nature lovers")).toBeTruthy();
  });

  it("renders the member count with 'members' suffix", () => {
    const { getByText } = render(<CircleInfoHeader {...baseProps} />);
    expect(getByText("42 members")).toBeTruthy();
  });

  it("shows 'Public' label for public circles", () => {
    const { getByText } = render(<CircleInfoHeader {...baseProps} />);
    expect(getByText("Public")).toBeTruthy();
  });

  it("shows 'Private' label for private circles", () => {
    const { getByText } = render(
      <CircleInfoHeader
        {...baseProps}
        circle={{ ...baseCircle, privacy: "private" }}
      />
    );
    expect(getByText("Private")).toBeTruthy();
  });

  it("renders each interest tag", () => {
    const { getByText } = render(<CircleInfoHeader {...baseProps} />);
    expect(getByText("Hiking")).toBeTruthy();
    expect(getByText("Photography")).toBeTruthy();
  });

  it("hides interests section when interests list is empty", () => {
    const { queryByText } = render(
      <CircleInfoHeader
        {...baseProps}
        circle={{ ...baseCircle, interests: [] }}
      />
    );
    expect(queryByText("Interests:")).toBeNull();
  });

  it("shows 'Tap to Add Photo' for admin when no image", () => {
    const { getByText } = render(
      <CircleInfoHeader
        {...baseProps}
        circle={{ ...baseCircle, isAdmin: true, circle_profile_url: null }}
      />
    );
    expect(getByText("Tap to Add Photo")).toBeTruthy();
  });

  it("shows 'No Photo' for non-admin when no image", () => {
    const { getByText } = render(
      <CircleInfoHeader
        {...baseProps}
        circle={{ ...baseCircle, isAdmin: false, circle_profile_url: null }}
      />
    );
    expect(getByText("No Photo")).toBeTruthy();
  });

  it("calls onImagePick when admin presses 'Tap to Add Photo'", () => {
    const onImagePick = jest.fn();
    const { getByText } = render(
      <CircleInfoHeader
        {...baseProps}
        circle={{ ...baseCircle, isAdmin: true, circle_profile_url: null }}
        onImagePick={onImagePick}
      />
    );
    fireEvent.press(getByText("Tap to Add Photo"));
    expect(onImagePick).toHaveBeenCalledTimes(1);
  });

  it("defaults member count to 0 when missing", () => {
    const { getByText } = render(
      <CircleInfoHeader
        {...baseProps}
        circle={{ ...baseCircle, memberCount: undefined }}
      />
    );
    expect(getByText("0 members")).toBeTruthy();
  });
});
