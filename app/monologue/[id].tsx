import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Copy, BookOpen, Clock, User } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import Colors from '@/constants/colors';
import { monologues } from '@/mocks/monologues';
import { useUserMonologues } from '@/providers/UserMonologuesProvider';

const typeColors: Record<string, string> = {
  dramatic: '#E57373',
  comedic: '#81C784',
  classical: '#FFB74D',
  contemporary: '#64B5F6',
};

export default function MonologueDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const { getMonologue: getUserMonologue } = useUserMonologues();

  const monologue = monologues.find((m) => m.id === id) ?? getUserMonologue(id as string) ?? null;

  if (!monologue) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Monologue not found</Text>
        </View>
      </View>
    );
  }

  const handleCopy = async () => {
    await Clipboard.setStringAsync(monologue.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: monologue.title }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={[styles.typeBadge, { backgroundColor: `${typeColors[monologue.type]}20` }]}>
            <Text style={[styles.typeBadgeText, { color: typeColors[monologue.type] }]}>
              {monologue.type}
            </Text>
          </View>
          <Text style={styles.title}>{monologue.title}</Text>
          <Text style={styles.source}>{monologue.source}</Text>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <User size={14} color={Colors.textMuted} />
            <Text style={styles.metaLabel}>Author</Text>
            <Text style={styles.metaValue}>{monologue.author}</Text>
          </View>
          <View style={styles.metaItem}>
            <Clock size={14} color={Colors.textMuted} />
            <Text style={styles.metaLabel}>Duration</Text>
            <Text style={styles.metaValue}>{monologue.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <BookOpen size={14} color={Colors.textMuted} />
            <Text style={styles.metaLabel}>For</Text>
            <Text style={styles.metaValue}>{monologue.gender}, {monologue.ageRange}</Text>
          </View>
        </View>

        <View style={styles.toneRow}>
          <Text style={styles.toneLabel}>Tone:</Text>
          <Text style={styles.toneValue}>{monologue.tone}</Text>
        </View>

        <View style={styles.textCard}>
          <Text style={styles.monologueText}>{monologue.text}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.8}>
            <Copy size={18} color={copied ? Colors.success : Colors.accent} />
            <Text style={[styles.copyBtnText, copied && { color: Colors.success }]}>
              {copied ? 'Copied!' : 'Copy Text'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.teleprompterBtn}
            onPress={() => router.push('/teleprompter' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.teleprompterBtnText}>Open in Teleprompter</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    marginBottom: 20,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  source: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metaItem: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  toneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  toneLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  toneValue: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '500' as const,
  },
  textCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
    marginBottom: 24,
  },
  monologueText: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  actions: {
    gap: 10,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  copyBtnText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  teleprompterBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  teleprompterBtnText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#0F0F0F',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textMuted,
  },
});
