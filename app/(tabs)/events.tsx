import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Linking from "expo-linking";

import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { DatabaseService } from "@/lib/database";
import EventModal from "@/components/EventModal";
import { EventsSkeleton } from "@/components/SkeletonLoader";
import { EventsListCard } from "@/components/events/EventsListCard";
import { EventsFilterSheet } from "@/components/events/EventsFilterSheet";
import { useDebounced } from "@/hooks/useDebounced";
import { useFocusEffect } from "expo-router";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  location_url?: string;
  description: string;
  circleid?: string;
  circleName?: string;
  createdby: string;
  photo_url?: string;
  going_count?: number;
  interested_count?: number;
  maybe_count?: number;
  not_going_count?: number;
  userRsvpStatus?: "going" | "maybe" | "not_going" | null;
  event_interests?: Array<{
    interests: { id: string; title: string; category: string };
  }>;
}

type RSVPFilter = "any" | "going" | "maybe" | "not_going" | "none";

export default function EventsScreen() {
  const { texts, isRTL } = useLanguage();
  const { user } = useAuth();

  const PRIMARY = "#198F4B";
  const BG = "#FFFFFF";
  const TEXT = "#0F172A";
  const SUBTLE = "#6B7280";
  const BORDER = "#E5E7EB";

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingRsvp, setPendingRsvp] = useState<Set<string>>(new Set());
  const [circles, setCircles] = useState<{ id: string; name: string }[]>([]);
  const [deletableEvents, setDeletableEvents] = useState<Set<string>>(
    new Set()
  );

  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query, 200);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [circleId, setCircleId] = useState<string | "any">("any");
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(
    new Set()
  );
  const [withPhoto, setWithPhoto] = useState(false);
  const [rsvpFilter, setRsvpFilter] = useState<RSVPFilter>("any");

  const STALE_MS = 30_000;
  const lastFetchRef = React.useRef<number>(0);
  const isFirstMount = React.useRef(true);
  const isStale = () => Date.now() - lastFetchRef.current > STALE_MS;

  useFocusEffect(
    useCallback(() => {
      if (user) {
        if (isFirstMount.current) {
          fetchEvents();
          fetchUserCircles();
          isFirstMount.current = false;
          lastFetchRef.current = Date.now();
        } else if (isStale()) {
          fetchEvents();
          lastFetchRef.current = Date.now();
        }
      }
    }, [user])
  );

  // Trigger initial load when user becomes available after auth
  useEffect(() => {
    if (user && isFirstMount.current) {
      fetchEvents();
      fetchUserCircles();
      isFirstMount.current = false;
      lastFetchRef.current = Date.now();
    }
  }, [user]);

  const fetchEvents = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await DatabaseService.getEvents();
      setEvents((data as any) || []);
      if (data) await checkDeletableEvents(data as any);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCircles = async () => {
    if (!user) return;
    try {
      const { data } = await DatabaseService.getUserCircles(user.id);
      if (data)
        setCircles(
          data.map((uc: any) => ({
            id: uc.circleid,
            name: uc.circles?.name || "Unknown Circle",
          }))
        );
    } catch {}
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!eventId) return Alert.alert("Error", "Invalid event ID");
    const { error } = await DatabaseService.deleteEvent(eventId);
    if (error)
      return Alert.alert("Error", "Failed to delete event: " + error.message);
    Alert.alert("Success", "Event deleted successfully");
    fetchEvents();
  };

  const checkDeletableEvents = async (fetchedEvents: Event[]) => {
    if (!user) return;
    const deletable = new Set<string>();

    // Add events created by the user
    for (const e of fetchedEvents) {
      if (e.createdby === user.id) deletable.add(e.id);
    }

    // Batch check admin status for all circle events not owned by user
    const circleIds = [
      ...new Set(
        fetchedEvents
          .filter((e) => e.circleid && e.createdby !== user.id)
          .map((e) => e.circleid!)
      ),
    ];

    if (circleIds.length > 0) {
      const { data: adminCircleIds } =
        await DatabaseService.getAdminCircleIds(circleIds, user.id);
      const adminSet = new Set(adminCircleIds || []);
      for (const e of fetchedEvents) {
        if (e.circleid && adminSet.has(e.circleid)) deletable.add(e.id);
      }
    }

    setDeletableEvents(deletable);
  };

  const handleRsvp = async (
    eventId: string,
    status: "going" | "maybe" | "not_going"
  ) => {
    if (!user) return;
    if (pendingRsvp.has(eventId)) return; // prevent double-tap

    const event = events.find((e) => e.id === eventId);
    const current = event?.userRsvpStatus;
    const newStatus = current === status ? null : status;

    // Mark as pending and apply optimistic update
    setPendingRsvp((prev) => new Set(prev).add(eventId));
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== eventId) return e;
        const next = { ...e };
        // Adjust counts: decrement old status, increment new status
        if (current === "going") next.going_count = Math.max(0, (next.going_count || 1) - 1);
        if (current === "maybe") next.maybe_count = Math.max(0, (next.maybe_count || 1) - 1);
        if (current === "not_going") next.not_going_count = Math.max(0, (next.not_going_count || 1) - 1);
        if (newStatus === "going") next.going_count = (next.going_count || 0) + 1;
        if (newStatus === "maybe") next.maybe_count = (next.maybe_count || 0) + 1;
        if (newStatus === "not_going") next.not_going_count = (next.not_going_count || 0) + 1;
        next.userRsvpStatus = newStatus;
        return next;
      })
    );

    let error;
    if (current) {
      if (current === status)
        ({ error } = await DatabaseService.deleteEventRsvp(eventId));
      else ({ error } = await DatabaseService.updateEventRsvp(eventId, status));
    } else ({ error } = await DatabaseService.createEventRsvp(eventId, status));

    setPendingRsvp((prev) => {
      const next = new Set(prev);
      next.delete(eventId);
      return next;
    });

    if (error) {
      Alert.alert("Error", "Failed to update RSVP");
      fetchEvents(); // revert by reloading
    }
  };

  const canEditEvent = async (event: Event) => {
    if (!user?.id) return false;
    if (event.createdby === user.id) return true;
    if (event.circleid) {
      try {
        const { data } = await DatabaseService.isCircleAdmin(
          event.circleid,
          user.id
        );
        return data?.isAdmin || false;
      } catch {
        return false;
      }
    }
    return false;
  };

  const handleEditEvent = async (event: Event) => {
    const ok = await canEditEvent(event);
    if (!ok)
      return Alert.alert(
        "Error",
        "You do not have permission to edit this event"
      );
    setEditingEvent({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      location_url: event.location_url,
      circleid: event.circleid,
      interests: event.event_interests?.map((ei: any) => ei.interests.id) || [],
      photo_url: event.photo_url,
    });
    setShowEditEventModal(true);
  };

  const toDate = (e: Event) => new Date(e.date);
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const allInterests = useMemo(() => {
    const map: Record<string, string> = {};
    events.forEach((e) =>
      e.event_interests?.forEach((i) => {
        map[i.interests.id] = i.interests.title;
      })
    );
    return Object.entries(map).map(([id, title]) => ({ id, title }));
  }, [events]);

  const filteredSorted = useMemo(() => {
    const now = new Date();
    const q = debouncedQuery.trim().toLowerCase();
    const base = events.filter((e) =>
      tab === "upcoming"
        ? toDate(e) >= startOfDay(now)
        : toDate(e) < startOfDay(now)
    );
    const byQuery = q
      ? base.filter((e) => {
          const interestText = (e.event_interests || [])
            .map((i) => i.interests.title)
            .join(" ");
          const bucket = `${e.title} ${e.description} ${e.location} ${
            e.circleName || ""
          } ${interestText}`.toLowerCase();
          return bucket.includes(q);
        })
      : base;

    const byFilters = byQuery.filter((e) => {
      if (circleId !== "any" && e.circleid !== circleId) return false;
      if (withPhoto && !e.photo_url) return false;
      if (rsvpFilter !== "any") {
        if (rsvpFilter === "none" && e.userRsvpStatus) return false;
        if (rsvpFilter !== "none" && e.userRsvpStatus !== rsvpFilter)
          return false;
      }
      if (selectedInterests.size > 0) {
        const ids = new Set(
          (e.event_interests || []).map((i) => i.interests.id)
        );
        for (const id of selectedInterests) if (!ids.has(id)) return false;
      }
      return true;
    });

    return byFilters.sort((a, b) =>
      tab === "upcoming" ? +toDate(a) - +toDate(b) : +toDate(b) - +toDate(a)
    );
  }, [events, tab, debouncedQuery, circleId, selectedInterests, withPhoto, rsvpFilter]);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const clearFilters = () => {
    setCircleId("any");
    setSelectedInterests(new Set());
    setWithPhoto(false);
    setRsvpFilter("any");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BG }]}>
      {/* Header */}
      <View style={styles.topBar}>
        <ThemedText type="title" style={[styles.brand, { color: PRIMARY }]}>
          Sircles
        </ThemedText>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: PRIMARY }]}
          onPress={() => setShowCreateModal(true)}
        >
          <IconSymbol name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <ThemedText type="title" style={[styles.heroTitle, { color: TEXT }]}>
          Find the perfect event for you.
        </ThemedText>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={[styles.searchBox, { borderColor: BORDER }]}>
          <IconSymbol name="magnifyingglass" size={18} color={SUBTLE} />
          <TextInput
            placeholder={texts.searchEvents || "Search Events"}
            placeholderTextColor={SUBTLE}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            underlineColorAndroid="transparent"
            selectionColor={PRIMARY}
            style={[
              styles.searchInput,
              { color: TEXT },
              isRTL && { textAlign: "right" },
              styles.inputNoOutline, // no yellow/orange outline
            ]}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity onPress={() => setTab("upcoming")}>
          <ThemedText
            style={[
              styles.tabText,
              tab === "upcoming"
                ? {
                    color: PRIMARY,
                    borderBottomColor: PRIMARY,
                    borderBottomWidth: 2,
                  }
                : { color: SUBTLE },
            ]}
          >
            {texts.upcoming || "Upcoming"}
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab("past")}>
          <ThemedText
            style={[
              styles.tabText,
              tab === "past"
                ? {
                    color: PRIMARY,
                    borderBottomColor: PRIMARY,
                    borderBottomWidth: 2,
                  }
                : { color: SUBTLE },
            ]}
          >
            {texts.past || "Past"}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView
        style={styles.eventsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await fetchEvents();
              lastFetchRef.current = Date.now();
              setRefreshing(false);
            }}
          />
        }
      >
        {loading ? (
          <EventsSkeleton />
        ) : filteredSorted.length === 0 ? (
          <View style={styles.empty}>
            <ThemedText style={{ color: SUBTLE }}>No events yet</ThemedText>
          </View>
        ) : (
          filteredSorted.map((event) => (
            <EventsListCard
              key={event.id}
              event={event as any}
              isRTL={isRTL}
              isDeletable={deletableEvents.has(event.id)}
              isRsvpPending={pendingRsvp.has(event.id)}
              onPress={setSelectedEvent as any}
              onEdit={handleEditEvent as any}
              onDelete={handleDeleteEvent}
              onRsvp={handleRsvp}
            />
          ))
        )}
      </ScrollView>

      {/* Details Modal */}
      <Modal
        visible={!!selectedEvent}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedEvent(null)}
      >
        {selectedEvent && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: "#FFFFFF" }]}>
              <View
                style={[styles.modalHeader, isRTL && styles.modalHeaderRTL]}
              >
                <ThemedText
                  type="subtitle"
                  style={[styles.modalTitle, { color: TEXT }]}
                >
                  {selectedEvent.title}
                </ThemedText>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedEvent(null)}
                >
                  <IconSymbol name="xmark" size={24} color={TEXT} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {selectedEvent.description?.trim()?.length > 0 && (
                  <ThemedText
                    style={{ color: TEXT, marginBottom: 12, lineHeight: 20 }}
                  >
                    {selectedEvent.description}
                  </ThemedText>
                )}
                <View style={styles.metaRow}>
                  <IconSymbol name="calendar" size={18} color={SUBTLE} />
                  <ThemedText style={[styles.metaText, { color: SUBTLE }]}>
                    {selectedEvent.date}
                  </ThemedText>
                </View>
                <View style={styles.metaRow}>
                  <IconSymbol name="clock" size={18} color={SUBTLE} />
                  <ThemedText style={[styles.metaText, { color: SUBTLE }]}>
                    {selectedEvent.time}
                  </ThemedText>
                </View>
                <View style={styles.metaRow}>
                  <IconSymbol name="location" size={18} color={SUBTLE} />
                  {selectedEvent.location_url ? (
                    <TouchableOpacity
                      onPress={() =>
                        Linking.openURL(selectedEvent.location_url!)
                      }
                    >
                      <ThemedText
                        style={[
                          styles.metaText,
                          { color: PRIMARY, textDecorationLine: "underline" },
                        ]}
                      >
                        {selectedEvent.location}
                      </ThemedText>
                    </TouchableOpacity>
                  ) : (
                    <ThemedText style={[styles.metaText, { color: SUBTLE }]}>
                      {selectedEvent.location}
                    </ThemedText>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>

      {/* Filters Sheet */}
      <EventsFilterSheet
        visible={filtersOpen}
        bg={BG}
        text={TEXT}
        primary={PRIMARY}
        circles={circles}
        selectedCircleId={circleId}
        onCircleChange={setCircleId}
        allInterests={allInterests}
        selectedInterests={selectedInterests}
        onToggleInterest={toggleInterest}
        withPhoto={withPhoto}
        onTogglePhoto={() => setWithPhoto((v) => !v)}
        rsvpFilter={rsvpFilter}
        onRsvpFilterChange={setRsvpFilter}
        onClear={clearFilters}
        onClose={() => setFiltersOpen(false)}
      />

      {/* Add/Edit */}
      <EventModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreated={fetchEvents}
        circles={circles}
      />
      <EventModal
        visible={showEditEventModal}
        onClose={() => setShowEditEventModal(false)}
        onEventCreated={fetchEvents}
        circles={circles}
        editingEvent={editingEvent}
      />
    </SafeAreaView>
  );
}

/* styles */
const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { fontSize: 28, fontWeight: "800" },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: { paddingHorizontal: 16, paddingVertical: 8 },
  heroTitle: { fontSize: 22, lineHeight: 28, fontWeight: "700" },

  searchWrap: { paddingHorizontal: 16, paddingTop: 8 },
  searchBox: {
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14 },
  inputNoOutline: {
    outlineStyle: "none" as any,
    outlineWidth: 0 as any,
    outlineColor: "transparent" as any,
    boxShadow: "none" as any,
  },

  tabsRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    gap: 20,
  },
  tabText: { fontSize: 14, fontWeight: "700", paddingBottom: 6 },

  eventsList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  metaText: { fontSize: 14 },

  empty: { paddingVertical: 40, alignItems: "center" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    padding: 20,
    borderRadius: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalHeaderRTL: { flexDirection: "row-reverse" },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  closeButton: { padding: 4 },

});
