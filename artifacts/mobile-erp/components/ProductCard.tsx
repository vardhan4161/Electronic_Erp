import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface ProductCardProps {
  name: string;
  sku: string;
  brand?: string | null;
  categoryName: string;
  sellingPrice: number;
  currentStock: number;
  reorderLevel: number;
  isActive: boolean;
  onPress?: () => void;
  onAddToCart?: () => void;
  showAddButton?: boolean;
}

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function ProductCard({
  name,
  sku,
  brand,
  categoryName,
  sellingPrice,
  currentStock,
  reorderLevel,
  isActive,
  onPress,
  onAddToCart,
  showAddButton,
}: ProductCardProps) {
  const colors = useColors();
  const isLow = currentStock <= reorderLevel;
  const stockColor = currentStock === 0 ? colors.destructive : isLow ? colors.warning : colors.success;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text, fontFamily: "Inter_600SemiBold" }]} numberOfLines={1}>
            {name}
          </Text>
          <Text style={[styles.meta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {brand ? `${brand} · ` : ""}{categoryName} · {sku}
          </Text>
        </View>
        {showAddButton && onAddToCart && currentStock > 0 && (
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={onAddToCart}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={18} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.footer}>
        <Text style={[styles.price, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>{fmt(sellingPrice)}</Text>
        <View style={[styles.stockBadge, { backgroundColor: stockColor + "22" }]}>
          <Feather name="package" size={10} color={stockColor} />
          <Text style={[styles.stockText, { color: stockColor, fontFamily: "Inter_500Medium" }]}>
            {currentStock} {isLow ? "(Low)" : ""}
          </Text>
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
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  info: { flex: 1, marginRight: 8 },
  name: { fontSize: 15, marginBottom: 3 },
  meta: { fontSize: 12, lineHeight: 16 },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: { fontSize: 16 },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  stockText: { fontSize: 11 },
});
