import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/Badge";

export default function SettingsScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const initials = user?.fullName
    ? user.fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  const roleVariant = user?.role === "admin" ? "danger" : user?.role === "manager" ? "warning" : "info";

  const handleChangePassword = () => {
    if (!currentPw || !newPw || !confirmPw) {
      Alert.alert("Required", "All fields are required");
      return;
    }
    if (newPw !== confirmPw) {
      Alert.alert("Mismatch", "New passwords don't match");
      return;
    }
    if (newPw.length < 6) {
      Alert.alert("Too short", "Password must be at least 6 characters");
      return;
    }
    Alert.alert("Coming Soon", "Password change via the web app is available.");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
  };

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + "22" }]}>
          <Text style={[styles.initials, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>{initials}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.name, { color: colors.text, fontFamily: "Inter_700Bold" }]}>{user?.fullName}</Text>
          <Text style={[styles.username, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>@{user?.username}</Text>
          <Text style={[styles.email, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{user?.email}</Text>
          <View style={styles.roleRow}>
            <Badge label={(user?.role ?? "").toUpperCase()} variant={roleVariant} />
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Change Password</Text>

        {[
          { label: "Current Password", value: currentPw, setter: setCurrentPw },
          { label: "New Password", value: newPw, setter: setNewPw },
          { label: "Confirm New Password", value: confirmPw, setter: setConfirmPw },
        ].map((f) => (
          <View key={f.label} style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>{f.label}</Text>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border, fontFamily: "Inter_400Regular" }]}
              placeholder={f.label}
              placeholderTextColor={colors.mutedForeground}
              value={f.value}
              onChangeText={f.setter}
              secureTextEntry
            />
          </View>
        ))}

        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary }]} onPress={handleChangePassword} activeOpacity={0.85}>
          <Feather name="lock" size={16} color="#fff" />
          <Text style={[styles.btnText, { fontFamily: "Inter_600SemiBold" }]}>Update Password</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>App Info</Text>
        {[
          { label: "App Name", value: "Volt ERP" },
          { label: "Version", value: "1.0.0" },
          { label: "Platform", value: "Mobile (Expo)" },
        ].map((r) => (
          <View key={r.label} style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{r.label}</Text>
            <Text style={[styles.infoVal, { color: colors.text, fontFamily: "Inter_500Medium" }]}>{r.value}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  profileCard: { borderRadius: 16, padding: 20, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 16 },
  avatar: { width: 68, height: 68, borderRadius: 34, alignItems: "center", justifyContent: "center" },
  initials: { fontSize: 24 },
  profileInfo: { flex: 1, gap: 3 },
  name: { fontSize: 18 },
  username: { fontSize: 14 },
  email: { fontSize: 14 },
  roleRow: { marginTop: 4 },
  card: { borderRadius: 12, padding: 16, borderWidth: 1, gap: 12 },
  sectionTitle: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 },
  field: { gap: 6 },
  fieldLabel: { fontSize: 13 },
  input: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15 },
  btn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 12, marginTop: 4 },
  btnText: { color: "#fff", fontSize: 15 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1 },
  infoLabel: { fontSize: 14 },
  infoVal: { fontSize: 14 },
});
