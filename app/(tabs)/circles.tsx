// CirclesScreen.tsx
import React, { useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Platform } from "react-native";
import {
  getCircles,
  createCircle,
  joinCircle,
  leaveCircle,
  getCirclesByUser,
  DatabaseService,
} from "@/lib/database";
import { supabase } from "@/lib/supabase";
import { StorageService } from "@/lib/storage";
import { CirclesSkeleton } from "@/components/SkeletonLoader";
import { useDebounced } from "@/hooks/useDebounced";
import { optimizeImageForUpload } from "@/lib/imageOptimize";
import { AnimatedSegment } from "@/components/AnimatedSegment";
import { CreateCircleModal } from "@/components/circles/CreateCircleModal";
import { useSirclesTheme } from "@/contexts/ThemeContext";

interface Circle {
  id: string;
  name: string;
  description: string;
  privacy: string;
  creationDate: string;
  memberCount?: number;
  isJoined?: boolean;
  member_count?: number;
  circle_profile_url?: string;
  creator?: string;
  hasPendingRequest?: boolean;
}

// ألوان
const COLORS = {
  primary: "#2B7A4B",
  screenBg: "#FFFFFF", // خلفية الصفحة أبيض
  surface: "#FFFFFF", // الكارد أبيض
  gray100: "#F8FAFC",
  gray200: "#EAECF0",
  gray300: "#D0D5DD",
  text: "#101828",
  textMuted: "#667085",
  danger: "#EF5350",
  dangerSoft: "#FFE9E9",
  control: "#EEF2F6", // عناصر التحكم الفاتحة
};

export default function CirclesScreen() {
  const { user, userProfile } = useAuth();
  const { texts, isRTL } = useLanguage();
  const { palette, resolved } = useSirclesTheme();

  // Theme-aware overrides — derived from palette
  const TC = {
    bg: palette.bg,
    surface: palette.surface,
    text: palette.text,
    subtle: palette.subtle,
    border: palette.border,
    primary: palette.primary,
    danger: palette.danger,
    control: resolved === "dark" ? palette.border : "#EEF2F6",
  };

  const [circles, setCircles] = useState<Circle[]>([]);
  const [myCircles, setMyCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination
  const PAGE_SIZE = 30;
  const [circlesPage, setCirclesPage] = useState(0);
  const [hasMoreCircles, setHasMoreCircles] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const STALE_MS = 30_000;
  const lastFetchRef = useRef<number>(0);
  const isStale = () => Date.now() - lastFetchRef.current > STALE_MS;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query, 200);

  const [newCircle, setNewCircle] = useState({
    name: "",
    description: "",
    privacy: "public" as "public" | "private",
    interests: [] as string[],
    image: null as string | null,
  });
  const [selectedImage, setSelectedImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [interests, setInterests] = useState<{ [key: string]: any[] }>({});
  const [loadingInterests, setLoadingInterests] = useState(false);

  const filtered = (activeTab === "all" ? circles : myCircles).filter(
    (c) =>
      c.name?.toLowerCase().includes(debouncedQuery.trim().toLowerCase()) ||
      c.description?.toLowerCase().includes(debouncedQuery.trim().toLowerCase())
  );

  const loadCircles = async (page = 0) => {
    try {
      if (page === 0) {
        setLoading(true);
        setError(null);
      }
      const { data: allCircles, error: circlesError, hasMore } =
        (await getCircles(page, PAGE_SIZE)) as {
          data: any[] | null;
          error: any;
          hasMore: boolean;
        };
      if (circlesError) {
        setError("Unable to load circles. Please try again.");
        if (page === 0) setCircles([]);
        return;
      }

      let joinedIds = new Set<string>();
      let pendingIds = new Set<string>();

      if (userProfile?.id) {
        const { data: userCirclesResult } = await getCirclesByUser(
          userProfile.id
        );
        joinedIds = new Set(userCirclesResult?.map((uc) => uc.circleId) || []);

        if (allCircles) {
          const privateNotJoined = allCircles
            .filter((c) => c.privacy === "private" && !joinedIds.has(c.id))
            .map((c) => c.id);

          if (privateNotJoined.length > 0) {
            const { data: pendingResults } =
              await DatabaseService.getUserPendingRequestsBatch(
                privateNotJoined,
                userProfile.id
              );
            pendingIds = new Set(
              (pendingResults || []).map((r: any) => r.circleid)
            );
          }
        }
      }

      const prepared =
        allCircles?.map((c) => ({
          ...c,
          isJoined: joinedIds.has(c.id),
          hasPendingRequest: pendingIds.has(c.id),
          memberCount: c.member_count || 0,
        })) || [];

      if (page === 0) {
        setCircles(prepared);
        setMyCircles(prepared.filter((c) => c.isJoined));
      } else {
        setCircles((prev) => [...prev, ...prepared]);
        setMyCircles((prev) => [
          ...prev,
          ...prepared.filter((c) => c.isJoined),
        ]);
      }
      setHasMoreCircles(hasMore ?? false);
      setCirclesPage(page);
    } catch {
      setError("Something went wrong. Please try again.");
      if (page === 0) setCircles([]);
    } finally {
      if (page === 0) setLoading(false);
    }
  };

  const loadMoreCircles = async () => {
    if (!hasMoreCircles || loadingMore || loading) return;
    setLoadingMore(true);
    await loadCircles(circlesPage + 1);
    setLoadingMore(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setCirclesPage(0);
    setHasMoreCircles(true);
    await loadCircles(0);
    lastFetchRef.current = Date.now();
    setRefreshing(false);
  };

  const loadInterests = async () => {
    setLoadingInterests(true);
    try {
      const { data } = await DatabaseService.getInterestsByCategory();
      if (data) setInterests(data);
    } finally {
      setLoadingInterests(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Please grant photo library access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.9,
    });
    if (!result.canceled && result.assets?.length)
      setSelectedImage(result.assets[0]);
  };

  const handleCreateCircle = async () => {
    if (!newCircle.name.trim()) {
      Alert.alert("Error", "Circle name is required");
      return;
    }
    if (!user?.id) {
      Alert.alert("Error", "You must be logged in");
      return;
    }

    try {
      const { data: rawData, error } = await createCircle({
        name: newCircle.name.trim(),
        description: newCircle.description.trim(),
        privacy: newCircle.privacy,
        creator: user.id,
      } as any);
      const data = rawData as any;
      if (error) {
        Alert.alert("Error", "Failed to create circle");
        return;
      }

      let circleProfileUrl: string | null = null;
      if (selectedImage && data) {
        const optimized = await optimizeImageForUpload(selectedImage);
        const { data: uploadData } =
          await StorageService.uploadCircleProfilePicture(
            data.id,
            optimized as any
          );
        circleProfileUrl = uploadData?.publicUrl || null;
      }
      if (circleProfileUrl && data) {
        await (supabase
          .from("circles") as any)
          .update({ circle_profile_url: circleProfileUrl })
          .eq("id", data.id);
      }

      if (data && newCircle.interests.length) {
        for (const interestId of newCircle.interests) {
          await (supabase
            .from("circle_interests") as any)
            .insert({ circleid: data.id, interestid: interestId });
        }
      }

      setShowCreateModal(false);
      setNewCircle({
        name: "",
        description: "",
        privacy: "public",
        interests: [],
        image: null,
      });
      setSelectedImage(null);
      await loadCircles();
      Alert.alert("Success", "Circle created successfully");
    } catch {
      Alert.alert("Error", "Failed to create circle");
    }
  };

  const toggleInterest = (interestId: string) => {
    setNewCircle((prev) => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter((id) => id !== interestId)
        : [...prev.interests, interestId],
    }));
  };

  const handleJoinLeave = async (
    circleId: string,
    isJoined: boolean,
    circleName: string,
    circlePrivacy: string
  ) => {
    if (!userProfile?.id) {
      Alert.alert("Error", "You must be logged in");
      return;
    }

    if (isJoined) {
      const { error } = await leaveCircle(userProfile.id, circleId);
      if (error) {
        Alert.alert("Error", "Failed to leave circle");
        return;
      }
      await loadCircles();
      return;
    }

    if (circlePrivacy === "private") {
      const sendRequest = async (message: string) => {
        const { error } = await DatabaseService.requestToJoinCircle(
          userProfile!.id,
          circleId,
          message
        );
        if (error) {
          Alert.alert("Error", error.message || "Failed to send request");
          return;
        }
        Alert.alert("Success", "Join request sent");
        await loadCircles();
      };

      if (Platform.OS === "web") {
        const message = window.prompt(
          `Send a request to join "${circleName}"`,
          ""
        );
        if (message !== null) await sendRequest(message);
      } else {
        Alert.alert(
          "Join Request",
          `Send a request to join "${circleName}"?`,
          [
            { text: "Cancel", style: "cancel" },
            { text: "Send Request", onPress: () => sendRequest("") },
          ]
        );
      }
      return;
    } else {
      const { error } = await joinCircle(userProfile.id, circleId);
      if (error) {
        Alert.alert("Error", "Unable to join circle");
        return;
      }
      await loadCircles();
    }
  };

  const handleDeleteCircle = async (circleId: string, circleName: string) => {
    if (!user?.id) {
      Alert.alert("Error", "You must be logged in");
      return;
    }
    const doDelete = async () => {
      const { error } = await DatabaseService.deleteCircle(circleId, user!.id);
      if (error) {
        Alert.alert("Error", error.message || "Failed to delete circle");
        return;
      }
      await loadCircles();
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm(`Delete "${circleName}" permanently?`);
      if (confirmed) await doDelete();
    } else {
      Alert.alert(
        "Delete Circle",
        `Delete "${circleName}" permanently? This cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: doDelete },
        ]
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (userProfile) {
        if (lastFetchRef.current === 0 || isStale()) {
          loadCircles();
          lastFetchRef.current = Date.now();
        }
      }
    }, [userProfile])
  );

  const renderCircle = (circle: Circle) => {
    const isJoined = !!circle.isJoined;
    const hasPending = !!circle.hasPendingRequest;

    return (
      <TouchableOpacity
        key={circle.id}
        style={[styles.card, { backgroundColor: TC.surface }]}
        onPress={() => router.push(`/circle/${circle.id}`)}
        activeOpacity={0.9}
      >
        {circle.creator === user?.id && (
          <TouchableOpacity
            style={styles.deleteFab}
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteCircle(circle.id, circle.name);
            }}
          >
            <IconSymbol name="trash" size={16} color={TC.danger} />
          </TouchableOpacity>
        )}

        {circle.circle_profile_url && (
          <Image
            source={{ uri: circle.circle_profile_url }}
            style={styles.cardImage}
            contentFit="cover"
          />
        )}

        <View style={styles.metaRow}>
          <View style={styles.metaGroup}>
            <IconSymbol
              name={circle.privacy === "private" ? "lock.fill" : "globe"}
              size={14}
              color={TC.subtle}
            />
            <ThemedText style={[styles.metaText, { color: TC.subtle }]}>
              {circle.privacy === "private"
                ? texts.private || "Private"
                : texts.public || "Public"}
            </ThemedText>
          </View>
          <View style={styles.metaGroup}>
            <IconSymbol name="person.3" size={14} color={TC.subtle} />
            <ThemedText style={[styles.metaText, { color: TC.subtle }]}>
              {circle.memberCount || 0}
            </ThemedText>
          </View>
        </View>

        <ThemedText
          type="defaultSemiBold"
          style={[styles.title, { color: TC.text }, isRTL && styles.rtl]}
        >
          {circle.name}
        </ThemedText>
        <ThemedText style={[styles.sub, { color: TC.subtle }, isRTL && styles.rtl]}>
          {circle.description || "No description"}
        </ThemedText>

        <View style={styles.footerRow}>
          {isJoined ? (
            <TouchableOpacity
              onPress={() =>
                handleJoinLeave(circle.id, true, circle.name, circle.privacy)
              }
              style={styles.leaveLight}
            >
              <ThemedText style={styles.leaveLightTxt}>leave</ThemedText>
            </TouchableOpacity>
          ) : hasPending ? (
            <View style={styles.pendingPill}>
              <ThemedText style={styles.pendingTxt}>Pending</ThemedText>
            </View>
          ) : (
            <View />
          )}

          {isJoined ? (
            <TouchableOpacity
              onPress={() => router.push(`/circle/${circle.id}`)}
              style={styles.openTextBtn}
            >
              <ThemedText style={[styles.openTxt, { color: TC.subtle }]}>Open</ThemedText>
              <IconSymbol
                name="square.and.arrow.up"
                size={14}
                color={TC.subtle}
              />
            </TouchableOpacity>
          ) : !hasPending ? (
            <TouchableOpacity
              style={[styles.joinBtn, { backgroundColor: TC.primary }]}
              onPress={() =>
                handleJoinLeave(circle.id, false, circle.name, circle.privacy)
              }
            >
              <ThemedText style={styles.joinTxt}>
                {circle.privacy === "private" ? "Request" : "Join"}
              </ThemedText>
            </TouchableOpacity>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: TC.bg }]}>
      {/* Header */}
      <View style={[styles.headerWrap, { backgroundColor: TC.bg }]}>
        <ThemedText type="title" style={[styles.headerTitle, { color: TC.text }]}>
          {texts.circles || "Circles"}
        </ThemedText>
        <TouchableOpacity
          style={[styles.addFab, { backgroundColor: TC.primary }]}
          onPress={() => {
            setShowCreateModal(true);
            loadInterests();
          }}
        >
          <IconSymbol name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: TC.control }]}>
        <IconSymbol name="magnifyingglass" size={16} color={TC.subtle} />
        <TextInput
          style={[styles.searchInput, { color: TC.text }]}
          placeholder={texts.search || "Search Circles"}
          placeholderTextColor={TC.subtle}
          value={query}
          onChangeText={setQuery}
          underlineColorAndroid="transparent"
          selectionColor={TC.primary} // اختياري لتغيير لون المؤشر/التحديد
        />
      </View>

      {/* Segmented */}
      <AnimatedSegment
        options={[
          { key: "all", label: texts.allCircles || "All Circles" },
          { key: "my", label: texts.myCircles || "My Circles" },
        ]}
        value={activeTab}
        onChange={(v) => setActiveTab(v as "all" | "my")}
        height={36}
      />

      {/* List */}
      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const distanceFromBottom =
            contentSize.height - (layoutMeasurement.height + contentOffset.y);
          if (distanceFromBottom < 400) loadMoreCircles();
        }}
        scrollEventThrottle={250}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {loading ? (
          <CirclesSkeleton />
        ) : error ? (
          <View style={styles.centerPad}>
            <ThemedText style={styles.emptyText}>{error}</ThemedText>
            <TouchableOpacity
              style={[styles.retryBtn, { backgroundColor: TC.primary }]}
              onPress={() => loadCircles(0)}
            >
              <ThemedText style={styles.retryTxt}>
                {texts.retry || "Retry"}
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.centerPad}>
            <ThemedText style={styles.emptyText}>
              {activeTab === "all"
                ? "No circles available"
                : "You haven't joined any circles yet"}
            </ThemedText>
          </View>
        ) : (
          <>
            <View style={styles.grid}>{filtered.map(renderCircle)}</View>
            {loadingMore && (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <ActivityIndicator size="small" color={TC.primary} />
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Create Modal */}
      <CreateCircleModal
        visible={showCreateModal}
        texts={texts}
        newCircle={newCircle}
        onChange={(updates) => setNewCircle({ ...newCircle, ...updates })}
        selectedImage={selectedImage}
        onPickImage={pickImage}
        interests={interests}
        loadingInterests={loadingInterests}
        onToggleInterest={toggleInterest}
        onSubmit={handleCreateCircle}
        onClose={() => {
          setShowCreateModal(false);
          setNewCircle({
            name: "",
            description: "",
            privacy: "public",
            interests: [],
            image: null,
          });
          setSelectedImage(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.screenBg },

  headerWrap: {
    backgroundColor: COLORS.screenBg,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 24, color: COLORS.text },

  addFab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },

  searchWrap: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.control,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },

  list: { flex: 1 },
  grid: { paddingHorizontal: 16, paddingBottom: 24, gap: 16 },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: 170,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginBottom: 10,
  },
  deleteFab: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  metaGroup: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 12, color: COLORS.textMuted },

  title: { fontSize: 16, marginBottom: 6, color: COLORS.text },
  sub: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 19,
    marginBottom: 10,
  },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  leaveLight: {
    paddingHorizontal: 16,
    height: 30,
    borderRadius: 16,
    backgroundColor: COLORS.dangerSoft,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  leaveLightTxt: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "lowercase",
  },
  pendingPill: {
    paddingHorizontal: 14,
    height: 30,
    borderRadius: 16,
    backgroundColor: "#FFE7C2",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  pendingTxt: { color: "#8A5200", fontSize: 12, fontWeight: "700" },
  openTextBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  openTxt: { color: COLORS.textMuted, fontSize: 13, fontWeight: "700" },
  joinBtn: {
    paddingHorizontal: 18,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },
  joinTxt: { color: "#fff", fontSize: 13, fontWeight: "700" },

  rtl: { textAlign: "right" },

  centerPad: { paddingVertical: 40, alignItems: "center" as const },
  emptyText: { opacity: 0.6, textAlign: "center" as const },
  retryBtn: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
  retryTxt: { color: "#fff", fontWeight: "700" as const },
});
