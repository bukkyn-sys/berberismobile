import "../global.css";
import { useEffect } from "react";
import { Linking } from "react-native";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "react-native-url-polyfill/auto";
import { AuthProvider } from "@/stores/auth-store";

const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    // Handle deep-link return after Stripe Checkout completes.
    // The web billing page redirects to: berberis://payment-success
    const sub = Linking.addEventListener("url", ({ url }) => {
      if (url.startsWith("berberis://payment-success")) {
        // Refetch subscription so profile + tier gate update immediately
        queryClient.invalidateQueries({ queryKey: ["subscription"] });
        router.replace("/(tabs)/profile");
      }
    });

    // Handle cold-start (app opened from closed state via deep-link)
    Linking.getInitialURL().then((url) => {
      if (url && url.startsWith("berberis://payment-success")) {
        queryClient.invalidateQueries({ queryKey: ["subscription"] });
        // Normal startup proceeds; user lands on tabs with updated tier
      }
    });

    return () => sub.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="pricing" />
          <Stack.Screen name="profile" />
        </Stack>
      </AuthProvider>
    </QueryClientProvider>
  );
}
