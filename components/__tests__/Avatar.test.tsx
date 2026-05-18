import React from "react";
import { render } from "@testing-library/react-native";
import { Avatar } from "../Avatar";

describe("Avatar", () => {
  it("renders image when uri is provided", () => {
    const { UNSAFE_root } = render(
      <Avatar uri="https://example.com/avatar.png" name="John" size={40} />
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it("falls back to initials when uri is empty", () => {
    const { getByText } = render(<Avatar uri={null} name="Jane Doe" size={40} />);
    expect(getByText("JD")).toBeTruthy();
  });

  it("uses ? when name is empty and no uri", () => {
    const { getByText } = render(<Avatar uri={null} name="" size={40} />);
    expect(getByText("?")).toBeTruthy();
  });

  it("uses just the first letter of a single-word name", () => {
    const { getByText } = render(<Avatar uri={null} name="Sircles" size={40} />);
    expect(getByText("S")).toBeTruthy();
  });

  it("caps initials at 2 characters even with 3+ word names", () => {
    const { getByText } = render(
      <Avatar uri={null} name="Anne Marie Smith Jones" size={40} />
    );
    expect(getByText("AM")).toBeTruthy();
  });
});
