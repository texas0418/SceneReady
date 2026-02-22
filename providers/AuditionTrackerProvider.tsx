import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContextHook } from '@nkzw/create-context-hook';

const STORAGE_KEY = 'audition_tracker';

export interface Audition {
  id: string;
  projectName: string;
  role: string;
  castingDirector: string;
  date: string;
  time: string;
  location: string;
  type: 'film' | 'tv' | 'theater' | 'commercial' | 'voiceover' | 'other';
  status: 'upcoming' | 'completed' | 'callback' | 'booked' | 'passed';
  notes: string;
  sides: string;
  createdAt: string;
}

export const [AuditionTrackerProvider, useAuditionTracker] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [auditions, setAuditions] = useState<Audition[]>([]);

  const query = useQuery({
    queryKey: ['audition_tracker'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as Audition[]) : [];
    },
  });

  useEffect(() => {
    if (query.data) {
      setAuditions(query.data);
    }
  }, [query.data]);

  const saveMutation = useMutation({
    mutationFn: async (updated: Audition[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['audition_tracker'], data);
    },
  });

  const addAudition = useCallback((data: Omit<Audition, 'id' | 'createdAt'>) => {
    const newAudition: Audition = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newAudition, ...auditions];
    setAuditions(updated);
    saveMutation.mutate(updated);
    return newAudition.id;
  }, [auditions, saveMutation]);

  const updateAudition = useCallback((id: string, updates: Partial<Audition>) => {
    const updated = auditions.map((a) => (a.id === id ? { ...a, ...updates } : a));
    setAuditions(updated);
    saveMutation.mutate(updated);
  }, [auditions, saveMutation]);

  const deleteAudition = useCallback((id: string) => {
    const updated = auditions.filter((a) => a.id !== id);
    setAuditions(updated);
    saveMutation.mutate(updated);
  }, [auditions, saveMutation]);

  const getAudition = useCallback((id: string) => {
    return auditions.find((a) => a.id === id);
  }, [auditions]);

  return useMemo(() => ({
    auditions,
    addAudition,
    updateAudition,
    deleteAudition,
    getAudition,
    isLoading: query.isLoading,
  }), [auditions, addAudition, updateAudition, deleteAudition, getAudition, query.isLoading]);
});
