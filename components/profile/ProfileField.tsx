import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";

interface Props {
  label: string;
  value: string;
  icon?: React.ReactNode;
  colors: {
    text: string;
    fieldBg: string;
    fieldBorder: string;
  };
}

export function ProfileField({ label, value, icon, colors }: Props) {
  return (
    <View style={{ marginBottom: 12 }}>
      <ThemedText style={[styles.fieldLabel, { color: colors.text }]}>
        {label}
      </ThemedText>
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: colors.fieldBg,
            borderColor: colors.fieldBorder,
          },
        ]}
      >
        <TextInput
          editable={false}
          value={value}
          style={[styles.input, { color: colors.text }]}
          pointerEvents="none"
        />
        <View style={styles.inputIconRight}>{icon}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  inputWrap: {
    position: "relative",
    borderRadius: 10,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
  },
  input: {
    height: 46,
    paddingHorizontal: 12,
    paddingRight: 44,
    fontSize: 14,
  },
  inputIconRight: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
});
