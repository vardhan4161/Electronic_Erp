import { Feather } from "@expo/vector-icons";
import { useGetCategorySales, useGetGstReport, useGetProfitLoss, useGetTopProducts } from "@workspace/api-client-react";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function fmtPct(n: number) {
  return `${n.toFixed(1)}%`;
}

type Range = "week" | "month" | "quarter";

function getRange(range: Range): { fromDate: string; toDate: string } {
  const now = new Date();
  const toDate = now.toISOString().split("T")[0];
  let from = new Date();
  if (range === "week") from.setDate(from.getDate() - 7);
  else if (range === "month") from.setMonth(from.getMonth() - 1);
  else from.setMonth(from.getMonth() - 3);
  return { fromDate: from.toISOString().split("T")[0], toDate };
}

export default function ReportsScreen() {
  const colors = useColors();
  const [range, setRange] = useState<Range>("month");
  const { fromDate, toDate } = getRange(range);

  const { data: pl, isLoading: plLoading } = useGetProfitLoss({ fromDate, toDate });
  const { data: gst, isLoading: gstLoading } = useGetGstReport({ fromDate, toDate });
  const { data: catSales } = useGetCategorySales({ fromDate, toDate });
  const { data: topProds } = useGetTopProducts({ fromDate, toDate, limit: 5 });

  const ranges: { key: Range; label: string }[] = [
    { key: "week", label: "Week" },
    { key: "month", label: "Month" },
    { key: "quarter", label: "Quarter" },
  ];

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.rangeRow}>
        {ranges.map((r) => (
          <TouchableOpacity
            key={r.key}
            style={[styles.rangeBtn, { backgroundColor: range === r.key ? colors.primary : colors.card, borderColor: colors.border }]}
            onPress={() => setRange(r.key)}
          >
            <Text style={[styles.rangeText, { color: range === r.key ? "#fff" : colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {plLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
      ) : pl ? (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Profit & Loss</Text>
          {[
            { label: "Revenue", value: fmt(pl.revenue), color: colors.primary },
            { label: "Cost of Goods", value: fmt(pl.costOfGoods), color: colors.text },
            { label: "Gross Profit", value: fmt(pl.grossProfit), color: colors.success },
            { label: "Gross Margin", value: fmtPct(pl.grossMargin), color: colors.success },
            { label: "Total Expenses", value: fmt(pl.totalExpenses), color: colors.destructive },
            { label: "Net Profit", value: fmt(pl.netProfit), color: pl.netProfit >= 0 ? colors.success : colors.destructive },
            { label: "Net Margin", value: fmtPct(pl.netMargin), color: pl.netMargin >= 0 ? colors.success : colors.destructive },
          ].map((row) => (
            <View key={row.label} style={[styles.row, { borderBottomColor: colors.border }]}>
              <Text style={[styles.rowLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{row.label}</Text>
              <Text style={[styles.rowVal, { color: row.color, fontFamily: "Inter_700Bold" }]}>{row.value}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {!gstLoading && gst ? (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>GST Summary</Text>
          {[
            { label: "Total Sales", value: fmt(gst.totalSales) },
            { label: "CGST", value: fmt(gst.totalCgst) },
            { label: "SGST", value: fmt(gst.totalSgst) },
            { label: "IGST", value: fmt(gst.totalIgst) },
            { label: "Total Tax", value: fmt(gst.totalTax) },
            { label: "Transactions", value: String(gst.transactionCount) },
          ].map((row) => (
            <View key={row.label} style={[styles.row, { borderBottomColor: colors.border }]}>
              <Text style={[styles.rowLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{row.label}</Text>
              <Text style={[styles.rowVal, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>{row.value}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {topProds && topProds.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Top Products</Text>
          {topProds.map((p, idx) => (
            <View key={p.productId} style={[styles.topRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.rank, { color: colors.mutedForeground, fontFamily: "Inter_700Bold" }]}>#{idx + 1}</Text>
              <View style={styles.topInfo}>
                <Text style={[styles.topName, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>{p.productName}</Text>
                <Text style={[styles.topMeta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{p.quantitySold} sold · {p.categoryName}</Text>
              </View>
              <Text style={[styles.topRev, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>{fmt(p.revenue)}</Text>
            </View>
          ))}
        </View>
      )}

      {catSales && catSales.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Sales by Category</Text>
          {catSales.map((c) => (
            <View key={c.categoryId} style={styles.catRow}>
              <View style={styles.catInfo}>
                <Text style={[styles.catName, { color: colors.text, fontFamily: "Inter_500Medium" }]}>{c.categoryName}</Text>
                <View style={[styles.barBg, { backgroundColor: colors.muted }]}>
                  <View style={[styles.barFill, { backgroundColor: colors.primary, width: `${Math.min(100, c.percentage)}%` as any }]} />
                </View>
              </View>
              <View style={styles.catRight}>
                <Text style={[styles.catRev, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>{fmt(c.revenue)}</Text>
                <Text style={[styles.catPct, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{fmtPct(c.percentage)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  rangeRow: { flexDirection: "row", gap: 8 },
  rangeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  rangeText: { fontSize: 14 },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 4 },
  cardTitle: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1 },
  rowLabel: { fontSize: 14 },
  rowVal: { fontSize: 15 },
  topRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, gap: 10 },
  rank: { fontSize: 16, width: 28 },
  topInfo: { flex: 1 },
  topName: { fontSize: 14, marginBottom: 2 },
  topMeta: { fontSize: 12 },
  topRev: { fontSize: 14 },
  catRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, gap: 12 },
  catInfo: { flex: 1, gap: 4 },
  catName: { fontSize: 14 },
  barBg: { height: 4, borderRadius: 2, overflow: "hidden" },
  barFill: { height: 4, borderRadius: 2 },
  catRight: { alignItems: "flex-end" },
  catRev: { fontSize: 14 },
  catPct: { fontSize: 12 },
});
