import React from "react";
import { Text } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import { SearchableSection } from "../SearchableSection";

const baseProps = {
  title: "Members",
  count: 5,
  placeholder: "Search members…",
  searchQuery: "",
  onSearchChange: () => {},
  backgroundColor: "#fff",
  textColor: "#0F172A",
  totalItems: 5,
  filteredCount: 5,
  emptyMessage: "No members",
  notFoundMessage: "No matches found",
  children: <Text>One Member</Text>,
};

describe("SearchableSection", () => {
  it("renders the title with count", () => {
    const { getByText } = render(<SearchableSection {...baseProps} />);
    expect(getByText("Members (5)")).toBeTruthy();
  });

  it("renders children when results exist", () => {
    const { getByText } = render(<SearchableSection {...baseProps} />);
    expect(getByText("One Member")).toBeTruthy();
  });

  it("shows emptyMessage when there are no items at all", () => {
    const { getByText, queryByText } = render(
      <SearchableSection
        {...baseProps}
        totalItems={0}
        filteredCount={0}
        children={null}
      />
    );
    expect(getByText("No members")).toBeTruthy();
    expect(queryByText("No matches found")).toBeNull();
  });

  it("shows notFoundMessage with the query when search returns nothing", () => {
    const { getByText } = render(
      <SearchableSection
        {...baseProps}
        searchQuery="Zelda"
        totalItems={5}
        filteredCount={0}
        children={null}
      />
    );
    expect(getByText(/No matches found/)).toBeTruthy();
  });

  it("calls onSearchChange when search input changes", () => {
    const onSearchChange = jest.fn();
    const { UNSAFE_getByType } = render(
      <SearchableSection {...baseProps} onSearchChange={onSearchChange} />
    );
    const input = UNSAFE_getByType(require("react-native").TextInput);
    fireEvent.changeText(input, "Alice");
    expect(onSearchChange).toHaveBeenCalledWith("Alice");
  });

  it("shows clear button only when search query is non-empty", () => {
    const onSearchChange = jest.fn();
    const { rerender, UNSAFE_queryAllByType } = render(
      <SearchableSection
        {...baseProps}
        searchQuery=""
        onSearchChange={onSearchChange}
      />
    );
    // No clear button when empty
    const TouchableOpacity = require("react-native").TouchableOpacity;
    const initialButtons = UNSAFE_queryAllByType(TouchableOpacity).length;

    rerender(
      <SearchableSection
        {...baseProps}
        searchQuery="something"
        onSearchChange={onSearchChange}
      />
    );
    const afterButtons = UNSAFE_queryAllByType(TouchableOpacity).length;
    expect(afterButtons).toBeGreaterThan(initialButtons);
  });
});
