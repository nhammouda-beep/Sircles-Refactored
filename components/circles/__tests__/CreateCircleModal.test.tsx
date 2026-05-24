import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { CreateCircleModal } from "../CreateCircleModal";

const baseProps = {
  visible: true,
  texts: {
    createCircle: "New Circle",
    name: "Circle name",
    enterCircleName: "e.g. Sport Circle",
    description: "Description",
    enterDescription: "What's this circle about?",
    privacy: "Privacy",
    public: "Public",
    private: "Private",
    interests: "Interests",
    profilePicture: "Add a circle image",
    cancel: "Cancel",
    create: "Create Circle",
  },
  newCircle: {
    name: "",
    description: "",
    privacy: "public" as "public" | "private",
    interests: [] as string[],
    image: null as string | null,
  },
  onChange: () => {},
  selectedImage: null,
  onPickImage: () => {},
  interests: {},
  loadingInterests: false,
  onToggleInterest: () => {},
  onSubmit: () => {},
  onClose: () => {},
};

describe("CreateCircleModal", () => {
  it("renders the title", () => {
    const { getByText } = render(<CreateCircleModal {...baseProps} />);
    expect(getByText("New Circle")).toBeTruthy();
  });

  it("renders all field labels", () => {
    const { getByText } = render(<CreateCircleModal {...baseProps} />);
    expect(getByText("Circle name")).toBeTruthy();
    expect(getByText("Description")).toBeTruthy();
    expect(getByText("Privacy")).toBeTruthy();
    expect(getByText("Interests")).toBeTruthy();
  });

  it("renders the 'Add a circle image' placeholder when no image", () => {
    const { getByText } = render(<CreateCircleModal {...baseProps} />);
    expect(getByText("Add a circle image")).toBeTruthy();
  });

  it("renders Cancel and Create Circle buttons", () => {
    const { getByText } = render(<CreateCircleModal {...baseProps} />);
    expect(getByText("Cancel")).toBeTruthy();
    expect(getByText("Create Circle")).toBeTruthy();
  });

  it("calls onClose when Cancel pressed", () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <CreateCircleModal {...baseProps} onClose={onClose} />
    );
    fireEvent.press(getByText("Cancel"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onSubmit when Create Circle pressed", () => {
    const onSubmit = jest.fn();
    const { getByText } = render(
      <CreateCircleModal {...baseProps} onSubmit={onSubmit} />
    );
    fireEvent.press(getByText("Create Circle"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("shows 'Loading interests...' when loadingInterests is true", () => {
    const { getByText } = render(
      <CreateCircleModal {...baseProps} loadingInterests={true} />
    );
    expect(getByText("Loading interests...")).toBeTruthy();
  });

  it("shows 'No interests available' when interests empty and not loading", () => {
    const { getByText } = render(<CreateCircleModal {...baseProps} />);
    expect(getByText("No interests available")).toBeTruthy();
  });

  it("renders interest chips grouped by category", () => {
    const { getByText } = render(
      <CreateCircleModal
        {...baseProps}
        interests={{
          Sports: [
            { id: "i1", title: "Football" },
            { id: "i2", title: "Tennis" },
          ],
        }}
      />
    );
    expect(getByText("Sports")).toBeTruthy();
    expect(getByText("Football")).toBeTruthy();
    expect(getByText("Tennis")).toBeTruthy();
  });

  it("calls onToggleInterest when an interest chip is pressed", () => {
    const onToggleInterest = jest.fn();
    const { getByText } = render(
      <CreateCircleModal
        {...baseProps}
        onToggleInterest={onToggleInterest}
        interests={{ Sports: [{ id: "i1", title: "Football" }] }}
      />
    );
    fireEvent.press(getByText("Football"));
    expect(onToggleInterest).toHaveBeenCalledWith("i1");
  });
});
