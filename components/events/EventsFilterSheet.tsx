import React from "react";
import {
  Modal,
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";

type RSVPFilter = "any" | "going" | "maybe" | "not_going" | "none";

interface Circle {
  id: string;
  name: string;
}

interface Interest {
  id: string;
  title: string;
}

interface Props {
  visible: boolean;
  bg: string;
  text: string;
  primary: string;
  circles: Circle[];
  selectedCircleId: string | "any";
  onCircleChange: (id: string | "any") => void;
  allInterests: Interest[];
  selectedInterests: Set<string>;
  onToggleInterest: (id: string) => void;
  withPhoto: boolean;
  onTogglePhoto: () => void;
  rsvpFilter: RSVPFilter;
  onRsvpFilterChange: (filter: RSVPFilter) => void;
  onClear: () => void;
  onClose: () => void;
}

/**
 * Filter sheet for events: by circle, interests, has-photo flag, and RSVP status.
 */
export function EventsFilterSheet({
  visible,
  bg,
  text,
  primary,
  circles,
  selectedCircleId,
  onCircleChange,
  allInterests,
  selectedInterests,
  onToggleInterest,
  withPhoto,
  onTogglePhoto,
  rsvpFilter,
  onRsvpFilterChange,
  onClear,
  onClose,
}: Props) {
  const rsvpKeys: RSVPFilter[] = ["any", "going", "maybe", "not_going", "none"];
  const rsvpLabel = (k: RSVPFilter) =>
    k === "any"
      ? "Any"
      : k === "not_going"
      ? "Can't go"
      : k === "none"
      ? "No response"
      : k.charAt(0).toUpperCase() + k.slice(1);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: bg }]}>
          <View style={styles.header}>
            <ThemedText type="subtitle" style={{ color: text }}>
              Filters
            </ThemedText>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Close filters"
              onPress={onClose}
            >
              <IconSymbol name="xmark" size={22} color={text} />
            </TouchableOpacity>
          </View>

          <ThemedText style={styles.sectionTitle}>Circle</ThemedText>
          <View style={styles.rowWrap}>
            <Chip
              label="Any"
              active={selectedCircleId === "any"}
              onPress={() => onCircleChange("any")}
              tintColor={primary}
            />
            {circles.map((c) => (
              <Chip
                key={c.id}
                label={c.name}
                active={selectedCircleId === c.id}
                onPress={() => onCircleChange(c.id)}
                tintColor={primary}
              />
            ))}
          </View>

          <ThemedText style={styles.sectionTitle}>Interests</ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 8 }}
          >
            <View style={[styles.rowWrap, { paddingRight: 12 }]}>
              {allInterests.map((i) => (
                <Chip
                  key={i.id}
                  label={i.title}
                  active={selectedInterests.has(i.id)}
                  onPress={() => onToggleInterest(i.id)}
                  tintColor={primary}
                />
              ))}
            </View>
          </ScrollView>

          <ThemedText style={styles.sectionTitle}>More</ThemedText>
          <View style={styles.rowWrap}>
            <Toggle
              label="With photo"
              value={withPhoto}
              onToggle={onTogglePhoto}
              tintColor={primary}
            />
          </View>

          <ThemedText style={styles.sectionTitle}>My RSVP</ThemedText>
          <View style={styles.rowWrap}>
            {rsvpKeys.map((k) => (
              <Chip
                key={k}
                label={rsvpLabel(k)}
                active={rsvpFilter === k}
                onPress={() => onRsvpFilterChange(k)}
                tintColor={primary}
              />
            ))}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              accessibilityRole="button"
              style={[styles.btn, styles.clearBtn]}
              onPress={onClear}
            >
              <ThemedText>Clear</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              style={[styles.btn, { backgroundColor: primary }]}
              onPress={onClose}
            >
              <ThemedText style={{ color: "#fff" }}>Apply</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Chip({
  label,
  active,
  onPress,
  tintColor,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  tintColor: string;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[
        styles.chip,
        active
          ? { backgroundColor: tintColor, borderColor: tintColor }
          : { borderColor: "#E5E7EB" },
      ]}
    >
      <ThemedText
        style={{
          color: active ? "#fff" : "#111827",
          fontSize: 12,
          fontWeight: "600",
        }}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

function Toggle({
  label,
  value,
  onToggle,
  tintColor,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
  tintColor: string;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={onToggle}
      style={styles.toggle}
    >
      <View
        style={[
          styles.toggleTrack,
          { backgroundColor: value ? tintColor : "#E5E7EB" },
        ]}
      >
        <View
          style={[
            styles.toggleThumb,
            value ? { alignSelf: "flex-end" } : { alignSelf: "flex-start" },
          ]}
        />
      </View>
      <ThemedText style={{ marginLeft: 8 }}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: { marginTop: 8, marginBottom: 6, fontWeight: "700" },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 8,
  },
  actions: { flexDirection: "row", gap: 8, marginTop: 8 },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  clearBtn: { borderWidth: 1, borderColor: "#E5E7EB" },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 8,
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: "center",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
});
