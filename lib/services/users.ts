import { supabase } from "../supabase";
import type { User } from "@/types/database";

export const UserService = {
  async getUser(id: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  },

  async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from("users")
      .update(updates as any)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  async updateUserAvatar(id: string, avatarUrl: string) {
    const { data, error } = await supabase
      .from("users")
      .update({ avatar_url: avatarUrl })
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  async checkFirstLogin(userId: string) {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user || currentUser.user.id !== userId) {
        return { data: null, error: new Error("Authentication required") };
      }

      const { data, error } = await supabase
        .from("users")
        .select("first_login")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error checking first login:", error);
        return { data: null, error };
      }

      return { data: data?.first_login || false, error: null };
    } catch (error) {
      console.error("Error in checkFirstLogin:", error);
      return { data: null, error: error as Error };
    }
  },

  async updateFirstLogin(userId: string) {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user || currentUser.user.id !== userId) {
        return { data: null, error: new Error("Authentication required") };
      }

      const { data, error } = await supabase
        .from("users")
        .update({ first_login: false })
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating first login:", error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error in updateFirstLogin:", error);
      return { data: null, error: error as Error };
    }
  },
};
