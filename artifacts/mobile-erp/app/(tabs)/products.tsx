import { useListCategories, useListProducts } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { ProductCard } from "@/components/ProductCard";
import { SearchBar } from "@/components/SearchBar";
import { EmptyState } from "@/components/EmptyState";

export default function ProductsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [lowStock, setLowStock] = useState(false);

  const { data: products, isLoading, refetch, isRefetching } = useListProducts({
    search: search || undefined,
    categoryId: categoryId ?? undefined,
    lowStock: lowStock || undefined,
    isActive: true,
  });

  const { data: categories } = useListCategories();
  const topPadding = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: topPadding }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: insets.top + 8 }]}>
        <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Products</Text>
        <Text style={[styles.count, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          {products?.length ?? 0} items
        </Text>
      </View>

      <View style={styles.searchRow}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search products..." />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={styles.filterContent}>
        <TouchableOpacity
          style={[styles.chip, { backgroundColor: !lowStock && categoryId === null ? colors.primary : colors.card, borderColor: colors.border }]}
          onPress={() => { setCategoryId(null); setLowStock(false); }}
        >
          <Text style={[styles.chipText, { color: !lowStock && categoryId === null ? "#fff" : colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chip, { backgroundColor: lowStock ? colors.warning : colors.card, borderColor: colors.border }]}
          onPress={() => { setLowStock((v) => !v); setCategoryId(null); }}
        >
          <Text style={[styles.chipText, { color: lowStock ? "#fff" : colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>Low Stock</Text>
        </TouchableOpacity>
        {categories?.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.chip, { backgroundColor: categoryId === c.id ? colors.primary : colors.card, borderColor: colors.border }]}
            onPress={() => { setCategoryId(c.id === categoryId ? null : c.id); setLowStock(false); }}
          >
            <Text style={[styles.chipText, { color: categoryId === c.id ? "#fff" : colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={products ?? []}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <ProductCard
            {...item}
            onPress={() => router.push(`/product/${item.id}` as any)}
          />
        )}
        contentContainerStyle={styles.list}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListEmptyComponent={
          isLoading
            ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
            : <EmptyState icon="box" title="No products found" subtitle="Try adjusting your search or filters" />
        }
        scrollEnabled={!!(products?.length)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  title: { fontSize: 20 },
  count: { fontSize: 13 },
  searchRow: { padding: 12 },
  filters: { maxHeight: 44 },
  filterContent: { paddingHorizontal: 12, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13 },
  list: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 100 },
});
