import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { CIRCLE_COLORS } from "./circleCardStyles";

interface CircleInfo {
  description?: string | null;
  memberCount?: number;
  privacy?: string | null;
  circle_profile_url?: string | null;
  isAdmin?: boolean;
  interests?: string[];
}

interface Props {
  circle: CircleInfo;
  surfaceColor: string;
  backgroundColor: string;
  textColor: string;
  onImagePick: () => void;
}

/**
 * Header section for a circle detail page: profile photo (with admin
 * change-photo overlay), description, member count, privacy badge,
 * and interest tags.
 */
export function CircleInfoHeader({
  circle,
  surfaceColor,
  backgroundColor,
  textColor,
  onImagePick,
}: Props) {
  const tintColor = CIRCLE_COLORS.primary;

  return (
    <View style={[styles.circleInfo, { backgroundColor: surfaceColor }]}>
      <View style={styles.circleImageContainer}>
        {circle.circle_profile_url ? (
          <View style={styles.circleImageWithOverlay}>
            <Image
              source={{ uri: circle.circle_profile_url }}
              style={styles.circleHeaderImage}
              contentFit="cover"
            />
            {circle.isAdmin && (
              <TouchableOpacity
                style={styles.circleImageOverlayButton}
                onPress={onImagePick}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.circleOverlayButtonContent,
                    { backgroundColor: "rgba(0,0,0,0.6)" },
                  ]}
                >
                  <IconSymbol name="camera" size={16} color="#fff" />
                  <ThemedText style={styles.circleOverlayButtonText}>
                    Change Photo
                  </ThemedText>
                </View>
              </TouchableOpacity>
            )}
          </View>
        ) : circle.isAdmin ? (
          <TouchableOpacity
            style={[
              styles.circleImagePlaceholderButton,
              { backgroundColor, borderColor: tintColor },
            ]}
            onPress={onImagePick}
            activeOpacity={0.7}
          >
            <View style={styles.circleImagePlaceholder}>
              <IconSymbol name="camera" size={32} color={tintColor} />
              <ThemedText
                style={[styles.circleImagePlaceholderText, { color: tintColor }]}
              >
                Tap to Add Photo
              </ThemedText>
            </View>
          </TouchableOpacity>
        ) : (
          <View
            style={[
              styles.circleImagePlaceholderView,
              { backgroundColor: "#F9FAFB", borderColor: CIRCLE_COLORS.border },
            ]}
          >
            <View style={styles.circleImagePlaceholder}>
              <IconSymbol name="photo" size={32} color={textColor + "40"} />
              <ThemedText
                style={[
                  styles.circleImagePlaceholderText,
                  { color: textColor + "40" },
                ]}
              >
                No Photo
              </ThemedText>
            </View>
          </View>
        )}
      </View>

      <ThemedText style={styles.circleDescription}>
        {circle.description}
      </ThemedText>

      <View style={styles.circleStats}>
        <View style={styles.statItem}>
          <IconSymbol name="person.3" size={16} color={textColor} />
          <ThemedText style={styles.statText}>
            {circle.memberCount || 0} members
          </ThemedText>
        </View>
        <View style={styles.statItem}>
          <IconSymbol
            name={circle.privacy === "private" ? "lock.fill" : "globe"}
            size={16}
            color={textColor}
          />
          <ThemedText style={styles.statText}>
            {circle.privacy === "private" ? "Private" : "Public"}
          </ThemedText>
        </View>
      </View>

      {circle.interests && circle.interests.length > 0 && (
        <View style={styles.circleInterests}>
          <ThemedText style={styles.interestsTitle}>Interests:</ThemedText>
          <View style={styles.interestTags}>
            {circle.interests.map((interest, index) => (
              <View
                key={index}
                style={[
                  styles.interestTag,
                  { backgroundColor: tintColor + "20" },
                ]}
              >
                <ThemedText
                  style={[styles.interestTagText, { color: tintColor }]}
                >
                  {interest}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circleInfo: { padding: 16, gap: 12 },
  circleImageContainer: { width: "100%" },
  circleImageWithOverlay: { position: "relative" },
  circleHeaderImage: { width: "100%", height: 200, borderRadius: 12 },
  circleImageOverlayButton: {
    position: "absolute",
    right: 12,
    bottom: 12,
  },
  circleOverlayButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  circleOverlayButtonText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  circleImagePlaceholderButton: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  circleImagePlaceholderView: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  circleImagePlaceholder: { alignItems: "center", gap: 8 },
  circleImagePlaceholderText: { fontSize: 13, fontWeight: "600" },
  circleDescription: { fontSize: 14, lineHeight: 20, color: "#0F172A" },
  circleStats: { flexDirection: "row", gap: 16 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  statText: { fontSize: 13, color: "#0F172A" },
  circleInterests: { gap: 6 },
  interestsTitle: { fontSize: 13, fontWeight: "700", color: "#0F172A" },
  interestTags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  interestTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  interestTagText: { fontSize: 12, fontWeight: "600" },
});
