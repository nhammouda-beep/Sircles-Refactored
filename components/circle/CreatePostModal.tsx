import React from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { CIRCLE_COLORS } from "./circleCardStyles";

interface Props {
  visible: boolean;
  circleName: string;
  surfaceColor: string;
  textColor: string;
  content: string;
  onContentChange: (content: string) => void;
  selectedImage: ImagePicker.ImagePickerAsset | null;
  onPickImage: () => void;
  loading: boolean;
  onSubmit: () => void;
  onClose: () => void;
}

export function CreatePostModal({
  visible,
  circleName,
  surfaceColor,
  textColor,
  content,
  onContentChange,
  selectedImage,
  onPickImage,
  loading,
  onSubmit,
  onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: surfaceColor }]}>
          <View style={styles.header}>
            <ThemedText style={[styles.title, { color: CIRCLE_COLORS.primary }]}>
              Create Post
            </ThemedText>
            <TouchableOpacity onPress={onClose}>
              <IconSymbol name="xmark" size={20} color={textColor} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <View style={styles.section}>
              <ThemedText style={styles.label}>Posting in:</ThemedText>
              <ThemedText style={[styles.circleName, { color: CIRCLE_COLORS.primary }]}>
                {circleName}
              </ThemedText>
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.label}>What is on your mind?</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: "#F9FAFB",
                    color: textColor,
                    borderColor: CIRCLE_COLORS.border,
                  },
                ]}
                value={content}
                onChangeText={onContentChange}
                placeholder="Share your thoughts with the circle..."
                placeholderTextColor={textColor + "60"}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.label}>Add Photo</ThemedText>
              <TouchableOpacity
                onPress={onPickImage}
                style={[
                  styles.imagePicker,
                  { backgroundColor: "#F9FAFB", borderColor: CIRCLE_COLORS.primary },
                  selectedImage && styles.imagePickerSelected,
                ]}
              >
                {selectedImage ? (
                  <>
                    <Image
                      source={{ uri: selectedImage.uri }}
                      style={styles.selectedImage}
                    />
                    <View style={styles.imageOverlay}>
                      <IconSymbol name="camera" size={16} color="#fff" />
                      <ThemedText style={styles.changeImageText}>
                        Change Photo
                      </ThemedText>
                    </View>
                  </>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <IconSymbol name="camera" size={32} color={CIRCLE_COLORS.primary} />
                    <ThemedText style={[styles.pickerText, { color: CIRCLE_COLORS.primary }]}>
                      Tap to select photo
                    </ThemedText>
                  </View>
                )}
              </TouchableOpacity>
              {selectedImage && (
                <ThemedText style={[styles.fileSize, { color: textColor + "80" }]}>
                  File size:{" "}
                  {((selectedImage.fileSize || 0) / 1024 / 1024).toFixed(2)} MB
                </ThemedText>
              )}
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <ThemedText style={{ color: CIRCLE_COLORS.subtle }}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: CIRCLE_COLORS.primary }]}
              onPress={onSubmit}
              disabled={loading || !content.trim()}
            >
              <ThemedText style={{ color: "#fff" }}>
                {loading ? "Posting..." : "Post"}
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
    justifyContent: "flex-end",
  },
  content: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: { fontSize: 18, fontWeight: "700" },
  body: { padding: 16, gap: 12 },
  section: { gap: 6 },
  label: { fontSize: 13, color: "#6B7280", fontWeight: "600" },
  circleName: { fontSize: 16, fontWeight: "700" },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 100,
    fontSize: 14,
  },
  imagePicker: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 10,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  imagePickerSelected: { borderStyle: "solid" },
  selectedImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 8,
  },
  changeImageText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  imagePlaceholder: { alignItems: "center", gap: 6 },
  pickerText: { fontSize: 13, fontWeight: "600" },
  fileSize: { fontSize: 12, marginTop: 4 },
  footer: {
    flexDirection: "row",
    gap: 8,
    padding: 16,
    paddingTop: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#9CA3AF",
  },
});
