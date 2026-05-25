import React from "react";
import { StyleSheet, View, Switch } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";

interface Props {
  icon: string;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  isRTL: boolean;
  colors: {
    primary: string;
    text: string;
    muted: string;
    border: string;
  };
}

export function SettingsToggleRow({
  icon,
  label,
  description,
  value,
  onValueChange,
  isRTL,
  colors,
}: Props) {
  return (
    <View style={[styles.settingItem, isRTL && styles.settingItemRTL]}>
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
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={"#FFFFFF"}
      />
    </View>
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
