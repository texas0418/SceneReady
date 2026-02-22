import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContextHook } from '@nkzw/create-context-hook';

const STORAGE_KEY = 'favorite_tools';
const ONBOARDING_KEY = 'has_seen_onboarding';

export const [FavoritesProvider, useFavorites] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true);

  const query = useQuery({
    queryKey: ['favorite_tools'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as string[]) : [];
    },
  });

  const onboardingQuery = useQuery({
    queryKey: ['has_seen_onboarding'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(ONBOARDING_KEY);
      return stored === 'true';
    },
  });

  useEffect(() => {
    if (query.data !== undefined) {
      setFavorites(query.data);
    }
  }, [query.data]);

  useEffect(() => {
    if (onboardingQuery.data !== undefined) {
      setHasSeenOnboarding(onboardingQuery.data);
    }
  }, [onboardingQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (updated: string[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['favorite_tools'], data);
    },
  });

  const toggleFavorite = useCallback((toolId: string) => {
    const updated = favorites.includes(toolId)
      ? favorites.filter((id) => id !== toolId)
      : [...favorites, toolId];
    setFavorites(updated);
    saveMutation.mutate(updated);
  }, [favorites, saveMutation]);

  const isFavorite = useCallback((toolId: string) => {
    return favorites.includes(toolId);
  }, [favorites]);

  const dismissOnboarding = useCallback(async () => {
    setHasSeenOnboarding(true);
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    queryClient.setQueryData(['has_seen_onboarding'], true);
  }, [queryClient]);

  return useMemo(() => ({
    favorites,
    toggleFavorite,
    isFavorite,
    hasSeenOnboarding,
    dismissOnboarding,
  }), [favorites, toggleFavorite, isFavorite, hasSeenOnboarding, dismissOnboarding]);
});
