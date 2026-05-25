import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";

export interface CircleConversation {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

interface Props {
  conversation: CircleConversation;
  onPress: (id: string) => void;
  avatarBgColor: string;
  textPrimary: { color: string };
  textSecondary: { color: string };
}

const AV_SIZE = 48;

export function ConversationListItem({
  conversation,
  onPress,
  avatarBgColor,
  textPrimary,
  textSecondary,
}: Props) {
  return (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => onPress(conversation.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.chatAvatar, { backgroundColor: avatarBgColor }]}>
        <IconSymbol name="person.3.fill" size={22} color="#fff" />
      </View>
      <View style={styles.chatTextBox}>
        <ThemedText
          type="defaultSemiBold"
          style={[styles.chatTitleText, textPrimary]}
          numberOfLines={1}
        >
          {conversation.name}
        </ThemedText>
        <ThemedText
          style={[styles.chatSubtitle, textSecondary]}
          numberOfLines={1}
        >
          {conversation.lastMessage || "No messages yet"}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chatAvatar: {
    width: AV_SIZE,
    height: AV_SIZE,
    borderRadius: AV_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  chatTextBox: { flex: 1 },
  chatTitleText: { fontSize: 16, marginBottom: 2 },
  chatSubtitle: { fontSize: 13 },
});
