import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { EditPostModal } from "../EditPostModal";

const baseProps = {
  visible: true,
  backgroundColor: "#fff",
  surfaceColor: "#fafafa",
  textColor: "#0F172A",
  content: "Hello world",
  onContentChange: () => {},
  onSave: () => {},
  onCancel: () => {},
};

describe("EditPostModal", () => {
  it("renders the Edit Post title", () => {
    const { getByText } = render(<EditPostModal {...baseProps} />);
    expect(getByText("Edit Post")).toBeTruthy();
  });

  it("renders both Cancel and Save buttons", () => {
    const { getByText } = render(<EditPostModal {...baseProps} />);
    expect(getByText("Cancel")).toBeTruthy();
    expect(getByText("Save")).toBeTruthy();
  });

  it("calls onCancel when Cancel pressed", () => {
    const onCancel = jest.fn();
    const { getByText } = render(
      <EditPostModal {...baseProps} onCancel={onCancel} />
    );
    fireEvent.press(getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onSave when Save pressed with content", () => {
    const onSave = jest.fn();
    const { getByText } = render(
      <EditPostModal {...baseProps} onSave={onSave} />
    );
    fireEvent.press(getByText("Save"));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("does not call onSave when content is empty/whitespace", () => {
    const onSave = jest.fn();
    const { getByText } = render(
      <EditPostModal {...baseProps} content="   " onSave={onSave} />
    );
    fireEvent.press(getByText("Save"));
    expect(onSave).not.toHaveBeenCalled();
  });
});
