import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Avatar } from "@/components/Avatar";
import { CIRCLE_COLORS } from "./circleCardStyles";

interface CirclePost {
  id: string;
  content: string;
  image?: string | null;
  creationdate: string;
  author?: { id?: string; name?: string | null; avatar_url?: string | null } | null;
  likes_count?: number;
  comments_count?: number;
  comments?: any[];
  userLiked?: boolean;
}

interface Props {
  post: CirclePost;
  surfaceColor: string;
  textColor: string;
  isRTL: boolean;
  isAuthor: boolean;
  canDelete: boolean;
  deletingPostId: string | null;
  onEdit: (postId: string, content: string) => void;
  onDelete: (postId: string) => void;
  onLike: (postId: string) => void;
}

/**
 * Post card variant used inside the circle detail screen.
 * Differs from the home feed PostCard: inline edit/delete icons
 * (instead of a three-dots menu), and tighter spacing.
 */
export function CirclePostCard({
  post,
  surfaceColor,
  textColor,
  isRTL,
  isAuthor,
  canDelete,
  deletingPostId,
  onEdit,
  onDelete,
  onLike,
}: Props) {
  const isDeleting = deletingPostId === post.id;

  return (
    <View
      style={[
        styles.postCard,
        {
          backgroundColor: surfaceColor,
          borderColor: CIRCLE_COLORS.border,
          borderWidth: 1,
        },
      ]}
    >
      <View style={[styles.postHeader, isRTL && styles.postHeaderRTL]}>
        <View style={[styles.authorInfo, isRTL && styles.authorInfoRTL]}>
          <Avatar uri={post.author?.avatar_url} name={post.author?.name} size={40} />
          <View style={styles.authorDetails}>
            <ThemedText type="defaultSemiBold" style={{ color: "#000000ff" }}>
              {post.author?.name || "Unknown User"}
            </ThemedText>
            <ThemedText style={styles.postTime}>
              {new Date(post.creationdate).toLocaleDateString()}
            </ThemedText>
          </View>
        </View>
        {(isAuthor || canDelete) && (
          <View style={styles.postEditActions}>
            {isAuthor && (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Edit post"
                style={styles.postActionButton}
                onPress={() => onEdit(post.id, post.content)}
              >
                <IconSymbol name="pencil" size={16} color={CIRCLE_COLORS.primary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Delete post"
              accessibilityHint="Permanently deletes this post"
              accessibilityState={{ disabled: isDeleting }}
              style={[
                styles.postActionButton,
                isDeleting && styles.disabledButton,
              ]}
              onPress={() => onDelete(post.id)}
              disabled={isDeleting}
            >
              <IconSymbol
                name="trash"
                size={16}
                color={isDeleting ? "#ccc" : CIRCLE_COLORS.danger}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.postContentContainer}>
        <ThemedText style={styles.postContent}>{post.content}</ThemedText>
      </View>

      {post.image && (
        <Image source={{ uri: post.image }} style={styles.postImage} />
      )}

      <View style={styles.postInteractionActions}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`${post.userLiked ? "Unlike" : "Like"} post (${post.likes_count || 0} ${(post.likes_count || 0) === 1 ? "like" : "likes"})`}
          accessibilityState={{ selected: !!post.userLiked }}
          style={styles.actionButton}
          onPress={() => onLike(post.id)}
        >
          <IconSymbol
            name={post.userLiked ? "heart.fill" : "heart"}
            size={20}
            color={post.userLiked ? CIRCLE_COLORS.danger : textColor}
          />
          <ThemedText
            style={[
              styles.actionText,
              post.userLiked && { color: CIRCLE_COLORS.danger },
            ]}
          >
            {post.likes_count || 0}
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`View comments (${post.comments_count || post.comments?.length || 0})`}
          style={styles.actionButton}
          onPress={() => router.push(`/post/${post.id}`)}
        >
          <IconSymbol name="bubble.left" size={20} color={textColor} />
          <ThemedText style={styles.actionText}>
            {post.comments_count || post.comments?.length || 0}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postCard: { padding: 12, borderRadius: 12, marginBottom: 12 },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  postHeaderRTL: { flexDirection: "row-reverse" },
  authorInfo: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  authorInfoRTL: { flexDirection: "row-reverse" },
  authorDetails: { flex: 1 },
  postTime: { fontSize: 11, color: "#94A3B8", marginTop: 2 },
  postEditActions: { flexDirection: "row", gap: 6 },
  postActionButton: { padding: 6 },
  disabledButton: { opacity: 0.5 },
  postContentContainer: { marginBottom: 8 },
  postContent: { fontSize: 14, lineHeight: 20, color: "#0F172A" },
  postImage: { width: "100%", height: 200, borderRadius: 10, marginBottom: 10 },
  postInteractionActions: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  actionButton: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionText: { fontSize: 13, color: "#6B7280" },
});
