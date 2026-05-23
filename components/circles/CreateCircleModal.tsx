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
import * as ImagePicker from "expo-image-picker";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { AnimatedSegment } from "@/components/AnimatedSegment";

interface NewCircle {
  name: string;
  description: string;
  privacy: "public" | "private";
  interests: string[];
  image: string | null;
}

interface Props {
  visible: boolean;
  texts: any;
  newCircle: NewCircle;
  onChange: (updates: Partial<NewCircle>) => void;
  selectedImage: ImagePicker.ImagePickerAsset | null;
  onPickImage: () => void;
  interests: { [category: string]: any[] };
  loadingInterests: boolean;
  onToggleInterest: (interestId: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const COLORS = {
  primary: "#2B7A4B",
  surface: "#FFFFFF",
  text: "#101828",
  textMuted: "#667085",
  control: "#EEF2F6",
};

/**
 * Bottom-sheet modal for creating a new circle.
 * Fields: profile image, name, description, privacy toggle, interests grid.
 */
export function CreateCircleModal({
  visible,
  texts,
  newCircle,
  onChange,
  selectedImage,
  onPickImage,
  interests,
  loadingInterests,
  onToggleInterest,
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
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn}>
              <IconSymbol name="chevron.left" size={18} color={COLORS.text} />
            </TouchableOpacity>
            <ThemedText type="subtitle" style={styles.sheetTitle}>
              {texts.createCircle || "New Circle"}
            </ThemedText>
            <View style={{ width: 32 }} />
          </View>

          <ScrollView style={styles.sheetBody} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.coverPicker} onPress={onPickImage}>
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={styles.coverImg}
                />
              ) : (
                <View style={styles.coverEmpty}>
                  <IconSymbol name="camera" size={28} color={COLORS.primary} />
                  <ThemedText
                    style={[styles.coverTxt, { color: COLORS.primary }]}
                  >
                    {texts.profilePicture || "Add a circle image"}
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.field}>
              <ThemedText style={styles.label}>
                {texts.name || "Circle name"}
              </ThemedText>
              <TextInput
                style={styles.input}
                placeholder={texts.enterCircleName || "e.g. Sport Circle"}
                placeholderTextColor={COLORS.textMuted + "AA"}
                value={newCircle.name}
                onChangeText={(t) => onChange({ name: t })}
              />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>
                {texts.description || "Description"}
              </ThemedText>
              <TextInput
                style={styles.textarea}
                placeholder={texts.enterDescription || "What's this circle about?"}
                placeholderTextColor={COLORS.textMuted + "AA"}
                value={newCircle.description}
                onChangeText={(t) => onChange({ description: t })}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>
                {texts.privacy || "Privacy"}
              </ThemedText>
              <AnimatedSegment
                options={[
                  { key: "public", label: texts.public || "Public" },
                  { key: "private", label: texts.private || "Private" },
                ]}
                value={newCircle.privacy}
                onChange={(v) => onChange({ privacy: v as "public" | "private" })}
                height={40}
              />
            </View>

            <View style={styles.field}>
              <ThemedText style={styles.label}>
                {texts.interests || "Interests"}
              </ThemedText>
              <View style={styles.interestsBox}>
                {loadingInterests ? (
                  <ThemedText style={styles.emptyText}>
                    Loading interests...
                  </ThemedText>
                ) : Object.keys(interests).length === 0 ? (
                  <ThemedText style={styles.emptyText}>
                    No interests available
                  </ThemedText>
                ) : (
                  Object.entries(interests).map(([cat, items]) => (
                    <View key={cat} style={{ marginBottom: 12 }}>
                      <ThemedText style={styles.catTitle}>{cat}</ThemedText>
                      <View style={styles.chips}>
                        {items.map((it: any) => {
                          const selected = newCircle.interests.includes(it.id);
                          return (
                            <TouchableOpacity
                              key={it.id}
                              style={[
                                styles.chip,
                                {
                                  backgroundColor: selected
                                    ? COLORS.primary
                                    : COLORS.surface,
                                },
                              ]}
                              onPress={() => onToggleInterest(it.id)}
                            >
                              <ThemedText
                                style={[
                                  styles.chipTxt,
                                  { color: selected ? "#fff" : COLORS.text },
                                ]}
                              >
                                {it.title}
                              </ThemedText>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          </ScrollView>

          <View style={styles.sheetFooter}>
            <TouchableOpacity style={styles.btnGhost} onPress={onClose}>
              <ThemedText style={styles.btnGhostTxt}>
                {texts.cancel || "Cancel"}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimary} onPress={onSubmit}>
              <ThemedText style={styles.btnPrimaryTxt}>
                {texts.create || "Create Circle"}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "92%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.control,
  },
  sheetTitle: { fontSize: 17, fontWeight: "700" },
  sheetBody: { padding: 16 },
  sheetFooter: {
    flexDirection: "row",
    gap: 8,
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  coverPicker: {
    height: 160,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: COLORS.primary,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  coverImg: { width: "100%", height: "100%" },
  coverEmpty: { alignItems: "center", gap: 6 },
  coverTxt: { fontSize: 13, fontWeight: "600" },
  field: { marginBottom: 16, gap: 6 },
  label: { fontSize: 13, fontWeight: "600", color: COLORS.textMuted },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: "#F9FAFB",
  },
  textarea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 90,
    color: COLORS.text,
    backgroundColor: "#F9FAFB",
  },
  interestsBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#F9FAFB",
  },
  catTitle: { fontSize: 12, fontWeight: "700", color: COLORS.textMuted, marginBottom: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  chipTxt: { fontSize: 12, fontWeight: "600" },
  emptyText: { color: COLORS.textMuted, fontSize: 13 },
  btnGhost: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  btnGhostTxt: { color: COLORS.text, fontWeight: "600" },
  btnPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },
  btnPrimaryTxt: { color: "#fff", fontWeight: "700" },
});
