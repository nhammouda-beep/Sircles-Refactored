import React from "react";
import { Modal, View, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Reusable confirmation dialog with cancel + destructive action buttons.
 * Replaces the various inline "Are you sure?" modals scattered across screens.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>{title}</ThemedText>
          </View>

          <View style={styles.body}>
            <ThemedText style={styles.message}>{message}</ThemedText>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={loading}
            >
              <ThemedText style={{ color: "#0F172A" }}>{cancelText}</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: destructive ? "#EF4444" : "#198F4B" },
              ]}
              onPress={onConfirm}
              disabled={loading}
            >
              <ThemedText style={{ color: "#fff", fontWeight: "600" }}>
                {loading ? "..." : confirmText}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  content: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 360,
    overflow: "hidden",
  },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  body: { paddingHorizontal: 20, paddingBottom: 20 },
  message: { fontSize: 14, color: "#475569", lineHeight: 20 },
  footer: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
});
