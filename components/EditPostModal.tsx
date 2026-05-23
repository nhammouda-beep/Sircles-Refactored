import React from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "./ThemedText";

interface Props {
  visible: boolean;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  content: string;
  onContentChange: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
  tintColor?: string;
  borderColor?: string;
}

/**
 * Page-sheet modal for editing a post's content.
 * Used by both the home feed and circle detail screens.
 */
export function EditPostModal({
  visible,
  backgroundColor,
  surfaceColor,
  textColor,
  content,
  onContentChange,
  onSave,
  onCancel,
  tintColor = "#198F4B",
  borderColor = "#E5E7EB",
}: Props) {
  const canSave = content.trim().length > 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={[styles.header, { backgroundColor: surfaceColor, borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={onCancel}>
            <ThemedText style={[styles.cancelButton, { color: tintColor }]}>
              Cancel
            </ThemedText>
          </TouchableOpacity>
          <ThemedText style={[styles.title, { color: textColor }]}>Edit Post</ThemedText>
          <TouchableOpacity onPress={onSave} disabled={!canSave}>
            <ThemedText
              style={[
                styles.saveButton,
                { color: canSave ? tintColor : textColor + "50" },
              ]}
            >
              Save
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <View style={styles.section}>
            <ThemedText style={styles.label}>Edit your post</ThemedText>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: surfaceColor, color: textColor, borderColor },
              ]}
              value={content}
              onChangeText={onContentChange}
              placeholder="What's on your mind?"
              placeholderTextColor={textColor + "60"}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              autoFocus
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 16, fontWeight: "700" },
  cancelButton: { fontSize: 14, fontWeight: "600" },
  saveButton: { fontSize: 14, fontWeight: "700" },
  body: { flex: 1, padding: 16 },
  section: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 150,
    fontSize: 14,
  },
});
