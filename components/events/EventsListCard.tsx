import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";

interface EventInterest {
  interests: { id: string; title: string; category: string };
}

interface EventListData {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location: string;
  location_url?: string;
  circleid?: string;
  circleName?: string;
  photo_url?: string;
  going_count?: number;
  maybe_count?: number;
  not_going_count?: number;
  userRsvpStatus?: "going" | "maybe" | "not_going" | null;
  event_interests?: EventInterest[];
}

const COLORS = {
  primary: "#198F4B",
  bg: "#FFFFFF",
  subtle: "#6B7280",
  warning: "#F59E0B",
  danger: "#EF4444",
};

interface Props {
  event: EventListData;
  isRTL: boolean;
  isDeletable: boolean;
  isRsvpPending?: boolean;
  onPress: (event: EventListData) => void;
  onEdit: (event: EventListData) => void;
  onDelete: (eventId: string) => void;
  onRsvp: (eventId: string, status: "going" | "maybe" | "not_going") => void;
}

/**
 * Card used on the Events tab list (different from CircleEventCard which
 * is shown inside circle detail). Has tap-to-open, deletable actions
 * overlay, and the canonical RSVP triplet.
 */
export function EventsListCard({
  event,
  isRTL,
  isDeletable,
  isRsvpPending,
  onPress,
  onEdit,
  onDelete,
  onRsvp,
}: Props) {
  const showImage = !!event.photo_url;
  const interests = event.event_interests || [];
  const firstTwo = interests.slice(0, 2);
  const moreCount = Math.max(0, interests.length - 2);

  const renderRsvpButton = (
    status: "going" | "maybe" | "not_going",
    label: string,
    count: number,
    color: string,
    icon: string
  ) => {
    const active = event.userRsvpStatus === status;
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${count}`}
        accessibilityState={{ selected: active, disabled: !!isRsvpPending }}
        style={[
          styles.rsvpBtn,
          {
            borderColor: color,
            backgroundColor: active ? color : COLORS.bg,
          },
          isRsvpPending && { opacity: 0.6 },
        ]}
        onPress={() => onRsvp(event.id, status)}
        disabled={isRsvpPending}
      >
        <IconSymbol
          name={icon as any}
          size={16}
          color={active ? "#fff" : color}
        />
        <ThemedText style={[styles.rsvpText, { color: active ? "#fff" : color }]}>
          {label} ({count})
        </ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Event: ${event.title}${event.circleName ? `, in ${event.circleName}` : ""}`}
      accessibilityHint="Opens event details"
      style={styles.card}
      onPress={() => onPress(event)}
    >
      {showImage && (
        <Image
          source={{ uri: event.photo_url! }}
          style={styles.cardImage}
          contentFit="cover"
        />
      )}

      <View style={[styles.cardBody, !showImage && styles.cardBodyRounded]}>
        {firstTwo.length > 0 && (
          <View style={styles.interestsRow}>
            {firstTwo.map((ei, idx) => (
              <View
                key={idx}
                style={[styles.pill, { backgroundColor: COLORS.primary }]}
              >
                <ThemedText style={styles.pillText}>
                  {ei.interests.title}
                </ThemedText>
              </View>
            ))}
            {moreCount > 0 && (
              <ThemedText style={styles.moreInterests}>
                +{moreCount} more
              </ThemedText>
            )}
          </View>
        )}

        <ThemedText
          type="defaultSemiBold"
          style={[styles.title, isRTL && styles.rtl]}
        >
          {event.title}
        </ThemedText>
        {event.description?.trim() && (
          <ThemedText style={styles.eventDescription}>
            {event.description}
          </ThemedText>
        )}

        {event.circleid ? (
          event.circleName && (
            <ThemedText style={[styles.metaSmall, { color: COLORS.subtle }]}>
              • {event.circleName}
            </ThemedText>
          )
        ) : (
          <ThemedText style={[styles.metaSmall, { color: COLORS.subtle }]}>
            • General
          </ThemedText>
        )}

        <View style={styles.metaRow}>
          <IconSymbol name="calendar" size={16} color={COLORS.subtle} />
          <ThemedText style={[styles.metaText, { color: COLORS.subtle }]}>
            {event.date}
          </ThemedText>
          <IconSymbol name="clock" size={16} color={COLORS.subtle} />
          <ThemedText style={[styles.metaText, { color: COLORS.subtle }]}>
            {event.time}
          </ThemedText>
        </View>
        <View style={styles.metaRow}>
          <IconSymbol name="location" size={16} color={COLORS.subtle} />
          {event.location_url ? (
            <TouchableOpacity
              accessibilityRole="link"
              accessibilityLabel={`Open location: ${event.location}`}
              onPress={() => Linking.openURL(event.location_url!)}
            >
              <ThemedText
                style={[
                  styles.metaText,
                  { color: COLORS.primary, textDecorationLine: "underline" },
                ]}
              >
                {event.location}
              </ThemedText>
            </TouchableOpacity>
          ) : (
            <ThemedText style={[styles.metaText, { color: COLORS.subtle }]}>
              {event.location || "no location"}
            </ThemedText>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.rsvpButtons}>
          {renderRsvpButton(
            "going",
            "Going",
            event.going_count || 0,
            COLORS.primary,
            "checkmark.circle.fill"
          )}
          {renderRsvpButton(
            "maybe",
            "Maybe",
            event.maybe_count || 0,
            COLORS.warning,
            "star.fill"
          )}
          {renderRsvpButton(
            "not_going",
            "Cannot Go",
            event.not_going_count || 0,
            COLORS.danger,
            "xmark.circle.fill"
          )}
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="View event details"
          onPress={() => onPress(event)}
          style={styles.moreLinkWrap}
        >
          <ThemedText style={[styles.moreLink, { color: COLORS.primary }]}>
            For more details ›
          </ThemedText>
        </TouchableOpacity>
      </View>

      {isDeletable && (
        <View style={styles.cardActions}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Edit event"
            style={styles.iconBtn}
            onPress={() => onEdit(event)}
          >
            <IconSymbol name="pencil" size={16} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Delete event"
            accessibilityHint="Permanently deletes this event"
            style={styles.iconBtn}
            onPress={() => onDelete(event.id)}
          >
            <IconSymbol name="trash" size={16} color="#ff4444" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardImage: { width: "100%", height: 180 },
  cardBody: { padding: 14 },
  cardBodyRounded: { borderRadius: 12 },
  interestsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pillText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  moreInterests: { fontSize: 11, color: "#6B7280", fontWeight: "600" },
  title: { fontSize: 16, marginBottom: 4 },
  rtl: { textAlign: "right" },
  eventDescription: { fontSize: 13, color: "#475569", lineHeight: 18, marginBottom: 6 },
  metaSmall: { fontSize: 12, marginBottom: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  metaText: { fontSize: 12 },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 10 },
  rsvpButtons: { flexDirection: "row", gap: 6 },
  rsvpBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 8,
  },
  rsvpText: { fontSize: 11, fontWeight: "700" },
  moreLinkWrap: { alignItems: "flex-end", marginTop: 8 },
  moreLink: { fontSize: 12, fontWeight: "700" },
  cardActions: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 8,
    padding: 2,
  },
  iconBtn: { padding: 6 },
});
