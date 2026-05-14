import { StyleSheet } from "react-native";

export const FEED_COLORS = {
  primary: "#198F4B",
  surface: "#FFFFFF",
  text: "#0F172A",
  subtle: "#6B7280",
  border: "#E5E7EB",
  cardBorder: "#F3F4F6",
};

export const feedStyles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginBottom: 14,
    overflow: "hidden",
  },
  cardHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontSize: 14, fontWeight: "700" },
  headerMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  headerSub: { fontSize: 12 },
  dot: { fontSize: 12, color: "#94A3B8" },
  menuBtn: { padding: 6 },

  cardBody: { paddingHorizontal: 12, paddingBottom: 12 },
  cardImage: { width: "100%", height: 190 },

  eventTitle: { fontSize: 16, fontWeight: "700", marginTop: 6 },
  eventMeta: { fontSize: 13, fontWeight: "700", marginTop: 4 },
  eventLoc: { fontSize: 13, marginTop: 6 },
  desc: { fontSize: 14, lineHeight: 22, marginTop: 6 },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: "700" },

  actionsRow: { flexDirection: "row", gap: 18, marginTop: 10 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionTxt: { fontSize: 13, color: "#6B7280" },
});
