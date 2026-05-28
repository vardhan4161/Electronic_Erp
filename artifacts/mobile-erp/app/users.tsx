import { useListUsers } from "@workspace/api-client-react";
import React from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";

export default function UsersScreen() {
  const colors = useColors();
  const { data: users, isLoading, refetch, isRefetching } = useListUsers();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        data={users ?? []}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary + "22" }]}>
              <Text style={[styles.initials, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                {item.fullName.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}
              </Text>
            </View>
            <View style={styles.info}>
              <Text style={[styles.name, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>{item.fullName}</Text>
              <Text style={[styles.username, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>@{item.username}</Text>
              <Text style={[styles.email, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{item.email}</Text>
            </View>
            <View style={styles.badges}>
              <Badge label={item.role.toUpperCase()} variant={item.role === "admin" ? "danger" : item.role === "manager" ? "warning" : "info"} />
              <Badge label={item.isActive ? "Active" : "Inactive"} variant={item.isActive ? "success" : "default"} />
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListEmptyComponent={
          isLoading
            ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
            : <EmptyState icon="users" title="No users found" />
        }
        scrollEnabled={!!(users?.length)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { padding: 12, gap: 8, paddingBottom: 100 },
  card: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 1, gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  initials: { fontSize: 16 },
  info: { flex: 1 },
  name: { fontSize: 15, marginBottom: 2 },
  username: { fontSize: 13 },
  email: { fontSize: 12 },
  badges: { gap: 4, alignItems: "flex-end" },
});
