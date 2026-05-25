import type { User, Circle, Event, Post } from "@/types/database";

// Service modules
import { UserService } from "./services/users";
import { InterestService } from "./services/interests";
import { NotificationService } from "./services/notifications";
import { CircleService } from "./services/circles";
import { PostService } from "./services/posts";
import { EventService } from "./services/events";

// Re-export service modules for direct import
export { UserService } from "./services/users";
export { InterestService } from "./services/interests";
export { NotificationService } from "./services/notifications";
export { CircleService } from "./services/circles";
export { PostService } from "./services/posts";
export { EventService } from "./services/events";

// ============================================================
// DatabaseService — unified API delegating to service modules
// ============================================================
export const DatabaseService = {
  // User operations
  getUser: UserService.getUser,
  updateUser: UserService.updateUser,
  updateUserAvatar: UserService.updateUserAvatar,
  checkFirstLogin: UserService.checkFirstLogin,
  updateFirstLogin: UserService.updateFirstLogin,

  // Interest operations
  getInterests: InterestService.getInterests,
  getUserInterests: InterestService.getUserInterests,
  getUserLookFor: InterestService.getUserLookFor,
  getInterestsByCategory: InterestService.getInterestsByCategory,
  createUserInterest: InterestService.createUserInterest,
  createUserLookingFor: InterestService.createUserLookingFor,

  // Notification operations
  getUserNotifications: NotificationService.getUserNotifications,
  markNotificationAsRead: NotificationService.markNotificationAsRead,
  markAllNotificationsAsRead: NotificationService.markAllNotificationsAsRead,

  // Circle operations
  getCircles: CircleService.getCircles,
  getCircleInterests: CircleService.getCircleInterests,
  getUserCircles: CircleService.getUserCircles,
  createCircle: CircleService.createCircle,
  updateCircle: CircleService.updateCircle,
  updateCircleInterests: CircleService.updateCircleInterests,
  joinCircle: CircleService.joinCircle,
  leaveCircle: CircleService.leaveCircle,
  requestToJoinCircle: CircleService.requestToJoinCircle,
  getCircleJoinRequests: CircleService.getCircleJoinRequests,
  getUserPendingRequestsBatch: CircleService.getUserPendingRequestsBatch,
  getUserPendingRequest: CircleService.getUserPendingRequest,
  handleJoinRequest: CircleService.handleJoinRequest,
  deleteCircle: CircleService.deleteCircle,
  getCircleMembers: CircleService.getCircleMembers,
  addCircleAdmin: CircleService.addCircleAdmin,
  removeCircleAdmin: CircleService.removeCircleAdmin,
  removeMemberFromCircle: CircleService.removeMemberFromCircle,
  getAdminCircleIds: CircleService.getAdminCircleIds,
  isCircleAdmin: CircleService.isCircleAdmin,
  getUserJoinedCircles: CircleService.getUserJoinedCircles,
  getCircleMessages: CircleService.getCircleMessages,
  sendMessage: CircleService.sendMessage,
  getCirclesByUser: CircleService.getCirclesByUser,

  // Event operations
  getEvents: EventService.getEvents,
  getUserCircleIds: EventService.getUserCircleIds,
  getEventsByCircle: EventService.getEventsByCircle,
  createEvent: EventService.createEvent,
  deleteEvent: EventService.deleteEvent,
  updateEvent: EventService.updateEvent,
  updateEventInterests: EventService.updateEventInterests,
  getEvent: EventService.getEvent,
  createEventRsvp: EventService.createEventRsvp,
  updateEventRsvp: EventService.updateEventRsvp,
  deleteEventRsvp: EventService.deleteEventRsvp,
  getEventRsvp: EventService.getEventRsvp,
  getEventRsvps: EventService.getEventRsvps,

  // Post operations
  getPosts: PostService.getPosts,
  createPost: PostService.createPost,
  getPost: PostService.getPost,
  getHomePagePosts: PostService.getHomePagePosts,
  updatePost: PostService.updatePost,
  deletePost: PostService.deletePost,
  likePost: PostService.likePost,
  unlikePost: PostService.unlikePost,
  createComment: PostService.createComment,
  getPostComments: PostService.getPostComments,
  deleteComment: PostService.deleteComment,
};

// ============================================================
// Named exports for convenience (used by some screens)
// ============================================================
export const getUser = (id: string) => DatabaseService.getUser(id);
export const updateUser = (id: string, updates: Partial<User>) =>
  DatabaseService.updateUser(id, updates);
export const getCircles = (page?: number, limit?: number) =>
  DatabaseService.getCircles(page, limit);
export const getUserCircles = (userId: string) =>
  DatabaseService.getUserCircles(userId);
export const createCircle = (circle: Omit<Circle, "id" | "creationdate">) =>
  DatabaseService.createCircle(circle);
export const getEvents = () => DatabaseService.getEvents();
export const createEvent = (event: Omit<Event, "id" | "creationdate">) =>
  DatabaseService.createEvent(event);
export const getPosts = (circleId?: string) =>
  DatabaseService.getPosts(circleId);
export const createPost = (
  post: Omit<Post, "id" | "creationdate">,
  photoAsset?: any
) => DatabaseService.createPost(post, photoAsset);
export const getInterests = () => DatabaseService.getInterests();
export const getUserInterests = (userId: string) =>
  DatabaseService.getUserInterests(userId);
export const getUserLookFor = (userId: string) =>
  DatabaseService.getUserLookFor(userId);
export const getInterestsByCategory = () =>
  DatabaseService.getInterestsByCategory();
export const getUserNotifications = (userId: string) =>
  DatabaseService.getUserNotifications(userId);
export const markNotificationAsRead = (notificationId: string) =>
  DatabaseService.markNotificationAsRead(notificationId);
export const markAllNotificationsAsRead = (userId: string) =>
  DatabaseService.markAllNotificationsAsRead(userId);
export const joinCircle = (userId: string, circleId: string) =>
  DatabaseService.joinCircle(userId, circleId);
export const leaveCircle = (userId: string, circleId: string) =>
  DatabaseService.leaveCircle(userId, circleId);
export const getUserJoinedCircles = (userId: string) =>
  DatabaseService.getUserJoinedCircles(userId);
export const getCircleMessages = (circleId: string) =>
  DatabaseService.getCircleMessages(circleId);
export const sendMessage = (message: any) =>
  DatabaseService.sendMessage(message);
export const requestToJoinCircle = (
  userId: string,
  circleId: string,
  message?: string
) => DatabaseService.requestToJoinCircle(userId, circleId, message);
export const getCircleJoinRequests = (circleId: string) =>
  DatabaseService.getCircleJoinRequests(circleId);
export const handleJoinRequest = (
  requestId: string,
  action: "accept" | "reject"
) => DatabaseService.handleJoinRequest(requestId, action);
export const getUserPendingRequest = (circleId: string, userId: string) =>
  DatabaseService.getUserPendingRequest(circleId, userId);
export const deleteCircle = (circleId: string, adminUserId: string) =>
  DatabaseService.deleteCircle(circleId, adminUserId);
export const getCircleMembers = (circleId: string) =>
  DatabaseService.getCircleMembers(circleId);
export const addCircleAdmin = (
  circleId: string,
  userId: string,
  requestingAdminId: string
) => DatabaseService.addCircleAdmin(circleId, userId, requestingAdminId);
export const removeCircleAdmin = (
  circleId: string,
  userId: string,
  requestingAdminId: string
) => DatabaseService.removeCircleAdmin(circleId, userId, requestingAdminId);
export const removeMemberFromCircle = (
  circleId: string,
  userId: string,
  adminId: string
) => DatabaseService.removeMemberFromCircle(circleId, userId, adminId);
export const isCircleAdmin = (circleId: string, userId: string) =>
  DatabaseService.isCircleAdmin(circleId, userId);
export const getHomePagePosts = (userId: string) =>
  DatabaseService.getHomePagePosts(userId);
export const getCircleInterests = (circleId: string) =>
  DatabaseService.getCircleInterests(circleId);
export const updateCircle = (circleId: string, updates: any, userId: string) =>
  DatabaseService.updateCircle(circleId, updates, userId);
export const updateCircleInterests = (
  circleId: string,
  interestIds: string[],
  userId: string
) => DatabaseService.updateCircleInterests(circleId, interestIds, userId);
export const deleteEvent = (eventId: string) =>
  DatabaseService.deleteEvent(eventId);
export const createEventRsvp = (
  eventId: string,
  status: "going" | "maybe" | "not_going"
) => DatabaseService.createEventRsvp(eventId, status);
export const updateEventRsvp = (
  eventId: string,
  status: "going" | "maybe" | "not_going"
) => DatabaseService.updateEventRsvp(eventId, status);
export const deleteEventRsvp = (eventId: string) =>
  DatabaseService.deleteEventRsvp(eventId);
export const getEventRsvp = (eventId: string, userId: string) =>
  DatabaseService.getEventRsvp(eventId, userId);
export const getEventRsvps = (eventId: string) =>
  DatabaseService.getEventRsvps(eventId);
export const updateEvent = (eventId: string, updates: any) =>
  DatabaseService.updateEvent(eventId, updates);
export const likePost = (postId: string, userId: string) =>
  DatabaseService.likePost(postId, userId);
export const unlikePost = (postId: string, userId: string) =>
  DatabaseService.unlikePost(postId, userId);
export const createComment = (postId: string, userId: string, text: string) =>
  DatabaseService.createComment(postId, userId, text);
export const getPostComments = (postId: string) =>
  DatabaseService.getPostComments(postId);
export const deleteComment = (commentId: string, userId: string) =>
  DatabaseService.deleteComment(commentId, userId);
export const deletePost = (postId: string, userId: string) =>
  DatabaseService.deletePost(postId, userId);
export const updatePost = (
  postId: string,
  updates: { content?: string; image?: string },
  userId: string
) => DatabaseService.updatePost(postId, updates, userId);
export const checkFirstLogin = (userId: string) =>
  DatabaseService.checkFirstLogin(userId);
export const updateFirstLogin = (userId: string) =>
  DatabaseService.updateFirstLogin(userId);

// Standalone function (used by circles screen)
export const getCirclesByUser = (userId: string) =>
  CircleService.getCirclesByUser(userId);
