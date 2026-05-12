import { supabase } from "../supabase";
import { StorageService } from "../storage";

export const EventService = {
  async getEvents() {
    // Verify user is authenticated
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) {
      return { data: null, error: new Error("Authentication required") };
    }

    // Get events that are either general (circleid is null) or from circles the user is a member of
    const { data: events, error } = await supabase
      .from("events")
      .select(
        `
        *,
        creator:users!events_createdby_fkey(name),
        circle:circles!events_circleid_fkey(name),
        event_interests(
          interests(id, title, category)
        )
      `
      )
      .or(
        `circleid.is.null,circleid.in.(${await this.getUserCircleIds(
          currentUser.user.id
        )})`
      )
      .order("creationdate", { ascending: false });

    if (error) {
      return { data: null, error };
    }

    // Get RSVP data separately and calculate counts for each event
    if (events && events.length > 0) {
      const eventIds = events.map((e) => e.id);

      // Get all RSVPs for these events
      const { data: allRsvps } = await supabase
        .from("event_rsvps")
        .select("event_id, user_id, status")
        .in("event_id", eventIds);

      // Get current user's RSVPs
      const { data: userRsvps } = await supabase
        .from("event_rsvps")
        .select("event_id, status")
        .eq("user_id", currentUser.user.id)
        .in("event_id", eventIds);

      // Calculate counts and add user RSVP status
      const enhancedEvents = events.map((event) => {
        const eventRsvps =
          allRsvps?.filter((rsvp) => rsvp.event_id === event.id) || [];
        const userRsvp = userRsvps?.find((rsvp) => rsvp.event_id === event.id);

        return {
          ...event,
          going_count: eventRsvps.filter((r) => r.status === "going").length,
          maybe_count: eventRsvps.filter((r) => r.status === "maybe").length,
          not_going_count: eventRsvps.filter((r) => r.status === "not_going")
            .length,
          userRsvpStatus: userRsvp?.status || null,
          circleName: event.circle?.name || null,
        };
      });

      return { data: enhancedEvents, error: null };
    }

    return { data: events || [], error: null };
  },

  async getUserCircleIds(userId: string) {
    try {
      const { data } = await supabase
        .from("user_circles")
        .select("circleid")
        .eq("userid", userId);

      const circleIds = data?.map((uc) => uc.circleid) || [];
      return circleIds.length > 0
        ? circleIds.join(",")
        : "00000000-0000-0000-0000-000000000000"; // dummy ID if no circles
    } catch (error) {
      return "00000000-0000-0000-0000-000000000000"; // dummy ID on error
    }
  },

  async getEventsByCircle(circleId: string) {
    // Verify user is authenticated
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) {
      return { data: null, error: new Error("Authentication required") };
    }

    const { data: events, error } = await supabase
      .from("events")
      .select(
        `
        *,
        creator:users!events_createdby_fkey(name),
        circle:circles!events_circleid_fkey(name),
        event_interests(
          interests(id, title, category)
        )
      `
      )
      .eq("circleid", circleId)
      .order("date", { ascending: true });

    if (error) {
      return { data: null, error };
    }

    // Get RSVP data separately and calculate counts for each event
    if (events && events.length > 0) {
      const eventIds = events.map((e) => e.id);

      // Get all RSVPs for these events
      const { data: allRsvps } = await supabase
        .from("event_rsvps")
        .select("event_id, user_id, status")
        .in("event_id", eventIds);

      // Get current user's RSVPs
      const { data: userRsvps } = await supabase
        .from("event_rsvps")
        .select("event_id, status")
        .eq("user_id", currentUser.user.id)
        .in("event_id", eventIds);

      // Calculate counts and add user RSVP status
      const enhancedEvents = events.map((event) => {
        const eventRsvps =
          allRsvps?.filter((rsvp) => rsvp.event_id === event.id) || [];
        const userRsvp = userRsvps?.find((rsvp) => rsvp.event_id === event.id);

        return {
          ...event,
          going_count: eventRsvps.filter((r) => r.status === "going").length,
          maybe_count: eventRsvps.filter((r) => r.status === "maybe").length,
          not_going_count: eventRsvps.filter((r) => r.status === "not_going")
            .length,
          user_rsvp: userRsvp ? [{ status: userRsvp.status }] : [],
          circleName: event.circle?.name || null,
        };
      });

      return { data: enhancedEvents, error: null };
    }

    return { data: events || [], error: null };
  },

  async createEvent(
    event: Omit<any, "id" | "creationdate"> & {
      interests?: any[];
      photoAsset?: any;
      location_url?: string | null;
    }
  ) {
    // Verify user is authenticated
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) {
      return { data: null, error: new Error("Authentication required") };
    }

    try {
      const eventId = crypto.randomUUID();

      // Extract interests and photo from event object and create clean event data
      const { interests, photoAsset, location_url, ...eventDataClean } = event;

      let eventPhotoUrl = null;

      // Upload photo if provided
      if (photoAsset) {
        const { data: uploadData, error: uploadError } =
          await StorageService.uploadEventPhoto(
            eventId,
            photoAsset,
            currentUser.user.id
          );

        if (uploadError) {
          console.error("Error uploading event photo:", uploadError);
          return { data: null, error: uploadError };
        }

        if (uploadData?.publicUrl) {
          eventPhotoUrl = uploadData.publicUrl;
        }
      }

      // Create the event with photo URL if available - fix column name
      const eventToInsert: any = {
        ...eventDataClean,
        id: eventId,
        createdby: currentUser.user.id,
        creationdate: new Date().toISOString(),
        photo_url: eventPhotoUrl, // Add photo URL to event
        location_url: location_url || null, // Add location_url to event
      };

      // Fix column name - use circleid not circleId
      if (eventToInsert.circleId) {
        eventToInsert.circleid = eventToInsert.circleId;
        delete eventToInsert.circleId;
      }

      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .insert(eventToInsert)
        .select()
        .single();

      if (eventError) {
        console.error("Error creating event:", eventError);
        // If event creation fails and we uploaded a photo, clean it up
        if (eventPhotoUrl && photoAsset) {
          try {
            const urlParts = eventPhotoUrl.split("/");
            const fileName = urlParts[urlParts.length - 1].split("?")[0];
            await StorageService.deleteEventPhoto(eventId, fileName);
          } catch (cleanupError) {
            console.error(
              "Error cleaning up uploaded photo after event creation failure:",
              cleanupError
            );
          }
        }
        return { data: null, error: eventError };
      }

      // Add event interests if provided
      if (interests && interests.length > 0) {
        // Handle both string array format and object array format from EventModal
        const eventInterests = interests
          .map((interest) => {
            if (typeof interest === "string") {
              // Simple string interest ID
              return {
                eventid: eventData.id,
                interestid: interest,
              };
            } else if (interest.interestid) {
              // Object with interestid property (from EventModal)
              return {
                eventid: eventData.id,
                interestid: interest.interestid,
              };
            } else {
              // Fallback
              console.warn("Unknown interest format:", interest);
              return null;
            }
          })
          .filter(Boolean); // Remove null entries

        const { error: interestsError } = await supabase
          .from("event_interests")
          .insert(eventInterests as any);

        if (interestsError) {
          console.error("Error adding event interests:", interestsError);
          // Don't fail the event creation if interests fail, but log the error
        }
      }

      return { data: eventData, error: null };
    } catch (error) {
      console.error("Error creating event:", error);
      return { data: null, error: error as Error };
    }
  },

  async deleteEvent(eventId: string) {
    try {
      // Check authentication
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return { data: null, error: new Error("Authentication required") };
      }

      // First, get the event details to check permissions manually
      const { data: eventData, error: fetchError } = await supabase
        .from("events")
        .select("id, createdby, circleid")
        .eq("id", eventId)
        .single();

      if (fetchError || !eventData) {
        return { data: null, error: new Error("Event not found") };
      }

      // Check if user has permission to delete
      let hasPermission = false;

      // 1. Event creator can delete
      if (eventData.createdby === currentUser.user.id) {
        hasPermission = true;
      }

      // 2. If it's a circle event, check if user is circle creator or admin
      if (!hasPermission && eventData.circleid) {
        // Check if user is circle creator
        const { data: circleData } = await supabase
          .from("circles")
          .select("creator")
          .eq("id", eventData.circleid)
          .single();

        if (circleData?.creator === currentUser.user.id) {
          hasPermission = true;
        }

        // Check if user is circle admin
        if (!hasPermission) {
          const { data: adminData } = await supabase
            .from("circle_admins")
            .select("userid")
            .eq("circleid", eventData.circleid)
            .eq("userid", currentUser.user.id)
            .single();

          if (adminData) {
            hasPermission = true;
          }
        }
      }

      if (!hasPermission) {
        return {
          data: null,
          error: new Error("You do not have permission to delete this event"),
        };
      }

      // Now attempt to delete with service role to bypass RLS
      const { data, error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId)
        .select();

      if (error) {
        return { data: null, error };
      }

      if (!data || data.length === 0) {
        return { data: null, error: new Error("Event not found") };
      }

      return { data: data[0], error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  async updateEvent(
    eventId: string,
    updates: {
      title?: string;
      description?: string;
      date?: string;
      time?: string;
      location?: string;
      photo_url?: string;
      location_url?: string;
    }
  ) {
    try {
      // Verify user is authenticated
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return { data: null, error: new Error("Authentication required") };
      }

      // Check if user has permission to update
      const { data: event } = await supabase
        .from("events")
        .select("createdby, circleid")
        .eq("id", eventId)
        .single();

      if (!event) {
        return { data: null, error: new Error("Event not found") };
      }

      const isCreator = event.createdby === currentUser.user.id;
      let isCircleAdmin = false;

      if (!isCreator && event.circleid) {
        // Check if user is circle admin
        const { data: adminCheck } = await supabase
          .from("circle_admins")
          .select("userid")
          .eq("circleid", event.circleid)
          .eq("userid", currentUser.user.id)
          .single();

        if (adminCheck) {
          isCircleAdmin = true;
        } else {
          // Check if user is circle creator
          const { data: circleCheck } = await supabase
            .from("circles")
            .select("creator")
            .eq("id", event.circleid)
            .single();

          if (circleCheck?.creator === currentUser.user.id) {
            isCircleAdmin = true;
          }
        }
      }

      if (!isCreator && !isCircleAdmin) {
        return {
          data: null,
          error: new Error("You do not have permission to edit this event"),
        };
      }

      const { data, error } = await supabase
        .from("events")
        .update(updates)
        .eq("id", eventId)
        .select()
        .single();

      if (error) {
        console.error("Error updating event:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error in updateEvent:", error);
      return { data: null, error: error as Error };
    }
  },

  async updateEventInterests(eventId: string, newInterests: string[]) {
    // Verify user is authenticated
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) {
      return { data: null, error: new Error("Authentication required") };
    }

    try {
      // Get current interests
      const { data: currentInterests } = await supabase
        .from("event_interests")
        .select("interestid")
        .eq("eventid", eventId);

      const currentInterestIds =
        currentInterests?.map((ci) => ci.interestid) || [];

      // Find interests to add and remove
      const interestsToAdd = newInterests.filter(
        (id) => !currentInterestIds.includes(id)
      );
      const interestsToRemove = currentInterestIds.filter(
        (id) => !newInterests.includes(id)
      );

      // Remove old interests
      if (interestsToRemove.length > 0) {
        const { error: removeError } = await supabase
          .from("event_interests")
          .delete()
          .eq("eventid", eventId)
          .in("interestid", interestsToRemove);

        if (removeError) {
          console.error("Error removing interests:", removeError);
          return { data: null, error: removeError };
        }
      }

      // Add new interests
      if (interestsToAdd.length > 0) {
        const newEventInterests = interestsToAdd.map((interestId) => ({
          eventid: eventId,
          interestid: interestId,
        }));

        const { error: addError } = await supabase
          .from("event_interests")
          .insert(newEventInterests);

        if (addError) {
          console.error("Error adding interests:", addError);
          return { data: null, error: addError };
        }
      }

      return { data: { success: true }, error: null };
    } catch (error) {
      console.error("Error in updateEventInterests:", error);
      return { data: null, error: error as Error };
    }
  },

  async getEvent(eventId: string) {
    return await supabase
      .from("events")
      .select(
        `
        *,
        creator:users!events_createdby_fkey(
          name,
          avatar_url
        ),
        circle:circles!events_circleid_fkey(
          id,
          name
        ),
        event_interests(
          interests(
            id,
            title
          )
        ),
        user_rsvp:event_rsvp!event_rsvp_eventid_fkey(
          status
        ),
        going_count:event_rsvp!event_rsvp_eventid_fkey(count),
        maybe_count:event_rsvp!event_rsvp_eventid_fkey(count),
        no_going_count:event_rsvp!event_rsvp_eventid_fkey(count)
      `
      )
      .eq("id", eventId)
      .single();
  },

  async createEventRsvp(
    eventId: string,
    status: "going" | "maybe" | "not_going"
  ) {
    try {
      // Verify user is authenticated
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return { data: null, error: new Error("Authentication required") };
      }

      const { data, error } = await supabase
        .from("event_rsvps")
        .insert([
          {
            event_id: eventId,
            user_id: currentUser.user.id,
            status: status,
          },
        ])
        .select();

      if (error) {
        console.error("Error creating RSVP:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error in createEventRsvp:", error);
      return { data: null, error: error as Error };
    }
  },

  async updateEventRsvp(
    eventId: string,
    status: "going" | "maybe" | "not_going"
  ) {
    try {
      // Verify user is authenticated
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return { data: null, error: new Error("Authentication required") };
      }

      const { data, error } = await supabase
        .from("event_rsvps")
        .update({ status: status })
        .eq("event_id", eventId)
        .eq("user_id", currentUser.user.id)
        .select();

      if (error) {
        console.error("Error updating RSVP:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error in updateEventRsvp:", error);
      return { data: null, error: error as Error };
    }
  },

  async deleteEventRsvp(eventId: string) {
    try {
      // Verify user is authenticated
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return { data: null, error: new Error("Authentication required") };
      }

      const { error } = await supabase
        .from("event_rsvps")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", currentUser.user.id);

      if (error) {
        console.error("Error deleting RSVP:", error);
        return { data: null, error };
      }

      return { data: { success: true }, error: null };
    } catch (error) {
      console.error("Error in deleteEventRsvp:", error);
      return { data: null, error: error as Error };
    }
  },

  async getEventRsvp(eventId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from("event_rsvps")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found"
        console.error("Error getting RSVP:", error);
        return { data: null, error };
      }

      return { data: data || null, error: null };
    } catch (error) {
      console.error("Error in getEventRsvp:", error);
      return { data: null, error: error as Error };
    }
  },

  async getEventRsvps(eventId: string) {
    try {
      const { data, error } = await supabase
        .from("event_rsvps")
        .select(
          `
          *,
          users!event_rsvps_user_id_fkey(name, avatar_url)
        `
        )
        .eq("event_id", eventId);

      if (error) {
        console.error("Error getting event RSVPs:", error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error("Error in getEventRsvps:", error);
      return { data: [], error: error as Error };
    }
  },
};
