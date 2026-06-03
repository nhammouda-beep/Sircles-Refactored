import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useFigmaTheme } from "@/theme/useFigmaTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/database";
import { getNavigationTarget } from "@/lib/notifications";
import { router } from "expo-router";

interface Notification {
  id: string;
  type: string;
  content: string;
  read: boolean;
  creationdate: string;
  linkedItemId?: string;
  linkedItemType?: string;
}

type Category = "all" | "event" | "interactions";

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { texts, isRTL } = useLanguage();
  const { palette, spacing, radii, type, shadow } = useFigmaTheme();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [category, setCategory] = useState<Category>("all");

  const getCategoryForType = (
    t: string
  ): "event" | "interactions" | "announcement" => {
    const x = (t || "").toLowerCase();
    if (x.includes("event") || x === "event") return "event";
    if (x.includes("like") || x.includes("comment") || x.includes("message"))
      return "interactions";
    return "announcement";
  };

  const unreadCounts = {
    event: notifications.filter(
      (n) => !n.read && getCategoryForType(n.type) === "event"
    ).length,
    interactions: notifications.filter(
      (n) => !n.read && getCategoryForType(n.type) === "interactions"
    ).length,
  };

  const loadNotifications = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data, error } = await getUserNotifications(user.id);
      if (error) {
        Alert.alert("Error", "Failed to load notifications");
        return;
      }
      setNotifications(
        data?.map((n: any) => ({
          id: n.id,
          type: n.type || "general",
          content: n.content || "",
          read: n.read || false,
          creationdate: n.creationdate,
          linkedItemId: n.linkeditemid || undefined,
          linkedItemType: n.linkeditemtype || undefined,
        })) || []
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (id: string) => {
    const { error } = await markNotificationAsRead(id);
    if (!error)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    const { error } = await markAllNotificationsAsRead(user.id);
    if (!error)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const getIcon = (t: string) => {
    const x = (t || "").toLowerCase();
    if (x.includes("circle_join")) return "person.badge.plus";
    if (x.includes("circle_invite")) return "person.3.fill";
    if (x.includes("event")) return "calendar";
    if (x.includes("message")) return "message.fill";
    if (x.includes("like")) return "heart.fill";
    if (x.includes("comment")) return "bubble.left.fill";
    return "bell.fill";
  };

  const formatTime = (creationdate: string) => {
    const d = new Date(creationdate);
    const diffMin = (Date.now() - d.getTime()) / (1000 * 60);
    if (diffMin < 1) return texts.justNow || "Just now";
    if (diffMin < 60) return `${Math.floor(diffMin)}m`;
    const diffH = diffMin / 60;
    if (diffH < 24) return `${Math.floor(diffH)}h`;
    const diffD = diffH / 24;
    if (diffD < 7) return `${Math.floor(diffD)}d`;
    return d.toLocaleDateString();
  };

  const handlePress = async (n: Notification) => {
    if (!n.read) await handleMarkAsRead(n.id);
    const target = getNavigationTarget(n);
    if (!target) return;
    if (target.params?.tab)
      router.push(`/circle/${target.params.id}?tab=${target.params.tab}`);
    else if (target.screen === "post/[id]")
      router.push(`/post/${target.params.id}`);
    else if (target.screen === "event/[id]")
      router.push(`/event/${target.params.id}`);
  };

  const filtered = notifications.filter((n) => {
    const cat = getCategoryForType(n.type);
    const passRead = filter === "all" || !n.read;
    const passCat = category === "all" ? true : cat === category;
    return passRead && passCat;
  });
  const unreadCount = notifications.filter((n) => !n.read).length;

  const Chip = ({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        borderRadius: radii.pill,
        backgroundColor: active ? palette.primary : palette.surfaceMuted,
        borderWidth: 1,
        borderColor: active ? palette.primary : palette.border,
        marginRight: spacing.sm,
      }}
    >
      <ThemedText
        style={[
          type.smallBold,
          { color: active ? palette.primaryOn : palette.text },
        ]}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderNotification = (n: Notification) => {
    const isRead = n.read;
    return (
      <TouchableOpacity
        key={n.id}
        onPress={() => handlePress(n)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`${n.content}, ${formatTime(n.creationdate)}${
          isRead ? "" : ", unread"
        }`}
        style={[
          styles.card,
          {
            marginHorizontal: spacing.lg,
            marginBottom: spacing.md,
            borderRadius: radii.lg,
            backgroundColor: palette.surface,
            borderColor: isRead ? palette.border : palette.primary + "33",
            padding: spacing.md,
            ...shadow.sm,
          },
        ]}
      >
        <View
          style={[
            styles.cardInner,
            isRTL && { flexDirection: "row-reverse" },
          ]}
        >
          <View
            style={[
              styles.iconBubble,
              {
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: isRead
                  ? palette.surfaceMuted
                  : palette.primarySoft,
                marginRight: isRTL ? 0 : spacing.md,
                marginLeft: isRTL ? spacing.md : 0,
              },
            ]}
          >
            <IconSymbol
              name={getIcon(n.type)}
              size={18}
              color={palette.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText
              style={[
                isRead
                  ? { ...type.body, color: palette.textMuted }
                  : { ...type.bodyBold, color: palette.text },
                isRTL && { textAlign: "right" },
              ]}
            >
              {n.content}
            </ThemedText>
            <View
              style={[
                styles.metaRow,
                isRTL && { flexDirection: "row-reverse" },
              ]}
            >
              <ThemedText
                style={[type.caption, { color: palette.textSubtle }]}
              >
                {formatTime(n.creationdate)}
              </ThemedText>
              {!isRead && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: palette.primary,
                  }}
                />
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: palette.bg }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            backgroundColor: palette.bg,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <IconSymbol name="chevron.left" size={22} color={palette.text} />
        </TouchableOpacity>
        <ThemedText style={[type.h3, { color: palette.text }]}>
          {texts.notifications || "Notifications"}
        </ThemedText>
        <TouchableOpacity
          onPress={handleMarkAllAsRead}
          accessibilityRole="button"
          accessibilityLabel="Mark all as read"
        >
          <ThemedText style={[type.smallBold, { color: palette.primary }]}>
            Read all
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Tabs: All / Unread */}
      <View
        style={[
          styles.tabRow,
          {
            paddingHorizontal: spacing.lg,
            gap: spacing["2xl"],
            borderBottomColor: palette.border,
          },
        ]}
      >
        {(["all", "unread"] as const).map((k) => {
          const active = filter === k;
          const label =
            k === "all" ? texts.all || "All" : texts.unread || "Unread";
          return (
            <TouchableOpacity
              key={k}
              onPress={() => setFilter(k)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={{ paddingVertical: spacing.md }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ThemedText
                  style={[
                    type.smallBold,
                    {
                      color: active ? palette.primary : palette.textMuted,
                    },
                  ]}
                >
                  {label}
                </ThemedText>
                {k === "unread" && unreadCount > 0 && (
                  <View
                    style={{
                      marginLeft: spacing.xs,
                      paddingHorizontal: 6,
                      paddingVertical: 1,
                      borderRadius: radii.pill,
                      backgroundColor: palette.primary,
                    }}
                  >
                    <ThemedText
                      style={[
                        type.caption,
                        { color: palette.primaryOn },
                      ]}
                    >
                      {unreadCount}
                    </ThemedText>
                  </View>
                )}
              </View>
              {active && (
                <View
                  style={{
                    height: 2,
                    backgroundColor: palette.primary,
                    marginTop: spacing.sm,
                    borderRadius: 1,
                  }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Category chips */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
        }}
      >
        <Chip
          label="All"
          active={category === "all"}
          onPress={() => setCategory("all")}
        />
        <Chip
          label={`Events${unreadCounts.event ? ` (${unreadCounts.event})` : ""}`}
          active={category === "event"}
          onPress={() => setCategory("event")}
        />
        <Chip
          label={`Interactions${
            unreadCounts.interactions ? ` (${unreadCounts.interactions})` : ""
          }`}
          active={category === "interactions"}
          onPress={() => setCategory("interactions")}
        />
      </View>

      {/* List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: spacing.sm, paddingBottom: spacing["3xl"] }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {loading ? (
          <View style={styles.empty}>
            <ThemedText style={[type.body, { color: palette.textMuted }]}>
              {texts.loading || "Loading..."}
            </ThemedText>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <IconSymbol name="bell" size={56} color={palette.border} />
            <ThemedText
              style={[
                type.h3,
                {
                  color: palette.text,
                  marginTop: spacing.lg,
                  textAlign: "center",
                },
              ]}
            >
              {filter === "unread"
                ? texts.noUnreadNotifications || "All caught up"
                : texts.noNotifications || "No notifications yet"}
            </ThemedText>
            <ThemedText
              style={[
                type.small,
                {
                  color: palette.textMuted,
                  marginTop: spacing.xs,
                  textAlign: "center",
                  paddingHorizontal: spacing["3xl"],
                },
              ]}
            >
              {texts.notificationsWillAppear ||
                "Updates from your circles will appear here."}
            </ThemedText>
          </View>
        ) : (
          filtered.map(renderNotification)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  card: {
    borderWidth: 1,
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconBubble: {
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
});
