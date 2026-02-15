import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';

const STORAGE_KEY = 'sides_annotations';

export interface Annotation {
  id: string;
  startIndex: number;
  endIndex: number;
  type: 'beat' | 'action' | 'note' | 'emotion' | 'emphasis';
  text: string;
  color: string;
}

export interface AnnotatedSide {
  id: string;
  title: string;
  scriptText: string;
  annotations: Annotation[];
  createdAt: string;
  updatedAt: string;
}

export const [SidesAnnotationProvider, useSidesAnnotation] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [sides, setSides] = useState<AnnotatedSide[]>([]);

  const query = useQuery({
    queryKey: ['sides_annotations'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      console.log('Loaded annotated sides:', stored ? JSON.parse(stored).length : 0);
      return stored ? (JSON.parse(stored) as AnnotatedSide[]) : [];
    },
  });

  useEffect(() => {
    if (query.data) {
      setSides(query.data);
    }
  }, [query.data]);

  const saveMutation = useMutation({
    mutationFn: async (updated: AnnotatedSide[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['sides_annotations'], data);
    },
  });

  const addSide = useCallback((side: Omit<AnnotatedSide, 'id' | 'createdAt' | 'updatedAt' | 'annotations'>) => {
    const now = new Date().toISOString();
    const newSide: AnnotatedSide = {
      ...side,
      id: `side_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      annotations: [],
      createdAt: now,
      updatedAt: now,
    };
    const updated = [newSide, ...sides];
    setSides(updated);
    saveMutation.mutate(updated);
    console.log('Added annotated side:', newSide.title);
    return newSide.id;
  }, [sides, saveMutation]);

  const addAnnotation = useCallback((sideId: string, annotation: Omit<Annotation, 'id'>) => {
    const newAnnotation: Annotation = {
      ...annotation,
      id: `ann_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    };
    const updated = sides.map((s) =>
      s.id === sideId
        ? { ...s, annotations: [...s.annotations, newAnnotation], updatedAt: new Date().toISOString() }
        : s
    );
    setSides(updated);
    saveMutation.mutate(updated);
    console.log('Added annotation to side:', sideId);
  }, [sides, saveMutation]);

  const removeAnnotation = useCallback((sideId: string, annotationId: string) => {
    const updated = sides.map((s) =>
      s.id === sideId
        ? { ...s, annotations: s.annotations.filter((a) => a.id !== annotationId), updatedAt: new Date().toISOString() }
        : s
    );
    setSides(updated);
    saveMutation.mutate(updated);
  }, [sides, saveMutation]);

  const deleteSide = useCallback((id: string) => {
    const updated = sides.filter((s) => s.id !== id);
    setSides(updated);
    saveMutation.mutate(updated);
    console.log('Deleted annotated side:', id);
  }, [sides, saveMutation]);

  const getSide = useCallback((id: string) => {
    return sides.find((s) => s.id === id);
  }, [sides]);

  return useMemo(() => ({
    sides,
    addSide,
    addAnnotation,
    removeAnnotation,
    deleteSide,
    getSide,
    isLoading: query.isLoading,
  }), [sides, addSide, addAnnotation, removeAnnotation, deleteSide, getSide, query.isLoading]);
});
