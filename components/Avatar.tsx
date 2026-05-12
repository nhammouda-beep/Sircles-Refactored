import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "./ThemedText";

interface Props {
  uri?: string | null;
  name?: string | null;
  size?: number;
  style?: any;
}

export function Avatar({ uri, name, size = 40, style }: Props) {
  const [errored, setErrored] = useState(false);

  const initials = (name || "?")
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const showImage = !!uri && !errored;

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri: uri as string }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          onError={() => setErrored(true)}
          contentFit="cover"
        />
      ) : (
        <ThemedText style={{ fontSize: size * 0.4, fontWeight: "700", color: "#fff" }}>
          {initials}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#198F4B",
    overflow: "hidden",
  },
});
