import React from "react";
import {
  Modal,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";

interface UserCircle {
  id: string;
  name: string;
}

interface Props {
  visible: boolean;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  borderColor: string;
  tintColor: string;
  subtleColor: string;
  userCircles: UserCircle[];
  selectedCircle: string;
  onSelectCircle: (id: string) => void;
  content: string;
  onContentChange: (content: string) => void;
  selectedImage: ImagePicker.ImagePickerAsset | null;
  onPickImage: () => void;
  onSubmit: () => void;
  onClose: () => void;
}

/**
 * Page-sheet modal for composing a new post on the home screen.
 * Pick a circle, write content, optionally attach a photo.
 */
export function HomeCreatePostModal({
  visible,
  backgroundColor,
  surfaceColor,
  textColor,
  borderColor,
  tintColor,
  subtleColor,
  userCircles,
  selectedCircle,
  onSelectCircle,
  content,
  onContentChange,
  selectedImage,
  onPickImage,
  onSubmit,
  onClose,
}: Props) {
  const canSubmit = content.trim().length > 0 && selectedCircle.length > 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
        <View
          style={[
            styles.modalHeader,
            { backgroundColor: surfaceColor, borderBottomColor: borderColor },
          ]}
        >
          <TouchableOpacity onPress={onClose}>
            <ThemedText style={[styles.cancelButton, { color: tintColor }]}>
              Cancel
            </ThemedText>
          </TouchableOpacity>
          <ThemedText style={[styles.modalTitle, { color: textColor }]}>
            Create Post
          </ThemedText>
          <TouchableOpacity onPress={onSubmit} disabled={!canSubmit}>
            <ThemedText
              style={[
                styles.saveButton,
                { color: canSubmit ? tintColor : subtleColor },
              ]}
            >
              Post
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.modalBody}>
          <View style={styles.inputSection}>
            <ThemedText style={[styles.inputLabel, { color: textColor }]}>
              Select Circle:
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {userCircles.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.circlePill,
                    {
                      borderColor: tintColor,
                      backgroundColor:
                        selectedCircle === c.id ? tintColor : surfaceColor,
                    },
                  ]}
                  onPress={() => onSelectCircle(c.id)}
                >
                  <ThemedText
                    style={[
                      styles.circlePillTxt,
                      {
                        color: selectedCircle === c.id ? "#fff" : textColor,
                      },
                    ]}
                  >
                    {c.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputSection}>
            <ThemedText style={[styles.inputLabel, { color: textColor }]}>
              What is on your mind?
            </ThemedText>
            <TextInput
              style={[
                styles.postInput,
                {
                  backgroundColor: surfaceColor,
                  color: textColor,
                  borderColor,
                },
              ]}
              value={content}
              onChangeText={onContentChange}
              placeholder="Share your thoughts..."
              placeholderTextColor={subtleColor}
              multiline
              numberOfLines={25}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputSection}>
            <ThemedText style={[styles.inputLabel, { color: textColor }]}>
              Add Photo:
            </ThemedText>
            <TouchableOpacity
              onPress={onPickImage}
              style={[
                styles.imagePicker,
                { backgroundColor: surfaceColor, borderColor: tintColor },
              ]}
            >
              {selectedImage ? (
                <View style={styles.imageSelected}>
                  <Image source={{ uri: selectedImage.uri }} style={styles.image} />
                  <View style={styles.imageOverlay}>
                    <IconSymbol name="photo" size={22} color="#fff" />
                    <ThemedText style={styles.imageOverlayTxt}>
                      Change Photo
                    </ThemedText>
                  </View>
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <IconSymbol name="photo" size={28} color={tintColor} />
                  <ThemedText style={[styles.imagePickerTxt, { color: tintColor }]}>
                    Tap to select a photo
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 16, fontWeight: "700" },
  cancelButton: { fontSize: 14, fontWeight: "600" },
  saveButton: { fontSize: 14, fontWeight: "700" },
  modalBody: { padding: 16, gap: 16, flex: 1 },
  inputSection: { gap: 6 },
  inputLabel: { fontSize: 13, fontWeight: "600" },
  circlePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  circlePillTxt: { fontSize: 12, fontWeight: "600" },
  postInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 180,
    fontSize: 14,
  },
  imagePicker: {
    height: 160,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  imageSelected: { width: "100%", height: "100%" },
  image: { width: "100%", height: "100%" },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 8,
  },
  imageOverlayTxt: { color: "#fff", fontSize: 12, fontWeight: "600" },
  imagePlaceholder: { alignItems: "center", gap: 6 },
  imagePickerTxt: { fontSize: 13, fontWeight: "600" },
});
