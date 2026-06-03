import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { ThemedText } from "@/components/ThemedText";
import { useFigmaTheme } from "@/theme/useFigmaTheme";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const { palette, spacing, radii, type, shadow } = useFigmaTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [passErr, setPassErr] = useState<string | null>(null);
  const [formErr, setFormErr] = useState<string | null>(null);

  const [emailFocused, setEmailFocused] = useState(false);
  const [pwFocused, setPwFocused] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

  const validate = () => {
    let ok = true;
    setFormErr(null);
    const e = email.trim();
    if (!e) { setEmailErr("Email is required"); ok = false; }
    else if (!emailRegex.test(e)) { setEmailErr("Invalid email format"); ok = false; }
    else setEmailErr(null);

    if (!password) { setPassErr("Password is required"); ok = false; }
    else if (password.length < 6) { setPassErr("Password must be at least 6 characters"); ok = false; }
    else setPassErr(null);

    return ok;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        const msg = normalizeAuthError(error);
        setFormErr(msg);
      } else {
        router.replace("/first-time-setup");
      }
    } catch {
      setFormErr("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputBorder = (focused: boolean, err: string | null) =>
    err ? palette.danger : focused ? palette.primary : palette.border;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: spacing["3xl"] }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View
            style={[
              styles.headerBar,
              { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
            ]}
          >
            <View style={{ width: 40 }} />
            <ThemedText
              style={[
                type.h3,
                { color: palette.text, textAlign: "center", flex: 1 },
              ]}
            >
              Sircles
            </ThemedText>
            <View style={{ width: 40 }} />
          </View>

          {/* Hero card */}
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.sm }}>
            <View
              style={[
                styles.heroCard,
                {
                  borderRadius: radii.xl,
                  backgroundColor: palette.primary,
                  ...shadow.md,
                  shadowColor: palette.primary,
                },
              ]}
            >
              <Image
                source={require("../assets/images/login-illustration.png")}
                style={[StyleSheet.absoluteFillObject, { opacity: 0.18 }]}
                contentFit="cover"
              />
              <View style={styles.heroOverlay} />
              <View
                style={{
                  padding: spacing.xl,
                  paddingTop: spacing["2xl"],
                  paddingBottom: spacing["2xl"],
                }}
              >
                <ThemedText
                  style={[
                    type.h1,
                    { color: palette.primaryOn, marginBottom: spacing.xs },
                  ]}
                >
                  Welcome back
                </ThemedText>
                <ThemedText
                  style={[
                    type.body,
                    { color: "rgba(255,255,255,0.88)" },
                  ]}
                >
                  Your community, your space.
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Form card */}
          <View
            style={[
              styles.formCard,
              {
                marginHorizontal: spacing.lg,
                marginTop: spacing.xl,
                borderRadius: radii.xl,
                backgroundColor: palette.surface,
                borderColor: palette.border,
                padding: spacing.xl,
              },
            ]}
          >
            <ThemedText
              style={[
                type.smallBold,
                {
                  color: palette.textMuted,
                  marginBottom: spacing.sm,
                  letterSpacing: 0.4,
                },
              ]}
            >
              EMAIL
            </ThemedText>
            <View
              style={[
                styles.inputWrap,
                {
                  borderColor: inputBorder(emailFocused, emailErr),
                  borderRadius: radii.lg,
                  backgroundColor: palette.surface,
                },
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={18}
                color={palette.textMuted}
                style={{ marginRight: spacing.sm }}
              />
              <TextInput
                style={[
                  styles.input,
                  { color: palette.text, fontSize: type.body.fontSize },
                ]}
                placeholder="you@example.com"
                placeholderTextColor={palette.textSubtle}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (emailErr) setEmailErr(null);
                  if (formErr) setFormErr(null);
                }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                accessibilityLabel="Email address"
              />
            </View>
            {emailErr ? (
              <ThemedText
                style={[
                  type.small,
                  { color: palette.danger, marginTop: spacing.xs },
                ]}
              >
                {emailErr}
              </ThemedText>
            ) : null}

            <ThemedText
              style={[
                type.smallBold,
                {
                  color: palette.textMuted,
                  marginTop: spacing.lg,
                  marginBottom: spacing.sm,
                  letterSpacing: 0.4,
                },
              ]}
            >
              PASSWORD
            </ThemedText>
            <View
              style={[
                styles.inputWrap,
                {
                  borderColor: inputBorder(pwFocused, passErr),
                  borderRadius: radii.lg,
                  backgroundColor: palette.surface,
                },
              ]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={palette.textMuted}
                style={{ marginRight: spacing.sm }}
              />
              <TextInput
                style={[
                  styles.input,
                  { color: palette.text, fontSize: type.body.fontSize },
                ]}
                placeholder="••••••••"
                placeholderTextColor={palette.textSubtle}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (passErr) setPassErr(null);
                  if (formErr) setFormErr(null);
                }}
                onFocus={() => setPwFocused(true)}
                onBlur={() => setPwFocused(false)}
                accessibilityLabel="Password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword((p) => !p)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={palette.textMuted}
                />
              </TouchableOpacity>
            </View>
            {passErr ? (
              <ThemedText
                style={[
                  type.small,
                  { color: palette.danger, marginTop: spacing.xs },
                ]}
              >
                {passErr}
              </ThemedText>
            ) : null}

            {formErr ? (
              <View
                style={{
                  marginTop: spacing.md,
                  padding: spacing.md,
                  borderRadius: radii.md,
                  backgroundColor: palette.dangerSoft,
                }}
              >
                <ThemedText style={[type.small, { color: palette.danger }]}>
                  {formErr}
                </ThemedText>
              </View>
            ) : null}

            <TouchableOpacity
              style={{
                alignSelf: "flex-end",
                marginTop: spacing.md,
              }}
              onPress={() => Alert.alert("Forgot Password", "Coming soon")}
              accessibilityRole="button"
              accessibilityLabel="Forgot password"
            >
              <ThemedText style={[type.smallBold, { color: palette.primary }]}>
                Forgot password?
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                {
                  marginTop: spacing.xl,
                  backgroundColor: palette.primary,
                  borderRadius: radii.lg,
                  paddingVertical: spacing.md + 2,
                  opacity: loading || !email.trim() || !password ? 0.7 : 1,
                  ...shadow.sm,
                },
              ]}
              onPress={handleLogin}
              disabled={loading || !email.trim() || !password}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
              accessibilityState={{
                disabled: loading || !email.trim() || !password,
              }}
            >
              <ThemedText
                style={[type.button, { color: palette.primaryOn }]}
              >
                {loading ? "Signing in..." : "Sign in"}
              </ThemedText>
            </TouchableOpacity>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: spacing.xl,
              }}
            >
              <View
                style={{ flex: 1, height: 1, backgroundColor: palette.border }}
              />
              <ThemedText
                style={[
                  type.caption,
                  {
                    color: palette.textSubtle,
                    marginHorizontal: spacing.md,
                    letterSpacing: 1,
                  },
                ]}
              >
                OR
              </ThemedText>
              <View
                style={{ flex: 1, height: 1, backgroundColor: palette.border }}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.secondaryButton,
                {
                  marginTop: spacing.lg,
                  borderRadius: radii.lg,
                  borderColor: palette.border,
                  backgroundColor: palette.surface,
                  paddingVertical: spacing.md + 2,
                },
              ]}
              onPress={() => Alert.alert("SSO", "Coming soon")}
              accessibilityRole="button"
              accessibilityLabel="Continue with SSO"
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={palette.text}
                style={{ marginRight: spacing.sm }}
              />
              <ThemedText style={[type.button, { color: palette.text }]}>
                Continue with SSO
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View
            style={{
              alignItems: "center",
              marginTop: spacing["2xl"],
              gap: spacing.md,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ThemedText style={[type.small, { color: palette.textMuted }]}>
                New to Sircles?{" "}
              </ThemedText>
              <TouchableOpacity
                onPress={() => router.push("/signup" as any)}
                accessibilityRole="link"
                accessibilityLabel="Create an account"
              >
                <ThemedText
                  style={[type.smallBold, { color: palette.primary }]}
                >
                  Create an account
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs + 2,
                borderRadius: radii.pill,
                backgroundColor: palette.successSoft,
              }}
            >
              <Ionicons
                name="lock-closed"
                size={12}
                color={palette.success}
                style={{ marginRight: spacing.xs }}
              />
              <ThemedText
                style={[
                  type.caption,
                  { color: palette.success, letterSpacing: 0.6 },
                ]}
              >
                ENCRYPTED CONNECTION
              </ThemedText>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function normalizeAuthError(error: any): string {
  const msg = (error?.message || "").toLowerCase();
  const code = (error?.code || error?.status || "").toString().toLowerCase();
  if (code.includes("invalid_credentials") || msg.includes("invalid login credentials"))
    return "Email or password is incorrect";
  if (code.includes("auth/invalid-credential") || msg.includes("invalid-credential"))
    return "Email or password is incorrect";
  if (code.includes("auth/user-not-found") || msg.includes("user not found"))
    return "User not found";
  if (code.includes("auth/wrong-password") || msg.includes("wrong password"))
    return "Wrong password";
  if (code.includes("auth/too-many-requests") || msg.includes("too many"))
    return "Too many attempts. Try again later.";
  if (code.includes("network") || msg.includes("network"))
    return "Network issue. Check your connection and try again.";
  return "Could not sign in. Check your credentials and try again.";
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  heroCard: {
    overflow: "hidden",
    minHeight: 180,
    justifyContent: "flex-end",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.25)",
  },
  formCard: {
    borderWidth: 1,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
  },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});
