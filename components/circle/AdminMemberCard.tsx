import React from "react";
import { View, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Avatar } from "@/components/Avatar";
import { circleCardStyles, CIRCLE_COLORS } from "./circleCardStyles";

interface Member {
  id: string;
  name: string;
  avatar_url?: string | null;
  isAdmin: boolean;
}

interface Props {
  member: Member;
  surfaceColor: string;
  isRTL: boolean;
  isCreator: boolean; // member is the circle creator
  canRemove: boolean;
  canToggleAdmin: boolean;
  onRemove: (memberId: string, memberName: string) => void;
  onToggleAdmin: (memberId: string, memberName: string, isAdmin: boolean) => void;
}

export function AdminMemberCard({
  member,
  surfaceColor,
  isRTL,
  isCreator,
  canRemove,
  canToggleAdmin,
  onRemove,
  onToggleAdmin,
}: Props) {
  return (
    <View
      style={[
        circleCardStyles.adminMemberCard,
        {
          backgroundColor: surfaceColor,
          borderColor: CIRCLE_COLORS.border,
          borderWidth: 1,
        },
      ]}
    >
      <View
        style={[
          circleCardStyles.adminMemberInfo,
          isRTL && circleCardStyles.adminMemberInfoRTL,
        ]}
      >
        <Avatar uri={member.avatar_url} name={member.name} size={40} />
        <View style={circleCardStyles.adminMemberDetails}>
          <ThemedText type="defaultSemiBold" style={{ color: "#000000ff" }}>
            {member.name}
          </ThemedText>
          <View style={circleCardStyles.memberBadges}>
            {member.isAdmin && (
              <View style={[circleCardStyles.badge, { backgroundColor: CIRCLE_COLORS.primary }]}>
                <ThemedText style={circleCardStyles.badgeText}>Admin</ThemedText>
              </View>
            )}
            {isCreator && (
              <View style={[circleCardStyles.badge, { backgroundColor: CIRCLE_COLORS.primary }]}>
                <ThemedText style={circleCardStyles.badgeText}>Creator</ThemedText>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={circleCardStyles.adminMemberActions}>
        {canRemove && (
          <TouchableOpacity
            style={[circleCardStyles.adminActionButton, { backgroundColor: CIRCLE_COLORS.danger }]}
            onPress={() => onRemove(member.id, member.name)}
          >
            <IconSymbol name="minus.circle" size={16} color="#fff" />
            <ThemedText style={circleCardStyles.adminActionButtonText}>Remove</ThemedText>
          </TouchableOpacity>
        )}

        {canToggleAdmin && (
          <TouchableOpacity
            style={[
              circleCardStyles.adminActionButton,
              {
                backgroundColor: member.isAdmin ? CIRCLE_COLORS.warning : CIRCLE_COLORS.primary,
              },
            ]}
            onPress={() => onToggleAdmin(member.id, member.name, member.isAdmin)}
          >
            <IconSymbol
              name={member.isAdmin ? "star.slash" : "star.fill"}
              size={16}
              color="#fff"
            />
            <ThemedText style={circleCardStyles.adminActionButtonText}>
              {member.isAdmin ? "Remove Admin" : "Make Admin"}
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
