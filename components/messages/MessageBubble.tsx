import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName?: string;
  timestamp: string;
  type: string;
  attachment?: string;
}

interface Props {
  message: Message;
  mine: boolean;
  isRTL: boolean;
  formatTime: (ts: string) => string;
  colors: {
    me: string;
    other: string;
    textDark: string;
    textLight: string;
  };
}

export function MessageBubble({
  message,
  mine,
  isRTL,
  formatTime,
  colors,
}: Props) {
  return (
    <View
      style={[
        styles.messageRow,
        mine ? styles.rowRight : styles.rowLeft,
        isRTL && (mine ? styles.rowLeft : styles.rowRight),
      ]}
    >
      <View
        style={[
          styles.bubble,
          mine
            ? { backgroundColor: colors.me }
            : { backgroundColor: colors.other },
          mine
            ? {
                borderTopRightRadius: 6,
                borderTopLeftRadius: 18,
                borderBottomLeftRadius: 18,
                marginLeft: 40,
              }
            : {
                borderTopLeftRadius: 6,
                borderTopRightRadius: 18,
                borderBottomRightRadius: 18,
                marginRight: 40,
              },
        ]}
      >
        {!mine && (
          <ThemedText style={[styles.senderName, { color: colors.me }]}>
            {message.senderName}
          </ThemedText>
        )}
        <ThemedText
          style={[
            styles.msgText,
            { color: mine ? colors.textLight : colors.textDark },
            isRTL && styles.rtlText,
          ]}
        >
          {message.content}
        </ThemedText>
        <ThemedText
          style={[
            styles.time,
            { color: mine ? colors.textLight : "#6B7280" },
            isRTL && styles.rtlText,
          ]}
        >
          {formatTime(message.timestamp)}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  messageRow: { marginVertical: 4, flexDirection: "row" },
  rowRight: { justifyContent: "flex-end" },
  rowLeft: { justifyContent: "flex-start" },
  bubble: { maxWidth: "78%", paddingHorizontal: 12, paddingVertical: 8 },
  senderName: { fontSize: 11, fontWeight: "600", marginBottom: 2 },
  msgText: { fontSize: 15, lineHeight: 20 },
  time: { fontSize: 10, marginTop: 4, alignSelf: "flex-end", opacity: 0.9 },
  rtlText: { textAlign: "right" },
});
