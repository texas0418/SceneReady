import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { MapPin, Star, Lightbulb } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { dialects } from '@/mocks/dialects';

const difficultyColors: Record<string, string> = {
  Beginner: '#81C784',
  Intermediate: '#FFB74D',
  Advanced: '#E57373',
};

export default function DialectDetail() {
  const { id } = useLocalSearchParams();
  const dialect = dialects.find((d) => d.id === id);

  if (!dialect) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Dialect not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: dialect.name }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>{dialect.name}</Text>
            <View style={[styles.badge, { backgroundColor: `${difficultyColors[dialect.difficulty]}20` }]}>
              <Text style={[styles.badgeText, { color: difficultyColors[dialect.difficulty] }]}>
                {dialect.difficulty}
              </Text>
            </View>
          </View>
          <View style={styles.regionRow}>
            <MapPin size={14} color={Colors.textMuted} />
            <Text style={styles.regionText}>{dialect.region}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Key Features</Text>
        <View style={styles.featureList}>
          {dialect.keyFeatures.map((feature, idx) => (
            <View key={idx} style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>IPA Examples</Text>
        <View style={styles.ipaList}>
          {dialect.ipaExamples.map((example, idx) => (
            <View key={idx} style={styles.ipaCard}>
              <View style={styles.ipaHeader}>
                <Text style={styles.ipaWord}>{example.word}</Text>
                <Text style={styles.ipaPhonetic}>{example.ipa}</Text>
              </View>
              <Text style={styles.ipaNote}>{example.note}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Tips</Text>
        <View style={styles.tipsList}>
          {dialect.tips.map((tip, idx) => (
            <View key={idx} style={styles.tipItem}>
              <Lightbulb size={14} color="#FFB74D" />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Famous Examples</Text>
        <View style={styles.examplesList}>
          {dialect.famousExamples.map((name, idx) => (
            <View key={idx} style={styles.exampleChip}>
              <Star size={12} color={Colors.accent} />
              <Text style={styles.exampleName}>{name}</Text>
            </View>
          ))}
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
    marginBottom: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  regionText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
    marginTop: 4,
  },
  featureList: {
    gap: 8,
    marginBottom: 28,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    marginTop: 7,
  },
  featureText: {
    fontSize: 15,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 21,
  },
  ipaList: {
    gap: 8,
    marginBottom: 28,
  },
  ipaCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
  },
  ipaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ipaWord: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  ipaPhonetic: {
    fontSize: 16,
    color: Colors.accent,
    fontWeight: '500' as const,
  },
  ipaNote: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  tipsList: {
    gap: 10,
    marginBottom: 28,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
  },
  tipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  examplesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  exampleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.spotlightStrong,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  exampleName: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
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
