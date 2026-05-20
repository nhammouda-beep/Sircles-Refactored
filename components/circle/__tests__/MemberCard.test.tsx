import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { MemberCard } from "../MemberCard";

const baseMember = {
  id: "member-1",
  name: "Bob Smith",
  avatar_url: null,
  isAdmin: false,
};

describe("MemberCard", () => {
  it("renders member name", () => {
    const { getByText } = render(
      <MemberCard
        member={baseMember}
        surfaceColor="#fff"
        isRTL={false}
        canRemove={false}
        onRemove={() => {}}
      />
    );
    expect(getByText("Bob Smith")).toBeTruthy();
  });

  it("shows Admin badge when member is admin", () => {
    const { getByText } = render(
      <MemberCard
        member={{ ...baseMember, isAdmin: true }}
        surfaceColor="#fff"
        isRTL={false}
        canRemove={false}
        onRemove={() => {}}
      />
    );
    expect(getByText("Admin")).toBeTruthy();
  });

  it("does not show Admin badge for non-admin members", () => {
    const { queryByText } = render(
      <MemberCard
        member={baseMember}
        surfaceColor="#fff"
        isRTL={false}
        canRemove={false}
        onRemove={() => {}}
      />
    );
    expect(queryByText("Admin")).toBeNull();
  });

  it("calls onRemove with member id and name when remove pressed", () => {
    const onRemove = jest.fn();
    const { UNSAFE_getByType } = render(
      <MemberCard
        member={baseMember}
        surfaceColor="#fff"
        isRTL={false}
        canRemove={true}
        onRemove={onRemove}
      />
    );
    const { TouchableOpacity } = require("react-native");
    fireEvent.press(UNSAFE_getByType(TouchableOpacity));
    expect(onRemove).toHaveBeenCalledWith("member-1", "Bob Smith");
  });
});
