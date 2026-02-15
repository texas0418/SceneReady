import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { MapPin, ChevronRight, Star } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { dialects, Dialect } from '@/mocks/dialects';

const difficultyColors: Record<string, string> = {
  Beginner: '#81C784',
  Intermediate: '#FFB74D',
  Advanced: '#E57373',
};

export default function DialectReference() {
  const router = useRouter();

  const renderItem = ({ item }: { item: Dialect }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/dialect/${item.id}` as any)}
      activeOpacity={0.8}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: `${difficultyColors[item.difficulty]}20` },
            ]}
          >
            <Text
              style={[styles.difficultyText, { color: difficultyColors[item.difficulty] }]}
            >
              {item.difficulty}
            </Text>
          </View>
        </View>
        <View style={styles.regionRow}>
          <MapPin size={14} color={Colors.textMuted} />
          <Text style={styles.regionText}>{item.region}</Text>
        </View>
      </View>

      <View style={styles.features}>
        {item.keyFeatures.slice(0, 2).map((feature, idx) => (
          <Text key={idx} style={styles.featureText}>
            • {feature}
          </Text>
        ))}
      </View>

      <View style={styles.cardBottom}>
        <View style={styles.examplesRow}>
          <Star size={12} color={Colors.textMuted} />
          <Text style={styles.examplesText}>
            {item.famousExamples.join(', ')}
          </Text>
        </View>
        <ChevronRight size={18} color={Colors.textMuted} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Dialect Reference' }} />
      <FlatList
        data={dialects}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.headerText}>
            {dialects.length} dialects with IPA breakdowns and tips
          </Text>
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
  headerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  cardTop: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 11,
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
    fontSize: 13,
    color: Colors.textMuted,
  },
  features: {
    gap: 4,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  examplesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  examplesText: {
    fontSize: 12,
    color: Colors.textMuted,
    flex: 1,
  },
});
