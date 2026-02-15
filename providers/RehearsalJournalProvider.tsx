import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';

const STORAGE_KEY = 'rehearsal_journal';

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  type: 'rehearsal' | 'class' | 'audition' | 'performance' | 'self-practice';
  whatWorked: string;
  toExplore: string;
  emotionalTriggers: string;
  notes: string;
  mood: number;
  createdAt: string;
}

export const [RehearsalJournalProvider, useRehearsalJournal] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  const query = useQuery({
    queryKey: ['rehearsal_journal'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      console.log('Loaded journal entries:', stored ? JSON.parse(stored).length : 0);
      return stored ? (JSON.parse(stored) as JournalEntry[]) : [];
    },
  });

  useEffect(() => {
    if (query.data) {
      setEntries(query.data);
    }
  }, [query.data]);

  const saveMutation = useMutation({
    mutationFn: async (updated: JournalEntry[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['rehearsal_journal'], data);
    },
  });

  const addEntry = useCallback((entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: `journal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    saveMutation.mutate(updated);
    console.log('Added journal entry:', newEntry.title);
    return newEntry.id;
  }, [entries, saveMutation]);

  const updateEntry = useCallback((id: string, updates: Partial<JournalEntry>) => {
    const updated = entries.map((e) => (e.id === id ? { ...e, ...updates } : e));
    setEntries(updated);
    saveMutation.mutate(updated);
    console.log('Updated journal entry:', id);
  }, [entries, saveMutation]);

  const deleteEntry = useCallback((id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    saveMutation.mutate(updated);
    console.log('Deleted journal entry:', id);
  }, [entries, saveMutation]);

  return useMemo(() => ({
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    isLoading: query.isLoading,
  }), [entries, addEntry, updateEntry, deleteEntry, query.isLoading]);
});
