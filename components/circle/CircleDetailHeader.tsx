import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { CIRCLE_COLORS } from "./circleCardStyles";

interface CircleData {
  id?: string;
  name?: string | null;
  isJoined?: boolean;
  isAdmin?: boolean;
  privacy?: string | null;
  createdby?: string;
  hasPendingRequest?: boolean;
}

interface Props {
  circle: CircleData;
  currentUserId?: string;
  hasPendingRequest: boolean;
  loading: boolean;
  surfaceColor: string;
  textColor: string;
  onJoin: () => void;
  onLeave: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Top header bar of the circle detail page.
 * Shows back button + circle name + action buttons
 * (Join / Request / Pending / Leave / Messages / Edit / Delete)
 * depending on user's role and membership state.
 */
export function CircleDetailHeader({
  circle,
  currentUserId,
  hasPendingRequest,
  loading,
  surfaceColor,
  textColor,
  onJoin,
  onLeave,
  onEdit,
  onDelete,
}: Props) {
  const showJoin =
    !circle.isJoined && !hasPendingRequest && !circle.hasPendingRequest;
  const showPending =
    !circle.isJoined && (hasPendingRequest || circle.hasPendingRequest);
  const showLeave = circle.isJoined && circle.createdby !== currentUserId;
  const showMessages = circle.isJoined;
  const showEdit = circle.isAdmin;
  const showDelete = circle.createdby === currentUserId;

  return (
    <View style={[styles.header, { backgroundColor: surfaceColor }]}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={() => router.back()}
      >
        <IconSymbol name="chevron.left" size={24} color={textColor} />
      </TouchableOpacity>
      <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
        {circle.name}
      </ThemedText>
      <View style={styles.headerActions}>
        {showJoin && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ disabled: loading }}
            style={[styles.button, { backgroundColor: CIRCLE_COLORS.primary }]}
            onPress={onJoin}
            disabled={loading}
          >
            <IconSymbol name="plus" size={16} color="#fff" />
            <ThemedText style={styles.buttonText}>
              {circle.privacy === "private" ? "Request to Join" : "Join"}
            </ThemedText>
          </TouchableOpacity>
        )}

        {showPending && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            style={[styles.button, { backgroundColor: CIRCLE_COLORS.warning }]}
            disabled
          >
            <IconSymbol name="clock" size={16} color="#fff" />
            <ThemedText style={styles.buttonText}>Pending</ThemedText>
          </TouchableOpacity>
        )}

        {showLeave && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ disabled: loading }}
            style={[styles.button, { backgroundColor: CIRCLE_COLORS.danger }]}
            onPress={onLeave}
            disabled={loading}
          >
            <IconSymbol name="minus" size={16} color="#fff" />
            <ThemedText style={styles.buttonText}>Leave</ThemedText>
          </TouchableOpacity>
        )}

        {showMessages && (
          <TouchableOpacity
            accessibilityRole="button"
            style={[styles.button, { backgroundColor: "#0EA5E9" }]}
            onPress={() => router.push(`/(tabs)/messages?circleId=${circle.id}`)}
          >
            <IconSymbol name="message" size={16} color="#fff" />
            <ThemedText style={styles.buttonText}>Messages</ThemedText>
          </TouchableOpacity>
        )}

        {showEdit && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ disabled: loading }}
            style={[styles.button, { backgroundColor: CIRCLE_COLORS.primary }]}
            onPress={onEdit}
            disabled={loading}
          >
            <IconSymbol name="pencil" size={16} color="#fff" />
            <ThemedText style={styles.buttonText}>Edit</ThemedText>
          </TouchableOpacity>
        )}

        {showDelete && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Delete circle"
            accessibilityHint="Permanently deletes this circle"
            accessibilityState={{ disabled: loading }}
            style={[styles.iconOnlyButton, { backgroundColor: CIRCLE_COLORS.danger }]}
            onPress={onDelete}
            disabled={loading}
          >
            <IconSymbol name="trash" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: "700", color: "#0F172A" },
  headerActions: { flexDirection: "row", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  buttonText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  iconOnlyButton: {
    padding: 6,
    borderRadius: 16,
  },
});
