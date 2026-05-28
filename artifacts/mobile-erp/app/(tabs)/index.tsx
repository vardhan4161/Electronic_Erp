import { Feather } from "@expo/vector-icons";
import { useGetDashboardStats, useGetSalesByDay, useListSales } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { EmptyState } from "@/components/EmptyState";
import { SaleCard } from "@/components/SaleCard";
import { StatCard } from "@/components/StatCard";

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const router = useRouter();

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useGetDashboardStats();
  const { data: salesByDay } = useGetSalesByDay({ days: 7 });
  const { data: recentSales, refetch: refetchSales } = useListSales({});

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? "Good morning" : greetingHour < 17 ? "Good afternoon" : "Good evening";

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 120 + bottomPadding }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPadding + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{greeting},</Text>
          <Text style={[styles.userName, { color: colors.text, fontFamily: "Inter_700Bold" }]}>{user?.fullName ?? "User"}</Text>
        </View>
        <View style={[styles.roleBadge, { backgroundColor: colors.primary + "22" }]}>
          <Text style={[styles.roleText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
            {(user?.role ?? "").toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Today</Text>
        {statsLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : stats ? (
          <View style={styles.statsGrid}>
            <StatCard title="Revenue" value={fmt(stats.todayRevenue)} icon="dollar-sign" color={colors.primary} subtitle={`${stats.todaySalesCount} sales`} />
            <StatCard title="Month Revenue" value={fmt(stats.monthRevenue)} icon="trending-up" color={colors.success} subtitle={`${stats.monthSalesCount} sales`} />
            <StatCard title="Month Profit" value={fmt(stats.monthProfit)} icon="activity" color={stats.monthProfit >= 0 ? colors.success : colors.destructive} />
            <StatCard title="Low Stock" value={String(stats.lowStockCount)} icon="alert-triangle" color={stats.lowStockCount > 0 ? colors.warning : colors.success} subtitle={stats.lowStockCount > 0 ? "Needs attention" : "All good"} />
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          {[
            { icon: "shopping-cart" as const, label: "New Sale", color: colors.primary, route: "/(tabs)/pos" as const },
            { icon: "package" as const, label: "Inventory", color: colors.warning, route: "/inventory" as const },
            { icon: "bar-chart-2" as const, label: "Reports", color: colors.success, route: "/reports" as const },
            { icon: "users" as const, label: "Customers", color: "#8B5CF6", route: "/(tabs)/customers" as const },
          ].map((a) => (
            <TouchableOpacity
              key={a.label}
              style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(a.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: a.color + "22" }]}>
                <Feather name={a.icon} size={20} color={a.color} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.text, fontFamily: "Inter_500Medium" }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {salesByDay && salesByDay.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Last 7 Days Revenue</Text>
          <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {(() => {
              const max = Math.max(...salesByDay.map((d) => d.revenue), 1);
              return salesByDay.slice(-7).map((d) => {
                const height = Math.max(4, (d.revenue / max) * 80);
                const date = new Date(d.date);
                const label = date.toLocaleDateString("en-IN", { weekday: "short" }).slice(0, 3);
                return (
                  <View key={d.date} style={styles.bar}>
                    <Text style={[styles.barRev, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {d.revenue > 0 ? `₹${Math.round(d.revenue / 1000)}k` : ""}
                    </Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { height, backgroundColor: colors.primary }]} />
                    </View>
                    <Text style={[styles.barDay, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{label}</Text>
                  </View>
                );
              });
            })()}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Recent Sales</Text>
          <TouchableOpacity onPress={() => router.push("/sales-history" as any)}>
            <Text style={[styles.seeAll, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>See all</Text>
          </TouchableOpacity>
        </View>
        {recentSales && recentSales.length > 0 ? (
          recentSales.slice(0, 5).map((sale) => (
            <SaleCard
              key={sale.id}
              {...sale}
              onPress={() => router.push(`/sale/${sale.id}` as any)}
            />
          ))
        ) : (
          <EmptyState icon="shopping-bag" title="No sales yet" subtitle="Start by making a sale in the POS terminal" />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  greeting: { fontSize: 13 },
  userName: { fontSize: 20 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  roleText: { fontSize: 12 },
  section: { paddingHorizontal: 16, paddingTop: 20, gap: 10 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 1 },
  seeAll: { fontSize: 13 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionsRow: { flexDirection: "row", gap: 10 },
  actionBtn: { flex: 1, alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 1, gap: 8 },
  actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 12, textAlign: "center" },
  chartCard: { borderRadius: 12, borderWidth: 1, padding: 14, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", height: 130 },
  bar: { flex: 1, alignItems: "center", gap: 4 },
  barRev: { fontSize: 9 },
  barTrack: { flex: 1, width: "70%", justifyContent: "flex-end" },
  barFill: { width: "100%", borderRadius: 3 },
  barDay: { fontSize: 10 },
});
