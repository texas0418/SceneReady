import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, Globe, FileText, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { monologues } from '@/mocks/monologues';
import { dialects } from '@/mocks/dialects';
import { glossaryTerms } from '@/mocks/glossary';

const sections = [
  {
    id: 'monologues',
    title: 'Monologue Library',
    subtitle: `${monologues.length} curated monologues`,
    icon: <BookOpen size={22} color="#81C784" />,
    route: '/monologue-library',
    color: 'rgba(129,199,132,0.12)',
    borderColor: 'rgba(129,199,132,0.2)',
  },
  {
    id: 'dialects',
    title: 'Dialect Reference',
    subtitle: `${dialects.length} accents with IPA guides`,
    icon: <Globe size={22} color="#BA68C8" />,
    route: '/dialect-reference',
    color: 'rgba(186,104,200,0.12)',
    borderColor: 'rgba(186,104,200,0.2)',
  },
  {
    id: 'glossary',
    title: 'Industry Glossary',
    subtitle: `${glossaryTerms.length} essential terms`,
    icon: <FileText size={22} color="#4DD0E1" />,
    route: '/industry-glossary',
    color: 'rgba(77,208,225,0.12)',
    borderColor: 'rgba(77,208,225,0.2)',
  },
];

export default function LibraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Library</Text>
        <Text style={styles.subtitle}>Reference materials for your craft</Text>

        <View style={styles.sectionList}>
          {sections.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={[styles.sectionCard, { borderColor: section.borderColor }]}
              onPress={() => router.push(section.route as any)}
              activeOpacity={0.8}
              testID={`library-${section.id}`}
            >
              <View style={[styles.sectionIcon, { backgroundColor: section.color }]}>
                {section.icon}
              </View>
              <View style={styles.sectionText}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
              </View>
              <ChevronRight size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.quickAccess}>
          <Text style={styles.quickTitle}>Quick Browse</Text>

          <Text style={styles.categoryLabel}>Recent Monologues</Text>
          {monologues.slice(0, 3).map((mono) => (
            <TouchableOpacity
              key={mono.id}
              style={styles.quickItem}
              onPress={() => router.push(`/monologue/${mono.id}` as any)}
              activeOpacity={0.7}
            >
              <View style={styles.quickDot} />
              <View style={styles.quickItemContent}>
                <Text style={styles.quickItemTitle}>{mono.title}</Text>
                <Text style={styles.quickItemMeta}>{mono.source} · {mono.type} · {mono.duration}</Text>
              </View>
              <ChevronRight size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}

          <Text style={[styles.categoryLabel, { marginTop: 20 }]}>Popular Dialects</Text>
          {dialects.slice(0, 3).map((dialect) => (
            <TouchableOpacity
              key={dialect.id}
              style={styles.quickItem}
              onPress={() => router.push(`/dialect/${dialect.id}` as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickDot, { backgroundColor: '#BA68C8' }]} />
              <View style={styles.quickItemContent}>
                <Text style={styles.quickItemTitle}>{dialect.name}</Text>
                <Text style={styles.quickItemMeta}>{dialect.region} · {dialect.difficulty}</Text>
              </View>
              <ChevronRight size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 30 }} />
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
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    paddingTop: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 28,
  },
  sectionList: {
    gap: 12,
    marginBottom: 32,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
  },
  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  sectionText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  quickAccess: {
    marginTop: 4,
  },
  quickTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 10,
  },
  quickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  quickDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#81C784',
    marginRight: 12,
  },
  quickItemContent: {
    flex: 1,
  },
  quickItemTitle: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
  },
  quickItemMeta: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
