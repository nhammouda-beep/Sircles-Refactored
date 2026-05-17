import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { CIRCLE_COLORS } from "./circleCardStyles";

interface Props {
  title: string;
  count: number;
  placeholder: string;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  backgroundColor: string;
  textColor: string;
  totalItems: number;
  filteredCount: number;
  emptyMessage: string;
  notFoundMessage: string;
  children: React.ReactNode;
  titleMarginTop?: number;
}

/**
 * A section with a title, count, search input, and a list of items.
 * Used by the admin tab on the circle detail page for join requests and
 * members.
 */
export function SearchableSection({
  title,
  count,
  placeholder,
  searchQuery,
  onSearchChange,
  backgroundColor,
  textColor,
  totalItems,
  filteredCount,
  emptyMessage,
  notFoundMessage,
  children,
  titleMarginTop = 0,
}: Props) {
  return (
    <View>
      <ThemedText
        type="subtitle"
        style={[styles.sectionTitle, { marginTop: titleMarginTop }]}
      >
        {title} ({count})
      </ThemedText>
      <View
        style={[
          styles.searchContainer,
          { backgroundColor, borderColor: CIRCLE_COLORS.border },
        ]}
      >
        <IconSymbol name="magnifyingglass" size={16} color={textColor + "60"} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder={placeholder}
          placeholderTextColor={textColor + "60"}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange("")}>
            <IconSymbol
              name="xmark.circle.fill"
              size={16}
              color={textColor + "40"}
            />
          </TouchableOpacity>
        )}
      </View>
      {filteredCount > 0 ? (
        children
      ) : totalItems > 0 ? (
        <ThemedText style={styles.emptyText}>
          {notFoundMessage.replace("{query}", searchQuery)}
        </ThemedText>
      ) : (
        <ThemedText style={styles.emptyText}>{emptyMessage}</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A", marginBottom: 10 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 13 },
  emptyText: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 13,
    fontStyle: "italic",
    paddingVertical: 16,
  },
});
