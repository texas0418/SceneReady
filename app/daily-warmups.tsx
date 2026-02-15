import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Mic, Wind, Heart, Eye, Clock, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { warmups, WarmUp } from '@/mocks/warmups';

const categoryConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  voice: { icon: <Mic size={20} color="#FF8A65" />, color: 'rgba(255,138,101,0.12)' },
  body: { icon: <Wind size={20} color="#81C784" />, color: 'rgba(129,199,132,0.12)' },
  emotional: { icon: <Heart size={20} color="#E57373" />, color: 'rgba(229,115,115,0.12)' },
  focus: { icon: <Eye size={20} color="#64B5F6" />, color: 'rgba(100,181,246,0.12)' },
};

export default function DailyWarmups() {
  const router = useRouter();

  const renderItem = ({ item }: { item: WarmUp }) => {
    const config = categoryConfig[item.category] || categoryConfig.voice;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/warmup/${item.id}` as any)}
        activeOpacity={0.8}
      >
        <View style={[styles.cardIcon, { backgroundColor: config.color }]}>
          {config.icon}
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc}>{item.description}</Text>
          <View style={styles.cardMeta}>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>{item.category}</Text>
            </View>
            <View style={styles.durationRow}>
              <Clock size={12} color={Colors.textMuted} />
              <Text style={styles.durationText}>{item.duration}</Text>
            </View>
            <Text style={styles.stepsText}>{item.steps.length} steps</Text>
          </View>
        </View>
        <ChevronRight size={18} color={Colors.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Daily Warm-Ups' }} />
      <FlatList
        data={warmups}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerCard}>
            <Text style={styles.headerTitle}>Warm Up Your Instrument</Text>
            <Text style={styles.headerSubtitle}>
              Professional actors warm up before every session. Pick a routine or combine several for a complete prep.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
  },
  headerCard: {
    backgroundColor: 'rgba(255,138,101,0.08)',
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,138,101,0.15)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryChip: {
    backgroundColor: Colors.backgroundLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  stepsText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
