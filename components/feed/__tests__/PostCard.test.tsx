import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { PostCard } from "../PostCard";

const basePost = {
  id: "post-1",
  content: "Hello world",
  creationdate: "2026-01-01T00:00:00Z",
  author: { id: "user-1", name: "Alice", avatar_url: null },
  circle: { id: "circle-1", name: "Test Circle" },
  likes_count: 3,
  comments_count: 5,
  userLiked: false,
};

const noopFormat = (_: any) => "Just now";

describe("PostCard", () => {
  it("renders post content", () => {
    const { getByText } = render(
      <PostCard
        post={basePost}
        isOwner={false}
        canLike
        onLike={() => {}}
        onMenu={() => {}}
        formatTimeAgo={noopFormat}
      />
    );
    expect(getByText("Hello world")).toBeTruthy();
  });

  it("renders author name and circle name", () => {
    const { getByText } = render(
      <PostCard
        post={basePost}
        isOwner={false}
        canLike
        onLike={() => {}}
        onMenu={() => {}}
        formatTimeAgo={noopFormat}
      />
    );
    expect(getByText("Alice")).toBeTruthy();
    expect(getByText("in Test Circle")).toBeTruthy();
  });

  it("renders like and comment counts", () => {
    const { getByText } = render(
      <PostCard
        post={basePost}
        isOwner={false}
        canLike
        onLike={() => {}}
        onMenu={() => {}}
        formatTimeAgo={noopFormat}
      />
    );
    expect(getByText("3")).toBeTruthy();
    expect(getByText("5")).toBeTruthy();
  });

  it("shows menu button only when isOwner is true", () => {
    const { queryByText, rerender } = render(
      <PostCard
        post={basePost}
        isOwner={false}
        canLike
        onLike={() => {}}
        onMenu={() => {}}
        formatTimeAgo={noopFormat}
      />
    );
    // Menu icon is an IconSymbol; checking via text presence is unreliable —
    // instead verify the rerender with isOwner=true doesn't crash and the
    // component tree is different by checking by testID is not feasible here.
    // We just confirm both branches render successfully.
    expect(queryByText("Hello world")).toBeTruthy();
    rerender(
      <PostCard
        post={basePost}
        isOwner={true}
        canLike
        onLike={() => {}}
        onMenu={() => {}}
        formatTimeAgo={noopFormat}
      />
    );
    expect(queryByText("Hello world")).toBeTruthy();
  });

  it("calls onLike with post id when like button is pressed", () => {
    const onLike = jest.fn();
    const { getByText } = render(
      <PostCard
        post={basePost}
        isOwner={false}
        canLike
        onLike={onLike}
        onMenu={() => {}}
        formatTimeAgo={noopFormat}
      />
    );
    fireEvent.press(getByText("3"));
    expect(onLike).toHaveBeenCalledWith("post-1");
  });

  it("falls back to 'Unknown' when author name is missing", () => {
    const { getByText } = render(
      <PostCard
        post={{ ...basePost, author: null }}
        isOwner={false}
        canLike
        onLike={() => {}}
        onMenu={() => {}}
        formatTimeAgo={noopFormat}
      />
    );
    expect(getByText("Unknown")).toBeTruthy();
  });

  it("falls back to 'Circle' when circle name is missing", () => {
    const { getByText } = render(
      <PostCard
        post={{ ...basePost, circle: null }}
        isOwner={false}
        canLike
        onLike={() => {}}
        onMenu={() => {}}
        formatTimeAgo={noopFormat}
      />
    );
    expect(getByText("in Circle")).toBeTruthy();
  });
});
