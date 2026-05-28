import { Feather } from "@expo/vector-icons";
import { useCreateSale, useListCategories, useListProducts } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "@/contexts/CartContext";
import { useColors } from "@/hooks/useColors";
import { ProductCard } from "@/components/ProductCard";
import { SearchBar } from "@/components/SearchBar";
import { EmptyState } from "@/components/EmptyState";

const PAYMENT_METHODS = ["CASH", "CARD", "UPI", "CREDIT"] as const;
type PaymentMethod = (typeof PAYMENT_METHODS)[number];

function fmt(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function POSScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { items, addItem, removeItem, updateQuantity, clearCart, subtotal, totalGst, totalDiscount, grandTotal, itemCount } = useCart();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [amountPaid, setAmountPaid] = useState("");

  const { data: products, isLoading: loadingProducts } = useListProducts({ search: search || undefined, categoryId: categoryId ?? undefined, isActive: true });
  const { data: categories } = useListCategories();
  const createSaleMutation = useCreateSale();

  const change = Math.max(0, (parseFloat(amountPaid) || 0) - grandTotal);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (paymentMethod !== "CREDIT" && (parseFloat(amountPaid) || 0) < grandTotal) {
      Alert.alert("Insufficient Payment", "Amount paid is less than grand total");
      return;
    }

    try {
      await createSaleMutation.mutateAsync({
        data: {
          customerName: customerName || null,
          customerPhone: customerPhone || null,
          customerGstin: null,
          isInterState: false,
          discountAmount: totalDiscount,
          paymentMethod,
          amountPaid: paymentMethod === "CREDIT" ? grandTotal : (parseFloat(amountPaid) || grandTotal),
          notes: null,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            discount: i.discount,
          })),
        },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      clearCart();
      setShowCheckout(false);
      setCustomerName("");
      setCustomerPhone("");
      setAmountPaid("");
      setPaymentMethod("CASH");
      Alert.alert("Sale Complete", "Invoice generated successfully");
    } catch {
      Alert.alert("Error", "Failed to process sale. Please try again.");
    }
  };

  const topPadding = Platform.OS === "web" ? 67 : 0;
  const bottomPadding = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: topPadding }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: insets.top + 8 }]}>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>POS Terminal</Text>
        {itemCount > 0 && (
          <TouchableOpacity onPress={() => { clearCart(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
            <Text style={[styles.clearText, { color: colors.destructive, fontFamily: "Inter_500Medium" }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchRow}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search products or scan barcode..." />
      </View>

      {categories && categories.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll} contentContainerStyle={styles.catContent}>
          <TouchableOpacity
            style={[styles.catChip, { backgroundColor: categoryId === null ? colors.primary : colors.card, borderColor: colors.border }]}
            onPress={() => setCategoryId(null)}
          >
            <Text style={[styles.catText, { color: categoryId === null ? "#fff" : colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>All</Text>
          </TouchableOpacity>
          {categories.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.catChip, { backgroundColor: categoryId === c.id ? colors.primary : colors.card, borderColor: colors.border }]}
              onPress={() => setCategoryId(c.id === categoryId ? null : c.id)}
            >
              <Text style={[styles.catText, { color: categoryId === c.id ? "#fff" : colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <FlatList
        data={products ?? []}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <ProductCard
            {...item}
            showAddButton
            onAddToCart={() => {
              addItem({ productId: item.id, name: item.name, sku: item.sku, unitPrice: item.sellingPrice, gstRate: item.gstRate, maxStock: item.currentStock });
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: itemCount > 0 ? 180 : 100 }]}
        ListEmptyComponent={loadingProducts ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} /> : <EmptyState icon="box" title="No products found" />}
        scrollEnabled={!!products?.length}
      />

      {itemCount > 0 && (
        <View style={[styles.cartBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + 8 + bottomPadding }]}>
          <View style={styles.cartItems}>
            {items.map((item) => (
              <View key={item.productId} style={styles.cartRow}>
                <Text style={[styles.cartName, { color: colors.text, fontFamily: "Inter_500Medium" }]} numberOfLines={1}>{item.name}</Text>
                <View style={styles.cartQty}>
                  <TouchableOpacity onPress={() => item.quantity === 1 ? removeItem(item.productId) : updateQuantity(item.productId, item.quantity - 1)} style={[styles.qtyBtn, { backgroundColor: colors.muted }]}>
                    <Feather name={item.quantity === 1 ? "trash-2" : "minus"} size={12} color={item.quantity === 1 ? colors.destructive : colors.text} />
                  </TouchableOpacity>
                  <Text style={[styles.qtyNum, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => updateQuantity(item.productId, item.quantity + 1)} style={[styles.qtyBtn, { backgroundColor: colors.muted }]} disabled={item.quantity >= item.maxStock}>
                    <Feather name="plus" size={12} color={colors.text} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.cartPrice, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>{fmt(item.unitPrice * item.quantity - item.discount)}</Text>
              </View>
            ))}
          </View>
          <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
            <View>
              <Text style={[styles.totalLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Grand Total ({itemCount} items)</Text>
              <Text style={[styles.totalAmt, { color: colors.text, fontFamily: "Inter_700Bold" }]}>{fmt(grandTotal)}</Text>
            </View>
            <TouchableOpacity style={[styles.checkoutBtn, { backgroundColor: colors.primary }]} onPress={() => setShowCheckout(true)} activeOpacity={0.85}>
              <Feather name="credit-card" size={16} color="#fff" />
              <Text style={[styles.checkoutText, { fontFamily: "Inter_600SemiBold" }]}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Modal visible={showCheckout} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowCheckout(false)}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Checkout</Text>
            <TouchableOpacity onPress={() => setShowCheckout(false)}><Feather name="x" size={24} color={colors.text} /></TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent} contentContainerStyle={{ gap: 16 }}>
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Customer (Optional)</Text>
              <TextInput style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background, fontFamily: "Inter_400Regular" }]} placeholder="Customer Name" placeholderTextColor={colors.mutedForeground} value={customerName} onChangeText={setCustomerName} />
              <TextInput style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background, fontFamily: "Inter_400Regular" }]} placeholder="Phone Number" placeholderTextColor={colors.mutedForeground} value={customerPhone} onChangeText={setCustomerPhone} keyboardType="phone-pad" />
            </View>

            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Payment Method</Text>
              <View style={styles.payMethods}>
                {PAYMENT_METHODS.map((pm) => (
                  <TouchableOpacity key={pm} style={[styles.payChip, { backgroundColor: paymentMethod === pm ? colors.primary : colors.background, borderColor: paymentMethod === pm ? colors.primary : colors.border }]} onPress={() => setPaymentMethod(pm)}>
                    <Text style={[styles.payText, { color: paymentMethod === pm ? "#fff" : colors.text, fontFamily: "Inter_500Medium" }]}>{pm}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Order Summary</Text>
              <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Subtotal</Text><Text style={[styles.summaryVal, { color: colors.text, fontFamily: "Inter_500Medium" }]}>{fmt(subtotal)}</Text></View>
              <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Discount</Text><Text style={[styles.summaryVal, { color: colors.warning, fontFamily: "Inter_500Medium" }]}>-{fmt(totalDiscount)}</Text></View>
              <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>GST</Text><Text style={[styles.summaryVal, { color: colors.text, fontFamily: "Inter_500Medium" }]}>{fmt(totalGst)}</Text></View>
              <View style={[styles.summaryRow, { marginTop: 8 }]}><Text style={[styles.summaryLabel, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Grand Total</Text><Text style={[styles.grandTotal, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>{fmt(grandTotal)}</Text></View>
            </View>

            {paymentMethod === "CASH" && (
              <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>Amount Received</Text>
                <TextInput style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background, fontFamily: "Inter_400Regular" }]} placeholder="Enter amount" placeholderTextColor={colors.mutedForeground} value={amountPaid} onChangeText={setAmountPaid} keyboardType="numeric" />
                {parseFloat(amountPaid) >= grandTotal && (
                  <Text style={[styles.changeText, { color: colors.success, fontFamily: "Inter_600SemiBold" }]}>Change: {fmt(change)}</Text>
                )}
              </View>
            )}
          </ScrollView>

          <View style={[styles.modalFooter, { borderTopColor: colors.border, paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: colors.primary, opacity: createSaleMutation.isPending ? 0.7 : 1 }]}
              onPress={handleCheckout}
              disabled={createSaleMutation.isPending}
              activeOpacity={0.85}
            >
              {createSaleMutation.isPending ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Feather name="check-circle" size={18} color="#fff" />
                  <Text style={[styles.confirmText, { fontFamily: "Inter_600SemiBold" }]}>Complete Sale</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  headerTitle: { fontSize: 20 },
  clearText: { fontSize: 14 },
  searchRow: { padding: 12 },
  catScroll: { maxHeight: 44 },
  catContent: { paddingHorizontal: 12, gap: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  catText: { fontSize: 13 },
  list: { paddingHorizontal: 12, paddingTop: 8 },
  cartBar: { position: "absolute", bottom: 0, left: 0, right: 0, borderTopWidth: 1, paddingTop: 8, paddingHorizontal: 12 },
  cartItems: { maxHeight: 120 },
  cartRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4, gap: 8 },
  cartName: { flex: 1, fontSize: 13 },
  cartQty: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: { width: 26, height: 26, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  qtyNum: { fontSize: 14, minWidth: 20, textAlign: "center" },
  cartPrice: { fontSize: 13, minWidth: 64, textAlign: "right" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTopWidth: 1, marginTop: 8 },
  totalLabel: { fontSize: 12 },
  totalAmt: { fontSize: 20 },
  checkoutBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  checkoutText: { color: "#fff", fontSize: 15 },
  modal: { flex: 1 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1 },
  modalTitle: { fontSize: 20 },
  modalContent: { flex: 1, padding: 16 },
  section: { borderRadius: 12, padding: 14, borderWidth: 1, gap: 10 },
  sectionTitle: { fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  modalInput: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15 },
  payMethods: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  payChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  payText: { fontSize: 14 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 14 },
  summaryVal: { fontSize: 14 },
  grandTotal: { fontSize: 20 },
  changeText: { fontSize: 15 },
  modalFooter: { padding: 16, borderTopWidth: 1 },
  confirmBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderRadius: 12 },
  confirmText: { color: "#fff", fontSize: 16 },
});
