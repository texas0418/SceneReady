import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Colors from "@/constants/colors";
import { UserMonologuesProvider } from "@/providers/UserMonologuesProvider";
import { RehearsalJournalProvider } from "@/providers/RehearsalJournalProvider";
import { CharacterBreakdownProvider } from "@/providers/CharacterBreakdownProvider";
import { SidesAnnotationProvider } from "@/providers/SidesAnnotationProvider";
import { AuditionTrackerProvider } from "@/providers/AuditionTrackerProvider";
import { FavoritesProvider } from "@/providers/FavoritesProvider";

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
      <Stack.Screen name="daily-warmups" options={{ title: "Daily Warm-Ups" }} />
      <Stack.Screen name="warmup/[id]" options={{ title: "Warm-Up" }} />
      <Stack.Screen name="industry-glossary" options={{ title: "Industry Glossary" }} />
      <Stack.Screen name="add-monologue" options={{ title: "Add Monologue", presentation: "modal" }} />
      <Stack.Screen name="rehearsal-journal" options={{ title: "Rehearsal Journal" }} />
      <Stack.Screen name="character-breakdown" options={{ title: "Character Breakdown" }} />
      <Stack.Screen name="sides-annotation" options={{ title: "Sides Annotation" }} />
      <Stack.Screen name="audition-tracker" options={{ title: "Audition Tracker" }} />
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
        <FavoritesProvider>
          <AuditionTrackerProvider>
            <UserMonologuesProvider>
              <RehearsalJournalProvider>
                <CharacterBreakdownProvider>
                  <SidesAnnotationProvider>
                    <RootLayoutNav />
                  </SidesAnnotationProvider>
                </CharacterBreakdownProvider>
              </RehearsalJournalProvider>
            </UserMonologuesProvider>
          </AuditionTrackerProvider>
        </FavoritesProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
