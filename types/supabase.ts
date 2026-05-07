export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      blackouts: {
        Row: {
          created_at: string | null
          created_by: string | null
          ends_at: string
          id: string
          place_id: string
          reason: string | null
          starts_at: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          ends_at: string
          id?: string
          place_id: string
          reason?: string | null
          starts_at: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          ends_at?: string
          id?: string
          place_id?: string
          reason?: string | null
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blackouts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blackouts_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          approved_by: string | null
          created_at: string | null
          ends_at: string
          id: string
          notes: string | null
          period: unknown
          place_id: string
          starts_at: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          ends_at: string
          id?: string
          notes?: string | null
          period?: unknown
          place_id: string
          starts_at: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          ends_at?: string
          id?: string
          notes?: string | null
          period?: unknown
          place_id?: string
          starts_at?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_admins: {
        Row: {
          circleid: string
          userid: string
        }
        Insert: {
          circleid: string
          userid: string
        }
        Update: {
          circleid?: string
          userid?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_admins_circleid_fkey"
            columns: ["circleid"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_admins_circleid_fkey"
            columns: ["circleid"]
            isOneToOne: false
            referencedRelation: "v_suggested_circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_admins_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_interests: {
        Row: {
          circleid: string
          interestid: string
        }
        Insert: {
          circleid: string
          interestid: string
        }
        Update: {
          circleid?: string
          interestid?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_interests_circleid_fkey"
            columns: ["circleid"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_interests_circleid_fkey"
            columns: ["circleid"]
            isOneToOne: false
            referencedRelation: "v_suggested_circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_interests_interestid_fkey"
            columns: ["interestid"]
            isOneToOne: false
            referencedRelation: "interests"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_join_requests: {
        Row: {
          circleid: string
          created_at: string | null
          id: string
          message: string | null
          status: string | null
          userid: string
        }
        Insert: {
          circleid: string
          created_at?: string | null
          id?: string
          message?: string | null
          status?: string | null
          userid: string
        }
        Update: {
          circleid?: string
          created_at?: string | null
          id?: string
          message?: string | null
          status?: string | null
          userid?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_join_requests_circleid_fkey"
            columns: ["circleid"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_join_requests_circleid_fkey"
            columns: ["circleid"]
            isOneToOne: false
            referencedRelation: "v_suggested_circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_join_requests_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_messages: {
        Row: {
          attachment: string | null
          circleid: string | null
          content: string | null
          creationdate: string | null
          id: string
          senderid: string | null
          timestamp: string | null
          type: string | null
        }
        Insert: {
          attachment?: string | null
          circleid?: string | null
          content?: string | null
          creationdate?: string | null
          id: string
          senderid?: string | null
          timestamp?: string | null
          type?: string | null
        }
        Update: {
          attachment?: string | null
          circleid?: string | null
          content?: string | null
          creationdate?: string | null
          id?: string
          senderid?: string | null
          timestamp?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "circle_messages_circleid_fkey"
            columns: ["circleid"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_messages_circleid_fkey"
            columns: ["circleid"]
            isOneToOne: false
            referencedRelation: "v_suggested_circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "circle_messages_senderid_fkey"
            columns: ["senderid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      circles: {
        Row: {
          circle_profile_url: string | null
          createdby: string
          creationdate: string | null
          creator: string | null
          description: string | null
          id: string
          member_count: number | null
          name: string | null
          privacy: string | null
        }
        Insert: {
          circle_profile_url?: string | null
          createdby?: string
          creationdate?: string | null
          creator?: string | null
          description?: string | null
          id: string
          member_count?: number | null
          name?: string | null
          privacy?: string | null
        }
        Update: {
          circle_profile_url?: string | null
          createdby?: string
          creationdate?: string | null
          creator?: string | null
          description?: string | null
          id?: string
          member_count?: number | null
          name?: string | null
          privacy?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "circles_createdby_fkey"
            columns: ["createdby"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          creationdate: string | null
          id: string
          postid: string | null
          text: string | null
          timestamp: string | null
          userid: string | null
        }
        Insert: {
          creationdate?: string | null
          id: string
          postid?: string | null
          text?: string | null
          timestamp?: string | null
          userid?: string | null
        }
        Update: {
          creationdate?: string | null
          id?: string
          postid?: string | null
          text?: string | null
          timestamp?: string | null
          userid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_postid_fkey"
            columns: ["postid"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      event_interests: {
        Row: {
          eventid: string
          interestid: string
        }
        Insert: {
          eventid: string
          interestid: string
        }
        Update: {
          eventid?: string
          interestid?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_interests_eventid_fkey"
            columns: ["eventid"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_interests_interestid_fkey"
            columns: ["interestid"]
            isOneToOne: false
            referencedRelation: "interests"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          event_id: string
          status: string
          user_id: string
        }
        Insert: {
          event_id: string
          status: string
          user_id: string
        }
        Update: {
          event_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_event"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          circleid: string | null
          createdby: string | null
          creationdate: string | null
          date: string | null
          description: string | null
          going: number | null
          id: string
          location: string | null
          location_url: string | null
          maybe: number | null
          no_going: number | null
          photo_url: string | null
          time: string | null
          title: string | null
          visibility: string | null
        }
        Insert: {
          circleid?: string | null
          createdby?: string | null
          creationdate?: string | null
          date?: string | null
          description?: string | null
          going?: number | null
          id: string
          location?: string | null
          location_url?: string | null
          maybe?: number | null
          no_going?: number | null
          photo_url?: string | null
          time?: string | null
          title?: string | null
          visibility?: string | null
        }
        Update: {
          circleid?: string | null
          createdby?: string | null
          creationdate?: string | null
          date?: string | null
          description?: string | null
          going?: number | null
          id?: string
          location?: string | null
          location_url?: string | null
          maybe?: number | null
          no_going?: number | null
          photo_url?: string | null
          time?: string | null
          title?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_circleid_fkey"
            columns: ["circleid"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_circleid_fkey"
            columns: ["circleid"]
            isOneToOne: false
            referencedRelation: "v_suggested_circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_createdby_fkey"
            columns: ["createdby"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      interests: {
        Row: {
          category: string | null
          creationdate: string | null
          id: string
          title: string | null
        }
        Insert: {
          category?: string | null
          creationdate?: string | null
          id: string
          title?: string | null
        }
        Update: {
          category?: string | null
          creationdate?: string | null
          id?: string
          title?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string | null
          creationdate: string | null
          id: string
          linkeditemid: string | null
          linkeditemtype: string | null
          read: boolean | null
          type: string | null
          userid: string | null
        }
        Insert: {
          content?: string | null
          creationdate?: string | null
          id: string
          linkeditemid?: string | null
          linkeditemtype?: string | null
          read?: boolean | null
          type?: string | null
          userid?: string | null
        }
        Update: {
          content?: string | null
          creationdate?: string | null
          id?: string
          linkeditemid?: string | null
          linkeditemtype?: string | null
          read?: boolean | null
          type?: string | null
          userid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      place_hours: {
        Row: {
          close_time: string
          created_at: string | null
          day_of_week: number
          effective_from: string | null
          effective_to: string | null
          id: string
          open_time: string
          place_id: string
        }
        Insert: {
          close_time: string
          created_at?: string | null
          day_of_week: number
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          open_time: string
          place_id: string
        }
        Update: {
          close_time?: string
          created_at?: string | null
          day_of_week?: number
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          open_time?: string
          place_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "place_hours_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      places: {
        Row: {
          admin_user_id: string
          capacity: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          location: string | null
          name: string
          timezone: string
          updated_at: string | null
        }
        Insert: {
          admin_user_id: string
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name: string
          timezone?: string
          updated_at?: string | null
        }
        Update: {
          admin_user_id?: string
          capacity?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name?: string
          timezone?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "places_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          postid: string
          userid: string
        }
        Insert: {
          postid: string
          userid: string
        }
        Update: {
          postid?: string
          userid?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_postid_fkey"
            columns: ["postid"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          circleid: string | null
          content: string | null
          createdat: string | null
          creationdate: string | null
          id: string
          image: string | null
          likes_count: number
          userid: string | null
        }
        Insert: {
          circleid?: string | null
          content?: string | null
          createdat?: string | null
          creationdate?: string | null
          id: string
          image?: string | null
          likes_count?: number
          userid?: string | null
        }
        Update: {
          circleid?: string | null
          content?: string | null
          createdat?: string | null
          creationdate?: string | null
          id?: string
          image?: string | null
          likes_count?: number
          userid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_circleid_fkey"
            columns: ["circleid"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_circleid_fkey"
            columns: ["circleid"]
            isOneToOne: false
            referencedRelation: "v_suggested_circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          adminresponse: string | null
          creationdate: string | null
          id: string
          message: string | null
          status: string | null
          targetid: string | null
          timestamp: string | null
          type: string | null
          userid: string | null
        }
        Insert: {
          adminresponse?: string | null
          creationdate?: string | null
          id: string
          message?: string | null
          status?: string | null
          targetid?: string | null
          timestamp?: string | null
          type?: string | null
          userid?: string | null
        }
        Update: {
          adminresponse?: string | null
          creationdate?: string | null
          id?: string
          message?: string | null
          status?: string | null
          targetid?: string | null
          timestamp?: string | null
          type?: string | null
          userid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_circle_prefs: {
        Row: {
          circleid: string
          creationdate: string
          reason: string | null
          snooze_until: string | null
          status: string
          updated_at: string
          userid: string
        }
        Insert: {
          circleid: string
          creationdate?: string
          reason?: string | null
          snooze_until?: string | null
          status: string
          updated_at?: string
          userid: string
        }
        Update: {
          circleid?: string
          creationdate?: string
          reason?: string | null
          snooze_until?: string | null
          status?: string
          updated_at?: string
          userid?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_circle_prefs_circleid_fkey"
            columns: ["circleid"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_circle_prefs_circleid_fkey"
            columns: ["circleid"]
            isOneToOne: false
            referencedRelation: "v_suggested_circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_circle_prefs_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_circles: {
        Row: {
          circleid: string
          userid: string
        }
        Insert: {
          circleid: string
          userid: string
        }
        Update: {
          circleid?: string
          userid?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_circles_circleid_fkey"
            columns: ["circleid"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_circles_circleid_fkey"
            columns: ["circleid"]
            isOneToOne: false
            referencedRelation: "v_suggested_circles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_circles_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interests: {
        Row: {
          interestid: string
          userid: string
        }
        Insert: {
          interestid: string
          userid: string
        }
        Update: {
          interestid?: string
          userid?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_interestid_fkey"
            columns: ["interestid"]
            isOneToOne: false
            referencedRelation: "interests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_interests_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_look_for: {
        Row: {
          interestid: string
          userid: string
        }
        Insert: {
          interestid: string
          userid: string
        }
        Update: {
          interestid?: string
          userid?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_look_for_interestid_fkey"
            columns: ["interestid"]
            isOneToOne: false
            referencedRelation: "interests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_look_for_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          address_apartment: string | null
          address_block: string | null
          address_building: string | null
          avatar_url: string | null
          creationdate: string | null
          dob: string | null
          email: string | null
          first_login: boolean
          gender: string | null
          id: string
          language: string | null
          name: string | null
          phone: string | null
          role: string | null
        }
        Insert: {
          address_apartment?: string | null
          address_block?: string | null
          address_building?: string | null
          avatar_url?: string | null
          creationdate?: string | null
          dob?: string | null
          email?: string | null
          first_login?: boolean
          gender?: string | null
          id: string
          language?: string | null
          name?: string | null
          phone?: string | null
          role?: string | null
        }
        Update: {
          address_apartment?: string | null
          address_block?: string | null
          address_building?: string | null
          avatar_url?: string | null
          creationdate?: string | null
          dob?: string | null
          email?: string | null
          first_login?: boolean
          gender?: string | null
          id?: string
          language?: string | null
          name?: string | null
          phone?: string | null
          role?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      v_suggested_circles: {
        Row: {
          circle_profile_url: string | null
          creationdate: string | null
          description: string | null
          id: string | null
          name: string | null
          score: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_available_place_slots: {
        Args: {
          p_date: string
          p_place_id: string
          p_slot_duration_minutes?: number
        }
        Returns: {
          slot_time: string
        }[]
      }
      get_available_slots: {
        Args: {
          p_date: string
          p_place_id: string
          p_slot_duration_minutes?: number
          p_space_id: string
        }
        Returns: {
          slot_end: string
          slot_start: string
        }[]
      }
      is_place_available: {
        Args: { p_ends_at: string; p_place_id: string; p_starts_at: string }
        Returns: boolean
      }
      suggested_circles: {
        Args: never
        Returns: {
          circle_profile_url: string
          creationdate: string
          description: string
          id: string
          name: string
          score: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
