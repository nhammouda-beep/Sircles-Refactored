import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { EditCircleModal } from "../EditCircleModal";

const baseProps = {
  visible: true,
  surfaceColor: "#fff",
  textColor: "#0F172A",
  editedCircle: {
    name: "My Circle",
    description: "A test circle",
    privacy: "public" as "public" | "private",
    interests: [] as string[],
  },
  onChange: () => {},
  interestsByCategory: {},
  onToggleInterest: () => {},
  onSave: () => {},
  onClose: () => {},
};

describe("EditCircleModal", () => {
  it("renders Edit Circle title", () => {
    const { getByText } = render(<EditCircleModal {...baseProps} />);
    expect(getByText("Edit Circle")).toBeTruthy();
  });

  it("renders all field labels", () => {
    const { getByText } = render(<EditCircleModal {...baseProps} />);
    expect(getByText("Circle Name")).toBeTruthy();
    expect(getByText("Description")).toBeTruthy();
    expect(getByText("Privacy")).toBeTruthy();
    expect(getByText("Interests")).toBeTruthy();
  });

  it("renders Cancel and Save Changes buttons", () => {
    const { getByText } = render(<EditCircleModal {...baseProps} />);
    expect(getByText("Cancel")).toBeTruthy();
    expect(getByText("Save Changes")).toBeTruthy();
  });

  it("renders Public and Private toggle options", () => {
    const { getByText } = render(<EditCircleModal {...baseProps} />);
    expect(getByText("Public")).toBeTruthy();
    expect(getByText("Private")).toBeTruthy();
  });

  it("calls onClose when Cancel pressed", () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <EditCircleModal {...baseProps} onClose={onClose} />
    );
    fireEvent.press(getByText("Cancel"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onSave when Save Changes pressed", () => {
    const onSave = jest.fn();
    const { getByText } = render(
      <EditCircleModal {...baseProps} onSave={onSave} />
    );
    fireEvent.press(getByText("Save Changes"));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("calls onChange when Privacy toggle changes", () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <EditCircleModal {...baseProps} onChange={onChange} />
    );
    fireEvent.press(getByText("Private"));
    expect(onChange).toHaveBeenCalled();
  });

  it("renders interests grouped by category", () => {
    const { getByText } = render(
      <EditCircleModal
        {...baseProps}
        interestsByCategory={{
          Music: [
            { id: "m1", title: "Guitar" },
            { id: "m2", title: "Piano" },
          ],
        }}
      />
    );
    expect(getByText("Music")).toBeTruthy();
    expect(getByText("Guitar")).toBeTruthy();
    expect(getByText("Piano")).toBeTruthy();
  });

  it("calls onToggleInterest when an interest chip is pressed", () => {
    const onToggleInterest = jest.fn();
    const { getByText } = render(
      <EditCircleModal
        {...baseProps}
        interestsByCategory={{ Music: [{ id: "m1", title: "Guitar" }] }}
        onToggleInterest={onToggleInterest}
      />
    );
    fireEvent.press(getByText("Guitar"));
    expect(onToggleInterest).toHaveBeenCalledWith("m1");
  });
});
