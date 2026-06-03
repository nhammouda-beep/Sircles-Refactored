import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { ThemedText } from "@/components/ThemedText";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { DatabaseService } from "@/lib/database";
import { supabase } from "@/lib/supabase";
import { StorageService } from "@/lib/storage";
import { optimizeImageForUpload } from "@/lib/imageOptimize";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { ProfileAvatarHeader } from "@/components/profile/ProfileAvatarHeader";
import { ProfileField } from "@/components/profile/ProfileField";
import { InterestsSection } from "@/components/profile/InterestsSection";
import { InterestPickerModal } from "@/components/profile/InterestPickerModal";
import { useSirclesTheme } from "@/contexts/ThemeContext";

const COLORS = {
  primary: "#2b7a4b",
  darkPrimary: "#0E4416",
  pageBg: "#FFFFFF",
  white: "#FFFFFF",
  text: "#111827",
  muted: "#6B7280",
  fieldBg: "#F3F4F6",
  fieldBorder: "#E5E7EB",
  chipBg: "#EFEFEF",
  chipText: "#111827",
  cardBorder: "#EEEEEE",
};

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

export default function ProfileScreen() {
  const { texts } = useLanguage();
  const { user, userProfile, updateUserProfile, loading } = useAuth();
  const { palette, resolved } = useSirclesTheme();

  // Theme-aware colors object — overrides the module-level COLORS at runtime
  const themedColors = {
    ...COLORS,
    primary: palette.primary,
    pageBg: palette.bg,
    white: palette.surface,
    text: palette.text,
    muted: palette.subtle,
    fieldBg: resolved === "dark" ? palette.border : COLORS.fieldBg,
    fieldBorder: palette.border,
    chipBg: resolved === "dark" ? palette.border : COLORS.chipBg,
    chipText: palette.text,
    cardBorder: palette.border,
  };

  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showLookForModal, setShowLookForModal] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [userInterests, setUserInterests] = useState<{
    [category: string]: any[];
  }>({});
  const [userLookFor, setUserLookFor] = useState<{ [category: string]: any[] }>(
    {}
  );
  const [availableInterests, setAvailableInterests] = useState<{
    [category: string]: any[];
  }>({});

  // ===== avatar =====
  const pickImage = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant photo library access to change your avatar"
        );
        return;
      }
    }

    // يدعم الإصدارات الجديدة وقديمة كـ fallback
    const mediaType =
      (ImagePicker as any).MediaType?.Image ??
      (ImagePicker as any).MediaTypeOptions?.Images;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [mediaType],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
      exif: false,
      base64: false,
    });

    if (!result.canceled && result.assets?.length) {
      await uploadAvatar(result.assets[0]);
    }
  };

  const uploadAvatar = async (asset: any) => {
    if (!user?.id) return;

    const { data: sessionRes } = await supabase.auth.getSession();
    if (!sessionRes?.session) {
      router.replace("/login");
      return;
    }

    setUploading(true);
    try {
      // Resize + compress to ~1080px JPEG for faster upload
      const optimized = await optimizeImageForUpload(asset);
      const uploadUri = optimized.uri;
      const ext = "jpg";

      // web: File | native: { uri }
      let fileForUpload: any = { uri: uploadUri };
      if (Platform.OS === "web") {
        const res = await fetch(uploadUri);
        const blob = await res.blob();
        fileForUpload = new File([blob], `${user.id}.${ext}`, {
          type: `image/${ext}`,
        });
      }

      const { data, error } = await StorageService.uploadAvatar(
        user.id,
        fileForUpload,
        ext
      );
      if (error || !data?.publicUrl) {
        Alert.alert("Error", error?.message || "Upload failed");
        return;
      }

      const raw = data.publicUrl; // يُخزَّن في DB
      const view = `${raw}?t=${Date.now()}`; // يُعرض مع cache-buster

      await DatabaseService.updateUserAvatar(user.id, raw);
      setAvatarUrl(view);
      if (updateUserProfile) await updateUserProfile({ avatar_url: raw });

      Alert.alert("Success", "Avatar updated successfully");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Unexpected error");
    } finally {
      setUploading(false);
    }
  };

  // ===== data =====
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user]);

  useEffect(() => {
    if (user?.id) {
      fetchUserInterests();
      fetchUserLookFor();
      checkExistingAvatar();
    }
    fetchAvailableInterests();
  }, [user?.id, userProfile?.avatar_url]);

  const checkExistingAvatar = async () => {
    if (!user?.id) return;
    if (userProfile?.avatar_url) {
      setAvatarUrl(`${userProfile.avatar_url}?t=${Date.now()}`);
      return;
    }
    const { exists, extension } = await StorageService.checkAvatarExists(
      user.id
    );
    if (exists && extension) {
      const url = StorageService.getAvatarUrl(user.id, extension);
      setAvatarUrl(`${url}?t=${Date.now()}`);
      await DatabaseService.updateUserAvatar(user.id, url);
    }
  };

  const fetchUserInterests = async () => {
    if (!user?.id) return;
    const { data } = await DatabaseService.getUserInterests(user.id);
    if (data) {
      const grouped: { [category: string]: any[] } = {};
      data.forEach((row: any) => {
        const cat = row.interests?.category || "Other";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(row.interests);
      });
      setUserInterests(grouped);
    }
  };

  const fetchUserLookFor = async () => {
    if (!user?.id) return;
    const { data } = await DatabaseService.getUserLookFor(user.id);
    if (data) {
      const grouped: { [category: string]: any[] } = {};
      data.forEach((row: any) => {
        const cat = row.interests?.category || "Other";
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(row.interests);
      });
      setUserLookFor(grouped);
    }
  };

  const fetchAvailableInterests = async () => {
    const { data } = await DatabaseService.getInterestsByCategory();
    if (data) setAvailableInterests(data);
  };

  const toggleInterest = async (interest: any) => {
    if (!user?.id) return;
    const isSelected = Object.values(userInterests)
      .flat()
      .some((i) => i.id === interest.id);
    if (isSelected) {
      await supabase
        .from("user_interests")
        .delete()
        .eq("userid", user.id)
        .eq("interestid", interest.id);
    } else {
      await supabase
        .from("user_interests")
        .insert({ userid: user.id, interestid: interest.id });
    }
    await fetchUserInterests();
  };

  const toggleLookFor = async (interest: any) => {
    if (!user?.id) return;
    const isSelected = Object.values(userLookFor)
      .flat()
      .some((i) => i.id === interest.id);
    if (isSelected) {
      await supabase
        .from("user_look_for")
        .delete()
        .eq("userid", user.id)
        .eq("interestid", interest.id);
    } else {
      await supabase
        .from("user_look_for")
        .insert([{ userid: user.id, interestid: interest.id }]);
    }
    await fetchUserLookFor();
  };

  if (loading || !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themedColors.pageBg }]}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ThemedText>Loading…</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const fullAddress =
    (userProfile?.address_apartment
      ? `Apt ${userProfile.address_apartment}`
      : "") +
    (userProfile?.address_building
      ? `${userProfile?.address_apartment ? ", " : ""}Building ${
          userProfile.address_building
        }`
      : "") +
    (userProfile?.address_block
      ? `${
          userProfile?.address_apartment || userProfile?.address_building
            ? ", "
            : ""
        }Block ${userProfile.address_block}`
      : "");

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themedColors.pageBg }]}>
      <ScrollView
        contentContainerStyle={styles.pageContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileAvatarHeader
          onSettingsPress={() => router.push("/settings")}
          avatarUrl={avatarUrl}
          fallbackAvatarUrl={userProfile?.avatar_url}
          uploading={uploading}
          onPickImage={pickImage}
          name={userProfile?.name || "User"}
          meta={(userProfile?.gender || "Male") + " • Circle 27"}
          primaryColor={themedColors.primary}
          textColor={themedColors.text}
          mutedColor={themedColors.muted}
        />

        <View style={styles.centerColumn}>
          <View
            style={[
              styles.blockCard,
              SHADOW,
              { backgroundColor: themedColors.white, borderColor: themedColors.cardBorder },
            ]}
          >
            <ProfileField
              label="Your Email"
              value={user?.email || "example123@gmail.com"}
              icon={
                <MaterialIcons name="email" size={18} color={themedColors.muted} />
              }
              colors={themedColors}
            />
            <ProfileField
              label="Phone Number"
              value={userProfile?.phone || "+20 1200001000"}
              icon={<Ionicons name="call" size={18} color={themedColors.muted} />}
              colors={themedColors}
            />
            <ProfileField
              label="Address"
              value={fullAddress || "Apt 8, Building 8, Block B"}
              icon={
                <Ionicons
                  name="location-sharp"
                  size={18}
                  color={themedColors.muted}
                />
              }
              colors={themedColors}
            />
          </View>

          <InterestsSection
            title="Interests"
            groupedInterests={userInterests}
            emptyText={texts.notInterested || "No interests added yet"}
            onEdit={() => setShowInterestModal(true)}
            colors={themedColors}
          />

          <InterestsSection
            title="Looking For"
            groupedInterests={userLookFor}
            emptyText="No looking for preferences added yet"
            onEdit={() => setShowLookForModal(true)}
            colors={themedColors}
          />
        </View>
      </ScrollView>

      <InterestPickerModal
        visible={showInterestModal}
        title={texts.interests || "Edit Interests"}
        availableInterests={availableInterests}
        selectedInterests={userInterests}
        onToggle={toggleInterest}
        onClose={() => setShowInterestModal(false)}
        colors={themedColors}
      />

      <InterestPickerModal
        visible={showLookForModal}
        title="Edit Looking For"
        availableInterests={availableInterests}
        selectedInterests={userLookFor}
        onToggle={toggleLookFor}
        onClose={() => setShowLookForModal(false)}
        colors={themedColors}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.pageBg },
  pageContent: { paddingBottom: 24 },
  centerColumn: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    paddingHorizontal: 16,
  },
  blockCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    width: "100%",
  },
});
