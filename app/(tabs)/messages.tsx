import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCircleMessages,
  getCirclesByUser,
  sendMessage,
} from "@/lib/database";
import { useDebounced } from "@/hooks/useDebounced";
import {
  ConversationListItem,
  CircleConversation,
} from "@/components/messages/ConversationListItem";
import { MessageBubble, Message } from "@/components/messages/MessageBubble";

const COLORS = {
  bg: "#F6F7FB",
  surface: "#FFFFFF",
  me: "#198F4B",
  other: "#EFEFEF",
  textDark: "#111111",
  textLight: "#FFFFFF",
  divider: "#E5E7EB",
  hint: "#9CA3AF",
  disabled: "#D1D5DB",
  pillBg: "#EAF6F0",
  pillText: "#198F4B",
};
const TEXT = {
  primary: { color: COLORS.textDark },
  secondary: { color: "#6B7280" },
};

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function MessagesScreen() {
  const { circleId } = useLocalSearchParams();
  const { user } = useAuth();
  const { texts, isRTL } = useLanguage();

  const backgroundColor = COLORS.bg;
  const surfaceColor = COLORS.surface;
  const textColor = COLORS.textDark;

  const [conversations, setConversations] = useState<CircleConversation[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query, 200);
  const filteredConversations = conversations.filter((c) =>
    c.name?.toLowerCase().includes(debouncedQuery.trim().toLowerCase())
  );

  const loadConversations = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data: userCircles, error } = await getCirclesByUser(user.id);
      if (error) {
        console.error("Error loading conversations:", error);
        setConversations([]);
        return;
      }
      const list: CircleConversation[] =
        userCircles?.map((uc: any) => ({
          id: uc.circleId,
          name: uc.circles?.name || "Circle",
          lastMessage: "No messages yet",
          lastMessageTime: "",
          unreadCount: 0,
        })) || [];
      setConversations(list);
    } catch (e) {
      console.error("Error loading conversations:", e);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (circleIdParam: string) => {
    try {
      const { data, error } = await getCircleMessages(circleIdParam);
      if (error) {
        console.error("Error loading messages:", error);
        setMessages([]);
        return;
      }
      const formatted: Message[] =
        data?.map((msg: any) => ({
          id: msg.id,
          content: msg.content || "",
          senderId: msg.senderid,
          senderName: msg.users?.name || "Unknown User",
          timestamp: msg.timestamp,
          type: msg.type || "text",
          attachment: msg.attachment || undefined,
        })) || [];
      setMessages(formatted);
    } catch (e) {
      console.error("Error loading messages:", e);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCircle || !user?.id) return;
    const content = newMessage.trim();
    setNewMessage("");
    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      content,
      senderId: user.id,
      senderName: "You",
      timestamp: new Date().toISOString(),
      type: "text",
    };
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages((prev) => [...prev, optimistic]);
    try {
      const { error } = await sendMessage({
        circleId: selectedCircle,
        senderId: user.id,
        content,
        type: "text",
      });
      if (error) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setMessages((p) => p.filter((m) => m.id !== tempId));
        setNewMessage(content);
        alert(
          String(error.message || "").includes("permission")
            ? "لا تملك صلاحية الإرسال في هذا السيركل. انضم أولًا."
            : "فشل الإرسال. حاول مجددًا."
        );
        return;
      }
      await loadMessages(selectedCircle);
    } catch (e) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMessages((p) => p.filter((m) => m.id !== tempId));
      setNewMessage(content);
      alert("فشل الإرسال. حاول مجددًا.");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    if (selectedCircle) await loadMessages(selectedCircle);
    setRefreshing(false);
  };

  useEffect(() => {
    loadConversations();
  }, [user]);
  useEffect(() => {
    if (selectedCircle) loadMessages(selectedCircle);
  }, [selectedCircle]);
  useEffect(() => {
    if (circleId && typeof circleId === "string" && conversations.length > 0) {
      const target = conversations.find((c) => c.id === circleId);
      if (target) setSelectedCircle(circleId);
    }
  }, [circleId, conversations]);

  const formatMessageTime = (ts: string) => {
    const d = new Date(ts),
      now = new Date();
    const h = (now.getTime() - d.getTime()) / 36e5;
    if (h < 24)
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (h < 168) return d.toLocaleDateString([], { weekday: "short" });
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // ===== Chats list screen =====
  if (!selectedCircle) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={[styles.listHeader, { backgroundColor: surfaceColor }]}>
          <TouchableOpacity style={styles.headerBtn}>
            <IconSymbol
              name={isRTL ? "chevron.right" : "chevron.left"}
              size={20}
              color={textColor}
            />
          </TouchableOpacity>
          <ThemedText
            type="defaultSemiBold"
            style={[styles.listTitle, TEXT.primary]}
          >
            Chats
          </ThemedText>
          <View style={styles.headerBtn} />
        </View>

        <View style={styles.searchWrap}>
          <View style={styles.searchPill}>
            <IconSymbol name="magnifyingglass" size={16} color={"#9AA3B2"} />
            <TextInput
              style={[
                styles.searchInput,
                styles.focusNone,
                { textAlign: isRTL ? "right" : "left" },
              ]}
              placeholder="Search"
              placeholderTextColor={"#A5ACB8"}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              underlineColorAndroid="transparent"
            />
          </View>
        </View>

        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ThemedText style={TEXT.secondary}>Loading...</ThemedText>
            </View>
          ) : filteredConversations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <IconSymbol name="message" size={56} color={`${textColor}33`} />
              <ThemedText style={[styles.emptyText, TEXT.secondary]}>
                No chats
              </ThemedText>
            </View>
          ) : (
            filteredConversations.map((c) => (
              <ConversationListItem
                key={c.id}
                conversation={c}
                onPress={setSelectedCircle}
                avatarBgColor={COLORS.me}
                textPrimary={TEXT.primary}
                textSecondary={TEXT.secondary}
              />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ===== Chat detail screen =====
  const selectedConversation = conversations.find(
    (c) => c.id === selectedCircle
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={[styles.chatHeader, { backgroundColor: surfaceColor }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedCircle(null)}
        >
          <IconSymbol
            name={isRTL ? "chevron.right" : "chevron.left"}
            size={20}
            color={textColor}
          />
        </TouchableOpacity>
        <ThemedText
          type="defaultSemiBold"
          style={[styles.chatTitle, TEXT.primary, isRTL && styles.rtlText]}
        >
          {selectedConversation?.name || "Chat"}
        </ThemedText>
        <TouchableOpacity style={styles.menuButton}>
          <IconSymbol name="ellipsis" size={18} color={textColor} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {messages.length === 0 ? (
            <View style={styles.emptyMessagesContainer}>
              <IconSymbol name="message" size={64} color={`${textColor}40`} />
              <ThemedText style={[styles.emptyText, TEXT.secondary]}>
                No messages yet
              </ThemedText>
            </View>
          ) : (
            messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                mine={m.senderId === user?.id}
                isRTL={isRTL}
                formatTime={formatMessageTime}
                colors={COLORS}
              />
            ))
          )}
        </ScrollView>

        {/* Input pill */}
        <View style={styles.inputBar}>
          <View style={styles.pill}>
            <TextInput
              style={[
                styles.pillInput,
                styles.focusNone,
                (Platform.select as any)({
                  android: styles.vCenterAndroid,
                  ios: styles.vCenterIOS,
                  web: styles.vCenterWeb,
                }),
                { textAlign: isRTL ? "right" : "left" },
              ]}
              placeholder={texts.typeMessage || "Type a message..."}
              placeholderTextColor={COLORS.pillText + "AA"}
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              numberOfLines={1}
              maxLength={500}
              selectionColor={COLORS.pillText}
              underlineColorAndroid="transparent"
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!newMessage.trim()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={[
                styles.pillIconBtn,
                { opacity: newMessage.trim() ? 1 : 0.4 },
              ]}
            >
              <IconSymbol
                name="paperplane.fill"
                size={18}
                color={COLORS.pillText}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const PILL_H = 55;
const SHIFT = 15;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  focusNone: Platform.select({
    web: {},
    default: {},
  }),

  // Chats list header
  listHeader: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.divider,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  listTitle: { flex: 1, textAlign: "center", fontSize: 18 },

  // Search
  searchWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF1F7",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    padding: 0,
    fontSize: 15,
    color: COLORS.textDark,
    borderWidth: 0,
  },

  // Chats list
  listContainer: { flex: 1 },

  // Chat detail header
  chatHeader: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.divider,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  chatTitle: { flex: 1, textAlign: "center", fontSize: 16 },

  // Messages
  chatContainer: { flex: 1 },
  messagesContainer: { flex: 1, paddingHorizontal: 12, paddingTop: 8 },

  // Input pill
  inputBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "transparent",
    borderTopWidth: 0,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.pillBg,
    borderRadius: 24,
    paddingHorizontal: 14,
    height: PILL_H,
  },
  pillInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textDark,
    paddingVertical: 0,
    marginRight: 8,
    height: PILL_H,
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  vCenterAndroid: { textAlignVertical: "center" },
  vCenterIOS: { paddingTop: SHIFT },
  vCenterWeb: { paddingTop: SHIFT },

  pillIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 8,
  },
  emptyMessagesContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: { fontSize: 16, fontWeight: "600", textAlign: "center" },

  rtlText: { textAlign: "right" },
});
