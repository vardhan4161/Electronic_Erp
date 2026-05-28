import { Feather } from "@expo/vector-icons";
import { useLogin } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = useLogin({
    mutation: {
      onSuccess: async (data) => {
        await login(data.token, data.user as any);
        router.replace("/(tabs)");
      },
      onError: () => {
        setError("Invalid username or password");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      },
    },
  });

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password");
      return;
    }
    setError("");
    loginMutation.mutate({ data: { username: username.trim(), password } });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.inner, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.header}>
          <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
            <Feather name="zap" size={28} color="#fff" />
          </View>
          <Text style={[styles.appName, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Volt ERP</Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Electronics Retail Management
          </Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.destructive + "22", borderColor: colors.destructive + "44" }]}>
              <Feather name="alert-circle" size={14} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive, fontFamily: "Inter_400Regular" }]}>{error}</Text>
            </View>
          ) : null}

          <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="user" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.text, fontFamily: "Inter_400Regular" }]}
              placeholder="Username"
              placeholderTextColor={colors.mutedForeground}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="lock" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.text, fontFamily: "Inter_400Regular" }]}
              placeholder="Password"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={() => setShowPw((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name={showPw ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: colors.primary, opacity: loginMutation.isPending ? 0.7 : 1 }]}
            onPress={handleLogin}
            disabled={loginMutation.isPending}
            activeOpacity={0.85}
          >
            {loginMutation.isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={[styles.loginText, { fontFamily: "Inter_600SemiBold" }]}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.demoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.demoTitle, { color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }]}>
            Demo Credentials
          </Text>
          {[
            { role: "Admin", user: "admin", pw: "admin123" },
            { role: "Manager", user: "manager1", pw: "admin123" },
            { role: "Cashier", user: "cashier1", pw: "admin123" },
          ].map((c) => (
            <TouchableOpacity
              key={c.role}
              style={styles.demoRow}
              onPress={() => { setUsername(c.user); setPassword(c.pw); setError(""); }}
              activeOpacity={0.7}
            >
              <Text style={[styles.demoRole, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>{c.role}</Text>
              <Text style={[styles.demoUser, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {c.user} / {c.pw}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24 },
  header: { alignItems: "center", marginBottom: 36 },
  logoBox: { width: 64, height: 64, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  appName: { fontSize: 28, marginBottom: 6 },
  tagline: { fontSize: 14 },
  form: { gap: 12, marginBottom: 24 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  errorText: { fontSize: 14, flex: 1 },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14 },
  input: { flex: 1, fontSize: 15 },
  loginBtn: { borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: 4 },
  loginText: { color: "#fff", fontSize: 16 },
  demoBox: { borderRadius: 12, padding: 14, borderWidth: 1, gap: 8 },
  demoTitle: { fontSize: 12, marginBottom: 4 },
  demoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
  demoRole: { fontSize: 13 },
  demoUser: { fontSize: 13 },
});
