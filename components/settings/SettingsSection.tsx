import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";

interface Props {
  icon: string;
  title: string;
  isRTL: boolean;
  colors: {
    primary: string;
    surface: string;
    text: string;
    border: string;
  };
  children: React.ReactNode;
}

export function SettingsSection({ icon, title, isRTL, colors, children }: Props) {
  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        <IconSymbol name={icon} size={20} color={colors.primary} />
        <ThemedText
          type="defaultSemiBold"
          style={[
            styles.sectionTitle,
            { color: colors.text },
            isRTL && styles.rtlText,
          ]}
        >
          {title}
        </ThemedText>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600" },
  rtlText: { textAlign: "right" },
});
