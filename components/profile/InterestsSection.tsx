import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";

interface Interest {
  id: string | number;
  title: string;
}

interface Props {
  title: string;
  groupedInterests: { [category: string]: Interest[] };
  emptyText: string;
  onEdit: () => void;
  colors: {
    primary: string;
    white: string;
    text: string;
    muted: string;
    cardBorder: string;
    chipBg: string;
    chipText: string;
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

export function InterestsSection({
  title,
  groupedInterests,
  emptyText,
  onEdit,
  colors,
}: Props) {
  const isEmpty = Object.keys(groupedInterests).length === 0;
  return (
    <View
      style={[
        styles.sectionCard,
        {
          backgroundColor: colors.white,
          borderColor: colors.cardBorder,
        },
        SHADOW,
      ]}
    >
      <View style={styles.sectionHeader}>
        <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
          {title}
        </ThemedText>
        <TouchableOpacity
          onPress={onEdit}
          style={[styles.editIconBtn, { backgroundColor: colors.primary }]}
        >
          <IconSymbol name="pencil" size={14} color="#FFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.sectionBody}>
        {isEmpty ? (
          <ThemedText style={[styles.emptyText, { color: colors.muted }]}>
            {emptyText}
          </ThemedText>
        ) : (
          Object.entries(groupedInterests).map(([cat, list]) => (
            <View key={cat} style={{ marginBottom: 10 }}>
              <ThemedText style={[styles.catTitle, { color: colors.muted }]}>
                {cat}
              </ThemedText>
              <View style={styles.tagsRow}>
                {list.map((interest) => (
                  <View
                    key={interest.id}
                    style={[styles.tag, { backgroundColor: colors.chipBg }]}
                  >
                    <ThemedText
                      style={[styles.tagText, { color: colors.chipText }]}
                    >
                      {interest.title}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    width: "100%",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 13, fontWeight: "700" },
  editIconBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionBody: { backgroundColor: "#F6F7F8", borderRadius: 12, padding: 12 },
  catTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tagText: { fontSize: 12, fontWeight: "600" },
  emptyText: {
    fontSize: 13,
    textAlign: "center",
    marginVertical: 8,
  },
});
