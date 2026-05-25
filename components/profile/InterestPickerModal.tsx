import React from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";

interface Interest {
  id: string | number;
  title: string;
}

interface Props {
  visible: boolean;
  title: string;
  availableInterests: { [category: string]: Interest[] };
  selectedInterests: { [category: string]: Interest[] };
  onToggle: (interest: Interest) => void;
  onClose: () => void;
  doneLabel?: string;
  colors: {
    primary: string;
    white: string;
    text: string;
    muted: string;
  };
}

const SHADOW = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  android: { elevation: 3 },
  default: {},
});

export function InterestPickerModal({
  visible,
  title,
  availableInterests,
  selectedInterests,
  onToggle,
  onClose,
  doneLabel = "Done",
  colors,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.white },
            SHADOW,
          ]}
        >
          <ThemedText
            type="subtitle"
            style={[styles.modalTitle, { color: colors.text }]}
          >
            {title}
          </ThemedText>
          <ScrollView style={{ maxHeight: 420 }}>
            {Object.entries(availableInterests).map(([category, interests]) => (
              <View key={category} style={{ marginBottom: 16 }}>
                <ThemedText style={[styles.catTitle, { color: colors.muted }]}>
                  {category}
                </ThemedText>
                <View style={styles.optionGrid}>
                  {(interests as Interest[]).map((interest) => {
                    const selected = Object.values(selectedInterests)
                      .flat()
                      .some((i: any) => i.id === interest.id);
                    return (
                      <TouchableOpacity
                        key={interest.id}
                        onPress={() => onToggle(interest)}
                        style={[
                          styles.optionBtn,
                          {
                            backgroundColor: selected
                              ? colors.primary
                              : "transparent",
                            borderColor: colors.primary,
                          },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.optionText,
                            { color: selected ? "#FFF" : colors.text },
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
          </ScrollView>
          <TouchableOpacity
            style={[styles.modalPrimary, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <ThemedText style={{ color: "#FFF", fontWeight: "600" }}>
              {doneLabel}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    width: "100%",
    maxWidth: 480,
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "700",
  },
  catTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  modalPrimary: {
    marginTop: 8,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  optionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionBtn: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  optionText: { fontSize: 12, fontWeight: "600" },
});
