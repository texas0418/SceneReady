import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { Monologue } from '@/mocks/monologues';

const STORAGE_KEY = 'user_monologues';

export interface UserMonologue extends Monologue {
  isUserAdded: boolean;
  createdAt: string;
}

export const [UserMonologuesProvider, useUserMonologues] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [monologues, setMonologues] = useState<UserMonologue[]>([]);

  const query = useQuery({
    queryKey: ['user_monologues'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as UserMonologue[]) : [];
    },
  });

  useEffect(() => {
    if (query.data) {
      setMonologues(query.data);
    }
  }, [query.data]);

  const saveMutation = useMutation({
    mutationFn: async (updated: UserMonologue[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user_monologues'], data);
    },
  });

  const addMonologue = useCallback((monologue: Omit<UserMonologue, 'id' | 'isUserAdded' | 'createdAt'>) => {
    const newMonologue: UserMonologue = {
      ...monologue,
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      isUserAdded: true,
      createdAt: new Date().toISOString(),
    };
    const updated = [newMonologue, ...monologues];
    setMonologues(updated);
    saveMutation.mutate(updated);
    return newMonologue.id;
  }, [monologues, saveMutation]);

  const deleteMonologue = useCallback((id: string) => {
    const updated = monologues.filter((m) => m.id !== id);
    setMonologues(updated);
    saveMutation.mutate(updated);
  }, [monologues, saveMutation]);

  const getMonologue = useCallback((id: string) => {
    return monologues.find((m) => m.id === id);
  }, [monologues]);

  return useMemo(() => ({
    userMonologues: monologues,
    addMonologue,
    deleteMonologue,
    getMonologue,
    isLoading: query.isLoading,
  }), [monologues, addMonologue, deleteMonologue, getMonologue, query.isLoading]);
});
