import { supabase } from "../supabase";
import { StorageService } from "../storage";

export const PostService = {
  async getPosts(circleId?: string) {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const currentUserId = user?.id;

    let query = supabase
      .from("posts")
      .select(
        `
        *,
        author:users!posts_userid_fkey(
          id,
          name,
          avatar_url
        ),
        circle:circles!posts_circleid_fkey(
          id,
          name
        )
      `
      )
      .order("creationdate", { ascending: false });

    if (circleId) {
      query = query.eq("circleid", circleId);
    } else {
      query = query.is("circleid", null);
    }

    const { data: posts, error } = await query;

    if (error || !posts) {
      return { data: posts, error };
    }

    // Get like counts, comments count, and user like status for each post
    if (posts && posts.length > 0) {
      const postIds = posts.map((post) => post.id);

      // Get all likes for these posts
      const { data: allLikes } = await supabase
        .from("post_likes")
        .select("postid, userid")
        .in("postid", postIds);

      // Get comments count for these posts
      const { data: commentsCount } = await supabase
        .from("comments")
        .select("postid")
        .in("postid", postIds);

      // Check which posts the current user has liked
      const userLikes = currentUserId
        ? allLikes?.filter((like) => like.userid === currentUserId) || []
        : [];
      const likedPostIds = new Set(userLikes.map((like) => like.postid));

      // Calculate like counts for each post
      const likeCounts =
        allLikes?.reduce((acc, like) => {
          acc[like.postid] = (acc[like.postid] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

      // Calculate comments count for each post
      const commentsCountMap =
        commentsCount?.reduce((acc, comment) => {
          acc[comment.postid] = (acc[comment.postid] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

      const postsWithLikeData = posts.map((post) => ({
        ...post,
        likes_count: likeCounts[post.id] || 0,
        userLiked: likedPostIds.has(post.id),
        comments_count: commentsCountMap[post.id] || 0,
        comments: [], // Add empty comments array for compatibility
      }));

      return { data: postsWithLikeData, error: null };
    }

    return { data: posts, error };
  },

  async createPost(post: any, photoAsset?: any) {
    // Verify user is authenticated
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) {
      return { data: null, error: new Error("Authentication required") };
    }

    const postId = crypto.randomUUID();

    try {
      let imageUrl = null;

      // Upload photo if provided
      if (photoAsset) {
        const { data: uploadData, error: uploadError } =
          await StorageService.uploadPostPhoto(
            postId,
            photoAsset,
            currentUser.user.id
          );

        if (uploadError) {
          console.error("Error uploading post photo:", uploadError);
          return { data: null, error: uploadError };
        }

        if (uploadData?.publicUrl) {
          imageUrl = uploadData.publicUrl;
        }
      }

      const newPost = {
        id: postId,
        ...post,
        image: imageUrl, // Set the image URL
        creationdate: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("posts")
        .insert(newPost)
        .select()
        .single();

      if (error) {
        // If post creation fails and we uploaded a photo, clean it up
        if (imageUrl && photoAsset) {
          try {
            // Extract filename from URL for cleanup
            const urlParts = imageUrl.split("/");
            const fileName = urlParts[urlParts.length - 1].split("?")[0];
            await StorageService.deletePostPhoto(postId, fileName);
          } catch (cleanupError) {
            console.error(
              "Error cleaning up uploaded photo after post creation failure:",
              cleanupError
            );
          }
        }
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error in createPost:", error);
      return { data: null, error: error as Error };
    }
  },

  async getPost(postId: string) {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const currentUserId = user?.id;

    const { data: post, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        author:users!posts_userid_fkey(
          name,
          avatar_url
        ),
        circle:circles!posts_circleid_fkey(
          id,
          name
        )
      `
      )
      .eq("id", postId)
      .single();

    if (error || !post) {
      return { data: post, error };
    }

    // Get like count and user like status
    const { data: likes } = await supabase
      .from("post_likes")
      .select("userid")
      .eq("postid", postId);

    const likesCount = likes?.length || 0;
    const userLiked = currentUserId
      ? likes?.some((like) => like.userid === currentUserId)
      : false;

    // Get comments
    const { data: comments } = await supabase
      .from("comments")
      .select(
        `
        id,
        text as content,
        creationdate,
        author:users!comments_userid_fkey(
          name,
          avatar_url
        )
      `
      )
      .eq("postid", postId)
      .order("creationdate", { ascending: true });

    const enhancedPost = {
      ...post,
      likes_count: likesCount,
      userLiked: userLiked,
      comments: comments || [],
    };

    return { data: enhancedPost, error: null };
  },

  async getHomePagePosts(userId: string, page = 0, limit = 20) {
    try {
      // First get the user's joined circles
      const { data: userCircles, error: circlesError } = await supabase
        .from("user_circles")
        .select("circleid")
        .eq("userid", userId);

      if (circlesError) {
        console.error("Error fetching user circles:", circlesError);
        return { data: [], error: circlesError, hasMore: false };
      }

      const circleIds = userCircles?.map((uc) => uc.circleid) || [];
      const from = page * limit;
      const to = from + limit - 1;

      // Get posts from user's circles or general posts (where circleid is null)
      const { data: posts, error } = await supabase
        .from("posts")
        .select(
          `
          id,
          content,
          image,
          createdat,
          creationdate,
          userid,
          circleid,
          author:users!posts_userid_fkey (
            id,
            name,
            avatar_url
          ),
          circle:circles!posts_circleid_fkey (
            id,
            name,
            circle_interests:circle_interests (
              interests (
                id,
                title,
                category
              )
            )
          )
        `
        )
        .or(
          circleIds.length > 0
            ? `circleid.is.null,circleid.in.(${circleIds.join(",")})`
            : "circleid.is.null"
        )
        .order("creationdate", { ascending: false })
        .range(from, to);

      if (error || !posts) {
        return { data: [], error, hasMore: false };
      }

      const hasMore = posts.length === limit;

      // Get likes and comments data separately for better control
      if (posts.length > 0) {
        const postIds = posts.map((p) => p.id);

        // Get all likes for these posts
        const { data: allLikes } = await supabase
          .from("post_likes")
          .select("postid, userid")
          .in("postid", postIds);

        // Get comments count for these posts
        const { data: commentsCount } = await supabase
          .from("comments")
          .select("postid")
          .in("postid", postIds);

        // Check which posts the current user has liked
        const userLikes =
          allLikes?.filter((like) => like.userid === userId) || [];
        const likedPostIds = new Set(userLikes.map((like) => like.postid));

        // Calculate like counts for each post
        const likeCounts =
          allLikes?.reduce((acc, like) => {
            acc[like.postid] = (acc[like.postid] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) || {};

        // Calculate comments count for each post
        const commentsCountMap =
          commentsCount?.reduce((acc, comment) => {
            acc[comment.postid] = (acc[comment.postid] || 0) + 1;
            return acc;
          }, {} as Record<string, number>) || {};

        // Transform posts with proper structure
        const transformedPosts = posts.map((post) => ({
          ...post,
          likes: allLikes?.filter((like) => like.postid === post.id) || [],
          likes_count: likeCounts[post.id] || 0,
          userLiked: likedPostIds.has(post.id),
          comments_count: commentsCountMap[post.id] || 0,
          comments: [], // Add empty comments array for compatibility
        }));

        return { data: transformedPosts, error: null, hasMore };
      }

      return { data: posts || [], error: null, hasMore };
    } catch (error) {
      console.error("Error in getHomePagePosts:", error);
      return { data: [], error: error as Error, hasMore: false };
    }
  },

  async updatePost(
    postId: string,
    updates: { content?: string; image?: string },
    userId: string
  ) {
    try {
      // Verify user is authenticated
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user || currentUser.user.id !== userId) {
        return { data: null, error: new Error("Authentication required") };
      }

      // Check if user owns the post
      const { data: post, error: fetchError } = await supabase
        .from("posts")
        .select("userid")
        .eq("id", postId)
        .single();

      if (fetchError || !post) {
        return { data: null, error: new Error("Post not found") };
      }

      if (post.userid !== userId) {
        return {
          data: null,
          error: new Error("You can only edit your own posts"),
        };
      }

      // Update the post
      const { data, error } = await supabase
        .from("posts")
        .update(updates)
        .eq("id", postId)
        .select()
        .single();

      if (error) {
        console.error("Error updating post:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error in updatePost:", error);
      return { data: null, error: error as Error };
    }
  },

  async deletePost(postId: string, userId: string) {
    try {
      // Verify user is authenticated
      const { data: currentUser, error: authError } =
        await supabase.auth.getUser();

      if (!currentUser?.user || authError) {
        console.error("🗑️ STEP 1 FAILED: Authentication failed");
        console.error("🗑️ - Missing user object:", !currentUser?.user);
        console.error("🗑️ - Has auth error:", !!authError);
        console.error("🗑️ - Auth error details:", authError);
        return { data: null, error: new Error("Authentication required") };
      }

      // Get post details first to understand permissions
      const { data: postDetails, error: fetchError } = await supabase
        .from("posts")
        .select(
          `
          id,
          userid,
          content,
          circleid,
          creationdate,
          circles:circleid(
            id,
            name,
            creator,
            circle_admins(userid)
          )
        `
        )
        .eq("id", postId)
        .single();

      if (fetchError || !postDetails) {
        console.error("🗑️ STEP 2 FAILED: Post not found or fetch error");
        console.error("🗑️ - Error details:", fetchError);
        return {
          data: null,
          error: new Error(
            `Post not found: ${fetchError?.message || "Unknown error"}`
          ),
        };
      }

      let hasPermission = false;
      let permissionReason = "none";

      // Check if user owns the post
      if (postDetails.userid === currentUser.user.id) {
        hasPermission = true;
        permissionReason = "post_owner";
      }

      // Check circle permissions if post is in a circle
      if (!hasPermission && postDetails.circleid && postDetails.circles) {
        // Check if user is circle creator
        if (postDetails.circles.creator === currentUser.user.id) {
          hasPermission = true;
          permissionReason = "circle_creator";
        }

        // Check if user is circle admin
        if (!hasPermission && postDetails.circles.circle_admins) {
          const isAdmin = postDetails.circles.circle_admins.some(
            (admin: any) => admin.userid === currentUser.user.id
          );
          if (isAdmin) {
            hasPermission = true;
            permissionReason = "circle_admin";
          }
        }
      }

      if (!hasPermission) {
        console.error("🗑️ STEP 3 FAILED: Permission denied");
        console.error("🗑️ - User ID:", currentUser.user.id);
        console.error("🗑️ - Post owner ID:", postDetails.userid);
        console.error("🗑️ - Circle ID:", postDetails.circleid);
        console.error("🗑️ - Circle creator:", postDetails.circles?.creator);
        return {
          data: null,
          error: new Error("You do not have permission to delete this post"),
        };
      }

      // Perform the delete
      const { data, error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId)
        .select("*");

      if (error) {
        console.error("🗑️ STEP 4 FAILED: Delete operation failed");
        console.error(
          "🗑️ - Full error object:",
          JSON.stringify(error, null, 2)
        );
        return {
          data: null,
          error: new Error(
            `Failed to delete post: ${error.message} (Code: ${error.code})`
          ),
        };
      }

      if (!data || data.length === 0) {
        console.error("🗑️ STEP 4 FAILED: No rows affected by delete");
        console.error("🗑️ - This could indicate:");
        console.error("🗑️   1. Post ID does not exist");
        console.error("🗑️   2. RLS policy is blocking the delete");
        console.error("🗑️   3. Post was already deleted");
        console.error("🗑️ - Post ID attempted:", postId);
        console.error("🗑️ - User ID:", currentUser.user.id);
        return {
          data: null,
          error: new Error("Post not found or already deleted"),
        };
      }

      return { data: { success: true, deletedPost: data[0] }, error: null };
    } catch (error) {
      console.error(
        "🗑️ ═══════════════════════════════════════════════════════════"
      );
      console.error("🗑️ DELETE POST FUNCTION FAILED WITH EXCEPTION");
      console.error(
        "🗑️ ═══════════════════════════════════════════════════════════"
      );
      console.error("🗑️ EXCEPTION DETAILS:");
      console.error("🗑️ - Error type:", typeof error);
      console.error(
        "🗑️ - Error message:",
        error instanceof Error ? error.message : String(error)
      );
      console.error(
        "🗑️ - Error stack:",
        error instanceof Error ? error.stack : "No stack trace"
      );
      console.error("🗑️ - Error object:", error);
      console.error(
        "🗑️ ═══════════════════════════════════════════════════════════"
      );

      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  async likePost(postId: string, userId: string) {
    try {
      // Verify user is authenticated
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user || currentUser.user.id !== userId) {
        return { data: null, error: new Error("Authentication required") };
      }

      const { data, error } = await supabase
        .from("post_likes")
        .insert({
          postid: postId,
          userid: userId,
        })
        .select();

      if (error) {
        console.error("Error liking post:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error in likePost:", error);
      return { data: null, error: error as Error };
    }
  },

  async unlikePost(postId: string, userId: string) {
    try {
      // Verify user is authenticated
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user || currentUser.user.id !== userId) {
        return { data: null, error: new Error("Authentication required") };
      }

      const { data, error } = await supabase
        .from("post_likes")
        .delete()
        .eq("postid", postId)
        .eq("userid", userId);

      if (error) {
        console.error("Error unliking post:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error in unlikePost:", error);
      return { data: null, error: error as Error };
    }
  },

  async createComment(postId: string, userId: string, text: string) {
    try {
      // Verify user is authenticated
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user || currentUser.user.id !== userId) {
        return { data: null, error: new Error("Authentication required") };
      }

      // Generate a proper UUID for the comment ID
      const commentId = crypto.randomUUID();
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("comments")
        .insert({
          id: commentId,
          postid: postId,
          userid: userId,
          text: text,
          timestamp: now,
          creationdate: now,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating comment:", error);
        return { data: null, error };
      }

      // Get the user info separately to avoid foreign key issues
      const { data: userInfo } = await supabase
        .from("users")
        .select("name, avatar_url")
        .eq("id", userId)
        .single();

      // Transform the response to match expected format
      const transformedData = {
        ...data,
        author: userInfo || { name: "Unknown User", avatar_url: null },
      };

      return { data: transformedData, error: null };
    } catch (error) {
      console.error("Error in createComment:", error);
      return { data: null, error: error as Error };
    }
  },

  async getPostComments(postId: string) {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("postid", postId)
        .order("creationdate", { ascending: true });

      if (error) {
        console.error("Error getting comments:", error);
        return { data: [], error };
      }

      if (!data || data.length === 0) {
        return { data: [], error: null };
      }

      // Get user info for each comment
      const userIds = [...new Set(data.map((comment) => comment.userid))];
      const { data: users } = await supabase
        .from("users")
        .select("id, name, avatar_url")
        .in("id", userIds);

      // Create a map of user info
      const userMap = (users || []).reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as Record<string, any>);

      // Transform the response to match expected format
      const transformedData = data.map((comment) => ({
        ...comment,
        author: userMap[comment.userid] || {
          name: "Unknown User",
          avatar_url: null,
        },
      }));

      return { data: transformedData, error: null };
    } catch (error) {
      console.error("Error in getPostComments:", error);
      return { data: [], error: error as Error };
    }
  },

  async deleteComment(commentId: string, userId: string) {
    try {
      // Verify user is authenticated
      const { data: currentUser, error: authError } =
        await supabase.auth.getUser();

      if (!currentUser?.user || authError) {
        console.error("🗑️ Authentication failed:", authError);
        return { data: null, error: new Error("Authentication required") };
      }

      if (currentUser.user.id !== userId) {
        console.error("🗑️ User ID mismatch");
        return { data: null, error: new Error("Authentication mismatch") };
      }

      // Get comment and related permissions in one query
      const { data: commentData, error: fetchError } = await supabase
        .from("comments")
        .select(
          `
          userid,
          id,
          text,
          postid,
          posts!inner(
            userid,
            circleid,
            circles(
              creator,
              circle_admins(userid)
            )
          )
        `
        )
        .eq("id", commentId)
        .single();

      if (fetchError || !commentData) {
        console.error("🗑️ Comment not found:", fetchError);
        return { data: null, error: new Error("Comment not found") };
      }

      // Check permissions
      let hasPermission = false;

      // 1. Comment owner can delete their own comment
      if (commentData.userid === userId) {
        hasPermission = true;
      }

      // 2. Post owner can delete comments on their post
      if (commentData.posts?.userid === userId) {
        hasPermission = true;
      }

      // 3. Circle admin or creator can delete comments in their circle
      if (commentData.posts?.circleid) {
        const circle = commentData.posts.circles;
        if (circle?.creator === userId) {
          hasPermission = true;
        }

        const circleAdmins = circle?.circle_admins || [];
        if (circleAdmins.some((admin: any) => admin.userid === userId)) {
          hasPermission = true;
        }
      }

      if (!hasPermission) {
        console.error("🗑️ Permission denied");
        return {
          data: null,
          error: new Error("You do not have permission to delete this comment"),
        };
      }

      // Delete the comment
      const { data, error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .select("*");

      if (error) {
        console.error("🗑️ Delete failed:", error);
        return {
          data: null,
          error: new Error(`Failed to delete comment: ${error.message}`),
        };
      }

      if (!data || data.length === 0) {
        console.error("🗑️ No rows affected");
        return {
          data: null,
          error: new Error("Comment not found or already deleted"),
        };
      }

      return { data: { success: true, deletedComment: data[0] }, error: null };
    } catch (error) {
      console.error("🗑️ Unexpected error:", error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },
};
