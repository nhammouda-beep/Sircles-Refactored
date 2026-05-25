import React from "react";
import { View, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Avatar } from "@/components/Avatar";
import { circleCardStyles, CIRCLE_COLORS } from "./circleCardStyles";

interface JoinRequest {
  id: string;
  message?: string | null;
  creationdate: string;
  users: { name: string; avatar?: string | null; avatar_url?: string | null };
}

interface Props {
  request: JoinRequest;
  surfaceColor: string;
  isRTL: boolean;
  onAction: (requestId: string, action: "accept" | "reject") => void;
}

export function JoinRequestCard({ request, surfaceColor, isRTL, onAction }: Props) {
  return (
    <View
      style={[
        circleCardStyles.requestCard,
        {
          backgroundColor: surfaceColor,
          borderColor: CIRCLE_COLORS.border,
          borderWidth: 1,
        },
      ]}
    >
      <View style={[circleCardStyles.requestInfo, isRTL && circleCardStyles.requestInfoRTL]}>
        <Avatar
          uri={request.users.avatar_url || request.users.avatar}
          name={request.users.name}
          size={40}
        />
        <View style={circleCardStyles.requestDetails}>
          <ThemedText type="defaultSemiBold">{request.users.name}</ThemedText>
          {request.message && (
            <ThemedText style={circleCardStyles.requestMessage}>
              "{request.message}"
            </ThemedText>
          )}
          <ThemedText style={circleCardStyles.requestTime}>
            {new Date(request.creationdate).toLocaleDateString()}
          </ThemedText>
        </View>
      </View>
      <View style={circleCardStyles.requestActions}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Accept join request from ${request.users.name}`}
          style={[circleCardStyles.requestButton, { backgroundColor: CIRCLE_COLORS.primary }]}
          onPress={() => onAction(request.id, "accept")}
        >
          <ThemedText style={circleCardStyles.requestButtonText}>Accept</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Reject join request from ${request.users.name}`}
          style={[circleCardStyles.requestButton, { backgroundColor: CIRCLE_COLORS.danger }]}
          onPress={() => onAction(request.id, "reject")}
        >
          <ThemedText style={circleCardStyles.requestButtonText}>Reject</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
