import { Feather } from "@expo/vector-icons";
import { useGetCustomer, useGetCustomerSales } from "@workspace/api-client-react";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { EmptyState } from "@/components/EmptyState";
import { SaleCard } from "@/components/SaleCard";

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();

  const { data: customer, isLoading } = useGetCustomer(Number(id));
  const { data: sales } = useGetCustomerSales(Number(id));

  if (isLoading) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.primary} /></View>;
  }

  if (!customer) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><EmptyState icon="user" title="Customer not found" /></View>;
  }

  const initials = customer.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + "22" }]}>
          <Text style={[styles.initials, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>{initials}</Text>
        </View>
        <Text style={[styles.name, { color: colors.text, fontFamily: "Inter_700Bold" }]}>{customer.name}</Text>
        <View style={styles.contactRow}>
          <Feather name="phone" size={14} color={colors.mutedForeground} />
          <Text style={[styles.contact, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{customer.phone}</Text>
        </View>
        {customer.email && (
          <View style={styles.contactRow}>
            <Feather name="mail" size={14} color={colors.mutedForeground} />
            <Text style={[styles.contact, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{customer.email}</Text>
          </View>
        )}
        {customer.address && (
          <View style={styles.contactRow}>
            <Feather name="map-pin" size={14} color={colors.mutedForeground} />
            <Text style={[styles.contact, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{customer.address}</Text>
          </View>
        )}
        {customer.gstin && (
          <View style={styles.contactRow}>
            <Feather name="file-text" size={14} color={colors.mutedForeground} />
            <Text style={[styles.contact, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>GSTIN: {customer.gstin}</Text>
          </View>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statVal, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>{fmt(customer.totalPurchases)}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Total Spent</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statVal, { color: colors.text, fontFamily: "Inter_700Bold" }]}>{customer.purchaseCount}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Orders</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Purchase History</Text>

      {sales && sales.length > 0 ? (
        sales.map((sale) => (
          <SaleCard
            key={sale.id}
            {...sale}
            onPress={() => router.push(`/sale/${sale.id}` as any)}
          />
        ))
      ) : (
        <EmptyState icon="shopping-bag" title="No purchases yet" />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, gap: 12 },
  hero: { borderRadius: 16, padding: 20, borderWidth: 1, alignItems: "center", gap: 6 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  initials: { fontSize: 26 },
  name: { fontSize: 20 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  contact: { fontSize: 14 },
  statsRow: { flexDirection: "row", gap: 12 },
  statBox: { flex: 1, borderRadius: 12, padding: 16, borderWidth: 1, alignItems: "center" },
  statVal: { fontSize: 22 },
  statLabel: { fontSize: 13, marginTop: 4 },
  sectionTitle: { fontSize: 11, textTransform: "uppercase", letterSpacing: 1, paddingLeft: 4 },
});
