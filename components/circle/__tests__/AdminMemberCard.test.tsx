import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { AdminMemberCard } from "../AdminMemberCard";

const baseMember = {
  id: "m-1",
  name: "Dana",
  avatar_url: null,
  isAdmin: false,
};

const baseProps = {
  member: baseMember,
  surfaceColor: "#fff",
  isRTL: false,
  isCreator: false,
  canRemove: true,
  canToggleAdmin: true,
  onRemove: () => {},
  onToggleAdmin: () => {},
};

describe("AdminMemberCard", () => {
  it("renders member name", () => {
    const { getByText } = render(<AdminMemberCard {...baseProps} />);
    expect(getByText("Dana")).toBeTruthy();
  });

  it("shows Creator badge when isCreator is true", () => {
    const { getByText } = render(
      <AdminMemberCard {...baseProps} isCreator={true} />
    );
    expect(getByText("Creator")).toBeTruthy();
  });

  it("shows Admin badge when member is admin", () => {
    const { getByText } = render(
      <AdminMemberCard {...baseProps} member={{ ...baseMember, isAdmin: true }} />
    );
    expect(getByText("Admin")).toBeTruthy();
  });

  it("shows 'Make Admin' label for a non-admin member", () => {
    const { getByText } = render(<AdminMemberCard {...baseProps} />);
    expect(getByText("Make Admin")).toBeTruthy();
  });

  it("shows 'Remove Admin' label for an admin member", () => {
    const { getByText } = render(
      <AdminMemberCard {...baseProps} member={{ ...baseMember, isAdmin: true }} />
    );
    expect(getByText("Remove Admin")).toBeTruthy();
  });

  it("hides Remove button when canRemove is false", () => {
    const { queryByText } = render(
      <AdminMemberCard {...baseProps} canRemove={false} />
    );
    expect(queryByText("Remove")).toBeNull();
  });

  it("hides admin toggle when canToggleAdmin is false", () => {
    const { queryByText } = render(
      <AdminMemberCard {...baseProps} canToggleAdmin={false} />
    );
    expect(queryByText("Make Admin")).toBeNull();
  });

  it("calls onRemove with id and name", () => {
    const onRemove = jest.fn();
    const { getByText } = render(
      <AdminMemberCard {...baseProps} onRemove={onRemove} />
    );
    fireEvent.press(getByText("Remove"));
    expect(onRemove).toHaveBeenCalledWith("m-1", "Dana");
  });

  it("calls onToggleAdmin with id, name and current admin state", () => {
    const onToggleAdmin = jest.fn();
    const { getByText } = render(
      <AdminMemberCard {...baseProps} onToggleAdmin={onToggleAdmin} />
    );
    fireEvent.press(getByText("Make Admin"));
    expect(onToggleAdmin).toHaveBeenCalledWith("m-1", "Dana", false);
  });
});
