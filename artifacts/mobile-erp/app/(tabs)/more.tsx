import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

interface MenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}

function MenuItem({ icon, label, subtitle, color, onPress }: MenuItemProps) {
  const colors = useColors();
  return (
    <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: color + "22" }]}>
        <Feather name={icon} size={22} color={color} />
      </View>
      <View style={styles.menuText}>
        <Text style={[styles.menuLabel, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>{label}</Text>
        <Text style={[styles.menuSub, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: topPadding }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: insets.top + 8 }]}>
        <View>
          <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>More</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {user?.fullName} · {user?.role}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + bottomPadding + 100 }]}>
        <Text style={[styles.section, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Operations</Text>
        <MenuItem icon="bar-chart-2" label="Reports" subtitle="Sales, P&L, GST reports" color={colors.primary} onPress={() => router.push("/reports" as any)} />
        <MenuItem icon="package" label="Inventory" subtitle="Stock movements & alerts" color={colors.warning} onPress={() => router.push("/inventory" as any)} />
        <MenuItem icon="shopping-bag" label="Sales History" subtitle="Browse all transactions" color={colors.success} onPress={() => router.push("/sales-history" as any)} />

        {user?.role === "admin" || user?.role === "manager" ? (
          <>
            <Text style={[styles.section, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Management</Text>
            <MenuItem icon="users" label="User Management" subtitle="Manage staff accounts" color="#8B5CF6" onPress={() => router.push("/users" as any)} />
          </>
        ) : null}

        <Text style={[styles.section, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Account</Text>
        <MenuItem icon="settings" label="Settings" subtitle="Profile & preferences" color={colors.info} onPress={() => router.push("/settings" as any)} />

        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "44" }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Feather name="log-out" size={18} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive, fontFamily: "Inter_600SemiBold" }]}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Volt ERP v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  title: { fontSize: 20 },
  subtitle: { fontSize: 13, marginTop: 2 },
  content: { padding: 16, gap: 8 },
  section: { fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginTop: 16, marginBottom: 4, paddingLeft: 4 },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 1, gap: 12 },
  menuIcon: { width: 42, height: 42, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15 },
  menuSub: { fontSize: 12, marginTop: 1 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 16, borderRadius: 12, borderWidth: 1, marginTop: 8 },
  logoutText: { fontSize: 16 },
  version: { textAlign: "center", fontSize: 12, marginTop: 16 },
});
