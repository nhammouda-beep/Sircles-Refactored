import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ConfirmDialog } from "../ConfirmDialog";

describe("ConfirmDialog", () => {
  const baseProps = {
    visible: true,
    title: "Delete Post",
    message: "Are you sure?",
    onConfirm: () => {},
    onCancel: () => {},
  };

  it("renders title and message when visible", () => {
    const { getByText } = render(<ConfirmDialog {...baseProps} />);
    expect(getByText("Delete Post")).toBeTruthy();
    expect(getByText("Are you sure?")).toBeTruthy();
  });

  it("renders default Confirm and Cancel labels", () => {
    const { getByText } = render(<ConfirmDialog {...baseProps} />);
    expect(getByText("Confirm")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
  });

  it("uses custom confirm and cancel text when provided", () => {
    const { getByText } = render(
      <ConfirmDialog {...baseProps} confirmText="Delete" cancelText="Keep" />
    );
    expect(getByText("Delete")).toBeTruthy();
    expect(getByText("Keep")).toBeTruthy();
  });

  it("calls onConfirm when confirm button pressed", () => {
    const onConfirm = jest.fn();
    const { getByText } = render(
      <ConfirmDialog {...baseProps} confirmText="Delete" onConfirm={onConfirm} />
    );
    fireEvent.press(getByText("Delete"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when cancel button pressed", () => {
    const onCancel = jest.fn();
    const { getByText } = render(
      <ConfirmDialog {...baseProps} onCancel={onCancel} />
    );
    fireEvent.press(getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("shows loading indicator text on confirm button when loading", () => {
    const { getByText } = render(
      <ConfirmDialog {...baseProps} loading confirmText="Delete" />
    );
    expect(getByText("...")).toBeTruthy();
  });
});
