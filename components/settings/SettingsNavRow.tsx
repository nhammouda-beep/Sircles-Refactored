import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";

interface Props {
  icon: string;
  label: string;
  onPress: () => void;
  isRTL: boolean;
  colors: {
    primary: string;
    text: string;
    muted: string;
  };
  rightElement?: React.ReactNode;
  description?: string;
}

export function SettingsNavRow({
  icon,
  label,
  onPress,
  isRTL,
  colors,
  rightElement,
  description,
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.settingItem, isRTL && styles.settingItemRTL]}
      onPress={onPress}
    >
      <View style={[styles.settingInfo, isRTL && styles.settingInfoRTL]}>
        <IconSymbol name={icon} size={20} color={colors.primary} />
        <View>
          <ThemedText
            style={[
              styles.settingLabel,
              { color: colors.text },
              isRTL && styles.rtlText,
            ]}
          >
            {label}
          </ThemedText>
          {description ? (
            <ThemedText
              style={[
                styles.settingDescription,
                { color: colors.muted },
                isRTL && styles.rtlText,
              ]}
            >
              {description}
            </ThemedText>
          ) : null}
        </View>
      </View>
      {rightElement ?? (
        <IconSymbol
          name={isRTL ? "chevron.left" : "chevron.right"}
          size={16}
          color={colors.muted}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingItemRTL: { flexDirection: "row-reverse" },
  settingInfo: { flexDirection: "row", alignItems: "center", flex: 1, gap: 12 },
  settingInfoRTL: { flexDirection: "row-reverse" },
  settingLabel: { fontSize: 16, fontWeight: "600" },
  settingDescription: { fontSize: 12, marginTop: 2 },
  rtlText: { textAlign: "right" },
});
