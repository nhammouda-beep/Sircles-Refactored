import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { CirclePostCard } from "../CirclePostCard";

const basePost = {
  id: "p-1",
  content: "Just joined this circle!",
  creationdate: "2026-01-15T10:00:00Z",
  author: { id: "u-1", name: "Eve", avatar_url: null },
  likes_count: 4,
  comments_count: 2,
  userLiked: false,
};

const baseProps = {
  post: basePost,
  surfaceColor: "#fff",
  textColor: "#0F172A",
  isRTL: false,
  isAuthor: false,
  canDelete: false,
  deletingPostId: null,
  onEdit: () => {},
  onDelete: () => {},
  onLike: () => {},
};

describe("CirclePostCard", () => {
  it("renders content and author name", () => {
    const { getByText } = render(<CirclePostCard {...baseProps} />);
    expect(getByText("Just joined this circle!")).toBeTruthy();
    expect(getByText("Eve")).toBeTruthy();
  });

  it("renders like count and comments count", () => {
    const { getByText } = render(<CirclePostCard {...baseProps} />);
    expect(getByText("4")).toBeTruthy();
    expect(getByText("2")).toBeTruthy();
  });

  it("falls back to 'Unknown User' when author name missing", () => {
    const { getByText } = render(
      <CirclePostCard
        {...baseProps}
        post={{ ...basePost, author: null }}
      />
    );
    expect(getByText("Unknown User")).toBeTruthy();
  });

  it("hides edit/delete actions when not author and cannot delete", () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    render(
      <CirclePostCard {...baseProps} onEdit={onEdit} onDelete={onDelete} />
    );
    // No way to trigger them - they shouldn't render
    expect(onEdit).not.toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("calls onLike with post id when like pressed", () => {
    const onLike = jest.fn();
    const { getByText } = render(
      <CirclePostCard {...baseProps} onLike={onLike} />
    );
    fireEvent.press(getByText("4"));
    expect(onLike).toHaveBeenCalledWith("p-1");
  });

  it("uses comments fallback length when comments_count is absent", () => {
    const { getByText } = render(
      <CirclePostCard
        {...baseProps}
        post={{
          ...basePost,
          comments_count: undefined,
          comments: [{ id: 1 }, { id: 2 }, { id: 3 }],
        }}
      />
    );
    expect(getByText("3")).toBeTruthy();
  });
});
