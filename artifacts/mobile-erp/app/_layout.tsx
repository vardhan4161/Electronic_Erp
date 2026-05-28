import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { setBaseUrl } from "@workspace/api-client-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

if (process.env.EXPO_PUBLIC_DOMAIN) {
  setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);
}

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inTabs = segments[0] === "(tabs)";
    const inLogin = segments[0] === "login";

    if (!user && !inLogin) {
      router.replace("/login");
    } else if (user && inLogin) {
      router.replace("/(tabs)");
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0D1117" }}>
        <ActivityIndicator color="#3B82F6" size="large" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen
        name="product/[id]"
        options={{ title: "Product Details", headerStyle: { backgroundColor: "#161B22" }, headerTintColor: "#E2E8F0", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="customer/[id]"
        options={{ title: "Customer", headerStyle: { backgroundColor: "#161B22" }, headerTintColor: "#E2E8F0", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="sale/[id]"
        options={{ title: "Invoice", headerStyle: { backgroundColor: "#161B22" }, headerTintColor: "#E2E8F0", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="inventory"
        options={{ title: "Inventory", headerStyle: { backgroundColor: "#161B22" }, headerTintColor: "#E2E8F0", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="reports"
        options={{ title: "Reports", headerStyle: { backgroundColor: "#161B22" }, headerTintColor: "#E2E8F0", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="settings"
        options={{ title: "Settings", headerStyle: { backgroundColor: "#161B22" }, headerTintColor: "#E2E8F0", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="sales-history"
        options={{ title: "Sales History", headerStyle: { backgroundColor: "#161B22" }, headerTintColor: "#E2E8F0", headerBackTitle: "Back" }}
      />
      <Stack.Screen
        name="users"
        options={{ title: "Users", headerStyle: { backgroundColor: "#161B22" }, headerTintColor: "#E2E8F0", headerBackTitle: "Back" }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AuthProvider>
                <CartProvider>
                  <RootLayoutNav />
                </CartProvider>
              </AuthProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
