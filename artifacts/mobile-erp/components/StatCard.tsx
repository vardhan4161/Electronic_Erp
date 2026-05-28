import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: keyof typeof Feather.glyphMap;
  color?: string;
}

export function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  const colors = useColors();
  const accentColor = color ?? colors.primary;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: accentColor + "22" }]}>
        <Feather name={icon} size={18} color={accentColor} />
      </View>
      <Text style={[styles.value, { color: colors.text, fontFamily: "Inter_700Bold" }]}>{value}</Text>
      <Text style={[styles.title, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: accentColor, fontFamily: "Inter_500Medium" }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    minWidth: 150,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  value: {
    fontSize: 20,
    marginBottom: 2,
  },
  title: {
    fontSize: 12,
    lineHeight: 16,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 4,
  },
});
