import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { DatabaseService } from "@/lib/database";
import { useCirclesStore } from "@/stores/circlesStore";
import EventModal from "@/components/EventModal";
import { FeedSkeleton } from "@/components/SkeletonLoader";
import { useDebounced } from "@/hooks/useDebounced";
import { optimizeImageForUpload } from "@/lib/imageOptimize";
import { PostCard } from "@/components/feed/PostCard";
import { EventCard } from "@/components/feed/EventCard";
import { SuggestedCirclesSection } from "@/components/feed/SuggestedCirclesSection";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Post {
  id: string;
  content: string;
  image?: string;
  creationdate: string;
  author: { id: string; name: string; avatar_url?: string } | null;
  circle: {
    id?: string;
    name: string;
    circle_interests?: { interests: { id: string; title: string } }[];
  } | null;
  likes: any[];
  comments: any[];
  likes_count?: number;
  comments_count?: number;
  userLiked?: boolean;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { texts } = useLanguage();

  // theme
  const PRIMARY = "#198F4B";
  const SURFACE = "#FFFFFF";
  const BG = "#FFFFFF";
  const TEXT = "#0F172A";
  const SUBTLE = "#6B7280";
  const BORDER = "#E5E7EB";

  const surfaceColor = SURFACE;
  const tintColor = PRIMARY;
  const textColor = TEXT;
  const backgroundColor = BG;

  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [userInterests, setUserInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const PAGE_SIZE = 20;
  const [postsPage, setPostsPage] = useState(0);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Staleness check — skip re-fetch if data is less than 30s old
  const STALE_MS = 30_000;
  const lastFetchRef = React.useRef<number>(0);
  const isStale = () => Date.now() - lastFetchRef.current > STALE_MS;

  // create / edit post
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedCircle, setSelectedCircle] = useState<string>("");
  const [userCircles, setUserCircles] = useState<any[]>([]);
  const [selectedPostImage, setSelectedPostImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [editingPost, setEditingPost] = useState<{ id: string } | null>(null);
  const [editPostContent, setEditPostContent] = useState("");
  const [deletePostLoading, setDeletePostLoading] = useState<string | null>(
    null
  );
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [isEventModalVisible, setEventModalVisible] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  // menu state
  const [menuFor, setMenuFor] = useState<{
    type: "post" | "event";
    id: string;
  } | null>(null);

  // search
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query, 200);

  const isAllowedImageAsset = (
    asset: ImagePicker.ImagePickerAsset | null | undefined
  ) => {
    if (!asset) return false;

    const allowedMimes = new Set(["image/png", "image/jpeg", "image/jpg"]);
    const allowedExts = new Set(["png", "jpg", "jpeg"]);

    const mime = asset.mimeType?.toLowerCase();
    if (mime && allowedMimes.has(mime)) return true;

    const nameOrUri = (asset.fileName || asset.uri || "").toLowerCase();
    const ext = nameOrUri.split(".").pop();
    if (ext && allowedExts.has(ext)) return true;

    return false;
  };

  const showUnsupportedAlert = () =>
    Alert.alert(
      "Unsupported Format",
      "Only PNG, JPG, or JPEG images are allowed.\nPlease select a valid image format."
    );

  // suggested circles store
  const {
    suggested: suggestedCircles,
    loadSuggested,
    dismiss,
    snooze,
  } = useCirclesStore();

  const isFirstMount = React.useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        if (isFirstMount.current) {
          loadPosts();
          loadSuggested();
          loadEvents();
          loadUserCircles();
          loadUserInterests();
          isFirstMount.current = false;
          lastFetchRef.current = Date.now();
        } else if (isStale()) {
          loadPosts();
          loadSuggested();
          loadEvents();
          lastFetchRef.current = Date.now();
        }
      }
    }, [user])
  );

  const isOwner = useCallback(
    (post?: Post | null) => !!post?.author?.id && post?.author?.id === user?.id,
    [user?.id]
  );

  const loadPosts = async (page = 0) => {
    if (!user?.id) {
      setPosts([]);
      setLoading(false);
      return;
    }
    try {
      if (page === 0) {
        setLoading(true);
        setError(null);
      }
      const { data, error, hasMore } = await DatabaseService.getHomePagePosts(
        user.id,
        page,
        PAGE_SIZE
      );
      if (error) {
        setError("Unable to load posts. Please try again.");
        if (page === 0) setPosts([]);
      } else {
        const postsWithLikes = (data || []).map((post: any) => ({
          ...post,
          likes_count: post.likes?.length || post.likes_count || 0,
          userLiked:
            post.userLiked ??
            (post.likes?.some((like: any) => like.userid === user.id) || false),
        }));
        if (page === 0) {
          setPosts(postsWithLikes);
        } else {
          setPosts((prev) => [...prev, ...postsWithLikes]);
        }
        setHasMorePosts(hasMore ?? false);
        setPostsPage(page);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (!hasMorePosts || loadingMore || loading) return;
    setLoadingMore(true);
    await loadPosts(postsPage + 1);
    setLoadingMore(false);
  };

  const loadEvents = async () => {
    try {
      const { data, error } = await DatabaseService.getEvents();
      if (error) setError("Unable to load events. Please try again.");
      else setEvents(data || []);
    } catch {
      setError("Unable to load events. Please try again.");
    }
  };

  // ✅ تعديل الحذف ليطابق صفحة Events: حذف من الـDB ثم إعادة التحميل
  const handleDeleteEvent = async (eventId: string) => {
    if (!eventId) {
      Alert.alert("Error", "Invalid event ID");
      return;
    }
    const { error } = await DatabaseService.deleteEvent(eventId);
    if (error) {
      Alert.alert("Error", error.message || "Failed to delete event");
      return;
    }
    await loadEvents(); // أعد تحميل الأحداث لكي يتحدّث الـfeed
    Alert.alert("Success", "Event deleted successfully");
  };

  function formatTo12Hour(timeString: string | undefined) {
    if (!timeString) {
      return "";
    }
    const [hours, minutes] = timeString.split(":");
    const hoursNum = parseInt(hours, 10);
    if (isNaN(hoursNum)) return "";

    const period = hoursNum >= 12 ? "PM" : "AM";
    let displayHours = hoursNum % 12;
    if (displayHours === 0) {
      displayHours = 12;
    }

    return `${displayHours}:${minutes} ${period}`;
  }

  const calculateInterestScore = (item: any) => {
    if (!userInterests?.length) return 0;
    let itemInterests: string[] = [];
    if (item.type === "event") {
      itemInterests =
        item.event_interests
          ?.map((ei: any) => ei.interests?.id)
          .filter(Boolean) || [];
    } else {
      itemInterests =
        item.circle?.circle_interests
          ?.map((ci: any) => ci.interests?.id)
          .filter(Boolean) || [];
    }
    const userIds = userInterests
      .map((ui) => ui.interests?.id || ui.interestid)
      .filter(Boolean);
    return itemInterests.filter((id) => userIds.includes(id)).length;
  };

  const feedItems = useMemo(() => {
    const combined = [
      ...posts.map((post) => ({
        ...post,
        type: "post" as const,
        sortDate: new Date(post.creationdate),
        interestScore: calculateInterestScore({ ...post, type: "post" }),
      })),
      ...events.map((event) => ({
        ...event,
        type: "event" as const,
        sortDate: new Date(event.creationdate || event.date || Date.now()),
        interestScore: calculateInterestScore({ ...event, type: "event" }),
      })),
    ];
    combined.sort(
      (a, b) =>
        (b.interestScore || 0) - (a.interestScore || 0) ||
        (b.sortDate as any) - (a.sortDate as any)
    );

    if (suggestedCircles && suggestedCircles.length > 0) {
      const insertAt = Math.min(3, combined.length);
      return [
        ...combined.slice(0, insertAt),
        { id: "suggested-section", type: "suggested" as const },
        ...combined.slice(insertAt),
      ];
    }

    return combined;
  }, [posts, events, userInterests, suggestedCircles]);

  const loadUserInterests = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await DatabaseService.getUserInterests(user.id);
      if (!error) setUserInterests(data || []);
    } catch {}
  };

  const loadUserCircles = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await DatabaseService.getUserCircles(user.id);
      if (error) return;
      const joined = (data || [])
        .map((uc: any) => uc.circles)
        .filter(Boolean);
      setUserCircles(joined);
    } catch {}
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPostsPage(0);
    setHasMorePosts(true);
    await Promise.all([
      loadPosts(0),
      loadEvents(),
      loadUserCircles(),
      loadUserInterests(),
    ]);
    await loadSuggested();
    lastFetchRef.current = Date.now();
    setRefreshing(false);
  }, [user, loadSuggested]);

  useEffect(() => {
    if (!user) {
      setPosts([]);
      setEvents([]);
      setUserInterests([]);
      setLoading(false);
    } else if (isFirstMount.current) {
      // Trigger initial load when user becomes available after auth
      loadPosts();
      loadSuggested();
      loadEvents();
      loadUserCircles();
      loadUserInterests();
      isFirstMount.current = false;
      lastFetchRef.current = Date.now();
    }
  }, [user]);

  const formatTimeAgo = (dateString?: string | null) => {
    if (!dateString) return "Unknown time";
    const date = new Date(dateString);
    if (isNaN(+date)) return "Unknown time";
    const diffH = Math.floor((Date.now() - +date) / 36e5);
    if (diffH < 1) return "Just now";
    if (diffH < 24) return `${diffH}h ago`;
    const d = Math.floor(diffH / 24);
    if (d < 7) return `${d}d ago`;
    return date.toLocaleDateString();
  };

  // ====== اختيار صورة مع تحقق الصيغة ======
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Allow photo library access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.9,
    });
    if (result.canceled) return;

    const asset = result.assets?.[0];
    if (!isAllowedImageAsset(asset)) {
      showUnsupportedAlert();
      return;
    }

    setSelectedPostImage(asset!);
  };

  const pendingLikes = React.useRef<Set<string>>(new Set());

  const handleLikePost = async (postId: string) => {
    if (!user?.id) return Alert.alert("Error", "Login first");
    if (pendingLikes.current.has(postId)) return; // prevent double-tap

    const i = posts.findIndex((p) => p.id === postId);
    if (i === -1) return;
    const original = [...posts];
    const p = posts[i];
    const next = [...posts];
    next[i] = {
      ...p,
      userLiked: !p.userLiked,
      likes_count: (p.likes_count || 0) + (p.userLiked ? -1 : 1),
    };
    setPosts(next);

    pendingLikes.current.add(postId);
    const { error } = p.userLiked
      ? await DatabaseService.unlikePost(postId, user.id)
      : await DatabaseService.likePost(postId, user.id);
    pendingLikes.current.delete(postId);

    if (error) {
      setPosts(original);
      Alert.alert("Error", "Failed to update like");
    }
  };

  // ====== إنشاء بوست مع تحقق الصيغة قبل الرفع ======
  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !selectedCircle) {
      Alert.alert("Error", "Content & circle required");
      return;
    }
    if (!user?.id) {
      Alert.alert("Error", "Login first");
      return;
    }
    if (selectedPostImage && !isAllowedImageAsset(selectedPostImage)) {
      showUnsupportedAlert();
      return;
    }

    try {
      // Optimize image before upload (resize to 1080px max, 80% quality JPEG)
      const optimizedImage = selectedPostImage
        ? await optimizeImageForUpload(selectedPostImage)
        : undefined;

      const { error } = await DatabaseService.createPost(
        {
          userid: user.id,
          content: newPostContent.trim(),
          circleid: selectedCircle,
        },
        optimizedImage
      );

      if (error) {
        Alert.alert("Error", error.message || "Failed to create post");
        return;
      }

      setShowPostModal(false);
      setNewPostContent("");
      setSelectedCircle("");
      setSelectedPostImage(null);
      await loadPosts();
    } catch {
      Alert.alert("Error", "Failed to create post");
    }
  };

  const handleEditPostStart = (postId: string, current: string) => {
    setEditingPost({ id: postId });
    setEditPostContent(current);
  };

  const handleSaveEdit = async () => {
    if (!editingPost || !editPostContent.trim() || !user?.id) return;
    const post = posts.find((p) => p.id === editingPost.id);
    if (!isOwner(post)) return Alert.alert("Error", "Not allowed");
    const { error } = await DatabaseService.updatePost(
      editingPost.id,
      { content: editPostContent.trim() },
      user.id
    );
    if (error) return Alert.alert("Error", "Failed to update post");
    setEditingPost(null);
    setEditPostContent("");
    await loadPosts();
  };

  const handleDeletePost = async (postId: string) => {
    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to delete posts");
      return;
    }
    setPostToDelete(postId);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete || !user?.id) return;
    try {
      setDeletePostLoading(postToDelete);
      setShowDeleteConfirmModal(false);
      const { error } = await DatabaseService.deletePost(
        postToDelete,
        user.id
      );
      if (error) {
        Alert.alert("Error", error.message || "Failed to delete post");
        return;
      }
      setPosts((prevPosts) =>
        prevPosts.filter((post) => post.id !== postToDelete)
      );
      Alert.alert("Success", "Post deleted successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to delete post");
    } finally {
      setDeletePostLoading(null);
      setPostToDelete(null);
    }
  };

  const pendingJoins = React.useRef<Set<string>>(new Set());

  const handleJoinSuggestedCircle = async (circleId: string) => {
    if (!user?.id) return Alert.alert("Error", "Login first");
    if (pendingJoins.current.has(circleId)) return; // prevent double-tap

    const circleToJoinAndDismiss = suggestedCircles.find(
      (c) => c.id === circleId
    );
    if (!circleToJoinAndDismiss) {
      console.error("Circle not found in suggestions list");
      return;
    }

    pendingJoins.current.add(circleId);
    const { error } = await DatabaseService.joinCircle(user.id, circleId);
    pendingJoins.current.delete(circleId);

    if (error) {
      if (error.message?.includes("private")) {
      } else {
        Alert.alert("Error", error.message);
      }
      return;
    }

    Alert.alert("Success", "Joined circle");

    dismiss(circleToJoinAndDismiss);

    await loadUserCircles();
  };

  const handleEditEventStart = (event: any) => {
    setEditingEvent(event);
    setEventModalVisible(true);
  };
  const handleEventSave = (savedEvent: any) => {
    if (editingEvent) {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === savedEvent.id ? savedEvent : event
        )
      );
    } else {
      setEvents((prevEvents) => [savedEvent, ...prevEvents]);
    }
  };

  const filteredFeed = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return feedItems;
    return feedItems.filter((item: any) => {
      if (item.type === "post") {
        const content = String(item.content || "").toLowerCase();
        const circle = String(item.circle?.name || "").toLowerCase();
        return content.includes(q) || circle.includes(q);
      } else if (item.type === "event") {
        const title = String(item.title || "").toLowerCase();
        const desc = String(item.description || "").toLowerCase();
        const circle = String(
          item.circle?.name || item.circleName || ""
        ).toLowerCase();
        return title.includes(q) || desc.includes(q) || circle.includes(q);
      }
      return true;
    });
  }, [feedItems, debouncedQuery]);

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.centeredContainer}>
          <IconSymbol name="person.circle" size={64} color={SUBTLE} />
          <ThemedText style={styles.emptyText}>
            Please log in to see posts
          </ThemedText>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: tintColor }]}
            onPress={() => router.push("/login")}
          >
            <ThemedText style={styles.primaryBtnText}>
              {texts.login || "Login"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={[styles.appHeader]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <ThemedText type="title" style={[styles.brand, { color: tintColor }]}>
            Sircles
          </ThemedText>
          <View style={{ backgroundColor: tintColor, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
            <ThemedText style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>v2</ThemedText>
          </View>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => setShowSearch((s) => !s)}>
            <IconSymbol name="magnifyingglass" size={22} color={TEXT} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(tabs)/messages")}>
            <IconSymbol name="bubble.left.fill" size={22} color={TEXT} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowPostModal(true)}>
            <IconSymbol name="plus.circle" size={22} color={TEXT} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Collapsible search bar */}
      {showSearch && (
        <View style={[styles.searchWrap, { borderColor: BORDER }]}>
          <IconSymbol name="magnifyingglass" size={18} color={SUBTLE} />
          <TextInput
            style={[styles.searchInput, { color: TEXT }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Search posts and events..."
            placeholderTextColor={SUBTLE}
            autoFocus
            returnKeyType="search"
          />
          {!!query && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <IconSymbol name="xmark.circle.fill" size={18} color={SUBTLE} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {loading ? (
        <FeedSkeleton />
      ) : error ? (
        <View style={[styles.content, styles.centeredContainer]}>
          <IconSymbol
            name="exclamationmark.triangle"
            size={64}
            color="#EF5350"
          />
          <ThemedText style={styles.emptyText}>{error}</ThemedText>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: tintColor }]}
            onPress={() => {
              loadPosts();
              loadEvents();
            }}
          >
            <ThemedText style={styles.primaryBtnText}>
              {texts.retry || "Retry"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          style={styles.content}
          data={filteredFeed}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={({ item }) =>
            item.type === "post" ? (
              <PostCard
                post={item}
                isOwner={isOwner(item)}
                canLike={!!user}
                onLike={handleLikePost}
                onMenu={(id) => setMenuFor({ type: "post", id })}
                formatTimeAgo={formatTimeAgo}
              />
            ) : item.type === "event" ? (
              <EventCard
                event={item}
                isOwner={item.createdby === user?.id}
                onMenu={(id) => setMenuFor({ type: "event", id })}
                formatTimeAgo={formatTimeAgo}
                formatTime={formatTo12Hour}
              />
            ) : (
              <SuggestedCirclesSection
                suggestedCircles={suggestedCircles}
                onJoin={handleJoinSuggestedCircle}
                onDismiss={dismiss as any}
                onSnooze={snooze as any}
              />
            )
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.centeredContainer}>
              <ThemedText style={styles.emptyText}>
                No posts or events yet
              </ThemedText>
            </View>
          }
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <ActivityIndicator size="small" color={tintColor} />
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Three-dots Menu */}
      <Modal
        visible={!!menuFor}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuFor(null)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuFor(null)}
        >
          <View
            style={[
              styles.menuSheet,
              { backgroundColor: SURFACE, borderColor: BORDER },
            ]}
          >
            {menuFor?.type === "post" &&
              (() => {
                const p = posts.find((x) => x.id === menuFor.id) || null;
                const owner = isOwner(p);
                return owner ? (
                  <>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        if (p) handleEditPostStart(p.id, p.content || "");
                        setMenuFor(null);
                      }}
                    >
                      <IconSymbol name="pencil" size={18} color={TEXT} />
                      <ThemedText
                        style={[styles.menuText, { color: "#000000ff" }]}
                      >
                        Edit
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        handleDeletePost(menuFor!.id);
                        setMenuFor(null);
                      }}
                    >
                      <IconSymbol name="trash" size={18} color="#EF4444" />
                      <ThemedText
                        style={[styles.menuText, { color: "#EF4444" }]}
                        onPress={confirmDeletePost}
                      >
                        Delete
                      </ThemedText>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
                    <ThemedText style={{ color: SUBTLE }}>
                      No actions available
                    </ThemedText>
                  </View>
                );
              })()}
            {menuFor?.type === "event" &&
              (() => {
                const event = events.find((e) => e.id === menuFor.id);
                const owner = event?.createdby === user?.id;
                return owner ? (
                  <>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        handleEditEventStart(event);
                        setMenuFor(null);
                      }}
                    >
                      <IconSymbol name="pencil" size={18} color={TEXT} />
                      <ThemedText
                        style={[styles.menuText, { color: "#000000ff" }]}
                      >
                        Edit Event
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => {
                        setMenuFor(null);
                        handleDeleteEvent(String(event.id)); // ✅ يستخدم الدالة المعدّلة
                      }}
                    >
                      <IconSymbol name="trash" size={18} color="#EF4444" />
                      <ThemedText
                        style={[styles.menuText, { color: "#EF4444" }]}
                      >
                        Delete Event
                      </ThemedText>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
                    <ThemedText style={{ color: SUBTLE }}>
                      No actions available
                    </ThemedText>
                  </View>
                );
              })()}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Create Post Modal */}
      <Modal
        visible={showPostModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
          <View
            style={[
              styles.modalHeader,
              { backgroundColor: surfaceColor, borderBottomColor: BORDER },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                setShowPostModal(false);
                setSelectedPostImage(null);
                setNewPostContent("");
                setSelectedCircle("");
              }}
            >
              <ThemedText style={[styles.cancelButton, { color: tintColor }]}>
                Cancel
              </ThemedText>
            </TouchableOpacity>
            <ThemedText style={[styles.modalTitle, { color: TEXT }]}>
              Create Post
            </ThemedText>
            <TouchableOpacity
              onPress={handleCreatePost}
              disabled={!newPostContent.trim() || !selectedCircle}
            >
              <ThemedText
                style={[
                  styles.saveButton,
                  {
                    color:
                      newPostContent.trim() && selectedCircle
                        ? tintColor
                        : SUBTLE,
                  },
                ]}
              >
                Post
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.inputSection}>
              <ThemedText style={[styles.inputLabel, { color: TEXT }]}>
                Select Circle:
              </ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {userCircles.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      styles.circlePill,
                      {
                        borderColor: tintColor,
                        backgroundColor:
                          selectedCircle === c.id ? tintColor : SURFACE,
                      },
                    ]}
                    onPress={() => setSelectedCircle(c.id)}
                  >
                    <ThemedText
                      style={[
                        styles.circlePillTxt,
                        { color: selectedCircle === c.id ? "#fff" : textColor },
                      ]}
                    >
                      {c.name}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputSection}>
              <ThemedText style={[styles.inputLabel, { color: TEXT }]}>
                What is on your mind?
              </ThemedText>
              <TextInput
                style={[
                  styles.postInput,
                  {
                    backgroundColor: SURFACE,
                    color: TEXT,
                    borderColor: BORDER,
                  },
                ]}
                value={newPostContent}
                onChangeText={setNewPostContent}
                placeholder="Share your thoughts..."
                placeholderTextColor={SUBTLE}
                multiline
                numberOfLines={25}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputSection}>
              <ThemedText style={[styles.inputLabel, { color: TEXT }]}>
                Add Photo:
              </ThemedText>
              <TouchableOpacity
                onPress={pickImage}
                style={[
                  styles.imagePicker,
                  { backgroundColor: SURFACE, borderColor: tintColor },
                ]}
              >
                {selectedPostImage ? (
                  <View style={styles.imageSelected}>
                    <Image
                      source={{ uri: selectedPostImage.uri }}
                      style={styles.image}
                    />
                    <View style={styles.imageOverlay}>
                      <IconSymbol name="photo" size={22} color="#fff" />
                      <ThemedText style={styles.imageOverlayTxt}>
                        Change Photo
                      </ThemedText>
                    </View>
                  </View>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <IconSymbol name="photo" size={28} color={tintColor} />
                    <ThemedText
                      style={[styles.imagePickerTxt, { color: tintColor }]}
                    >
                      Tap to select a photo
                    </ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Edit Post Modal */}
      <Modal
        visible={!!editingPost}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
          <View
            style={[
              styles.modalHeader,
              { backgroundColor: surfaceColor, borderBottomColor: BORDER },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                setEditingPost(null);
                setEditPostContent("");
              }}
            >
              <ThemedText style={[styles.cancelButton, { color: tintColor }]}>
                Cancel
              </ThemedText>
            </TouchableOpacity>
            <ThemedText style={[styles.modalTitle, { color: TEXT }]}>
              Edit Post
            </ThemedText>
            <TouchableOpacity
              onPress={handleSaveEdit}
              disabled={!editPostContent.trim()}
            >
              <ThemedText
                style={[
                  styles.saveButton,
                  { color: editPostContent.trim() ? tintColor : SUBTLE },
                ]}
              >
                Save
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputSection}>
              <ThemedText style={[styles.inputLabel, { color: TEXT }]}>
                Edit your post
              </ThemedText>
              <TextInput
                style={[
                  styles.postInput,
                  {
                    backgroundColor: SURFACE,
                    color: TEXT,
                    borderColor: BORDER,
                  },
                ]}
                value={editPostContent}
                onChangeText={setEditPostContent}
                placeholder="What's on your mind?"
                placeholderTextColor={SUBTLE}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                autoFocus
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      <ConfirmDialog
        visible={showDeleteConfirmModal}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        destructive
        loading={deletePostLoading === postToDelete}
        onConfirm={confirmDeletePost}
        onCancel={() => {
          setShowDeleteConfirmModal(false);
          setPostToDelete(null);
        }}
      />

      <EventModal
        visible={isEventModalVisible}
        onClose={() => {
          setEventModalVisible(false);
          setEditingEvent(null);
        }}
        onEventCreated={handleEventSave}
        editingEvent={editingEvent}
        circles={userCircles}
      />
    </SafeAreaView>
  );
}


/* Styles */
const styles = StyleSheet.create({
  container: { flex: 1 },

  appHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { fontSize: 28, fontWeight: "800" },
  headerIcons: { flexDirection: "row", gap: 16 },

  // Search bar
  searchWrap: {
    marginHorizontal: 12,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14 },

  content: { flex: 1, paddingHorizontal: 12, paddingBottom: 16 },

  /* Card */
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginBottom: 14,
    overflow: "hidden",
  },
  cardHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  avatarImg: { width: 36, height: 36, borderRadius: 18 },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontSize: 14, fontWeight: "700" },
  headerMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  headerSub: { fontSize: 12 },
  dot: { fontSize: 12, color: "#94A3B8" },
  menuBtn: { padding: 6 },

  cardBody: { paddingHorizontal: 12, paddingBottom: 12 },
  cardImage: { width: "100%", height: 190 },

  eventTitle: { fontSize: 16, fontWeight: "700", marginTop: 6 },
  eventMeta: { fontSize: 13, fontWeight: "700", marginTop: 4 },
  eventLoc: { fontSize: 13, marginTop: 6 },
  desc: { fontSize: 14, lineHeight: 22, marginTop: 6 },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: "700" },

  actionsRow: { flexDirection: "row", gap: 18, marginTop: 10 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionTxt: { fontSize: 13, color: "#6B7280" },

  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  emptyText: { opacity: 0.6, textAlign: "center" },

  /* Menus */
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  menuSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 6,
    borderTopWidth: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuText: { fontSize: 16, fontWeight: "600" },

  /* Modals */
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  cancelButton: { fontSize: 16, fontWeight: "700" },
  saveButton: { fontSize: 16, fontWeight: "700" },
  modalBody: { padding: 16 },
  modalContent: { flex: 1, padding: 16 },

  /* Inputs */
  inputSection: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  circlePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 8,
  },
  circlePillTxt: { fontSize: 12, fontWeight: "700" },
  postInput: { borderRadius: 10, padding: 12, borderWidth: 1, minHeight: 100 },
  imagePicker: {
    height: 130,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: "dashed",
    overflow: "hidden",
  },
  imageSelected: { width: "100%", height: "100%", position: "relative" },
  image: { width: "100%", height: "100%" },
  imageOverlay: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  imageOverlayTxt: { color: "#fff", fontSize: 12, fontWeight: "700" },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  imagePickerTxt: { fontSize: 13, fontWeight: "700" },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteModalContent: {
    width: "85%",
    maxWidth: 300,
    borderRadius: 16,
    overflow: "hidden",
  },
  deleteModalHeader: {
    padding: 20,
    paddingBottom: 16,
    alignItems: "center",
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  deleteModalBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  deleteModalMessage: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.8,
  },
  deleteModalFooter: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  cancelDeleteButton: {
    borderWidth: 1,
    borderColor: "#ddd",
  },
  /* Buttons */
  primaryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
});
