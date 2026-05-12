// Domain types — aligned with the database schema (snake_case)
// For full DB schema types, see types/supabase.ts (auto-generated)
import type { Database } from "./supabase";

// ===== Re-exports from generated DB schema (Place, Booking, Blackout, etc.) =====
export type Place = Database["public"]["Tables"]["places"]["Row"];
export type CreatePlaceInput = Database["public"]["Tables"]["places"]["Insert"];
export type UpdatePlaceInput = Database["public"]["Tables"]["places"]["Update"];

export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type CreateBookingInput = Database["public"]["Tables"]["bookings"]["Insert"];
export type UpdateBookingInput = Database["public"]["Tables"]["bookings"]["Update"];
export type BookingFilter = {
  user_id?: string;
  place_id?: string;
  space_id?: string; // alias for place_id (legacy)
  status?: string;
  from?: string;
  to?: string;
  date_from?: string;
  date_to?: string;
};
export type AvailableSlot = {
  slot_start: string;
  slot_end: string;
};

export type Blackout = Database["public"]["Tables"]["blackouts"]["Row"];
export type CreateBlackoutInput = Database["public"]["Tables"]["blackouts"]["Insert"];

export type PlaceHours = Database["public"]["Tables"]["place_hours"]["Row"];
export type CreatePlaceHoursInput = Database["public"]["Tables"]["place_hours"]["Insert"];

// ===== Helpers =====
const toBool = (v: any) =>
  v === true || v === "true"
    ? true
    : v === false || v === "false"
    ? false
    : !!v;

// ===== Users =====
export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  dob?: string | null;
  gender?: string | null;
  language?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  address_apartment?: string | null;
  address_building?: string | null;
  address_block?: string | null;
  role?: string | null;
  creationdate?: string | null;
  first_login?: boolean | null;
}

// Legacy alias for backward compatibility
export type UserRow = User;

// ===== Interests =====
export interface Interest {
  id: string;
  title: string;
  category: string;
  creationdate?: string | null;
}
export type InterestRow = Interest;

// ===== Circles =====
export interface Circle {
  id: string;
  name?: string | null;
  description?: string | null;
  privacy?: string | null;
  creationdate?: string | null;
  circle_profile_url?: string | null;
  creator?: string | null;
  member_count?: number | null;
  score?: number;
}
export type CircleRow = Circle;

// ===== Events =====
export interface Event {
  id: string;
  title?: string | null;
  date?: string | null;
  time?: string | null;
  location?: string | null;
  location_url?: string | null;
  circleid?: string | null;
  visibility?: string | null;
  description?: string | null;
  createdby?: string | null;
  creationdate?: string | null;
  photo_url?: string | null;
}
export type EventRow = Event;

// ===== Posts =====
export interface Post {
  id: string;
  userid?: string | null;
  content?: string | null;
  image?: string | null;
  circleid?: string | null;
  createdat?: string | null;
  creationdate?: string | null;
  comments_count?: number;
  likes_count?: number;
}
export type PostRow = Post;

// ===== Comments =====
export interface Comment {
  id: string;
  postid?: string | null;
  userid?: string | null;
  text?: string | null;
  timestamp?: string | null;
  creationdate?: string | null;
}
export type CommentRow = Comment;

// ===== Circle Messages =====
export interface CircleMessage {
  id: string;
  circleid?: string | null;
  senderid?: string | null;
  content?: string | null;
  type?: string | null;
  attachment?: string | null;
  timestamp?: string | null;
  creationdate?: string | null;
}
export type CircleMessageRow = CircleMessage;

// ===== Notifications =====
export interface Notification {
  id: string;
  userid?: string | null;
  type?: string | null;
  content?: string | null;
  read?: boolean | null;
  timestamp?: string | null;
  linkeditemid?: string | null;
  linkeditemtype?: string | null;
  creationdate?: string | null;
}
export type NotificationRow = Notification;

// ===== Reports =====
export interface Report {
  id: string;
  userid?: string | null;
  type?: string | null;
  targetid?: string | null;
  message?: string | null;
  status?: string | null;
  adminresponse?: string | null;
  timestamp?: string | null;
  creationdate?: string | null;
}
export type ReportRow = Report;

// ===== Join tables =====
export interface UserInterest {
  userid: string;
  interestid: string;
}
export type UserInterestRow = UserInterest;

export interface UserCircle {
  userid: string;
  circleid: string;
  status?: string | null;
}
export type UserCircleRow = UserCircle;

export interface CircleInterest {
  circleid: string;
  interestid: string;
}
export type CircleInterestRow = CircleInterest;

export interface CircleAdmin {
  circleid: string;
  userid: string;
}
export type CircleAdminRow = CircleAdmin;

export interface EventInterest {
  eventid: string;
  interestid: string;
}
export type EventInterestRow = EventInterest;

export interface PostLike {
  postid: string;
  userid: string;
}
export type PostLikeRow = PostLike;
