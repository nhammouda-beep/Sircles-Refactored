import { supabase } from "../supabase";

export const CircleService = {
  async getCircles(page = 0, limit = 30) {
    const from = page * limit;
    const to = from + limit - 1;
    const { data, error } = await supabase
      .from("circles")
      .select(
        `
        *,
        circle_interests(
          interests(
            id,
            title,
            category
          )
        )
      `
      )
      .order("creationdate", { ascending: false })
      .range(from, to);
    const hasMore = (data?.length || 0) === limit;
    return { data, error, hasMore };
  },

  async getCircleInterests(circleId: string) {
    const { data, error } = await supabase
      .from("circle_interests")
      .select(
        `
        interests(
          id,
          title,
          category
        )
      `
      )
      .eq("circleid", circleId);

    return {
      data: data?.map((ci) => ci.interests).filter(Boolean) || [],
      error,
    };
  },

  async getUserCircles(userId: string) {
    try {
      const { data, error } = await supabase
        .from("user_circles")
        .select(
          `
          circleid,
          circles (*)
        `
        )
        .eq("userid", userId);

      if (error) {
        // Handle RLS policy errors
        if (error.code === "PGRST001" || error.code === "42501") {
          return { data: [], error: null };
        }
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error("Error in getUserCircles:", error);
      return { data: [], error: null };
    }
  },

  async createCircle(circle: any) {
    // Verify user exists and is authenticated
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) {
      return { data: null, error: new Error("User not authenticated") };
    }

    const circleId = crypto.randomUUID();
    const userId = currentUser.user.id;

    // Use auth.uid() directly as the creator ID and include the generated ID
    const newCircle = {
      id: circleId,
      ...circle,
      creator: userId,
      createdby: userId, // Also set createdby for consistency
      creationdate: new Date().toISOString(),
    };

    try {
      // 1. Insert into circles table with the generated ID
      const { data: circleData, error: circleError } = await supabase
        .from("circles")
        .insert(newCircle)
        .select()
        .single();

      if (circleError) {
        console.error("Error creating circle:", circleError);
        return { data: null, error: circleError };
      }

      // 2. Add creator as admin in circle_admins using the created circle's ID
      const { error: adminError } = await supabase
        .from("circle_admins")
        .insert({
          circleid: circleData.id, // Use the ID from the created circle
          userid: userId,
        });

      if (adminError) {
        console.error("Error adding admin:", adminError);
        // Rollback circle creation if admin creation fails
        await supabase.from("circles").delete().eq("id", circleData.id);
        return { data: null, error: adminError };
      }

      // 3. Add creator to user_circles (join the circle) using the created circle's ID
      const { error: joinError } = await supabase.from("user_circles").insert({
        userid: userId,
        circleid: circleData.id, // Use the ID from the created circle
      });

      if (joinError) {
        console.error("Error joining circle:", joinError);
        // Rollback previous operations
        await supabase
          .from("circle_admins")
          .delete()
          .eq("circleid", circleData.id);
        await supabase.from("circles").delete().eq("id", circleData.id);
        return { data: null, error: joinError };
      }

      return { data: circleData, error: null };
    } catch (error) {
      console.error("Error in createCircle transaction:", error);
      return { data: null, error: error as Error };
    }
  },

  async updateCircle(
    circleId: string,
    updates: {
      name?: string;
      description?: string;
      privacy?: "public" | "private";
      circle_profile_url?: string;
    },
    userId: string
  ) {
    try {
      // Verify user is authenticated
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return { data: null, error: new Error("Authentication required") };
      }

      // Check if user is admin or creator
      const { data: adminCheck } = await supabase
        .from("circles")
        .select("creator")
        .eq("id", circleId)
        .single();

      if (!adminCheck) {
        return { data: null, error: new Error("Circle not found") };
      }

      const isCreator = adminCheck.creator === userId;

      if (!isCreator) {
        // Check if user is admin
        const { data: isAdmin } = await supabase
          .from("circle_admins")
          .select("userid")
          .eq("circleid", circleId)
          .eq("userid", userId)
          .single();

        if (!isAdmin) {
          return {
            data: null,
            error: new Error("You do not have permission to edit this circle"),
          };
        }
      }

      const { data, error } = await supabase
        .from("circles")
        .update(updates)
        .eq("id", circleId)
        .select()
        .single();

      if (error) {
        console.error("Error updating circle:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error in updateCircle:", error);
      return { data: null, error: error as Error };
    }
  },

  async updateCircleInterests(
    circleId: string,
    interestIds: string[],
    userId: string
  ) {
    try {
      // Verify user is authenticated
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return { data: null, error: new Error("Authentication required") };
      }

      // Check if user is admin or creator
      const { data: adminCheck } = await supabase
        .from("circles")
        .select("creator")
        .eq("id", circleId)
        .single();

      if (!adminCheck) {
        return { data: null, error: new Error("Circle not found") };
      }

      const isCreator = adminCheck.creator === userId;

      if (!isCreator) {
        // Check if user is admin
        const { data: isAdmin } = await supabase
          .from("circle_admins")
          .select("userid")
          .eq("circleid", circleId)
          .eq("userid", userId)
          .single();

        if (!isAdmin) {
          return {
            data: null,
            error: new Error(
              "You do not have permission to edit circle interests"
            ),
          };
        }
      }

      // Get current interests
      const { data: currentInterests } = await supabase
        .from("circle_interests")
        .select("interestid")
        .eq("circleid", circleId);

      const currentInterestIds =
        currentInterests?.map((ci) => ci.interestid) || [];

      // Find interests to add and remove
      const interestsToAdd = interestIds.filter(
        (id) => !currentInterestIds.includes(id)
      );
      const interestsToRemove = currentInterestIds.filter(
        (id) => !interestIds.includes(id)
      );

      // Remove old interests
      if (interestsToRemove.length > 0) {
        const { error: removeError } = await supabase
          .from("circle_interests")
          .delete()
          .eq("circleid", circleId)
          .in("interestid", interestsToRemove);

        if (removeError) {
          console.error("Error removing interests:", removeError);
          return { data: null, error: removeError };
        }
      }

      // Add new interests
      if (interestsToAdd.length > 0) {
        const newInterests = interestsToAdd.map((interestId) => ({
          circleid: circleId,
          interestid: interestId,
        }));

        const { error: addError } = await supabase
          .from("circle_interests")
          .insert(newInterests);

        if (addError) {
          console.error("Error adding interests:", addError);
          return { data: null, error: addError };
        }
      }

      return { data: { success: true }, error: null };
    } catch (error) {
      console.error("Error in updateCircleInterests:", error);
      return { data: null, error: error as Error };
    }
  },

  async joinCircle(userId: string, circleId: string) {
    try {
      // First check if the circle is private
      const { data: circle, error: circleError } = await supabase
        .from("circles")
        .select("privacy")
        .eq("id", circleId)
        .single();

      if (circleError) {
        return { data: null, error: new Error("Circle not found") };
      }

      // If circle is private, user should request to join instead
      if (circle.privacy === "private") {
        return {
          data: null,
          error: new Error(
            "This is a private circle. Please request to join instead."
          ),
        };
      }

      const { data, error } = await supabase
        .from("user_circles")
        .insert({ userid: userId, circleid: circleId });

      if (error) {
        // Handle RLS policy errors
        if (error.code === "PGRST001" || error.code === "42501") {
          return {
            data: null,
            error: new Error("You do not have permission to join this circle"),
          };
        }
        // Handle duplicate entry
        if (error.code === "23505") {
          return {
            data: null,
            error: new Error("You are already a member of this circle"),
          };
        }
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error in joinCircle:", error);
      return { data: null, error: error as Error };
    }
  },

  async leaveCircle(userId: string, circleId: string) {
    const { data, error } = await supabase
      .from("user_circles")
      .delete()
      .eq("userid", userId)
      .eq("circleid", circleId);
    return { data, error };
  },

  async requestToJoinCircle(
    userId: string,
    circleId: string,
    message?: string
  ) {
    try {
      // Verify user is authenticated
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return { data: null, error: new Error("Authentication required") };
      }

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from("user_circles")
        .select("userid")
        .eq("userid", userId)
        .eq("circleid", circleId)
        .single();

      if (existingMember) {
        return {
          data: null,
          error: new Error("You are already a member of this circle"),
        };
      }

      // Check if user already has a pending request
      const { data: existingRequest } = await supabase
        .from("circle_join_requests")
        .select("id, status")
        .eq("userid", userId)
        .eq("circleid", circleId)
        .single();

      if (existingRequest) {
        if (existingRequest.status === "pending") {
          return {
            data: null,
            error: new Error(
              "You already have a pending request for this circle"
            ),
          };
        } else if (existingRequest.status === "rejected") {
          // Update the existing rejected request to pending with new message
          const { data, error } = await supabase
            .from("circle_join_requests")
            .update({
              message: message || "",
              status: "pending",
              created_at: new Date().toISOString(),
            })
            .eq("id", existingRequest.id)
            .select()
            .single();

          return { data, error };
        }
      }

      // Create new join request
      const { data, error } = await supabase
        .from("circle_join_requests")
        .insert({
          id: crypto.randomUUID(),
          userid: userId,
          circleid: circleId,
          message: message || "",
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating join request:", error);
        return { data: null, error };
      }

      // Try to create notification for circle admins (don't fail if this fails)
      try {
        // Get circle admins and creator
        const { data: circle } = await supabase
          .from("circles")
          .select("creator, name")
          .eq("id", circleId)
          .single();

        if (circle) {
          const { data: admins } = await supabase
            .from("circle_admins")
            .select("userid")
            .eq("circleid", circleId);

          // Create notification for creator
          await supabase.from("notifications").insert({
            id: crypto.randomUUID(),
            userid: circle.creator,
            type: "join_request",
            title: "New Join Request",
            message: `Someone requested to join "${circle.name}"`,
            read: false,
            timestamp: new Date().toISOString(),
          });

          if (admins) {
            for (const admin of admins) {
              if (admin.userid !== circle.creator) {
                await supabase.from("notifications").insert({
                  id: crypto.randomUUID(),
                  userid: admin.userid,
                  type: "join_request",
                  title: "New Join Request",
                  message: `Someone requested to join "${circle.name}"`,
                  read: false,
                  timestamp: new Date().toISOString(),
                });
              }
            }
          }
        }
      } catch (notificationError) {
        console.error(
          "Error creating join request notification:",
          notificationError
        );
        // Don't fail the join request if notification creation fails
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error in requestToJoinCircle:", error);
      return { data: null, error: error as Error };
    }
  },

  async getCircleJoinRequests(circleId: string) {
    try {
      // Verify user is authenticated
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return { data: [], error: new Error("Authentication required") };
      }

      const { data, error } = await supabase
        .from("circle_join_requests")
        .select(
          `
          *,
          users!circle_join_requests_userid_fkey(
            id,
            name,
            avatar_url
          )
        `
        )
        .eq("circleid", circleId)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching join requests:", error);
        return { data: [], error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error("Error in getCircleJoinRequests:", error);
      return { data: [], error: error as Error };
    }
  },

  async getUserPendingRequestsBatch(circleIds: string[], userId: string) {
    try {
      if (circleIds.length === 0) return { data: [], error: null };
      const { data, error } = await supabase
        .from("circle_join_requests")
        .select("circleid")
        .eq("userid", userId)
        .eq("status", "pending")
        .in("circleid", circleIds);

      if (error) return { data: [], error };
      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error as Error };
    }
  },

  async getUserPendingRequest(circleId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from("circle_join_requests")
        .select("*")
        .eq("circleid", circleId)
        .eq("userid", userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error checking pending request:", error);
        return { data: null, error };
      }

      // Get the most recent pending request if any exists
      const pendingRequest = data && data.length > 0 ? data[0] : null;
      return { data: pendingRequest, error: null };
    } catch (error) {
      console.error("Error in getUserPendingRequest:", error);
      return { data: null, error: error as Error };
    }
  },

  async handleJoinRequest(requestId: string, action: "accept" | "reject") {
    try {
      // Verify user is authenticated
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return { data: null, error: new Error("Authentication required") };
      }

      // Get the join request details
      const { data: request, error: requestError } = await supabase
        .from("circle_join_requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (requestError || !request) {
        return { data: null, error: new Error("Join request not found") };
      }

      // Update request status
      const { error: updateError } = await supabase
        .from("circle_join_requests")
        .update({ status: action === "accept" ? "accepted" : "rejected" })
        .eq("id", requestId);

      if (updateError) {
        return { data: null, error: updateError };
      }

      // If accepted, add user to circle
      if (action === "accept") {
        const { error: joinError } = await supabase
          .from("user_circles")
          .insert({
            userid: request.userid,
            circleid: request.circleid,
          });

        if (joinError) {
          // Rollback request status update
          await supabase
            .from("circle_join_requests")
            .update({ status: "pending" })
            .eq("id", requestId);

          return {
            data: null,
            error: new Error("Failed to add user to circle"),
          };
        }
      }

      return { data: { success: true, action }, error: null };
    } catch (error) {
      console.error("Error in handleJoinRequest:", error);
      return { data: null, error: error as Error };
    }
  },

  async deleteCircle(circleId: string, userId: string) {
    try {
      // Check if user is the creator
      const { data: circle, error: circleError } = await supabase
        .from("circles")
        .select("creator")
        .eq("id", circleId)
        .single();

      if (circleError) {
        console.error("Error fetching circle:", circleError);
        return { data: null, error: circleError };
      }

      if (circle?.creator !== userId) {
        return {
          data: null,
          error: { message: "Only the circle creator can delete this circle" },
        };
      }

      // Delete the circle (cascade will handle related data due to foreign key constraints)
      const { error: deleteError } = await supabase
        .from("circles")
        .delete()
        .eq("id", circleId)
        .eq("creator", userId);

      if (deleteError) {
        console.error("Error deleting circle:", deleteError);
        return { data: null, error: deleteError };
      }

      return { data: { success: true }, error: null };
    } catch (error) {
      console.error("Error in deleteCircle:", error);
      return { data: null, error: error as Error };
    }
  },

  async getCircleMembers(circleId: string) {
    try {
      const { data, error } = await supabase
        .from("user_circles")
        .select(
          `
          userid,
          users!inner(id, name, avatar_url)
        `
        )
        .eq("circleid", circleId);

      if (error) {
        console.error("Error fetching circle members:", error);
        return { data: [], error };
      }

      if (!data || data.length === 0) {
        return { data: [], error: null };
      }

      // Get admin status for each member
      const userIds = data.map((member) => member.userid);
      const { data: adminData } = await supabase
        .from("circle_admins")
        .select("userid")
        .eq("circleid", circleId)
        .in("userid", userIds);

      const adminUserIds = new Set(
        adminData?.map((admin) => admin.userid) || []
      );

      return {
        data: data.map((member) => ({
          id: member.users.id,
          name: member.users.name,
          avatar_url: member.users.avatar_url,
          isAdmin: adminUserIds.has(member.userid),
        })),
        error: null,
      };
    } catch (error) {
      console.error("Error in getCircleMembers:", error);
      return { data: [], error: error as Error };
    }
  },

  async addCircleAdmin(
    circleId: string,
    userId: string,
    requestingAdminId: string
  ) {
    try {
      // Validate inputs
      if (!circleId) {
        return { data: null, error: new Error("Circle ID is required") };
      }
      if (!userId) {
        return { data: null, error: new Error("User ID is required") };
      }
      if (!requestingAdminId) {
        return {
          data: null,
          error: new Error("Requesting admin ID is required"),
        };
      }

      // Get circle creator
      const { data: circle, error: circleError } = await supabase
        .from("circles")
        .select("creator")
        .eq("id", circleId)
        .single();

      if (circleError) {
        return {
          data: null,
          error: new Error(`Failed to fetch circle: ${circleError.message}`),
        };
      }

      if (!circle) {
        return { data: null, error: new Error("Circle not found") };
      }

      // Verify requesting user is the main admin (creator) OR a regular admin
      const isCreator = circle.creator === requestingAdminId;

      if (!isCreator) {
        // Check if requesting user is at least an admin
        const { data: adminCheck, error: adminError } = await supabase
          .from("circle_admins")
          .select("userid")
          .eq("circleid", circleId)
          .eq("userid", requestingAdminId)
          .single();

        if (adminError || !adminCheck) {
          return {
            data: null,
            error: new Error("Only circle admins can manage admin privileges"),
          };
        }
      }

      // Check if user is already an admin
      const { data: existingAdmin } = await supabase
        .from("circle_admins")
        .select("userid")
        .eq("circleid", circleId)
        .eq("userid", userId)
        .single();

      if (existingAdmin) {
        return { data: null, error: new Error("User is already an admin") };
      }

      // Perform the insert
      const { data, error } = await supabase
        .from("circle_admins")
        .insert({
          circleid: circleId,
          userid: userId,
        })
        .select();

      if (error) {
        return {
          data: null,
          error: new Error(`Failed to add admin: ${error.message}`),
        };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async removeCircleAdmin(
    circleId: string,
    userId: string,
    requestingAdminId: string
  ) {
    try {
      // Validate inputs
      if (!circleId) {
        return { data: null, error: new Error("Circle ID is required") };
      }
      if (!userId) {
        return { data: null, error: new Error("User ID is required") };
      }
      if (!requestingAdminId) {
        return {
          data: null,
          error: new Error("Requesting admin ID is required"),
        };
      }

      // Get circle creator
      const { data: circle, error: circleError } = await supabase
        .from("circles")
        .select("creator")
        .eq("id", circleId)
        .single();

      if (circleError) {
        return {
          data: null,
          error: new Error(`Failed to fetch circle: ${circleError.message}`),
        };
      }

      if (!circle) {
        return { data: null, error: new Error("Circle not found") };
      }

      // Cannot remove the main admin (creator)
      if (circle.creator === userId) {
        return { data: null, error: new Error("Cannot remove the main admin") };
      }

      // Verify requesting user is the main admin (creator) OR a regular admin
      const isCreator = circle.creator === requestingAdminId;

      if (!isCreator) {
        // Check if requesting user is at least an admin
        const { data: adminCheck, error: adminError } = await supabase
          .from("circle_admins")
          .select("userid")
          .eq("circleid", circleId)
          .eq("userid", requestingAdminId)
          .single();

        if (adminError || !adminCheck) {
          return {
            data: null,
            error: new Error("Only circle admins can manage admin privileges"),
          };
        }
      }

      // Perform the delete
      const { data, error } = await supabase
        .from("circle_admins")
        .delete()
        .eq("circleid", circleId)
        .eq("userid", userId);

      if (error) {
        return {
          data: null,
          error: new Error(`Failed to remove admin: ${error.message}`),
        };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  },

  async removeMemberFromCircle(
    circleId: string,
    userId: string,
    adminId: string
  ) {
    try {
      // First check if requesting user is the creator
      const { data: circle, error: circleError } = await supabase
        .from("circles")
        .select("creator")
        .eq("id", circleId)
        .single();

      if (circleError) {
        return {
          data: null,
          error: new Error(`Failed to fetch circle: ${circleError.message}`),
        };
      }

      const isCreator = circle?.creator === adminId;

      if (!isCreator) {
        // Check if user is admin
        const { data: adminCheck, error: adminError } = await supabase
          .from("circle_admins")
          .select("userid")
          .eq("circleid", circleId)
          .eq("userid", adminId)
          .single();

        if (adminError) {
          return {
            data: null,
            error: new Error(
              `Failed to verify admin status: ${adminError.message}`
            ),
          };
        }

        if (!adminCheck) {
          return {
            data: null,
            error: new Error(
              "You do not have admin permissions to remove members"
            ),
          };
        }
      }

      // Cannot remove the creator from their own circle
      if (circle?.creator === userId) {
        return {
          data: null,
          error: new Error("Cannot remove the circle creator"),
        };
      }

      // Remove from circle
      const { data, error } = await supabase
        .from("user_circles")
        .delete()
        .eq("circleid", circleId)
        .eq("userid", userId);

      if (error) {
        return {
          data: null,
          error: new Error(`Failed to remove member: ${error.message}`),
        };
      }

      // Also remove admin status if they had it (ignore errors here as they might not be admin)
      await supabase
        .from("circle_admins")
        .delete()
        .eq("circleid", circleId)
        .eq("userid", userId);

      return { data, error: null };
    } catch (error) {
      console.error("Error in removeMemberFromCircle:", error);
      return { data: null, error: error as Error };
    }
  },

  async getAdminCircleIds(circleIds: string[], userId: string) {
    try {
      if (circleIds.length === 0) return { data: [], error: null };

      const { data: creatorCircles } = await supabase
        .from("circles")
        .select("id")
        .in("id", circleIds)
        .eq("creator", userId);

      const { data: adminCircles } = await supabase
        .from("circle_admins")
        .select("circleid")
        .in("circleid", circleIds)
        .eq("userid", userId);

      const ids = new Set([
        ...(creatorCircles || []).map((c: any) => c.id),
        ...(adminCircles || []).map((a: any) => a.circleid),
      ]);
      return { data: [...ids], error: null };
    } catch (error) {
      return { data: [], error: error as Error };
    }
  },

  async isCircleAdmin(circleId: string, userId: string) {
    try {
      // Check if user is the creator
      const { data: circle } = await supabase
        .from("circles")
        .select("creator")
        .eq("id", circleId)
        .single();

      const isCreator = circle?.creator === userId;
      if (isCreator)
        return {
          data: { isAdmin: true, isMainAdmin: true, isCreator: true },
          error: null,
        };

      // Check if user is in circle_admins
      const { data: admin } = await supabase
        .from("circle_admins")
        .select("userid")
        .eq("circleid", circleId)
        .eq("userid", userId)
        .single();

      const isAdmin = !!admin;
      return {
        data: { isAdmin, isMainAdmin: false, isCreator: false },
        error: null,
      };
    } catch (error) {
      console.error("Error in isCircleAdmin:", error);
      return {
        data: { isAdmin: false, isMainAdmin: false, isCreator: false },
        error: error as Error,
      };
    }
  },

  async getUserJoinedCircles(userId: string) {
    const { data, error } = await supabase
      .from("user_circles")
      .select("circleid")
      .eq("userid", userId);
    return { data, error };
  },

  async getCircleMessages(circleId: string) {
    try {
      const { data, error } = await supabase
        .from("circle_messages")
        .select(
          `
          *,
          users:senderid(name, avatar_url)
        `
        )
        .eq("circleid", circleId)
        .order("timestamp", { ascending: true });

      if (error) {
        // Handle RLS policy errors
        if (error.code === "PGRST001" || error.code === "42501") {
          return { data: [], error: null }; // Return empty array for non-members
        }
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error("Error in getCircleMessages:", error);
      return { data: [], error: null };
    }
  },

  async sendMessage(message: {
    circleId: string;
    senderId: string;
    content: string;
    type: string;
    attachment?: string;
  }) {
    try {
      const newMessage = {
        id: crypto.randomUUID(),
        circleid: message.circleId,
        senderid: message.senderId,
        content: message.content,
        type: message.type,
        attachment: message.attachment,
        timestamp: new Date().toISOString(),
        creationdate: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("circle_messages")
        .insert(newMessage)
        .select()
        .single();

      if (error) {
        // Handle RLS policy errors
        if (error.code === "PGRST001" || error.code === "42501") {
          return {
            data: null,
            error: new Error(
              "You do not have permission to send messages in this circle"
            ),
          };
        }
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error in sendMessage:", error);
      return { data: null, error: error as Error };
    }
  },

  async getCirclesByUser(userId: string) {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return { data: [], error: new Error("Authentication required") };
      }

      const { data, error } = await supabase
        .from("user_circles")
        .select(
          `
          circleid,
          circles!inner(
            id,
            name,
            description
          )
        `
        )
        .eq("userid", userId);

      if (error) {
        if (error.code === "PGRST001" || error.code === "42501") {
          return { data: [], error: null };
        }
        return { data: null, error };
      }

      return {
        data:
          data?.map((uc: any) => ({
            circleId: uc.circleid,
            circles: uc.circles,
          })) || [],
        error: null,
      };
    } catch (error) {
      console.error("Error in getCirclesByUser:", error);
      return { data: [], error: null };
    }
  },
};
