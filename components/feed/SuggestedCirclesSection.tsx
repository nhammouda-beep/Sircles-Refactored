import React from "react";
import { View, ScrollView, TouchableOpacity, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { CircleCard } from "@/components/CircleCard";
import { feedStyles, FEED_COLORS } from "./feedStyles";

interface Props {
  suggestedCircles: any[];
  onJoin: (circleId: string) => void;
  onDismiss: (circle: any) => void;
  onSnooze: (circle: any) => void;
}

export function SuggestedCirclesSection({
  suggestedCircles,
  onJoin,
  onDismiss,
  onSnooze,
}: Props) {
  const { width } = useWindowDimensions();
  const H_PAD = 12;
  const CARD_GAP = 12;
  const cardW = Math.floor((width - H_PAD * 2) * 0.72);

  return (
    <View style={[feedStyles.card, { backgroundColor: FEED_COLORS.surface }]}>
      <View style={{ paddingHorizontal: H_PAD, paddingTop: 10, paddingBottom: 8 }}>
        <ThemedText
          style={{ fontWeight: "700", fontSize: 14, color: FEED_COLORS.text }}
        >
          Circles of Your Interest
        </ThemedText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: H_PAD, paddingBottom: 10 }}
      >
        {suggestedCircles.map((circle: any, idx: number) => (
          <View
            key={circle.id}
            style={{
              width: cardW,
              marginRight: idx === suggestedCircles.length - 1 ? 0 : CARD_GAP,
            }}
          >
            <CircleCard
              circle={circle}
              onJoin={onJoin}
              onDismiss={onDismiss as any}
              onSnooze={onSnooze as any}
            />
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        onPress={() => router.push("/(tabs)/circles")}
        style={{
          alignItems: "center",
          paddingVertical: 8,
          borderTopWidth: 1,
          borderColor: FEED_COLORS.border,
        }}
      >
        <ThemedText style={{ color: FEED_COLORS.subtle, fontWeight: "600" }}>
          See All
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}
