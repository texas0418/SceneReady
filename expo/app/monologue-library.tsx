import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { Search, Filter, X, Plus, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { monologues, Monologue } from '@/mocks/monologues';
import { useUserMonologues } from '@/providers/UserMonologuesProvider';

const typeFilters = ['all', 'dramatic', 'comedic', 'classical', 'contemporary'] as const;
const genderFilters = ['all', 'male', 'female', 'neutral'] as const;

const typeColors: Record<string, string> = {
  dramatic: '#E57373',
  comedic: '#81C784',
  classical: '#FFB74D',
  contemporary: '#64B5F6',
};

interface DisplayMonologue extends Monologue {
  isUserAdded?: boolean;
}

export default function MonologueLibrary() {
  const router = useRouter();
  const { userMonologues, deleteMonologue } = useUserMonologues();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'curated' | 'mine'>('all');

  const allMonologues = useMemo((): DisplayMonologue[] => {
    const userItems: DisplayMonologue[] = userMonologues.map((m) => ({ ...m, isUserAdded: true }));
    const curatedItems: DisplayMonologue[] = monologues.map((m) => ({ ...m, isUserAdded: false }));
    return [...userItems, ...curatedItems];
  }, [userMonologues]);

  const filtered = useMemo(() => {
    return allMonologues.filter((m) => {
      const matchesSource =
        sourceFilter === 'all' ||
        (sourceFilter === 'mine' && m.isUserAdded) ||
        (sourceFilter === 'curated' && !m.isUserAdded);
      const matchesSearch =
        !search ||
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.author.toLowerCase().includes(search.toLowerCase()) ||
        m.source.toLowerCase().includes(search.toLowerCase()) ||
        m.tone.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || m.type === typeFilter;
      const matchesGender = genderFilter === 'all' || m.gender === genderFilter;
      return matchesSearch && matchesType && matchesGender && matchesSource;
    });
  }, [search, typeFilter, genderFilter, sourceFilter, allMonologues]);

  const handleDelete = (id: string, title: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    deleteMonologue(id);
  };

  const renderItem = ({ item }: { item: DisplayMonologue }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/monologue/${item.id}` as any)}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.typeBadge, { backgroundColor: `${typeColors[item.type]}20` }]}>
            <Text style={[styles.typeBadgeText, { color: typeColors[item.type] }]}>
              {item.type}
            </Text>
          </View>
          {item.isUserAdded && (
            <View style={styles.userBadge}>
              <Text style={styles.userBadgeText}>MY</Text>
            </View>
          )}
        </View>
        <View style={styles.cardHeaderRight}>
          <Text style={styles.duration}>{item.duration}</Text>
          {item.isUserAdded && (
            <TouchableOpacity
              onPress={() => handleDelete(item.id, item.title)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.deleteBtn}
            >
              <Trash2 size={14} color={Colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardSource}>{item.source}</Text>
      <View style={styles.cardMeta}>
        <Text style={styles.cardMetaText}>{item.author}</Text>
        <Text style={styles.cardMetaDot}>·</Text>
        <Text style={styles.cardMetaText}>{item.gender}</Text>
        <Text style={styles.cardMetaDot}>·</Text>
        <Text style={styles.cardMetaText}>{item.ageRange}</Text>
      </View>
      <Text style={styles.cardTone}>{item.tone}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Monologue Library',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/add-monologue' as any);
              }}
              style={styles.addHeaderBtn}
              testID="add-monologue-header-btn"
            >
              <Plus size={20} color={Colors.accent} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.searchRow}>
        <View style={styles.searchInput}>
          <Search size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchField}
            placeholder="Search monologues..."
            placeholderTextColor={Colors.textMuted}
            value={search}
            onChangeText={setSearch}
            testID="monologue-search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} color={showFilters ? Colors.accent : Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersSection}>
          <Text style={styles.filterLabel}>Source</Text>
          <View style={styles.filterRow}>
            {(['all', 'curated', 'mine'] as const).map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.filterChip, sourceFilter === s && styles.filterChipActive]}
                onPress={() => setSourceFilter(s)}
              >
                <Text style={[styles.filterChipText, sourceFilter === s && styles.filterChipTextActive]}>
                  {s === 'all' ? 'All' : s === 'curated' ? 'Curated' : 'My Monologues'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.filterLabel}>Type</Text>
          <View style={styles.filterRow}>
            {typeFilters.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.filterChip, typeFilter === t && styles.filterChipActive]}
                onPress={() => setTypeFilter(t)}
              >
                <Text style={[styles.filterChipText, typeFilter === t && styles.filterChipTextActive]}>
                  {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.filterLabel}>Gender</Text>
          <View style={styles.filterRow}>
            {genderFilters.map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.filterChip, genderFilter === g && styles.filterChipActive]}
                onPress={() => setGenderFilter(g)}
              >
                <Text style={[styles.filterChipText, genderFilter === g && styles.filterChipTextActive]}>
                  {g === 'all' ? 'All' : g.charAt(0).toUpperCase() + g.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No monologues match your filters</Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => router.push('/add-monologue' as any)}
            >
              <Plus size={16} color={Colors.accent} />
              <Text style={styles.emptyAddText}>Add your own</Text>
            </TouchableOpacity>
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchField: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtnActive: {
    backgroundColor: Colors.spotlightStrong,
  },
  filtersSection: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.spotlightStrong,
    borderColor: Colors.accent,
  },
  filterChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.accent,
    fontWeight: '600' as const,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  duration: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cardSource: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardMetaText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  cardMetaDot: {
    fontSize: 12,
    color: Colors.textMuted,
    marginHorizontal: 6,
  },
  cardTone: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '500' as const,
  },
  addHeaderBtn: {
    padding: 4,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userBadge: {
    backgroundColor: 'rgba(232,168,56,0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  userBadgeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  deleteBtn: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textMuted,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.spotlightStrong,
  },
  emptyAddText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
});
