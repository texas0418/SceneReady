import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

const STORAGE_KEY = 'app_settings';

export interface AppSettings {
  speechRate: number;
  voiceId: string | null;
  hapticsEnabled: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  speechRate: 0.9,
  voiceId: null,
  hapticsEnabled: true,
};

export const [SettingsProvider, useSettings] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const query = useQuery({
    queryKey: ['app_settings'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      return stored
        ? { ...DEFAULT_SETTINGS, ...(JSON.parse(stored) as Partial<AppSettings>) }
        : DEFAULT_SETTINGS;
    },
  });

  useEffect(() => {
    if (query.data) {
      setSettings(query.data);
    }
  }, [query.data]);

  const saveMutation = useMutation({
    mutationFn: async (updated: AppSettings) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['app_settings'], data);
    },
  });

  const update = useCallback((patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveMutation.mutate(next);
  }, [settings, saveMutation]);

  return useMemo(() => ({
    settings,
    update,
    isLoading: query.isLoading,
  }), [settings, update, query.isLoading]);
});
