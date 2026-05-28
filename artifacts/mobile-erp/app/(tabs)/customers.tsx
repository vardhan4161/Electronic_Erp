import { Feather } from "@expo/vector-icons";
import { useCreateCustomer, useListCustomers } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { CustomerCard } from "@/components/CustomerCard";
import { EmptyState } from "@/components/EmptyState";
import { SearchBar } from "@/components/SearchBar";

export default function CustomersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const { data: customers, isLoading, refetch, isRefetching } = useListCustomers({ search: search || undefined });
  const createMutation = useCreateCustomer();
  const topPadding = Platform.OS === "web" ? 67 : 0;

  const handleAdd = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Required", "Name and phone are required");
      return;
    }
    try {
      await createMutation.mutateAsync({ data: { name: name.trim(), phone: phone.trim(), email: email.trim() || null } });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowAdd(false);
      setName(""); setPhone(""); setEmail("");
      refetch();
    } catch {
      Alert.alert("Error", "Failed to add customer. Phone may already be registered.");
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: topPadding }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: insets.top + 8 }]}>
        <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Customers</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={() => setShowAdd(true)}>
          <Feather name="user-plus" size={16} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search by name or phone..." />
      </View>

      <FlatList
        data={customers ?? []}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <CustomerCard
            {...item}
            onPress={() => router.push(`/customer/${item.id}` as any)}
          />
        )}
        contentContainerStyle={styles.list}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListEmptyComponent={
          isLoading
            ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
            : <EmptyState icon="users" title="No customers yet" subtitle="Add your first customer to get started" />
        }
        scrollEnabled={!!(customers?.length)}
      />

      <Modal visible={showAdd} animationType="slide" presentationStyle="formSheet" onRequestClose={() => setShowAdd(false)}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>New Customer</Text>
            <TouchableOpacity onPress={() => setShowAdd(false)}><Feather name="x" size={22} color={colors.text} /></TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            {[
              { label: "Name *", value: name, setter: setName, placeholder: "Full name", keyboard: "default" as const },
              { label: "Phone *", value: phone, setter: setPhone, placeholder: "Phone number", keyboard: "phone-pad" as const },
              { label: "Email", value: email, setter: setEmail, placeholder: "Email address", keyboard: "email-address" as const },
            ].map((f) => (
              <View key={f.label} style={styles.field}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>{f.label}</Text>
                <TextInput
                  style={[styles.fieldInput, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border, fontFamily: "Inter_400Regular" }]}
                  placeholder={f.placeholder}
                  placeholderTextColor={colors.mutedForeground}
                  value={f.value}
                  onChangeText={f.setter}
                  keyboardType={f.keyboard}
                  autoCapitalize={f.keyboard === "default" ? "words" : "none"}
                />
              </View>
            ))}
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: createMutation.isPending ? 0.7 : 1 }]}
              onPress={handleAdd}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? <ActivityIndicator color="#fff" /> : (
                <Text style={[styles.saveBtnText, { fontFamily: "Inter_600SemiBold" }]}>Save Customer</Text>
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
  title: { fontSize: 20 },
  addBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  searchRow: { padding: 12 },
  list: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 100 },
  modal: { flex: 1 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1 },
  modalTitle: { fontSize: 20 },
  modalBody: { padding: 20, gap: 16 },
  field: { gap: 6 },
  fieldLabel: { fontSize: 13 },
  fieldInput: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15 },
  saveBtn: { borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  saveBtnText: { color: "#fff", fontSize: 16 },
});
