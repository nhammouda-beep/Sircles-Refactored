import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  LayoutChangeEvent,
} from "react-native";
import { ThemedText } from "./ThemedText";

interface SegmentOption {
  key: string;
  label: string;
}

interface Props {
  options: SegmentOption[];
  value: string;
  onChange: (v: string) => void;
  height?: number;
  primaryColor?: string;
  trackColor?: string;
}

/**
 * Segmented control with an animated pill that slides between options.
 * Used for tab-like binary/ternary switches (e.g. All Circles / My Circles).
 */
export function AnimatedSegment({
  options,
  value,
  onChange,
  height = 36,
  primaryColor = "#2B7A4B",
  trackColor = "#EEF2F6",
}: Props) {
  const idx = Math.max(
    0,
    options.findIndex((o) => o.key === value)
  );
  const anim = useRef(new Animated.Value(idx)).current;
  const [w, setW] = useState(0);

  useEffect(() => {
    const i = Math.max(
      0,
      options.findIndex((o) => o.key === value)
    );
    Animated.timing(anim, {
      toValue: i,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [value]);

  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);
  const pillW = w / Math.max(1, options.length);
  const translateX = anim.interpolate({
    inputRange: options.map((_, i) => i),
    outputRange: options.map((_, i) => i * pillW),
  });

  return (
    <View
      style={[
        styles.segment,
        { height: height + 12, padding: 6, backgroundColor: trackColor },
      ]}
      onLayout={onLayout}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            margin: 6,
            width: pillW - 12,
            height,
            borderRadius: height / 2,
            backgroundColor: primaryColor,
            transform: [{ translateX }],
          },
        ]}
      />
      {options.map((o) => {
        const active = o.key === value;
        return (
          <TouchableOpacity
            key={o.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.segmentBtn, { height }]}
            activeOpacity={0.9}
            onPress={() => onChange(o.key)}
          >
            <ThemedText
              style={[
                styles.segmentTxt,
                active && { color: "#000", fontWeight: "700" },
              ]}
            >
              {o.label}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  segment: {
    flexDirection: "row",
    borderRadius: 999,
    overflow: "hidden",
    alignItems: "center",
  },
  segmentBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentTxt: {
    fontSize: 13,
    fontWeight: "600",
    color: "#667085",
  },
});
