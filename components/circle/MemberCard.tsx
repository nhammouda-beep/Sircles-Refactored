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
  canRemove: boolean;
  onRemove: (memberId: string, memberName: string) => void;
}

export function MemberCard({
  member,
  surfaceColor,
  isRTL,
  canRemove,
  onRemove,
}: Props) {
  return (
    <View
      style={[
        circleCardStyles.memberCard,
        {
          backgroundColor: surfaceColor,
          borderColor: CIRCLE_COLORS.border,
          borderWidth: 1,
        },
      ]}
    >
      <View style={[circleCardStyles.memberInfo, isRTL && circleCardStyles.memberInfoRTL]}>
        <Avatar uri={member.avatar_url} name={member.name} size={40} />
        <View style={circleCardStyles.memberDetails}>
          <ThemedText type="defaultSemiBold" style={{ color: "#000000ff" }}>
            {member.name}
          </ThemedText>
          {member.isAdmin && (
            <ThemedText style={[circleCardStyles.adminBadge, { color: CIRCLE_COLORS.primary }]}>
              Admin
            </ThemedText>
          )}
        </View>
      </View>
      {canRemove && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Remove ${member.name}`}
          accessibilityHint="Removes this member from the circle"
          style={circleCardStyles.removeButton}
          onPress={() => onRemove(member.id, member.name)}
        >
          <IconSymbol name="minus.circle" size={20} color={CIRCLE_COLORS.danger} />
        </TouchableOpacity>
      )}
    </View>
  );
}
