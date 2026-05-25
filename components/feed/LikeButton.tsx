import React, { useRef } from "react";
import { Animated, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { feedStyles } from "./feedStyles";

interface Props {
  liked: boolean;
  count: number;
  onPress: () => void;
  disabled?: boolean;
  subtleColor?: string;
}

export function LikeButton({
  liked,
  count,
  onPress,
  disabled,
  subtleColor = "#6B7280",
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const run = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.25,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 160,
          delay: 80,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const handlePress = () => {
    run();
    onPress();
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${liked ? "Unlike" : "Like"} post (${count} ${count === 1 ? "like" : "likes"})`}
      accessibilityState={{ selected: liked, disabled: !!disabled }}
      style={[feedStyles.actionBtn, { position: "relative" }]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <IconSymbol
          name={liked ? "heart.fill" : "heart"}
          size={20}
          color={liked ? "#ff4444" : subtleColor}
        />
      </Animated.View>

      <ThemedText
        style={[
          feedStyles.actionTxt,
          liked && { color: "#ff4444", fontWeight: "700" },
        ]}
      >
        {count}
      </ThemedText>

      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: -6,
          right: -6,
          top: -6,
          bottom: -6,
          borderRadius: 8,
          backgroundColor: "rgba(255,68,68,0.15)",
          opacity,
        }}
      />
    </TouchableOpacity>
  );
}
