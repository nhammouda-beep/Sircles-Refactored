import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  FlatList,
} from "react-native";
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
import { HomeCreatePostModal } from "@/components/feed/HomeCreatePostModal";
import { ActionMenu, type ActionMenuItem } from "@/components/feed/ActionMenu";
import { EditPostModal } from "@/components/EditPostModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useSirclesTheme } from "@/contexts/ThemeContext";

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
  const { palette } = useSirclesTheme();

  // theme — pulled from ThemeContext (light/dark aware)
  const PRIMARY = palette.primary;
  const SURFACE = palette.surface;
  const BG = palette.bg;
  const TEXT = palette.text;
  const SUBTLE = palette.subtle;
  const BORDER = palette.border;

  const tintColor = PRIMARY;
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

      <ActionMenu
        visible={!!menuFor}
        items={(() => {
          if (!menuFor) return [];
          if (menuFor.type === "post") {
            const p = posts.find((x) => x.id === menuFor.id) || null;
            if (!isOwner(p)) return [];
            const items: ActionMenuItem[] = [
              {
                label: "Edit",
                icon: "pencil",
                onPress: () => p && handleEditPostStart(p.id, p.content || ""),
              },
              {
                label: "Delete",
                icon: "trash",
                color: "#EF4444",
                onPress: () => handleDeletePost(menuFor.id),
              },
            ];
            return items;
          }
          const event = events.find((e) => e.id === menuFor.id);
          if (event?.createdby !== user?.id || !event) return [];
          const items: ActionMenuItem[] = [
            {
              label: "Edit Event",
              icon: "pencil",
              onPress: () => handleEditEventStart(event),
            },
            {
              label: "Delete Event",
              icon: "trash",
              color: "#EF4444",
              onPress: () => handleDeleteEvent(String(event.id)),
            },
          ];
          return items;
        })()}
        surfaceColor={SURFACE}
        borderColor={BORDER}
        textColor={TEXT}
        subtleColor={SUBTLE}
        onClose={() => setMenuFor(null)}
      />

      {/* Create Post Modal */}
      <HomeCreatePostModal
        visible={showPostModal}
        backgroundColor={backgroundColor}
        surfaceColor={SURFACE}
        textColor={TEXT}
        borderColor={BORDER}
        tintColor={tintColor}
        subtleColor={SUBTLE}
        userCircles={userCircles}
        selectedCircle={selectedCircle}
        onSelectCircle={setSelectedCircle}
        content={newPostContent}
        onContentChange={setNewPostContent}
        selectedImage={selectedPostImage}
        onPickImage={pickImage}
        onSubmit={handleCreatePost}
        onClose={() => {
          setShowPostModal(false);
          setSelectedPostImage(null);
          setNewPostContent("");
          setSelectedCircle("");
        }}
      />

      <EditPostModal
        visible={!!editingPost}
        backgroundColor={backgroundColor}
        surfaceColor={SURFACE}
        textColor={TEXT}
        tintColor={tintColor}
        borderColor={BORDER}
        content={editPostContent}
        onContentChange={setEditPostContent}
        onSave={handleSaveEdit}
        onCancel={() => {
          setEditingPost(null);
          setEditPostContent("");
        }}
      />

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

  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  emptyText: { opacity: 0.6, textAlign: "center" },

  /* Buttons */
  primaryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  primaryBtnText: { color: "#fff", fontWeight: "700" },
});
