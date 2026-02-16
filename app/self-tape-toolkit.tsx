import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  Camera,
  Lightbulb,
  Mic,
  Clapperboard,
  Eye,
  ChevronLeft,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { selfTapeChecklist, framingGuides } from '@/mocks/selfTapeChecklist';

const categoryIcons: Record<string, React.ReactNode> = {
  'Before You Record': <Clapperboard size={18} color={Colors.accent} />,
  'Technical Setup': <Camera size={18} color="#64B5F6" />,
  'Lighting': <Lightbulb size={18} color="#FFB74D" />,
  'Audio': <Mic size={18} color="#81C784" />,
  'Performance': <Eye size={18} color="#E57373" />,
};

export default function SelfTapeToolkit() {
  const router = useRouter();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [expandedCategory, setExpandedCategory] = useState<string | null>('1');
  const [showFraming, setShowFraming] = useState(false);

  const toggleCheck = (itemKey: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(itemKey)) {
        next.delete(itemKey);
      } else {
        next.add(itemKey);
      }
      return next;
    });
  };

  const totalItems = selfTapeChecklist.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedCount = checked.size;
  const progress = totalItems > 0 ? checkedCount / totalItems : 0;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{
        title: 'Self-Tape Toolkit',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <ChevronLeft size={24} color={Colors.accent} />
          </TouchableOpacity>
        ),
      }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Self-Tape Checklist</Text>
            <Text style={styles.progressCount}>{checkedCount}/{totalItems}</Text>
          </View>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
          </View>
          <Text style={styles.progressHint}>
            {checkedCount === totalItems
              ? 'You\'re ready to record!'
              : 'Check off each item before you hit record'}
          </Text>
        </View>

        {selfTapeChecklist.map((category) => {
          const isExpanded = expandedCategory === category.id;
          const categoryChecked = category.items.filter((_, i) =>
            checked.has(`${category.id}-${i}`)
          ).length;

          return (
            <View key={category.id} style={styles.categoryCard}>
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => setExpandedCategory(isExpanded ? null : category.id)}
                activeOpacity={0.7}
              >
                <View style={styles.categoryLeft}>
                  {categoryIcons[category.category] || <Circle size={18} color={Colors.textMuted} />}
                  <Text style={styles.categoryTitle}>{category.category}</Text>
                </View>
                <View style={styles.categoryRight}>
                  <Text style={styles.categoryCount}>
                    {categoryChecked}/{category.items.length}
                  </Text>
                  {isExpanded ? (
                    <ChevronUp size={18} color={Colors.textMuted} />
                  ) : (
                    <ChevronDown size={18} color={Colors.textMuted} />
                  )}
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.itemList}>
                  {category.items.map((item, idx) => {
                    const key = `${category.id}-${idx}`;
                    const isChecked = checked.has(key);
                    return (
                      <TouchableOpacity
                        key={key}
                        style={styles.checkItem}
                        onPress={() => toggleCheck(key)}
                        activeOpacity={0.7}
                      >
                        {isChecked ? (
                          <CheckCircle size={22} color={Colors.success} />
                        ) : (
                          <Circle size={22} color={Colors.textMuted} />
                        )}
                        <View style={styles.checkItemText}>
                          <Text
                            style={[
                              styles.checkItemLabel,
                              isChecked && styles.checkItemLabelDone,
                            ]}
                          >
                            {item.label}
                          </Text>
                          <Text style={styles.checkItemTip}>{item.tip}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        <TouchableOpacity
          style={styles.framingToggle}
          onPress={() => setShowFraming(!showFraming)}
          activeOpacity={0.8}
        >
          <Camera size={20} color={Colors.accent} />
          <Text style={styles.framingToggleText}>Framing Guide</Text>
          {showFraming ? (
            <ChevronUp size={18} color={Colors.textMuted} />
          ) : (
            <ChevronDown size={18} color={Colors.textMuted} />
          )}
        </TouchableOpacity>

        {showFraming && (
          <View style={styles.framingList}>
            {framingGuides.map((guide) => (
              <View key={guide.id} style={styles.framingCard}>
                <Text style={styles.framingName}>{guide.name}</Text>
                <Text style={styles.framingDesc}>{guide.description}</Text>
                <View style={styles.framingMeta}>
                  <Text style={styles.framingMetaLabel}>When to use:</Text>
                  <Text style={styles.framingMetaValue}>{guide.when}</Text>
                </View>
                <View style={styles.framingMeta}>
                  <Text style={styles.framingMetaLabel}>Tips:</Text>
                  <Text style={styles.framingMetaValue}>{guide.tips}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

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
  progressSection: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(232,168,56,0.15)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  progressCount: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  progressHint: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 10,
  },
  categoryCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  categoryCount: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  itemList: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    gap: 12,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  checkItemText: {
    flex: 1,
  },
  checkItemLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  checkItemLabelDone: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  checkItemTip: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  framingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
  },
  framingToggleText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  framingList: {
    gap: 10,
    marginTop: 10,
  },
  framingCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
  },
  framingName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.accent,
    marginBottom: 6,
  },
  framingDesc: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  framingMeta: {
    marginBottom: 6,
  },
  framingMetaLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  framingMetaValue: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
