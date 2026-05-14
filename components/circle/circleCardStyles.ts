import { StyleSheet } from "react-native";

export const CIRCLE_COLORS = {
  primary: "#198F4B",
  text: "#0F172A",
  subtle: "#6B7280",
  border: "#E5E7EB",
  danger: "#EF4444",
  warning: "#F59E0B",
};

export const circleCardStyles = StyleSheet.create({
  memberCard: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  memberInfo: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  memberInfoRTL: { flexDirection: "row-reverse" },
  memberAvatar: {},
  memberDetails: { flex: 1 },
  adminBadge: { fontSize: 11, fontWeight: "700", marginTop: 2 },
  removeButton: { padding: 6 },

  requestCard: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  requestInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  requestInfoRTL: { flexDirection: "row-reverse" },
  requestAvatar: {},
  requestDetails: { flex: 1 },
  requestMessage: { fontSize: 13, fontStyle: "italic", marginTop: 4 },
  requestTime: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  requestActions: { flexDirection: "row", gap: 8, marginTop: 10 },
  requestButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  requestButtonText: { color: "#fff", fontWeight: "700" },

  adminMemberCard: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  adminMemberInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  adminMemberInfoRTL: { flexDirection: "row-reverse" },
  adminMemberAvatar: {},
  adminMemberDetails: { flex: 1 },
  memberBadges: { flexDirection: "row", gap: 6, marginTop: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  adminMemberActions: { flexDirection: "row", gap: 8, marginTop: 10 },
  adminActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  adminActionButtonText: { color: "#fff", fontWeight: "700", fontSize: 12 },
});
