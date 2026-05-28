import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface SaleCardProps {
  invoiceNumber: string;
  customerName?: string | null;
  grandTotal: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  onPress?: () => void;
}

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: "#3FB950",
  RETURNED: "#F85149",
  PARTIAL_RETURN: "#D29922",
};

const PAYMENT_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  CASH: "dollar-sign",
  CARD: "credit-card",
  UPI: "smartphone",
  CREDIT: "clock",
};

export function SaleCard({ invoiceNumber, customerName, grandTotal, paymentMethod, status, createdAt, onPress }: SaleCardProps) {
  const colors = useColors();
  const statusColor = STATUS_COLORS[status] ?? colors.mutedForeground;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={[styles.invoice, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>{invoiceNumber}</Text>
          <Text style={[styles.customer, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {customerName ?? "Walk-in Customer"}
          </Text>
          <Text style={[styles.date, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {formatDate(createdAt)}
          </Text>
        </View>
        <View style={styles.right}>
          <Text style={[styles.amount, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>{fmt(grandTotal)}</Text>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: statusColor + "22" }]}>
              <Text style={[styles.badgeText, { color: statusColor, fontFamily: "Inter_500Medium" }]}>
                {status.replace("_", " ")}
              </Text>
            </View>
            <Feather name={PAYMENT_ICONS[paymentMethod] ?? "dollar-sign"} size={14} color={colors.mutedForeground} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  left: { flex: 1 },
  right: { alignItems: "flex-end", gap: 6 },
  invoice: { fontSize: 14, marginBottom: 2 },
  customer: { fontSize: 13, marginBottom: 2 },
  date: { fontSize: 12 },
  amount: { fontSize: 18 },
  badges: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeText: { fontSize: 10 },
});
