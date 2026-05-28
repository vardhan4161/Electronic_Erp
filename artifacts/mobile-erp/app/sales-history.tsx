import { useListSales } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { EmptyState } from "@/components/EmptyState";
import { SearchBar } from "@/components/SearchBar";
import { SaleCard } from "@/components/SaleCard";

export default function SalesHistoryScreen() {
  const colors = useColors();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data: sales, isLoading, refetch, isRefetching } = useListSales({ search: search || undefined });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.searchRow}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search by invoice or customer..." />
      </View>
      <FlatList
        data={sales ?? []}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <SaleCard {...item} onPress={() => router.push(`/sale/${item.id}` as any)} />
        )}
        contentContainerStyle={styles.list}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListEmptyComponent={
          isLoading
            ? <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
            : <EmptyState icon="shopping-bag" title="No sales found" />
        }
        scrollEnabled={!!(sales?.length)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  searchRow: { padding: 12 },
  list: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 100 },
});
