import React from "react";
import {
  StyleSheet,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";

interface PasswordData {
  current: string;
  new: string;
  confirm: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  passwordData: PasswordData;
  setPasswordData: (data: PasswordData) => void;
  isRTL: boolean;
  texts: any;
  colors: {
    primary: string;
    bg: string;
    surface: string;
    text: string;
    muted: string;
    border: string;
  };
}

export function PasswordChangeModal({
  visible,
  onClose,
  onSubmit,
  passwordData,
  setPasswordData,
  isRTL,
  texts,
  colors,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.modalOverlay,
          { backgroundColor: "rgba(17,24,39,0.5)" },
        ]}
      >
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: colors.bg,
              borderColor: colors.border,
              borderWidth: 1,
            },
          ]}
        >
          <ThemedText
            type="subtitle"
            style={[
              styles.modalTitle,
              { color: colors.text },
              isRTL && styles.rtlText,
            ]}
          >
            {texts.changePassword || "Change Password"}
          </ThemedText>

          <View style={styles.formField}>
            <ThemedText
              style={[
                styles.fieldLabel,
                { color: colors.muted },
                isRTL && styles.rtlText,
              ]}
            >
              {texts.currentPassword || "Current Password"}
            </ThemedText>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  textAlign: isRTL ? "right" : "left",
                  borderColor: colors.border,
                  borderWidth: 1,
                },
              ]}
              placeholder={
                texts.enterCurrentPassword || "Enter current password"
              }
              placeholderTextColor={colors.muted}
              secureTextEntry
              value={passwordData.current}
              onChangeText={(text) =>
                setPasswordData({ ...passwordData, current: text })
              }
            />
          </View>

          <View style={styles.formField}>
            <ThemedText
              style={[
                styles.fieldLabel,
                { color: colors.muted },
                isRTL && styles.rtlText,
              ]}
            >
              {texts.newPassword || "New Password"}
            </ThemedText>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  textAlign: isRTL ? "right" : "left",
                  borderColor: colors.border,
                  borderWidth: 1,
                },
              ]}
              placeholder={texts.enterNewPassword || "Enter new password"}
              placeholderTextColor={colors.muted}
              secureTextEntry
              value={passwordData.new}
              onChangeText={(text) =>
                setPasswordData({ ...passwordData, new: text })
              }
            />
          </View>

          <View style={styles.formField}>
            <ThemedText
              style={[
                styles.fieldLabel,
                { color: colors.muted },
                isRTL && styles.rtlText,
              ]}
            >
              {texts.confirmPassword || "Confirm Password"}
            </ThemedText>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  textAlign: isRTL ? "right" : "left",
                  borderColor: colors.border,
                  borderWidth: 1,
                },
              ]}
              placeholder={texts.confirmNewPassword || "Confirm new password"}
              placeholderTextColor={colors.muted}
              secureTextEntry
              value={passwordData.confirm}
              onChangeText={(text) =>
                setPasswordData({ ...passwordData, confirm: text })
              }
            />
          </View>

          <View style={[styles.modalActions, isRTL && styles.modalActionsRTL]}>
            <TouchableOpacity
              style={[
                styles.modalButton,
                styles.cancelButton,
                { backgroundColor: colors.bg, borderColor: colors.border },
              ]}
              onPress={onClose}
            >
              <ThemedText style={{ color: colors.text }}>
                {texts.cancel || "Cancel"}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.primary }]}
              onPress={onSubmit}
            >
              <ThemedText style={{ color: "#FFFFFF" }}>{"Change"}</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: { textAlign: "center", marginBottom: 16 },
  formField: { marginBottom: 16 },
  fieldLabel: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  textInput: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  modalActions: { flexDirection: "row", gap: 12 },
  modalActionsRTL: { flexDirection: "row-reverse" },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  cancelButton: {},
  rtlText: { textAlign: "right" },
});
