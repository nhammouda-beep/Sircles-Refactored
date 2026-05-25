import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { feedStyles, FEED_COLORS } from "./feedStyles";

interface EventCardData {
  id: string;
  title?: string | null;
  description?: string | null;
  date?: string | null;
  time?: string | null;
  location?: string | null;
  creationdate?: string | null;
  createdby?: string | null;
  photo_url?: string | null;
  image?: string | null;
  circle?: { name?: string | null } | null;
  circleName?: string | null;
  event_interests?: Array<{ interests?: { id?: string; title?: string } }>;
}

interface Props {
  event: EventCardData;
  isOwner: boolean;
  onMenu: (eventId: string) => void;
  formatTimeAgo: (dateString?: string | null) => string;
  formatTime: (timeString?: string) => string;
}

export function EventCard({
  event,
  isOwner,
  onMenu,
  formatTimeAgo,
  formatTime,
}: Props) {
  return (
    <View style={[feedStyles.card, { backgroundColor: FEED_COLORS.surface }]}>
      <View style={feedStyles.cardHeader}>
        <View style={feedStyles.headerLeft}>
          <View
            style={[
              feedStyles.avatarCircle,
              { backgroundColor: FEED_COLORS.primary + "26" },
            ]}
          >
            <IconSymbol name="calendar" size={18} color={FEED_COLORS.primary} />
          </View>
          <View style={feedStyles.headerTextWrap}>
            <ThemedText style={[feedStyles.headerTitle, { color: FEED_COLORS.text }]}>
              {event.circle?.name || event.circleName || "Event"}
            </ThemedText>
            <ThemedText style={[feedStyles.headerSub, { color: FEED_COLORS.subtle }]}>
              Event • {formatTimeAgo(event.creationdate)}
            </ThemedText>
          </View>
        </View>
        {isOwner && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Event options"
            accessibilityHint="Opens menu with event actions"
            onPress={() => onMenu(event.id)}
            style={feedStyles.menuBtn}
          >
            <IconSymbol name="ellipsis" size={20} color={FEED_COLORS.subtle} />
          </TouchableOpacity>
        )}
      </View>

      {(event.photo_url || event.image) && (
        <Image
          source={{ uri: (event.photo_url || event.image) as string }}
          style={feedStyles.cardImage}
        />
      )}
      <View style={feedStyles.cardBody}>
        <ThemedText
          style={[feedStyles.eventTitle, { color: FEED_COLORS.text, fontWeight: "800" }]}
        >
          {event.title || "Untitled Event"}
        </ThemedText>
        <ThemedText style={[feedStyles.eventMeta, { color: FEED_COLORS.primary }]}>
          📅 {event.date ? new Date(event.date).toLocaleDateString() : "TBD"} •{" "}
          {formatTime(event.time || undefined) || "TBD"}
        </ThemedText>
        {event.description ? (
          <ThemedText style={[feedStyles.desc, { color: FEED_COLORS.text }]}>
            {event.description}
          </ThemedText>
        ) : null}
        {event.location ? (
          <ThemedText style={[feedStyles.eventLoc, { color: FEED_COLORS.subtle }]}>
            📍 {event.location}
          </ThemedText>
        ) : null}

        {event.event_interests?.length ? (
          <View style={feedStyles.chipsRow}>
            {event.event_interests.map((ei, idx) => (
              <View
                key={ei.interests?.id || idx}
                style={[
                  feedStyles.chip,
                  {
                    borderColor: FEED_COLORS.primary,
                    backgroundColor: FEED_COLORS.primary + "1A",
                  },
                ]}
              >
                <ThemedText style={[feedStyles.chipText, { color: FEED_COLORS.primary }]}>
                  {ei.interests?.title}
                </ThemedText>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}
