import { supabase } from "../supabase";

export const NotificationService = {
  async getUserNotifications(userId: string) {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("userid", userId)
      .order("creationdate", { ascending: false });
    return { data, error };
  },

  async markNotificationAsRead(notificationId: string) {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) {
      return { data: null, error: new Error("Authentication required") };
    }

    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)
      .select()
      .single();
    return { data, error };
  },

  async markAllNotificationsAsRead(userId: string) {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) {
      return { data: null, error: new Error("Authentication required") };
    }

    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("userid", userId)
      .eq("read", false);
    return { data, error };
  },
};
