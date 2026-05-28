import { Feather } from "@expo/vector-icons";
import { useGetProduct, useListSerialNumbers, useListStockMovements } from "@workspace/api-client-react";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: valueColor ?? colors.text, fontFamily: "Inter_500Medium" }]}>{value}</Text>
    </View>
  );
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const [tab, setTab] = useState<"info" | "stock" | "serials">("info");

  const { data: product, isLoading } = useGetProduct(Number(id));
  const { data: movements } = useListStockMovements({ productId: Number(id) });
  const { data: serials } = useListSerialNumbers({ productId: Number(id) });

  if (isLoading) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.primary} /></View>;
  }

  if (!product) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><EmptyState icon="box" title="Product not found" /></View>;
  }

  const isLow = product.currentStock <= product.reorderLevel;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.hero, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.productName, { color: colors.text, fontFamily: "Inter_700Bold" }]}>{product.name}</Text>
        <Text style={[styles.productMeta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {product.brand ? `${product.brand} · ` : ""}{product.categoryName} · {product.sku}
        </Text>
        <View style={styles.badges}>
          <Text style={[styles.price, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>{fmt(product.sellingPrice)}</Text>
          <Badge label={product.isActive ? "Active" : "Inactive"} variant={product.isActive ? "success" : "danger"} />
          <Badge label={`Stock: ${product.currentStock}`} variant={isLow ? (product.currentStock === 0 ? "danger" : "warning") : "success"} />
        </View>
      </View>

      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        {(["info", "stock", "serials"] as const).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, t === tab && { borderBottomColor: colors.primary }]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, { color: t === tab ? colors.primary : colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
              {t === "info" ? "Details" : t === "stock" ? `Movements (${movements?.length ?? 0})` : `Serials (${serials?.length ?? 0})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {tab === "info" && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Row label="SKU" value={product.sku} />
            {product.barcode && <Row label="Barcode" value={product.barcode} />}
            {product.brand && <Row label="Brand" value={product.brand} />}
            {product.model && <Row label="Model" value={product.model} />}
            <Row label="Category" value={product.categoryName} />
            <Row label="Cost Price" value={fmt(product.costPrice)} />
            <Row label="Selling Price" value={fmt(product.sellingPrice)} valueColor={colors.primary} />
            <Row label="GST Rate" value={`${product.gstRate}%`} />
            <Row label="Current Stock" value={String(product.currentStock)} valueColor={isLow ? colors.warning : colors.success} />
            <Row label="Reorder Level" value={String(product.reorderLevel)} />
            <Row label="Unit" value={product.unit} />
            {product.description && <Row label="Description" value={product.description} />}
          </View>
        )}

        {tab === "stock" && (
          movements && movements.length > 0 ? (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {movements.map((m, idx) => (
                <View key={m.id} style={[styles.movRow, idx < movements.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                  <View>
                    <Text style={[styles.movType, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>{m.movementType}</Text>
                    <Text style={[styles.movDate, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {new Date(m.createdAt).toLocaleDateString("en-IN")}
                    </Text>
                    {m.reference && <Text style={[styles.movRef, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{m.reference}</Text>}
                  </View>
                  <View style={styles.movRight}>
                    <Text style={[styles.movQty, { color: m.quantity > 0 ? colors.success : colors.destructive, fontFamily: "Inter_700Bold" }]}>
                      {m.quantity > 0 ? "+" : ""}{m.quantity}
                    </Text>
                    <Text style={[styles.movStock, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                      {m.previousStock} → {m.newStock}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <EmptyState icon="trending-up" title="No stock movements" />
          )
        )}

        {tab === "serials" && (
          serials && serials.length > 0 ? (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {serials.map((s, idx) => (
                <View key={s.id} style={[styles.serialRow, idx < serials.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                  <View>
                    <Text style={[styles.serialNum, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>{s.serialNumber}</Text>
                    {s.imei1 && <Text style={[styles.serialMeta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>IMEI1: {s.imei1}</Text>}
                    {s.imei2 && <Text style={[styles.serialMeta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>IMEI2: {s.imei2}</Text>}
                  </View>
                  <Badge label={s.status} variant={s.status === "AVAILABLE" ? "success" : s.status === "SOLD" ? "default" : "danger"} />
                </View>
              ))}
            </View>
          ) : (
            <EmptyState icon="hash" title="No serial numbers" subtitle="Add serial/IMEI numbers for tracking" />
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: { padding: 16, borderBottomWidth: 1 },
  productName: { fontSize: 20, marginBottom: 4 },
  productMeta: { fontSize: 13, marginBottom: 10 },
  badges: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  price: { fontSize: 22 },
  tabs: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabText: { fontSize: 13 },
  content: { padding: 12, gap: 12 },
  card: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderBottomWidth: 0 },
  rowLabel: { fontSize: 14 },
  rowValue: { fontSize: 14, textAlign: "right", flex: 1, marginLeft: 16 },
  movRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", padding: 12 },
  movType: { fontSize: 14, marginBottom: 2 },
  movDate: { fontSize: 12 },
  movRef: { fontSize: 12 },
  movRight: { alignItems: "flex-end" },
  movQty: { fontSize: 18 },
  movStock: { fontSize: 12 },
  serialRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12 },
  serialNum: { fontSize: 14, marginBottom: 2 },
  serialMeta: { fontSize: 12 },
});
