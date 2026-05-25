import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  title?: string;
  onSettingsPress: () => void;
  avatarUrl: string | null;
  fallbackAvatarUrl?: string | null;
  uploading: boolean;
  onPickImage: () => void;
  name: string;
  meta: string;
  primaryColor: string;
  textColor: string;
  mutedColor: string;
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

export function ProfileAvatarHeader({
  title = "Your Profile",
  onSettingsPress,
  avatarUrl,
  fallbackAvatarUrl,
  uploading,
  onPickImage,
  name,
  meta,
  primaryColor,
  textColor,
  mutedColor,
}: Props) {
  const displayUri = avatarUrl || fallbackAvatarUrl;
  return (
    <>
      <View style={[styles.hero, { backgroundColor: primaryColor }]}>
        <ThemedText style={styles.headerTitle}>{title}</ThemedText>
        <TouchableOpacity onPress={onSettingsPress} style={styles.headerGear}>
          <Ionicons name="settings-outline" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={onPickImage}
        disabled={uploading}
        style={styles.avatarWrap}
      >
        <View style={[styles.avatarGreen, { backgroundColor: primaryColor }]}>
          {displayUri ? (
            <Image source={{ uri: displayUri }} style={styles.avatarImg} />
          ) : (
            <View style={[styles.avatarImg, styles.avatarPlaceholder]}>
              <ThemedText style={{ fontSize: 28 }}>👤</ThemedText>
            </View>
          )}
        </View>
        <View style={[styles.editAvatarBtn, { backgroundColor: primaryColor }]}>
          <IconSymbol name="pencil" size={14} color="#FFF" />
        </View>
      </TouchableOpacity>

      <ThemedText style={[styles.nameText, { color: textColor }]}>{name}</ThemedText>
      <ThemedText style={[styles.metaText, { color: mutedColor }]}>{meta}</ThemedText>
    </>
  );
}

// Re-export so callers can apply consistent shadow if needed
export const PROFILE_HEADER_SHADOW = SHADOW;

const styles = StyleSheet.create({
  hero: {
    width: "100%",
    height: 120,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
    position: "absolute",
    top: 15,
    left: 16,
  },
  headerGear: {
    position: "absolute",
    right: 16,
    top: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarWrap: { alignSelf: "center", marginTop: -46 },
  avatarGreen: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImg: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#FFF",
  },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center" },
  editAvatarBtn: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  nameText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  metaText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "400",
    textAlign: "center",
    marginBottom: 12,
  },
});
