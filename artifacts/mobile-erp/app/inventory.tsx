import { Feather } from "@expo/vector-icons";
import { useCreateStockMovement, useGetLowStockProducts, useListProducts, useListStockMovements } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";

const MOVEMENT_TYPES = ["PURCHASE", "ADJUSTMENT", "RETURN"] as const;
type MovementType = (typeof MOVEMENT_TYPES)[number];

export default function InventoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"low" | "movements">("low");
  const [showAdd, setShowAdd] = useState(false);
  const [productId, setProductId] = useState("");
  const [movType, setMovType] = useState<MovementType>("PURCHASE");
  const [qty, setQty] = useState("");
  const [notes, setNotes] = useState("");
  const [prodSearch, setProdSearch] = useState("");

  const { data: lowStock, isLoading: loadingLow, refetch: refetchLow } = useGetLowStockProducts();
  const { data: movements, isLoading: loadingMov, refetch: refetchMov } = useListStockMovements({});
  const { data: allProducts } = useListProducts({ search: prodSearch || undefined, isActive: true });
  const addMovMutation = useCreateStockMovement();

  const handleAdd = async () => {
    if (!productId || !qty) {
      Alert.alert("Required", "Product and quantity are required");
      return;
    }
    try {
      await addMovMutation.mutateAsync({
        data: { productId: Number(productId), movementType: movType, quantity: Number(qty), notes: notes || null },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowAdd(false);
      setProductId(""); setQty(""); setNotes(""); setProdSearch("");
      refetchLow(); refetchMov();
    } catch {
      Alert.alert("Error", "Failed to record stock movement");
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        {(["low", "movements"] as const).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, t === tab && { borderBottomColor: colors.primary }]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, { color: t === tab ? colors.primary : colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
              {t === "low" ? `Low Stock (${lowStock?.length ?? 0})` : "Movements"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "low" && (
        <FlatList
          data={lowStock ?? []}
          keyExtractor={(i) => String(i.id)}
          renderItem={({ item }) => (
            <View style={[styles.stockItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.stockInfo}>
                <Text style={[styles.stockName, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>{item.name}</Text>
                <Text style={[styles.stockMeta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{item.sku} · {item.categoryName}</Text>
              </View>
              <View style={styles.stockRight}>
                <Badge label={`${item.currentStock} left`} variant={item.currentStock === 0 ? "danger" : "warning"} />
                <Text style={[styles.reorder, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Min: {item.reorderLevel}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: 100 }}
          onRefresh={refetchLow}
          refreshing={false}
          ListEmptyComponent={loadingLow ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} /> : <EmptyState icon="check-circle" title="All stock levels OK" subtitle="No products below reorder level" />}
          scrollEnabled={!!(lowStock?.length)}
        />
      )}

      {tab === "movements" && (
        <FlatList
          data={movements ?? []}
          keyExtractor={(i) => String(i.id)}
          renderItem={({ item }) => (
            <View style={[styles.movItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.movInfo}>
                <Text style={[styles.movProduct, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>{item.productName}</Text>
                <Text style={[styles.movMeta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {item.movementType} · {new Date(item.createdAt).toLocaleDateString("en-IN")}
                </Text>
                {item.reference && <Text style={[styles.movMeta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{item.reference}</Text>}
              </View>
              <View style={styles.movRight}>
                <Text style={[styles.movQty, { color: item.quantity > 0 ? colors.success : colors.destructive, fontFamily: "Inter_700Bold" }]}>
                  {item.quantity > 0 ? "+" : ""}{item.quantity}
                </Text>
                <Text style={[styles.movStock, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  → {item.newStock}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: 100 }}
          onRefresh={refetchMov}
          refreshing={false}
          ListEmptyComponent={loadingMov ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} /> : <EmptyState icon="trending-up" title="No stock movements" />}
          scrollEnabled={!!(movements?.length)}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 16 }]}
        onPress={() => setShowAdd(true)}
        activeOpacity={0.85}
      >
        <Feather name="plus" size={22} color="#fff" />
      </TouchableOpacity>

      <Modal visible={showAdd} animationType="slide" presentationStyle="formSheet" onRequestClose={() => setShowAdd(false)}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Stock Movement</Text>
            <TouchableOpacity onPress={() => setShowAdd(false)}><Feather name="x" size={22} color={colors.text} /></TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.modalBody}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Movement Type</Text>
              <View style={styles.typeRow}>
                {MOVEMENT_TYPES.map((t) => (
                  <TouchableOpacity key={t} style={[styles.typeChip, { backgroundColor: movType === t ? colors.primary : colors.card, borderColor: colors.border }]} onPress={() => setMovType(t)}>
                    <Text style={[styles.typeText, { color: movType === t ? "#fff" : colors.text, fontFamily: "Inter_500Medium" }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Search Product</Text>
              <TextInput style={[styles.inp, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card, fontFamily: "Inter_400Regular" }]} placeholder="Type product name..." placeholderTextColor={colors.mutedForeground} value={prodSearch} onChangeText={setProdSearch} />
            </View>

            {allProducts && allProducts.length > 0 && (
              <View style={[styles.prodList, { borderColor: colors.border }]}>
                {allProducts.slice(0, 5).map((p) => (
                  <TouchableOpacity key={p.id} style={[styles.prodOpt, { borderBottomColor: colors.border, backgroundColor: productId === String(p.id) ? colors.primary + "22" : "transparent" }]} onPress={() => { setProductId(String(p.id)); setProdSearch(p.name); }}>
                    <Text style={[styles.prodName, { color: colors.text, fontFamily: "Inter_500Medium" }]}>{p.name}</Text>
                    <Text style={[styles.prodSku, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{p.sku} · Stock: {p.currentStock}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Quantity *</Text>
              <TextInput style={[styles.inp, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card, fontFamily: "Inter_400Regular" }]} placeholder="Enter quantity" placeholderTextColor={colors.mutedForeground} value={qty} onChangeText={setQty} keyboardType="numeric" />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Notes</Text>
              <TextInput style={[styles.inp, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card, fontFamily: "Inter_400Regular" }]} placeholder="Optional notes" placeholderTextColor={colors.mutedForeground} value={notes} onChangeText={setNotes} multiline />
            </View>

            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: addMovMutation.isPending ? 0.7 : 1 }]} onPress={handleAdd} disabled={addMovMutation.isPending}>
              {addMovMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={[styles.saveBtnText, { fontFamily: "Inter_600SemiBold" }]}>Record Movement</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  tabs: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabText: { fontSize: 14 },
  stockItem: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 1, gap: 12 },
  stockInfo: { flex: 1 },
  stockName: { fontSize: 14, marginBottom: 2 },
  stockMeta: { fontSize: 12 },
  stockRight: { alignItems: "flex-end", gap: 4 },
  reorder: { fontSize: 12 },
  movItem: { flexDirection: "row", alignItems: "flex-start", padding: 14, borderRadius: 12, borderWidth: 1, gap: 12 },
  movInfo: { flex: 1 },
  movProduct: { fontSize: 14, marginBottom: 2 },
  movMeta: { fontSize: 12, lineHeight: 18 },
  movRight: { alignItems: "flex-end" },
  movQty: { fontSize: 20 },
  movStock: { fontSize: 12 },
  fab: { position: "absolute", right: 16, width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 },
  modal: { flex: 1 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1 },
  modalTitle: { fontSize: 20 },
  modalBody: { padding: 20, gap: 16 },
  field: { gap: 8 },
  label: { fontSize: 13 },
  typeRow: { flexDirection: "row", gap: 8 },
  typeChip: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  typeText: { fontSize: 13 },
  inp: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15 },
  prodList: { borderRadius: 10, borderWidth: 1, overflow: "hidden" },
  prodOpt: { padding: 12, borderBottomWidth: 1 },
  prodName: { fontSize: 14 },
  prodSku: { fontSize: 12 },
  saveBtn: { borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 16 },
});
