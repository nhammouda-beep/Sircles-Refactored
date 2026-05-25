import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { CIRCLE_COLORS } from "./circleCardStyles";

export type CircleTab = "feed" | "events" | "members" | "admin";

interface Props {
  activeTab: CircleTab;
  isJoined: boolean;
  isAdmin: boolean;
  surfaceColor: string;
  onTabChange: (tab: CircleTab) => void;
}

/**
 * Tab bar for the circle detail page.
 * Feed is always visible. Events + Members appear only for joined members.
 * Admin tab appears only for circle admins.
 */
export function CircleTabBar({
  activeTab,
  isJoined,
  isAdmin,
  surfaceColor,
  onTabChange,
}: Props) {
  const renderTab = (key: CircleTab, label: string) => (
    <TouchableOpacity
      key={key}
      accessibilityRole="tab"
      accessibilityState={{ selected: activeTab === key }}
      style={[
        styles.tab,
        activeTab === key && { backgroundColor: CIRCLE_COLORS.primary },
      ]}
      onPress={() => onTabChange(key)}
    >
      <ThemedText
        style={[styles.tabText, activeTab === key && { color: "#fff" }]}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.tabContainer, { backgroundColor: surfaceColor }]}>
      {renderTab("feed", "Feed")}
      {isJoined && renderTab("events", "Events")}
      {isJoined && renderTab("members", "Members")}
      {isAdmin && renderTab("admin", "Admin")}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },
});
