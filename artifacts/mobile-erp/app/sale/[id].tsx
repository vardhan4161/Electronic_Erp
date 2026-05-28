import { useGetSale } from "@workspace/api-client-react";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, value, bold, color }: { label: string; value: string; bold?: boolean; color?: string }) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{label}</Text>
      <Text style={[styles.rowVal, { color: color ?? colors.text, fontFamily: bold ? "Inter_700Bold" : "Inter_500Medium" }]}>{value}</Text>
    </View>
  );
}

export default function SaleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const { data, isLoading } = useGetSale(Number(id));

  if (isLoading) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.primary} /></View>;
  }

  if (!data) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><EmptyState icon="file-text" title="Sale not found" /></View>;
  }

  const { sale, items } = data;
  const statusVariant = sale.status === "COMPLETED" ? "success" : sale.status === "RETURNED" ? "danger" : "warning";

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.invoiceHeader, { backgroundColor: colors.primary }]}>
        <Text style={[styles.invoiceNo, { fontFamily: "Inter_700Bold" }]}>{sale.invoiceNumber}</Text>
        <Text style={[styles.invoiceDate, { fontFamily: "Inter_400Regular" }]}>
          {new Date(sale.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
        </Text>
        <Badge label={sale.status.replace("_", " ")} variant={statusVariant} />
      </View>

      {(sale.customerName || sale.customerPhone) && (
        <Section title="Customer">
          {sale.customerName && <Row label="Name" value={sale.customerName} />}
          {sale.customerPhone && <Row label="Phone" value={sale.customerPhone} />}
          {sale.customerGstin && <Row label="GSTIN" value={sale.customerGstin} />}
        </Section>
      )}

      <Section title="Items">
        {items.map((item) => (
          <View key={item.id} style={[styles.itemRow, { borderBottomColor: colors.border }]}>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>{item.productName}</Text>
              <Text style={[styles.itemSku, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{item.productSku}</Text>
              <Text style={[styles.itemMeta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {item.quantity} × {fmt(item.unitPrice)} (GST {item.gstRate}%)
              </Text>
              {item.discount > 0 && (
                <Text style={[styles.itemMeta, { color: colors.warning, fontFamily: "Inter_400Regular" }]}>Discount: -{fmt(item.discount)}</Text>
              )}
            </View>
            <Text style={[styles.itemTotal, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>{fmt(item.totalPrice)}</Text>
          </View>
        ))}
      </Section>

      <Section title="Payment Summary">
        <Row label="Subtotal" value={fmt(sale.subtotal)} />
        {sale.discountAmount > 0 && <Row label="Discount" value={`-${fmt(sale.discountAmount)}`} color={colors.warning} />}
        {sale.cgst > 0 && <Row label="CGST" value={fmt(sale.cgst)} />}
        {sale.sgst > 0 && <Row label="SGST" value={fmt(sale.sgst)} />}
        {sale.igst > 0 && <Row label="IGST" value={fmt(sale.igst)} />}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Row label="Grand Total" value={fmt(sale.grandTotal)} bold color={colors.primary} />
        <Row label="Payment" value={sale.paymentMethod} />
        <Row label="Amount Paid" value={fmt(sale.amountPaid)} />
        {sale.changeAmount > 0 && <Row label="Change" value={fmt(sale.changeAmount)} color={colors.success} />}
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { gap: 12, paddingBottom: 40 },
  invoiceHeader: { padding: 20, alignItems: "center", gap: 6 },
  invoiceNo: { color: "#fff", fontSize: 22 },
  invoiceDate: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  section: { margin: 12, borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  sectionTitle: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowLabel: { fontSize: 14 },
  rowVal: { fontSize: 14, textAlign: "right" },
  itemRow: { paddingVertical: 10, borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, marginBottom: 2 },
  itemSku: { fontSize: 12 },
  itemMeta: { fontSize: 12 },
  itemTotal: { fontSize: 15, marginLeft: 12 },
  divider: { height: 1, marginVertical: 6 },
});
