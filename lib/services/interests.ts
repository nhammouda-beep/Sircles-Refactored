import { supabase } from "../supabase";

export const InterestService = {
  async getInterests() {
    const { data, error } = await supabase
      .from("interests")
      .select("id, title, category")
      .order("category, title");
    return { data, error };
  },

  async getUserInterests(userId: string) {
    try {
      const { data, error } = await supabase
        .from("user_interests")
        .select(
          `
          interestid,
          interests(
            id,
            title,
            category
          )
        `
        )
        .eq("userid", userId);

      if (error) return { data: null, error };
      return { data: data || [], error: null };
    } catch (error) {
      console.error("Error in getUserInterests:", error);
      return { data: [], error: null };
    }
  },

  async getUserLookFor(userId: string) {
    try {
      const { data, error } = await supabase
        .from("user_look_for")
        .select(
          `
          interestid,
          interests(
            id,
            title,
            category
          )
        `
        )
        .eq("userid", userId);

      if (error) return { data: null, error };
      return { data: data || [], error: null };
    } catch (error) {
      console.error("Error in getUserLookFor:", error);
      return { data: [], error: null };
    }
  },

  async getInterestsByCategory() {
    const { data, error } = await supabase
      .from("interests")
      .select("id, title, category")
      .order("category, title");

    if (error) return { data: null, error };

    const groupedInterests: { [key: string]: any[] } = {};
    data?.forEach((interest) => {
      const category = interest.category || "Other";
      if (!groupedInterests[category]) {
        groupedInterests[category] = [];
      }
      groupedInterests[category].push(interest);
    });

    return { data: groupedInterests, error: null };
  },

  async createUserInterest(userId: string, interestId: string) {
    try {
      const { data, error } = await supabase.from("user_interests").upsert(
        { userid: userId, interestid: interestId },
        { onConflict: "userid,interestid" }
      );
      return { data, error };
    } catch (error) {
      console.error("Error creating user interest:", error);
      return { data: null, error };
    }
  },

  async createUserLookingFor(userId: string, interestId: string) {
    try {
      const { data, error } = await supabase.from("user_look_for").upsert(
        { userid: userId, interestid: interestId },
        { onConflict: "userid,interestid" }
      );
      return { data, error };
    } catch (error) {
      console.error("Error creating user looking for:", error);
      return { data: null, error };
    }
  },
};
