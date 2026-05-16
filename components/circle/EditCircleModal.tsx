import React from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { CIRCLE_COLORS } from "./circleCardStyles";

interface EditedCircle {
  name: string;
  description: string;
  privacy: "public" | "private";
  interests: string[];
}

interface Props {
  visible: boolean;
  surfaceColor: string;
  textColor: string;
  editedCircle: EditedCircle;
  onChange: (updater: (prev: EditedCircle) => EditedCircle) => void;
  interestsByCategory: { [category: string]: any[] };
  onToggleInterest: (interestId: string) => void;
  onSave: () => void;
  onClose: () => void;
}

export function EditCircleModal({
  visible,
  surfaceColor,
  textColor,
  editedCircle,
  onChange,
  interestsByCategory,
  onToggleInterest,
  onSave,
  onClose,
}: Props) {
  const tintColor = CIRCLE_COLORS.primary;

  const renderPrivacyOption = (
    value: "public" | "private",
    label: string,
    icon: string
  ) => {
    const active = editedCircle.privacy === value;
    return (
      <TouchableOpacity
        style={[
          styles.privacyOption,
          { backgroundColor: "#F9FAFB", borderColor: CIRCLE_COLORS.border },
          active && { backgroundColor: tintColor + "10", borderColor: tintColor },
        ]}
        onPress={() => onChange((prev) => ({ ...prev, privacy: value }))}
      >
        <IconSymbol
          name={icon as any}
          size={20}
          color={active ? tintColor : textColor}
        />
        <ThemedText
          style={[styles.privacyText, active && { color: tintColor }]}
        >
          {label}
        </ThemedText>
      </TouchableOpacity>
    );
  };

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
            <ThemedText style={styles.title}>Edit Circle</ThemedText>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: textColor + "20" }]}
              onPress={onClose}
            >
              <IconSymbol name="xmark" size={18} color={textColor} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <View style={styles.section}>
              <ThemedText style={styles.label}>Circle Name</ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: "#F9FAFB",
                    color: textColor,
                    borderColor: CIRCLE_COLORS.border,
                  },
                ]}
                value={editedCircle.name}
                onChangeText={(text) => onChange((prev) => ({ ...prev, name: text }))}
                placeholder="Enter circle name"
                placeholderTextColor={textColor + "60"}
              />
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.label}>Description</ThemedText>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: "#F9FAFB",
                    color: textColor,
                    borderColor: CIRCLE_COLORS.border,
                  },
                ]}
                value={editedCircle.description}
                onChangeText={(text) =>
                  onChange((prev) => ({ ...prev, description: text }))
                }
                placeholder="Enter circle description"
                placeholderTextColor={textColor + "60"}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.label}>Privacy</ThemedText>
              <View style={styles.privacyOptions}>
                {renderPrivacyOption("public", "Public", "globe")}
                {renderPrivacyOption("private", "Private", "lock.fill")}
              </View>
            </View>

            <View style={styles.section}>
              <ThemedText style={styles.label}>Interests</ThemedText>
              <View>
                {Object.entries(interestsByCategory).map(([category, interests]) => (
                  <View key={category} style={styles.categorySection}>
                    <ThemedText style={styles.categoryTitle}>{category}</ThemedText>
                    <View style={styles.interestsGrid}>
                      {(interests as any[]).map((interest: any) => {
                        const selected = editedCircle.interests.includes(interest.id);
                        return (
                          <TouchableOpacity
                            key={interest.id}
                            style={[
                              styles.interestChip,
                              {
                                backgroundColor: selected ? tintColor : "#F9FAFB",
                                borderColor: tintColor,
                              },
                            ]}
                            onPress={() => onToggleInterest(interest.id)}
                          >
                            <ThemedText
                              style={[
                                styles.interestChipText,
                                { color: selected ? "#fff" : textColor },
                              ]}
                            >
                              {interest.title}
                            </ThemedText>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          <View
            style={[
              styles.footer,
              { backgroundColor: surfaceColor, borderTopColor: CIRCLE_COLORS.border },
            ]}
          >
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <ThemedText style={{ color: textColor }}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: tintColor }]}
              onPress={onSave}
            >
              <ThemedText style={{ color: "#fff", fontWeight: "600" }}>
                Save Changes
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
  title: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { padding: 16 },
  section: { marginBottom: 16, gap: 6 },
  label: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    fontSize: 14,
  },
  privacyOptions: { flexDirection: "row", gap: 8 },
  privacyOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  privacyText: { fontSize: 14, fontWeight: "600", color: "#0F172A" },
  categorySection: { marginBottom: 12 },
  categoryTitle: { fontSize: 12, fontWeight: "700", color: "#6B7280", marginBottom: 6 },
  interestsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  interestChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  interestChipText: { fontSize: 12, fontWeight: "600" },
  footer: {
    flexDirection: "row",
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
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
    borderColor: "#E5E7EB",
  },
});
