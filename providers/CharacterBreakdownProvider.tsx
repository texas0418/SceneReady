import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';

const STORAGE_KEY = 'character_breakdowns';

export interface CharacterBreakdown {
  id: string;
  characterName: string;
  projectName: string;
  objective: string;
  obstacles: string;
  tactics: string;
  backstory: string;
  relationships: string;
  sensoryWork: string;
  innerLife: string;
  physicality: string;
  voiceNotes: string;
  createdAt: string;
  updatedAt: string;
}

export const [CharacterBreakdownProvider, useCharacterBreakdowns] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [breakdowns, setBreakdowns] = useState<CharacterBreakdown[]>([]);

  const query = useQuery({
    queryKey: ['character_breakdowns'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      console.log('Loaded character breakdowns:', stored ? JSON.parse(stored).length : 0);
      return stored ? (JSON.parse(stored) as CharacterBreakdown[]) : [];
    },
  });

  useEffect(() => {
    if (query.data) {
      setBreakdowns(query.data);
    }
  }, [query.data]);

  const saveMutation = useMutation({
    mutationFn: async (updated: CharacterBreakdown[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['character_breakdowns'], data);
    },
  });

  const addBreakdown = useCallback((breakdown: Omit<CharacterBreakdown, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newBreakdown: CharacterBreakdown = {
      ...breakdown,
      id: `char_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newBreakdown, ...breakdowns];
    setBreakdowns(updated);
    saveMutation.mutate(updated);
    console.log('Added character breakdown:', newBreakdown.characterName);
    return newBreakdown.id;
  }, [breakdowns, saveMutation]);

  const updateBreakdown = useCallback((id: string, updates: Partial<CharacterBreakdown>) => {
    const updated = breakdowns.map((b) =>
      b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
    );
    setBreakdowns(updated);
    saveMutation.mutate(updated);
    console.log('Updated character breakdown:', id);
  }, [breakdowns, saveMutation]);

  const deleteBreakdown = useCallback((id: string) => {
    const updated = breakdowns.filter((b) => b.id !== id);
    setBreakdowns(updated);
    saveMutation.mutate(updated);
    console.log('Deleted character breakdown:', id);
  }, [breakdowns, saveMutation]);

  const getBreakdown = useCallback((id: string) => {
    return breakdowns.find((b) => b.id === id);
  }, [breakdowns]);

  return useMemo(() => ({
    breakdowns,
    addBreakdown,
    updateBreakdown,
    deleteBreakdown,
    getBreakdown,
    isLoading: query.isLoading,
  }), [breakdowns, addBreakdown, updateBreakdown, deleteBreakdown, getBreakdown, query.isLoading]);
});
