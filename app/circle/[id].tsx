import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  FlatList,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { DatabaseService } from "@/lib/database";
import { Avatar } from "@/components/Avatar";
import { MemberCard } from "@/components/circle/MemberCard";
import { JoinRequestCard } from "@/components/circle/JoinRequestCard";
import { AdminMemberCard } from "@/components/circle/AdminMemberCard";
import { CirclePostCard } from "@/components/circle/CirclePostCard";
import { CircleTabBar } from "@/components/circle/CircleTabBar";
import { CircleInfoHeader } from "@/components/circle/CircleInfoHeader";
import { CreatePostModal } from "@/components/circle/CreatePostModal";
import { EditPostModal } from "@/components/circle/EditPostModal";
import { EditCircleModal } from "@/components/circle/EditCircleModal";
import { CircleEventCard } from "@/components/circle/CircleEventCard";
import { SearchableSection } from "@/components/circle/SearchableSection";
import { CircleDetailHeader } from "@/components/circle/CircleDetailHeader";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { supabase } from "@/lib/supabase";
import { StorageService } from "@/lib/storage";
import EventModal from "@/components/EventModal";

interface Circle {
  id: string;
  name: string;
  description: string;
  privacy: "public" | "private";
  createdby: string;
  memberCount: number;
  isJoined: boolean;
  isAdmin: boolean;
  isMainAdmin: boolean;
  interests?: string[];
  creator?: string;
  circle_profile_url?: string;
  hasPendingRequest?: boolean;
}

interface Post {
  id: string;
  content: string;
  image?: string;
  creationdate: string;
  author: {
    id?: string;
    name: string;
    avatar_url?: string;
  };
  likes: any[];
  comments: any[];
  likes_count?: number;
  userLiked?: boolean;
}

interface Member {
  id: string;
  name: string;
  avatar_url?: string;
  isAdmin: boolean;
}

interface JoinRequest {
  id: string;
  message: string;
  creationdate: string;
  users: {
    name: string;
    avatar?: string;
  };
}

const PALETTE = {
  background: "#FFFFFF",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  muted: "#6B7280",
  tint: "#0E7F45",
  success: "#0E7F45",
  warning: "#F59E0B",
  danger: "#EF4444",
  link: "#0EA5E9",
  overlay: "rgba(0,0,0,0.6)",
};

export default function CircleScreen() {
  const { id, tab = "feed" } = useLocalSearchParams();
  const circleId = Array.isArray(id) ? id[0] : id || "";

  const { user } = useAuth();
  const { texts, isRTL } = useLanguage();

  const backgroundColor = PALETTE.background;
  const surfaceColor = PALETTE.surface;
  const tintColor = PALETTE.tint;
  const textColor = PALETTE.text;
  const successColor = PALETTE.success;

  if (!circleId || circleId === "undefined") {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.centeredContainer}>
          <ThemedText>Invalid circle ID</ThemedText>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: tintColor }]}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const [activeTab, setActiveTab] = useState<
    "feed" | "members" | "admin" | "events"
  >("feed");
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [selectedPostImage, setSelectedPostImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [requestSearchQuery, setRequestSearchQuery] = useState("");

  const [newPostContent, setNewPostContent] = useState("");
  const [createPostLoading, setCreatePostLoading] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editPostContent, setEditPostContent] = useState("");
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [deletePostLoading, setDeletePostLoading] = useState<string | null>(
    null
  );
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [editedCircle, setEditedCircle] = useState({
    name: "",
    description: "",
    privacy: "public" as "public" | "private",
    interests: [] as string[],
    circle_profile_url: undefined as string | undefined,
    _selectedImageAsset: undefined as any,
  });
  const [allInterests, setAllInterests] = useState<any[]>([]);
  const [interestsByCategory, setInterestsByCategory] = useState<{
    [key: string]: any[];
  }>({});

  const [interests, setInterests] = useState<{ [category: string]: any[] }>({});
  const [uploading, setUploading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [circle, setCircle] = useState<Circle | null>(null);

  const loadEvents = async () => {
    if (!circleId) return;
    try {
      const { data, error } = await DatabaseService.getEventsByCircle(
        circleId as string
      );
      if (error) return;
      setEvents(data || []);
    } catch {}
  };

  const loadInterests = async () => {
    try {
      const { data, error } = await DatabaseService.getInterestsByCategory();
      if (error) return;
      setInterests(data || {});
    } catch {}
  };

  const handleSaveCircleChanges = async () => {
    await handleSaveChanges();
  };

  const deleteEvent = async (eventId: string) => {
    if (!eventId) {
      Alert.alert("Error", "Invalid event ID");
      return;
    }
    try {
      const { error } = await DatabaseService.deleteEvent(eventId);
      if (error) {
        Alert.alert("Error", "Failed to delete event: " + error.message);
        return;
      }
      Alert.alert("Success", "Event deleted successfully");
      await loadEvents();
    } catch {
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      circleid: event.circleid,
      interests: event.event_interests?.map((ei: any) => ei.interests.id) || [],
      photo_url: event.photo_url,
    });
    setShowEditEventModal(true);
  };

  const handleSaveEventChanges = async () => {
    if (!editingEvent || !user?.id) {
      Alert.alert("Error", "Unable to save changes. Please try again.");
      return;
    }
    try {
      setLoading(true);
      let updateData: any = {
        title: editingEvent.title,
        description: editingEvent.description,
        date: editingEvent.date,
        time: editingEvent.time,
        location: editingEvent.location,
      };

      if (editingEvent._selectedImageAsset) {
        try {
          const { data: uploadData } = await StorageService.uploadEventPhoto(
            editingEvent.id,
            editingEvent._selectedImageAsset,
            user.id
          );
          if (uploadData?.publicUrl)
            updateData.photo_url = uploadData.publicUrl;
        } catch {}
      }

      const { error } = await supabase
        .from("events")
        .update(updateData)
        .eq("id", editingEvent.id);
      if (error) {
        Alert.alert("Error", error.message || "Failed to update event");
        return;
      }

      try {
        await DatabaseService.updateEventInterests(
          editingEvent.id,
          editingEvent.interests
        );
      } catch {}

      Alert.alert("Success", "Event updated successfully");
      setShowEditEventModal(false);
      setEditingEvent(null);
      await loadEvents();
    } catch {
      Alert.alert("Error", "Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  const canEditEvent = (event: any) => {
    if (!user?.id) return false;
    if (event.createdby === user.id) return true;
    if (event.circleid && circle?.isAdmin) return true;
    return false;
  };

  const handleEventImagePicker = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant photo library access to change event picture."
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });
      if (!result.canceled && result.assets?.length) {
        const asset = result.assets[0];
        if (!asset.uri) {
          Alert.alert("Error", "Invalid image selected");
          return;
        }
        setEditingEvent((prev: any) =>
          prev
            ? { ...prev, photo_url: asset.uri, _selectedImageAsset: asset }
            : null
        );
      }
    } catch {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleEventRsvp = async (
    eventId: string,
    status: "going" | "maybe" | "not_going"
  ) => {
    if (!user) return;
    try {
      const event = events.find((e) => e.id === eventId);
      const hasExistingRsvp = event?.user_rsvp && event.user_rsvp.length > 0;

      if (hasExistingRsvp) {
        const currentStatus = event.user_rsvp[0].status;
        if (currentStatus === status) {
          const { error } = await DatabaseService.deleteEventRsvp(eventId);
          if (error) {
            Alert.alert("Error", "Failed to remove RSVP");
            return;
          }
        } else {
          const { error } = await DatabaseService.updateEventRsvp(
            eventId,
            status
          );
          if (error) {
            Alert.alert("Error", "Failed to update RSVP");
            return;
          }
        }
      } else {
        const { error } = await DatabaseService.createEventRsvp(
          eventId,
          status
        );
        if (error) {
          Alert.alert("Error", "Failed to create RSVP");
          return;
        }
      }
      await loadEvents();
    } catch {
      Alert.alert("Error", "Failed to update RSVP");
    }
  };

  const loadCircleData = async () => {
    if (!circleId || circleId === "undefined" || !user?.id) {
      setLoading(false);
      return;
    }
    try {
      const { data: circleDataFromDb } = await DatabaseService.getCircles();
      const currentCircle = circleDataFromDb?.find((c) => c.id === circleId);
      if (!currentCircle) {
        Alert.alert("Error", "Circle not found");
        router.back();
        return;
      }

      let isJoined = false;
      let isAdmin = false;
      let isMainAdmin = false;
      let hasPendingRequestLocal = false;

      if (user?.id) {
        const { data: joinedCircles } =
          await DatabaseService.getUserJoinedCircles(user.id);
        isJoined =
          joinedCircles?.some((jc) => jc.circleid === circleId) || false;

        if (isJoined) {
          const { data: adminData } = await DatabaseService.isCircleAdmin(
            circleId as string,
            user.id
          );
          isAdmin = adminData?.isAdmin || false;
          isMainAdmin = adminData?.isMainAdmin || false;
        } else {
          const { data: pendingRequest } =
            await DatabaseService.getUserPendingRequest(
              circleId as string,
              user.id
            );
          hasPendingRequestLocal = !!pendingRequest;
        }
      }

      const interests =
        currentCircle.circle_interests
          ?.map((ci: any) => ci.interests?.title)
          .filter(Boolean) || [];

      const updatedCircle: Circle = {
        ...currentCircle,
        createdby: currentCircle.createdby,
        isJoined,
        isAdmin,
        isMainAdmin,
        memberCount: currentCircle.member_count || 0,
        interests,
        creator: currentCircle.creator || currentCircle.createdby,
        hasPendingRequest: hasPendingRequestLocal,
      } as Circle;

      setCircle(updatedCircle);
      setHasPendingRequest(hasPendingRequestLocal);

      if (isJoined || currentCircle.privacy === "public") {
        const { data: postsData } = await DatabaseService.getPosts(
          circleId as string
        );
        setPosts((postsData as any) || []);
      }

      if (isJoined || currentCircle.privacy === "public") {
        const { data: membersData } = await DatabaseService.getCircleMembers(
          circleId as string
        );
        setMembers((membersData as any) || []);
      } else {
        setMembers([]);
      }

      if (isAdmin) {
        const { data: requestsData } =
          await DatabaseService.getCircleJoinRequests(circleId as string);
        setJoinRequests((requestsData as any) || []);
      }
    } catch {
      Alert.alert("Error", "Failed to load circle data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCircleData();
    await loadEvents();
    setRefreshing(false);
  };

  const handleJoinRequest = async (
    requestId: string,
    action: "accept" | "reject"
  ) => {
    try {
      const { error } = await DatabaseService.handleJoinRequest(
        requestId,
        action
      );
      if (error) {
        Alert.alert("Error", `Failed to ${action} request: ${error.message}`);
        return;
      }
      Alert.alert("Success", `Request ${action}ed successfully`);
      await loadCircleData();
    } catch {
      Alert.alert("Error", `Failed to ${action} request`);
    }
  };

  // ------------ fixed: delete circle works on web + native ------------
  const handleDeleteCircle = async () => {
    if (!user?.id || !circleId) {
      Alert.alert("Error", "Unable to delete circle. Please try again.");
      return;
    }

    // Web confirmation
    if (Platform.OS === "web") {
      const ok = window.confirm("Are you sure you want to delete the circle?");
      if (!ok) return;
      try {
        setLoading(true);
        const { error } = await DatabaseService.deleteCircle(
          circleId as string,
          user.id
        );
        if (error) {
          Alert.alert("Error", error.message || "Failed to delete circle");
          return;
        }
        alert("Circle deleted successfully");
        router.replace("/(tabs)/circles");
      } catch {
        Alert.alert("Error", "Failed to delete circle");
      } finally {
        setLoading(false);
      }
      return;
    }

    // iOS/Android alert
    Alert.alert(
      "Delete Circle",
      "Are you sure you want to delete the circle?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const { error } = await DatabaseService.deleteCircle(
                circleId as string,
                user.id
              );
              if (error) {
                Alert.alert(
                  "Error",
                  error.message || "Failed to delete circle"
                );
                return;
              }
              Alert.alert("Success", "Circle deleted successfully", [
                {
                  text: "OK",
                  onPress: () => router.replace("/(tabs)/circles"),
                },
              ]);
            } catch {
              Alert.alert("Error", "Failed to delete circle");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };
  // --------------------------------------------------------------------

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!circle?.isAdmin) return;
    try {
      const { error } = await DatabaseService.removeMemberFromCircle(
        circleId as string,
        memberId,
        user!.id
      );
      if (error) {
        Alert.alert("Error", "Failed to remove member");
        return;
      }
      Alert.alert("Success", `${memberName} has been removed from the circle`);
      await loadCircleData();
    } catch {
      Alert.alert("Error", "Failed to remove member");
    }
  };

  const handleRemoveMemberAsAdmin = async (
    memberId: string,
    memberName: string
  ) => {
    if (!circle?.isAdmin) return;
    try {
      const { error } = await DatabaseService.removeMemberFromCircle(
        circleId as string,
        memberId,
        user!.id
      );
      if (error) {
        Alert.alert(
          "Error",
          `Failed to remove member: ${
            error.message || "Unknown error occurred"
          }`
        );
        return;
      }
      Alert.alert("Success", `${memberName} has been removed from the circle`);
      await loadCircleData();
    } catch {
      Alert.alert("Error", `Unexpected error occurred`);
    }
  };

  const handleToggleAdmin = async (
    memberId: string,
    memberName: string,
    isCurrentlyAdmin: boolean
  ) => {
    if (!circle?.isAdmin || !user?.id || !circleId) return;
    try {
      let result;
      if (isCurrentlyAdmin) {
        result = await DatabaseService.removeCircleAdmin(
          circleId as string,
          memberId,
          user.id
        );
      } else {
        result = await DatabaseService.addCircleAdmin(
          circleId as string,
          memberId,
          user.id
        );
      }
      if (result?.error) {
        Alert.alert(
          "Error",
          `Failed to toggle admin for ${memberName}: ${
            result.error.message || ""
          }`
        );
        return;
      }
      setLoading(true);
      await loadCircleData();
      setLoading(false);
    } catch {
      Alert.alert("Error", "Unexpected error occurred");
    }
  };

  const handleJoinCircle = async () => {
    if (!user?.id || !circleId || !circle) return;

    if (circle.privacy === "private") {
      Alert.prompt(
        "Request to Join",
        `Send a request to join "${circle.name}". You can include an optional message:`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Send Request",
            onPress: async (message?: string) => {
              try {
                const { error } = await DatabaseService.requestToJoinCircle(
                  user.id,
                  circleId as string,
                  message || ""
                );
                if (error) {
                  if (error.message.includes("already")) {
                    Alert.alert(
                      "Info",
                      "You have already requested to join this circle."
                    );
                    setHasPendingRequest(true);
                    setCircle((prev) =>
                      prev ? { ...prev, hasPendingRequest: true } : null
                    );
                  } else {
                    Alert.alert("Error", "Failed to send join request");
                  }
                  return;
                }
                Alert.alert(
                  "Success",
                  "Join request sent! The admin will review your request."
                );
                setHasPendingRequest(true);
                setCircle((prev) =>
                  prev ? { ...prev, hasPendingRequest: true } : null
                );
                setTimeout(async () => {
                  await loadCircleData();
                }, 1000);
              } catch {
                Alert.alert("Error", "Failed to send join request");
              }
            },
          },
        ],
        "plain-text"
      );
    } else {
      try {
        const { error } = await DatabaseService.joinCircle(
          user.id,
          circleId as string
        );
        if (error) {
          if (error.message.includes("already a member"))
            Alert.alert("Info", "You are already a member of this circle.");
          else Alert.alert("Error", "Failed to join circle");
          return;
        }
        Alert.alert("Success", "You have joined the circle!");
        await loadCircleData();
      } catch {
        Alert.alert("Error", "Failed to join circle");
      }
    }
  };

  const handleLeaveCircle = async () => {
    if (!user?.id || !circleId) return;
    Alert.alert(
      "Leave Circle",
      "Are you sure you want to leave this circle?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await DatabaseService.leaveCircle(
                user.id,
                circleId
              );
              if (error) {
                Alert.alert("Error", error.message || "Failed to leave circle");
                return;
              }
              Alert.alert("Success", "You have left the circle");
              router.back();
            } catch {
              Alert.alert("Error", "Failed to leave circle");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const loadCircleInterests = async () => {
    try {
      const { data: interestsData, error } =
        await DatabaseService.getInterestsByCategory();
      if (error) return;
      setInterestsByCategory(interestsData || {});
      const allInterestsFlat = Object.values(interestsData || {}).flat();
      setAllInterests(allInterestsFlat);
    } catch {}
  };

  const handleEditCircle = async () => {
    if (!circle) return;
    const { data: currentInterests } = await DatabaseService.getCircleInterests(
      circle.id
    );
    const currentInterestIds =
      currentInterests?.map((interest) => interest.id) || [];
    setEditedCircle({
      name: circle.name || "",
      description: circle.description || "",
      privacy: (circle.privacy as "public" | "private") || "public",
      interests: currentInterestIds,
      circle_profile_url: circle.circle_profile_url || undefined,
      _selectedImageAsset: undefined,
    });
    await loadCircleInterests();
    setShowEditModal(true);
  };

  const toggleEditInterest = (interestId: string) => {
    setEditedCircle((prev) => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter((id) => id !== interestId)
        : [...prev.interests, interestId],
    }));
  };

  const handleImagePicker = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant photo library access to change circle picture."
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });
      if (!result.canceled && result.assets?.length) {
        const asset = result.assets[0];
        if (!asset.uri) {
          Alert.alert("Error", "Invalid image selected");
          return;
        }
        setEditedCircle((prev) => ({
          ...prev,
          circle_profile_url: asset.uri,
          _selectedImageAsset: asset,
        }));
      }
    } catch {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleCircleImagePicker = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please allow access to your photo library to change the circle image."
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length) {
        const selectedAsset = result.assets[0];
        await uploadCircleImage(selectedAsset);
      }
    } catch {
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  const uploadCircleImage = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!user?.id || !circleId) {
      Alert.alert("Error", "User or circle information is missing.");
      return;
    }
    setImageUploading(true);
    try {
      const result = await StorageService.uploadCircleProfilePicture(
        circleId as string,
        asset
      );
      if (result.error) {
        Alert.alert(
          "Upload Error",
          result.error.message || "Failed to upload circle image."
        );
        return;
      }
      if (result.data?.publicUrl) {
        const imageUrl = result.data.publicUrl;
        const { error: updateError } = await supabase
          .from("circles")
          .update({ circle_profile_url: imageUrl })
          .eq("id", circleId);
        if (updateError) {
          Alert.alert("Error", "Failed to update circle image.");
        } else {
          setCircle((prev) =>
            prev ? { ...prev, circle_profile_url: imageUrl } : null
          );
          Alert.alert("Success", "Circle image updated successfully!");
          await loadCircleData();
        }
      }
    } catch {
      Alert.alert("Error", "Failed to upload circle image. Please try again.");
    } finally {
      setImageUploading(false);
    }
  };

  const loadCirclePosts = async () => {
    if (!circleId) return;
    setLoading(true);
    try {
      const { data: postsData } = await DatabaseService.getPosts(
        circleId as string
      );
      setPosts((postsData as any) || []);
    } catch {
      Alert.alert("Error", "Failed to load posts.");
    } finally {
      setLoading(false);
    }
  };

  const pickPostImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant photo library access to select images."
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });
      if (!result.canceled && result.assets?.length) {
        const asset = result.assets[0];
        if (!asset.uri) {
          Alert.alert("Error", "Invalid image selected");
          return;
        }
        if ((asset as any).fileSize && (asset as any).fileSize > 3145728) {
          Alert.alert("Error", "Image size must be less than 3MB");
          return;
        }
        setSelectedPostImage(asset);
      }
    } catch {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      Alert.alert("Error", "Please enter post content");
      return;
    }
    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to create posts");
      return;
    }
    try {
      setCreatePostLoading(true);
      const { error } = await DatabaseService.createPost(
        { userid: user.id, content: newPostContent.trim(), circleid: circleId },
        selectedPostImage
      );
      if (error) {
        Alert.alert("Error", "Failed to create post");
        return;
      }
      setNewPostContent("");
      setSelectedPostImage(null);
      setShowPostModal(false);
      loadCirclePosts();
    } catch {
      Alert.alert("Error", "Failed to create post");
    } finally {
      setCreatePostLoading(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to like posts");
      return;
    }
    try {
      const postIndex = posts.findIndex((p) => p.id === postId);
      if (postIndex === -1) return;

      const post = posts[postIndex];
      const isCurrentlyLiked = post.userLiked;

      const updatedPosts = [...posts];
      updatedPosts[postIndex] = {
        ...post,
        userLiked: !isCurrentlyLiked,
        likes_count: isCurrentlyLiked
          ? (post.likes_count || 1) - 1
          : (post.likes_count || 0) + 1,
      };
      setPosts(updatedPosts);

      const { error } = isCurrentlyLiked
        ? await DatabaseService.unlikePost(postId, user.id)
        : await DatabaseService.likePost(postId, user.id);

      if (error) setPosts(posts);
    } catch {
      Alert.alert("Error", "Failed to update like");
    }
  };

  const handleEditPost = (postId: string, content: string) => {
    setEditPostId(postId);
    setEditPostContent(content || "");
    setIsEditingPost(true);
  };

  const handleCancelEdit = () => {
    setIsEditingPost(false);
    setEditPostId(null);
    setEditPostContent("");
  };

  const handleUpdatePost = async () => {
    if (!editPostId || !editPostContent.trim()) return;
    try {
      if (!user?.id) return;
      setLoading(true);
      const { error } = await DatabaseService.updatePost(
        editPostId,
        { content: editPostContent.trim() },
        user.id
      );
      if (error) {
        Alert.alert("Error", "Failed to update post");
        return;
      }
      setPosts(
        posts.map((post) =>
          post.id === editPostId
            ? { ...post, content: editPostContent.trim() }
            : post
        )
      );
      handleCancelEdit();
    } catch {
      Alert.alert("Error", "Failed to update post");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to delete posts");
      return;
    }
    setPostToDelete(postId);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeletePost = async () => {
    if (!postToDelete || !user?.id) return;
    try {
      setDeletePostLoading(postToDelete);
      setShowDeleteConfirmModal(false);
      const { error } = await DatabaseService.deletePost(postToDelete, user.id);
      if (error) {
        Alert.alert("Error", error.message || "Failed to delete post");
        return;
      }
      setPosts((prevPosts) =>
        prevPosts.filter((post) => post.id !== postToDelete)
      );
      Alert.alert("Success", "Post deleted successfully");
    } catch {
      Alert.alert("Error", "Failed to delete post");
    } finally {
      setDeletePostLoading(null);
      setPostToDelete(null);
    }
  };

  const handleSaveChanges = async () => {
    if (!user?.id || !circleId || !circle) {
      Alert.alert("Error", "Unable to save changes. Please try again.");
      return;
    }
    try {
      setLoading(true);
      let updateData: any = {
        name: editedCircle.name,
        description: editedCircle.description,
        privacy: editedCircle.privacy,
      };

      if (editedCircle._selectedImageAsset) {
        try {
          const { data: uploadData } =
            await StorageService.uploadCircleProfilePicture(
              circle.id,
              editedCircle._selectedImageAsset
            );
          if (uploadData?.publicUrl)
            updateData.circle_profile_url = uploadData.publicUrl;
        } catch {}
      }

      const { error } = await DatabaseService.updateCircle(
        circleId as string,
        updateData,
        user.id
      );
      if (error) {
        Alert.alert("Error", error.message || "Failed to update circle");
        return;
      }

      try {
        const { data: currentInterests } =
          await DatabaseService.getCircleInterests(circleId as string);
        const currentInterestIds =
          currentInterests?.map((interest) => interest.id) || [];
        const interestsToAdd = editedCircle.interests.filter(
          (id) => !currentInterestIds.includes(id)
        );
        const interestsToRemove = currentInterestIds.filter(
          (id) => !editedCircle.interests.includes(id)
        );

        for (const interestId of interestsToRemove) {
          await supabase
            .from("circle_interests")
            .delete()
            .eq("circleid", circleId)
            .eq("interestid", interestId);
        }
        for (const interestId of interestsToAdd) {
          await supabase
            .from("circle_interests")
            .insert({ circleid: circleId, interestid: interestId });
        }
      } catch {}

      Alert.alert("Success", "Circle updated successfully");
      setShowEditModal(false);
      await loadCircleData();
    } catch {
      Alert.alert("Error", "Failed to update circle");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCircleData();
    loadEvents();
    loadInterests();
  }, [circleId, user]);

  useEffect(() => {
    if (tab && ["feed", "events", "chat", "admin"].includes(tab as string))
      setActiveTab(tab as any);
  }, [tab]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.centeredContainer}>
          <ThemedText>{texts.loading || "Loading..."}</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!circle) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.centeredContainer}>
          <ThemedText>Circle not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const renderPost = (post: Post) => (
    <CirclePostCard
      key={post.id}
      post={post as any}
      surfaceColor={surfaceColor}
      textColor={textColor}
      isRTL={isRTL}
      isAuthor={post.author?.id === user?.id}
      canDelete={post.author?.id === user?.id || !!circle.isAdmin}
      deletingPostId={deletePostLoading}
      onEdit={handleEditPost}
      onDelete={handleDeletePost}
      onLike={handleLikePost}
    />
  );

  const renderMember = (member: Member) => (
    <MemberCard
      key={member.id}
      member={member}
      surfaceColor={surfaceColor}
      isRTL={isRTL}
      canRemove={
        !!circle.isAdmin &&
        member.id !== circle.creator &&
        member.id !== user?.id
      }
      onRemove={handleRemoveMember}
    />
  );

  const renderJoinRequest = (request: JoinRequest) => (
    <JoinRequestCard
      key={request.id}
      request={request}
      surfaceColor={surfaceColor}
      isRTL={isRTL}
      onAction={handleJoinRequest}
    />
  );

  const renderAdminMember = (member: Member) => {
    const isMemberCreator = member.id === circle.creator;
    const isSelf = member.id === user?.id;
    return (
      <AdminMemberCard
        key={member.id}
        member={member}
        surfaceColor={surfaceColor}
        isRTL={isRTL}
        isCreator={isMemberCreator}
        canRemove={!isMemberCreator && !isSelf}
        canToggleAdmin={!isMemberCreator && !isSelf && !!circle.isAdmin}
        onRemove={handleRemoveMemberAsAdmin}
        onToggleAdmin={handleToggleAdmin}
      />
    );
  };

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );
  const filteredJoinRequests = joinRequests.filter((r) =>
    r.users.name.toLowerCase().includes(requestSearchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CircleDetailHeader
        circle={circle}
        currentUserId={user?.id}
        hasPendingRequest={hasPendingRequest}
        loading={loading}
        surfaceColor={surfaceColor}
        textColor={textColor}
        onJoin={handleJoinCircle}
        onLeave={handleLeaveCircle}
        onEdit={handleEditCircle}
        onDelete={handleDeleteCircle}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
      <CircleInfoHeader
        circle={circle}
        surfaceColor={surfaceColor}
        backgroundColor={backgroundColor}
        textColor={textColor}
        onImagePick={handleCircleImagePicker}
      />

      <CircleTabBar
        activeTab={activeTab}
        isJoined={!!circle.isJoined}
        isAdmin={!!circle.isAdmin}
        surfaceColor={surfaceColor}
        onTabChange={setActiveTab}
      />

        {activeTab === "feed" && (
          <View style={styles.feedContainer}>
            {circle.isJoined || circle.privacy === "public" ? (
              posts.length > 0 ? (
                posts.map(renderPost)
              ) : (
                <View style={styles.emptyContainer}>
                  <ThemedText>No posts yet</ThemedText>
                  {circle.isJoined && (
                    <ThemedText style={styles.emptySubtext}>
                      Be the first to share something!
                    </ThemedText>
                  )}
                </View>
              )
            ) : (
              <View style={styles.emptyContainer}>
                <IconSymbol
                  name="lock.fill"
                  size={48}
                  color={textColor + "40"}
                />
                <ThemedText>
                  This is a private circle. Join to view posts.
                </ThemedText>
              </View>
            )}
          </View>
        )}
        {activeTab === "events" && (
          <View style={styles.eventsContainer}>
            {(circle?.createdby === user?.id || circle.isAdmin) && (
              <TouchableOpacity
                style={[
                  styles.createPostButton,
                  { backgroundColor: tintColor },
                ]}
                onPress={() => setShowEventModal(true)}
              >
                <IconSymbol name="plus" size={20} color="#fff" />

                <ThemedText style={styles.createPostButtonText}>
                  Create Event
                </ThemedText>
              </TouchableOpacity>
            )}

            <FlatList
              data={events}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <CircleEventCard
                  event={item}
                  surfaceColor={surfaceColor}
                  backgroundColor={backgroundColor}
                  successColor={successColor}
                  canEdit={canEditEvent(item)}
                  canDelete={
                    circle?.createdby === user?.id ||
                    !!circle.isAdmin ||
                    item.createdby === user?.id
                  }
                  onEdit={handleEditEvent}
                  onDelete={deleteEvent}
                  onRsvp={handleEventRsvp}
                />
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <ThemedText style={styles.emptyStateText}>
                    No events yet
                  </ThemedText>
                </View>
              }
            />
          </View>
        )}

        {activeTab === "members" && circle.isJoined && (
          <View style={styles.membersContainer}>
            {members.map(renderMember)}
          </View>
        )}

        {activeTab === "admin" && circle.isAdmin && (
          <View style={styles.adminContainer}>
            <SearchableSection
              title="Join Requests"
              count={joinRequests.length}
              placeholder="Search join requests by name..."
              searchQuery={requestSearchQuery}
              onSearchChange={setRequestSearchQuery}
              backgroundColor={backgroundColor}
              textColor={textColor}
              totalItems={joinRequests.length}
              filteredCount={filteredJoinRequests.length}
              emptyMessage="No pending join requests"
              notFoundMessage={'No join requests found matching "{query}"'}
            >
              {filteredJoinRequests.map(renderJoinRequest)}
            </SearchableSection>

            <SearchableSection
              title="Circle Members"
              count={members.length}
              placeholder="Search members by name..."
              searchQuery={memberSearchQuery}
              onSearchChange={setMemberSearchQuery}
              backgroundColor={backgroundColor}
              textColor={textColor}
              totalItems={members.length}
              filteredCount={filteredMembers.length}
              emptyMessage="No members found"
              notFoundMessage={'No members found matching "{query}"'}
              titleMarginTop={24}
            >
              <View style={styles.adminMembersContainer}>
                {filteredMembers.map(renderAdminMember)}
              </View>
            </SearchableSection>
          </View>
        )}
      </ScrollView>

      {circle.isJoined && activeTab === "feed" && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: tintColor }]}
          onPress={() => setShowPostModal(true)}
        >
          <IconSymbol name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Create Post Modal */}
    <CreatePostModal
        visible={showPostModal}
        circleName={circle.name || ""}
        surfaceColor={surfaceColor}
        textColor={textColor}
        content={newPostContent}
        onContentChange={setNewPostContent}
        selectedImage={selectedPostImage}
        onPickImage={pickPostImage}
        loading={createPostLoading}
        onSubmit={handleCreatePost}
        onClose={() => {
          setShowPostModal(false);
          setSelectedPostImage(null);
        }}
      />

      {/* Event Modals */}
      <EventModal
        visible={showEventModal}
        onClose={() => setShowEventModal(false)}
        onEventCreated={loadEvents}
        preSelectedCircleId={circleId as string}
        circles={[
          { id: circleId as string, name: circle?.name || "Current Circle" },
        ]}
      />

      <EventModal
        visible={showEditEventModal}
        onClose={() => setShowEditEventModal(false)}
        onEventCreated={loadEvents}
        preSelectedCircleId={circleId as string}
        circles={[
          { id: circleId as string, name: circle?.name || "Current Circle" },
        ]}
        editingEvent={editingEvent}
      />

      <EditPostModal
        visible={isEditingPost}
        backgroundColor={backgroundColor}
        surfaceColor={surfaceColor}
        textColor={textColor}
        content={editPostContent}
        onContentChange={setEditPostContent}
        onSave={handleUpdatePost}
        onCancel={handleCancelEdit}
      />

      <EditCircleModal
        visible={showEditModal}
        surfaceColor={surfaceColor}
        textColor={textColor}
        editedCircle={editedCircle as any}
        onChange={setEditedCircle as any}
        interestsByCategory={interestsByCategory}
        onToggleInterest={toggleEditInterest}
        onSave={handleSaveCircleChanges}
        onClose={() => setShowEditModal(false)}
      />

      {/* Delete Post Confirmation Modal */}
      <ConfirmDialog
        visible={showDeleteConfirmModal}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        destructive
        loading={deletePostLoading === postToDelete}
        onConfirm={confirmDeletePost}
        onCancel={() => {
          setShowDeleteConfirmModal(false);
          setPostToDelete(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    // removed boxShadow (unsupported)
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    flex: 1,
    textAlign: "center",
    color: "#0D5C27",
    fontWeight: "bold",
  },
  circleInfo: {
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    margin: 10,
  },

  circleHeaderImage: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginBottom: 10,
  },

  circleDescription: {
    fontSize: 13,
    marginBottom: 10,
    color: "#333",
    opacity: 0.9,
    lineHeight: 18,
  },

  circleStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  statText: {
    fontSize: 12,
    color: "#555",
    fontWeight: "500",
  },

  circleInterests: {
    marginTop: 6,
    borderTopWidth: 0.4,
    borderTopColor: "#E2E2E2",
    paddingTop: 8,
  },

  interestsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
    marginBottom: 6,
  },

  interestTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  interestTag: {
    backgroundColor: "#0D5C27",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },

  interestTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },

  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0D5C27",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  feedContainer: {
    gap: 16,
  },
  postCard: {
    padding: 16,
    borderRadius: 12,
    // removed boxShadow (unsupported)
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  postHeaderRTL: {
    flexDirection: "row-reverse",
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  authorInfoRTL: {
    flexDirection: "row-reverse",
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorDetails: {
    flex: 1,
  },
  postTime: {
    fontSize: 12,
    opacity: 0.5,
    color: "#6b7280",
  },
  postContentContainer: {
    marginBottom: 12,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  postActions: {
    flexDirection: "row",
    marginTop: 8,
    gap: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    opacity: 0.7,
    color: "#6b7280",
  },
  postActionButton: {
    padding: 8,
    borderRadius: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  postEditActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  postInteractionActions: {
    flexDirection: "row",
    marginTop: 8,
    gap: 16,
  },
  membersContainer: {
    gap: 12,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    // removed boxShadow (unsupported)
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  memberInfoRTL: {
    flexDirection: "row-reverse",
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  memberDetails: {
    flex: 1,
  },
  adminBadge: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
  removeButton: {
    padding: 8,
  },
  adminContainer: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
    color: "#000000ff",
  },
  adminMembersContainer: {
    gap: 12,
  },
  adminMemberCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    // removed boxShadow (unsupported)
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  adminMemberInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  adminMemberInfoRTL: {
    flexDirection: "row-reverse",
  },
  adminMemberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  adminMemberDetails: {
    flex: 1,
  },
  memberBadges: {
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  adminMemberActions: {
    flexDirection: "column",
    gap: 8,
    alignItems: "flex-end",
  },
  adminActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  adminActionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  requestCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    // removed boxShadow (unsupported)
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  requestInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  requestInfoRTL: {
    flexDirection: "row-reverse",
  },
  requestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  requestDetails: {
    flex: 1,
  },
  requestMessage: {
    fontSize: 12,
    fontStyle: "italic",
    opacity: 0.7,
    marginTop: 2,
  },
  requestTime: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: 2,
  },
  requestActions: {
    flexDirection: "row",
    gap: 8,
  },
  requestButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  requestButtonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  acceptButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rejectButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 16,
  },
  createPostButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  emptyText: {
    opacity: 0.6,
    textAlign: "center",
    color: "#6b7280",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  editModalContent: {
    width: "95%",
    maxHeight: "90%",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 20,
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  imageSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  circleImageContainer: {
    position: "relative",
    marginBottom: 12,
  },
  circleImageWithOverlay: {
    position: "relative",
    width: "100%",
    height: 150,
  },
  circleImageOverlayButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  circleOverlayButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  circleOverlayButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  circleImagePlaceholderButton: {
    height: 150,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderStyle: "dashed",
  },
  circleImagePlaceholderView: {
    height: 150,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderStyle: "dashed",
  },
  circleImagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  circleImagePlaceholderText: {
    fontSize: 14,
    fontWeight: "500",
  },
  imageContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  imageWithOverlay: {
    position: "relative",
    width: "100%",
    height: 120,
  },
  circleEditImage: {
    width: "100%",
    height: 120,
    borderRadius: 12,
  },
  imageOverlayButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  overlayButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  overlayButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  imagePlaceholderButton: {
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderStyle: "dashed",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  imagePickerText: {
    fontSize: 14,
    fontWeight: "500",
  },
  inputSection: {
    marginBottom: 20,
  },
  textInput: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    minHeight: 44,
  },
  privacyOptions: {
    flexDirection: "row",
    gap: 12,
  },
  privacyOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    gap: 8,
  },
  privacyText: {
    fontSize: 14,
    fontWeight: "500",
  },
  interestsContainer: {
    gap: 16,
  },
  categorySection: {
    gap: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.8,
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  editInterestChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  editInterestChipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  joinButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  pendingButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
    opacity: 0.8,
  },
  pendingButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  leaveButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  leaveButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  messageButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  deleteButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: 6,
    marginLeft: 8,
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    backgroundColor: "#f8f9fa",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  cancelButton: {
    borderWidth: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  debugInfo: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  debugText: {
    fontSize: 12,
    fontFamily: "monospace",
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  createPostModalContent: {
    width: "95%",
    maxWidth: 400,
    borderRadius: 16,
    overflow: "hidden",
  },
  postingInLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  circleName: {
    fontSize: 16,
    fontWeight: "600",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  postInput: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    minHeight: 100,
    maxHeight: 200,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.5,
    textAlign: "center",
    marginTop: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    minHeight: 24,
  },
  imagePickerButton: {
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedImageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  selectedPostImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
  },
  changeImageText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  createPostButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D5C27",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    gap: 6,
    marginBottom: 8,
  },

  modalContainer: {
    flex: 1,
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  inputGroup: {
    marginBottom: 16,
  },
  postButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  postButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dateTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  dateTimeField: {
    flex: 1,
  },
  interestsScrollView: {
    maxHeight: 200,
  },
  interestCategory: {
    marginBottom: 16,
  },
  interestChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  interestChipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  eventsContainer: {
    flex: 1,
    padding: 16,
  },
  eventCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: "#000000ff",
  },
  eventDate: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
    color: "#6b7280",
  },
  eventLocation: {
    fontSize: 14,
    opacity: 0.8,
    color: "#6b7280",
  },
  eventDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
    color: "#565759ff",
  },
  eventInterests: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 6,
  },
  eventInterestChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  eventInterestText: {
    fontSize: 12,
    fontWeight: "500",
  },
  eventCreator: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: "italic",
    color: "#6b7280",
  },
  deleteEventButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    opacity: 0.6,
  },
  eventRsvpSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  eventRsvpButtons: {
    flexDirection: "row",
    gap: 6,
  },
  eventRsvpButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    gap: 3,
  },
  eventRsvpButtonText: {
    fontSize: 10,
    fontWeight: "600",
  },
  eventPhoto: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginVertical: 12,
  },
  eventActions: {
    flexDirection: "row",
    gap: 8,
  },
  editEventButton: {
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  editEventModalContent: {
    width: "95%",
    maxHeight: "90%",
    borderRadius: 16,
    overflow: "hidden",
  },
  dateTimeSection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  selectedEventImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 20,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteModalContent: {
    width: "85%",
    maxWidth: 300,
    borderRadius: 16,
    overflow: "hidden",
  },
  deleteModalHeader: {
    padding: 20,
    paddingBottom: 16,
    alignItems: "center",
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  deleteModalBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  deleteModalMessage: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.8,
  },
  deleteModalFooter: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  cancelDeleteButton: {
    borderWidth: 1,
    borderColor: "#ddd",
  },
  textAreaInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
});
