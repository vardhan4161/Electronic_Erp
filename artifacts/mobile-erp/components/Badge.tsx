import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "default";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = "default" }: BadgeProps) {
  const colors = useColors();

  const colorMap: Record<BadgeVariant, { bg: string; text: string }> = {
    success: { bg: colors.success + "22", text: colors.success },
    warning: { bg: colors.warning + "22", text: colors.warning },
    danger: { bg: colors.destructive + "22", text: colors.destructive },
    info: { bg: colors.info + "22", text: colors.info },
    default: { bg: colors.muted, text: colors.mutedForeground },
  };

  const c = colorMap[variant];

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.text, fontFamily: "Inter_500Medium" }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  text: { fontSize: 11 },
});
