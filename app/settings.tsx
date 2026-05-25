import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SettingsToggleRow } from "@/components/settings/SettingsToggleRow";
import { SettingsNavRow } from "@/components/settings/SettingsNavRow";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { PasswordChangeModal } from "@/components/settings/PasswordChangeModal";

// لوحة ألوان متوافقة مع اللقطات
const palette = {
  primary: "#198F4B",
  primaryDark: "#0A5C2B",
  bg: "#FFFFFF",
  surface: "#F8F9FA",
  text: "#111827",
  muted: "#6B7280",
  border: "#E5E7EB",
  chipBg: "#F3F4F6",
  chipText: "#111827",
  success: "#22C55E",
};
const handleLogout = async () => {
  try {
    // امسحي أي بيانات مستخدم محفوظة
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userData");

    // رجّعي المستخدم لصفحة اللوجين
    router.replace("/login");
  } catch (error) {
    console.log("Logout error:", error);
  }
};
export default function SettingsScreen() {
  const { texts, language, toggleLanguage, isRTL } = useLanguage();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // لا دارك مود هنا. الطابع في الشots فاتح + أخضر
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [notifications, setNotifications] = useState({
    messages: true,
    events: true,
    circleUpdates: true,
    communityPosts: false,
  });

  const handlePasswordChange = () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      Alert.alert(
        texts.error || "Error",
        texts.fillAllFields || "Please fill in all fields."
      );
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      Alert.alert(
        texts.error || "Error",
        texts.passwordMismatch || "New passwords do not match."
      );
      return;
    }
    if (passwordData.new.length < 6) {
      Alert.alert(
        texts.error || "Error",
        "Password must be at least 6 characters long."
      );
      return;
    }
    Alert.alert(
      texts.success || "Success",
      texts.passwordChanged || "Password changed successfully!"
    );
    setShowPasswordModal(false);
    setPasswordData({ current: "", new: "", confirm: "" });
  };

  const toggleTheme = () => {
    // مجرد تبديل نصي لإبقاء السويتش كما هو لو محتاجه
    setIsDarkMode(!isDarkMode);
    Alert.alert("Theme", `Switched to ${!isDarkMode ? "Dark" : "Light"} mode`);
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const notificationItems = [
    {
      key: "messages" as const,
      icon: "message.fill",
      label: texts.messageNotifications || "Message Notifications",
      desc: "Get notified about new messages",
    },
    {
      key: "events" as const,
      icon: "calendar",
      label: texts.eventNotifications || "Event Notifications",
      desc: "Get notified about upcoming events",
    },
    {
      key: "circleUpdates" as const,
      icon: "person.3.fill",
      label: texts.circleUpdates || "Circle Updates",
      desc: "Get notified about circle activities",
    },
    {
      key: "communityPosts" as const,
      icon: "megaphone.fill",
      label: texts.communityPosts || "Community Posts",
      desc: "Get notified about admin posts",
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]}>
      {/* Header أخضر صلب */}
      <View style={[styles.header, { backgroundColor: palette.primary }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol
            name={isRTL ? "chevron.right" : "chevron.left"}
            size={24}
            color={"#FFFFFF"}
          />
        </TouchableOpacity>
        <ThemedText
          type="title"
          style={[
            styles.headerTitle,
            { color: "#FFFFFF" },
            isRTL && styles.rtlText,
          ]}
        >
          {texts.settings || "Settings"}
        </ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Password Settings */}
        <SettingsSection
          icon="lock"
          title={texts.passwordSettings || "Password Settings"}
          isRTL={isRTL}
          colors={palette}
        >
          <SettingsNavRow
            icon="key.fill"
            label={texts.changePassword || "Change Password"}
            onPress={() => setShowPasswordModal(true)}
            isRTL={isRTL}
            colors={palette}
          />
        </SettingsSection>

        {/* Theme Settings */}
        <SettingsSection
          icon={isDarkMode ? "moon.fill" : "sun.max.fill"}
          title={texts.themeSettings || "Theme Settings"}
          isRTL={isRTL}
          colors={palette}
        >
          <SettingsToggleRow
            icon={isDarkMode ? "moon.fill" : "sun.max.fill"}
            label={texts.darkMode || "Dark Mode"}
            description={isDarkMode ? "Dark theme enabled" : "Light theme enabled"}
            value={isDarkMode}
            onValueChange={toggleTheme}
            isRTL={isRTL}
            colors={palette}
          />
        </SettingsSection>

        {/* Language Settings */}
        <SettingsSection
          icon="globe"
          title={texts.languageSettings || "Language Settings"}
          isRTL={isRTL}
          colors={palette}
        >
          <SettingsNavRow
            icon="globe"
            label={texts.language || "Language"}
            description={language === "en" ? "English" : "العربية"}
            onPress={toggleLanguage}
            isRTL={isRTL}
            colors={palette}
            rightElement={
              <View
                style={[
                  styles.languageToggle,
                  {
                    backgroundColor: palette.chipBg,
                    borderColor: palette.border,
                    borderWidth: 1,
                  },
                ]}
              >
                <ThemedText
                  style={[styles.languageToggleText, { color: palette.chipText }]}
                >
                  {language === "en" ? "ع" : "EN"}
                </ThemedText>
              </View>
            }
          />
        </SettingsSection>

        {/* Notification Settings */}
        <SettingsSection
          icon="bell"
          title={texts.notificationSettings || "Notification Settings"}
          isRTL={isRTL}
          colors={palette}
        >
          {notificationItems.map((item) => (
            <SettingsToggleRow
              key={item.key}
              icon={item.icon}
              label={item.label}
              description={item.desc}
              value={notifications[item.key]}
              onValueChange={() => toggleNotification(item.key)}
              isRTL={isRTL}
              colors={palette}
            />
          ))}
        </SettingsSection>
        <View style={styles.containerLogOut}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <PasswordChangeModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordChange}
        passwordData={passwordData}
        setPasswordData={setPasswordData}
        isRTL={isRTL}
        texts={texts}
        colors={palette}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, flex: 1, textAlign: "center" },
  headerSpacer: { width: 32 },

  content: { flex: 1, padding: 16 },

  languageToggle: {
    paddingHorizontal: 10,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  languageToggleText: { fontSize: 12, fontWeight: "700" },

  rtlText: { textAlign: "right" },
  containerLogOut: {
    flexGrow: 1,
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "#fff",
  },
  logoutButton: {
    backgroundColor: "#E53935",
    paddingVertical: 15,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
