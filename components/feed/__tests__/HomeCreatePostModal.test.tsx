import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { HomeCreatePostModal } from "../HomeCreatePostModal";

const baseProps = {
  visible: true,
  backgroundColor: "#fff",
  surfaceColor: "#fafafa",
  textColor: "#0F172A",
  borderColor: "#E5E7EB",
  tintColor: "#198F4B",
  subtleColor: "#6B7280",
  userCircles: [
    { id: "c1", name: "Foodies" },
    { id: "c2", name: "Runners" },
  ],
  selectedCircle: "",
  onSelectCircle: () => {},
  content: "",
  onContentChange: () => {},
  selectedImage: null,
  onPickImage: () => {},
  onSubmit: () => {},
  onClose: () => {},
};

describe("HomeCreatePostModal", () => {
  it("renders the Create Post title", () => {
    const { getByText } = render(<HomeCreatePostModal {...baseProps} />);
    expect(getByText("Create Post")).toBeTruthy();
  });

  it("renders all user circles as selectable pills", () => {
    const { getByText } = render(<HomeCreatePostModal {...baseProps} />);
    expect(getByText("Foodies")).toBeTruthy();
    expect(getByText("Runners")).toBeTruthy();
  });

  it("renders Cancel and Post buttons", () => {
    const { getByText } = render(<HomeCreatePostModal {...baseProps} />);
    expect(getByText("Cancel")).toBeTruthy();
    expect(getByText("Post")).toBeTruthy();
  });

  it("calls onClose when Cancel pressed", () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <HomeCreatePostModal {...baseProps} onClose={onClose} />
    );
    fireEvent.press(getByText("Cancel"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does NOT call onSubmit when content is empty or circle not selected", () => {
    const onSubmit = jest.fn();
    const { getByText } = render(
      <HomeCreatePostModal {...baseProps} onSubmit={onSubmit} />
    );
    fireEvent.press(getByText("Post"));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit when content + circle are set", () => {
    const onSubmit = jest.fn();
    const { getByText } = render(
      <HomeCreatePostModal
        {...baseProps}
        content="Hello"
        selectedCircle="c1"
        onSubmit={onSubmit}
      />
    );
    fireEvent.press(getByText("Post"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("calls onSelectCircle when a circle pill is pressed", () => {
    const onSelectCircle = jest.fn();
    const { getByText } = render(
      <HomeCreatePostModal {...baseProps} onSelectCircle={onSelectCircle} />
    );
    fireEvent.press(getByText("Foodies"));
    expect(onSelectCircle).toHaveBeenCalledWith("c1");
  });

  it("shows 'Tap to select a photo' when no image picked", () => {
    const { getByText } = render(<HomeCreatePostModal {...baseProps} />);
    expect(getByText("Tap to select a photo")).toBeTruthy();
  });

  it("shows 'Change Photo' when image is selected", () => {
    const { getByText } = render(
      <HomeCreatePostModal
        {...baseProps}
        selectedImage={{ uri: "file://test.jpg" } as any}
      />
    );
    expect(getByText("Change Photo")).toBeTruthy();
  });
});
