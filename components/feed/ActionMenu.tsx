import React from "react";
import { Modal, View, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";

export interface ActionMenuItem {
  label: string;
  icon: string;
  color?: string;
  onPress: () => void;
}

interface Props {
  visible: boolean;
  items: ActionMenuItem[];
  surfaceColor: string;
  borderColor: string;
  textColor: string;
  subtleColor: string;
  emptyMessage?: string;
  onClose: () => void;
}

/**
 * Generic bottom-sheet action menu used for three-dots menus on posts/events.
 * Show 0+ items; if items is empty, shows emptyMessage.
 */
export function ActionMenu({
  visible,
  items,
  surfaceColor,
  borderColor,
  textColor,
  subtleColor,
  emptyMessage = "No actions available",
  onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[
            styles.sheet,
            { backgroundColor: surfaceColor, borderColor },
          ]}
        >
          {items.length === 0 ? (
            <View style={styles.empty}>
              <ThemedText style={{ color: subtleColor }}>{emptyMessage}</ThemedText>
            </View>
          ) : (
            items.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.item}
                onPress={() => {
                  onClose();
                  item.onPress();
                }}
              >
                <IconSymbol
                  name={item.icon as any}
                  size={18}
                  color={item.color || textColor}
                />
                <ThemedText
                  style={[styles.text, { color: item.color || textColor }]}
                >
                  {item.label}
                </ThemedText>
              </TouchableOpacity>
            ))
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    paddingBottom: 24,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  text: { fontSize: 15, fontWeight: "600" },
  empty: { paddingHorizontal: 16, paddingVertical: 14 },
});
