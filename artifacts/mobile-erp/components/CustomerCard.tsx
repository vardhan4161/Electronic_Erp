import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface CustomerCardProps {
  name: string;
  phone: string;
  email?: string | null;
  totalPurchases: number;
  purchaseCount: number;
  onPress?: () => void;
}

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function CustomerCard({ name, phone, email, totalPurchases, purchaseCount, onPress }: CustomerCardProps) {
  const colors = useColors();
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.avatar, { backgroundColor: colors.primary + "22" }]}>
        <Text style={[styles.initials, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>{name}</Text>
        <Text style={[styles.phone, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          <Feather name="phone" size={11} /> {phone}
        </Text>
        {email ? (
          <Text style={[styles.phone, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            <Feather name="mail" size={11} /> {email}
          </Text>
        ) : null}
      </View>
      <View style={styles.stats}>
        <Text style={[styles.total, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>{fmt(totalPurchases)}</Text>
        <Text style={[styles.count, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {purchaseCount} orders
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: { fontSize: 16 },
  info: { flex: 1 },
  name: { fontSize: 15, marginBottom: 2 },
  phone: { fontSize: 12, lineHeight: 18 },
  stats: { alignItems: "flex-end" },
  total: { fontSize: 15 },
  count: { fontSize: 12 },
});
