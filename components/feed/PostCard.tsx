import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Avatar } from "@/components/Avatar";
import { LikeButton } from "./LikeButton";
import { feedStyles, FEED_COLORS } from "./feedStyles";

interface PostCardData {
  id: string;
  content?: string | null;
  image?: string | null;
  creationdate?: string | null;
  author?: { id?: string; name?: string | null; avatar_url?: string | null } | null;
  circle?: { id?: string; name?: string | null } | null;
  likes_count?: number;
  comments_count?: number;
  userLiked?: boolean;
}

interface Props {
  post: PostCardData;
  isOwner: boolean;
  canLike: boolean;
  onLike: (postId: string) => void;
  onMenu: (postId: string) => void;
  formatTimeAgo: (dateString?: string | null) => string;
}

export function PostCard({
  post,
  isOwner,
  canLike,
  onLike,
  onMenu,
  formatTimeAgo,
}: Props) {
  return (
    <View style={[feedStyles.card, { backgroundColor: FEED_COLORS.surface }]}>
      <View style={feedStyles.cardHeader}>
        <View style={feedStyles.headerLeft}>
          <Avatar uri={post.author?.avatar_url} name={post.author?.name} size={36} />
          <View style={feedStyles.headerTextWrap}>
            <ThemedText style={[feedStyles.headerTitle, { color: FEED_COLORS.text }]}>
              {post.author?.name || "Unknown"}
            </ThemedText>
            <View style={feedStyles.headerMetaRow}>
              <ThemedText style={[feedStyles.headerSub, { color: FEED_COLORS.subtle }]}>
                in {post.circle?.name || "Circle"}
              </ThemedText>
              <ThemedText style={feedStyles.dot}>•</ThemedText>
              <ThemedText style={[feedStyles.headerSub, { color: FEED_COLORS.subtle }]}>
                {formatTimeAgo(post.creationdate)}
              </ThemedText>
            </View>
          </View>
        </View>

        {isOwner && (
          <TouchableOpacity
            onPress={() => onMenu(post.id)}
            style={feedStyles.menuBtn}
          >
            <IconSymbol name="ellipsis" size={20} color={FEED_COLORS.subtle} />
          </TouchableOpacity>
        )}
      </View>

      <View style={feedStyles.cardBody}>
        {!!post.content && (
          <ThemedText style={[feedStyles.desc, { color: FEED_COLORS.text }]}>
            {post.content}
          </ThemedText>
        )}
        {post.image && (
          <Image source={{ uri: post.image }} style={feedStyles.cardImage} />
        )}

        <View style={feedStyles.actionsRow}>
          <LikeButton
            liked={!!post.userLiked}
            count={post.likes_count || 0}
            onPress={() => onLike(post.id)}
            disabled={!canLike}
            subtleColor={FEED_COLORS.subtle}
          />

          <TouchableOpacity
            style={feedStyles.actionBtn}
            onPress={() => router.push(`/post/${post.id}`)}
          >
            <IconSymbol name="bubble.left" size={18} color={FEED_COLORS.subtle} />
            <ThemedText style={feedStyles.actionTxt}>
              {post.comments_count || 0}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
