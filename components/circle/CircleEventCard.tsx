import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { CIRCLE_COLORS } from "./circleCardStyles";

interface CircleEvent {
  id: string;
  title?: string;
  date?: string;
  time?: string;
  location?: string;
  location_url?: string | null;
  description?: string;
  photo_url?: string | null;
  createdby?: string;
  creator?: { name?: string };
  event_interests?: Array<{ interests: { id: string; title: string } }>;
  going_count?: number;
  maybe_count?: number;
  no_going_count?: number;
  user_rsvp?: Array<{ status: "going" | "maybe" | "not_going" }>;
}

interface Props {
  event: CircleEvent;
  surfaceColor: string;
  backgroundColor: string;
  successColor: string;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (event: CircleEvent) => void;
  onDelete: (eventId: string) => void;
  onRsvp: (eventId: string, status: "going" | "maybe" | "not_going") => void;
}

export function CircleEventCard({
  event,
  surfaceColor,
  backgroundColor,
  successColor,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onRsvp,
}: Props) {
  const currentStatus = event.user_rsvp?.[0]?.status;

  const renderRsvpButton = (
    status: "going" | "maybe" | "not_going",
    label: string,
    count: number,
    color: string,
    icon: string
  ) => {
    const active = currentStatus === status;
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${count}`}
        accessibilityState={{ selected: active }}
        style={[
          styles.rsvpButton,
          {
            backgroundColor: active ? color : backgroundColor,
            borderColor: color,
          },
        ]}
        onPress={() => onRsvp(event.id, status)}
      >
        <IconSymbol name={icon as any} size={14} color={active ? "#fff" : color} />
        <ThemedText
          style={[styles.rsvpButtonText, { color: active ? "#fff" : color }]}
        >
          {label} ({count})
        </ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.eventCard,
        { backgroundColor: surfaceColor, borderColor: CIRCLE_COLORS.border },
      ]}
    >
      <View style={styles.eventHeader}>
        <View style={styles.eventInfo}>
          <ThemedText style={styles.eventTitle}>{event.title}</ThemedText>
          <ThemedText style={styles.eventDate}>
            {event.date && new Date(event.date).toLocaleDateString()} at {event.time}
          </ThemedText>
          {event.location && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ThemedText style={styles.eventLocation}>📍 </ThemedText>
              {event.location_url ? (
                <TouchableOpacity
                  accessibilityRole="link"
                  accessibilityLabel={`Open location: ${event.location}`}
                  onPress={() => Linking.openURL(event.location_url!)}
                >
                  <ThemedText
                    style={[
                      styles.eventLocation,
                      { color: "#0EA5E9", textDecorationLine: "underline" },
                    ]}
                  >
                    {event.location}
                  </ThemedText>
                </TouchableOpacity>
              ) : (
                <ThemedText style={styles.eventLocation}>{event.location}</ThemedText>
              )}
            </View>
          )}
        </View>
        <View style={styles.eventActions}>
          {canEdit && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Edit event"
              style={styles.actionButton}
              onPress={() => onEdit(event)}
            >
              <IconSymbol name="pencil" size={18} color={CIRCLE_COLORS.primary} />
            </TouchableOpacity>
          )}
          {canDelete && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Delete event"
              accessibilityHint="Permanently deletes this event"
              style={styles.actionButton}
              onPress={() => onDelete(event.id)}
            >
              <IconSymbol name="trash" size={18} color={CIRCLE_COLORS.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {event.photo_url && (
        <Image
          source={{ uri: event.photo_url }}
          style={styles.eventPhoto}
          contentFit="cover"
        />
      )}

      {event.description && (
        <ThemedText style={styles.eventDescription}>{event.description}</ThemedText>
      )}

      {event.event_interests && event.event_interests.length > 0 && (
        <View style={styles.eventInterests}>
          {event.event_interests.map((ei) => (
            <View
              key={ei.interests.id}
              style={[
                styles.interestChip,
                {
                  backgroundColor: CIRCLE_COLORS.primary + "20",
                  borderColor: CIRCLE_COLORS.primary,
                },
              ]}
            >
              <ThemedText
                style={[styles.interestChipText, { color: CIRCLE_COLORS.primary }]}
              >
                {ei.interests.title}
              </ThemedText>
            </View>
          ))}
        </View>
      )}

      <ThemedText style={styles.eventCreator}>
        Created by {event.creator?.name || "Unknown"}
      </ThemedText>

      <View style={styles.rsvpButtons}>
        {renderRsvpButton(
          "going",
          "Going",
          event.going_count || 0,
          successColor,
          "checkmark.circle.fill"
        )}
        {renderRsvpButton(
          "maybe",
          "Maybe",
          event.maybe_count || 0,
          CIRCLE_COLORS.warning,
          "star.fill"
        )}
        {renderRsvpButton(
          "not_going",
          "Can't Go",
          event.no_going_count || 0,
          CIRCLE_COLORS.danger,
          "xmark.circle.fill"
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    gap: 10,
  },
  eventHeader: { flexDirection: "row", justifyContent: "space-between" },
  eventInfo: { flex: 1, gap: 4 },
  eventTitle: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  eventDate: { fontSize: 12, color: "#6B7280" },
  eventLocation: { fontSize: 12, color: "#6B7280" },
  eventActions: { flexDirection: "row", gap: 8 },
  actionButton: { padding: 6 },
  eventPhoto: { width: "100%", height: 180, borderRadius: 10 },
  eventDescription: { fontSize: 13, lineHeight: 18, color: "#475569" },
  eventInterests: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  interestChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  interestChipText: { fontSize: 11, fontWeight: "600" },
  eventCreator: { fontSize: 11, color: "#94A3B8", fontStyle: "italic" },
  rsvpButtons: { flexDirection: "row", gap: 6 },
  rsvpButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 8,
  },
  rsvpButtonText: { fontSize: 11, fontWeight: "700" },
});
