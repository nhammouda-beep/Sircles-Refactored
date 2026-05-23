import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ActionMenu } from "../ActionMenu";

const baseProps = {
  visible: true,
  items: [
    { label: "Edit", icon: "pencil", onPress: () => {} },
    { label: "Delete", icon: "trash", color: "#EF4444", onPress: () => {} },
  ],
  surfaceColor: "#fff",
  borderColor: "#E5E7EB",
  textColor: "#0F172A",
  subtleColor: "#6B7280",
  onClose: () => {},
};

describe("ActionMenu", () => {
  it("renders all provided items", () => {
    const { getByText } = render(<ActionMenu {...baseProps} />);
    expect(getByText("Edit")).toBeTruthy();
    expect(getByText("Delete")).toBeTruthy();
  });

  it("shows default empty message when items are empty", () => {
    const { getByText } = render(<ActionMenu {...baseProps} items={[]} />);
    expect(getByText("No actions available")).toBeTruthy();
  });

  it("shows custom empty message when provided", () => {
    const { getByText } = render(
      <ActionMenu
        {...baseProps}
        items={[]}
        emptyMessage="Nothing to see here"
      />
    );
    expect(getByText("Nothing to see here")).toBeTruthy();
  });

  it("calls item.onPress then onClose when item is pressed", () => {
    const onEditPress = jest.fn();
    const onClose = jest.fn();
    const { getByText } = render(
      <ActionMenu
        {...baseProps}
        items={[{ label: "Edit", icon: "pencil", onPress: onEditPress }]}
        onClose={onClose}
      />
    );
    fireEvent.press(getByText("Edit"));
    expect(onClose).toHaveBeenCalled();
    expect(onEditPress).toHaveBeenCalled();
  });
});
