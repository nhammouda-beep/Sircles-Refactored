import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { LikeButton } from "../LikeButton";

describe("LikeButton", () => {
  it("renders the like count", () => {
    const { getByText } = render(
      <LikeButton liked={false} count={7} onPress={() => {}} />
    );
    expect(getByText("7")).toBeTruthy();
  });

  it("renders zero count", () => {
    const { getByText } = render(
      <LikeButton liked={false} count={0} onPress={() => {}} />
    );
    expect(getByText("0")).toBeTruthy();
  });

  it("calls onPress when tapped", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <LikeButton liked={false} count={3} onPress={onPress} />
    );
    fireEvent.press(getByText("3"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <LikeButton liked={false} count={3} onPress={onPress} disabled />
    );
    fireEvent.press(getByText("3"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders in liked state without crashing", () => {
    const { getByText } = render(
      <LikeButton liked={true} count={10} onPress={() => {}} />
    );
    expect(getByText("10")).toBeTruthy();
  });
});
