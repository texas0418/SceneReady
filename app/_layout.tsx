import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.accent,
        headerTitleStyle: { color: Colors.textPrimary },
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="self-tape-toolkit" options={{ title: "Self-Tape Toolkit" }} />
      <Stack.Screen name="ai-scene-partner" options={{ title: "AI Scene Partner" }} />
      <Stack.Screen name="teleprompter" options={{ title: "Teleprompter", headerShown: false }} />
      <Stack.Screen name="monologue-library" options={{ title: "Monologue Library" }} />
      <Stack.Screen name="monologue/[id]" options={{ title: "Monologue" }} />
      <Stack.Screen name="cold-read-timer" options={{ title: "Cold Read Timer" }} />
      <Stack.Screen name="dialect-reference" options={{ title: "Dialect Reference" }} />
      <Stack.Screen name="dialect/[id]" options={{ title: "Dialect Details" }} />
      <Stack.Screen name="daily-warmups" options={{ title: "Daily Warm-Ups" }} />
      <Stack.Screen name="warmup/[id]" options={{ title: "Warm-Up" }} />
      <Stack.Screen name="industry-glossary" options={{ title: "Industry Glossary" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <RootLayoutNav />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
