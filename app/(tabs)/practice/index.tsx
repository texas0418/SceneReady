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
import {
  Users,
  Monitor,
  Timer,
  Flame,
  Camera,
  ChevronRight,
  Mic,
  Heart,
  Eye,
  Wind,
} from 'lucide-react-native';
import Colors from '@/constants/colors';

const practiceTools = [
  {
    id: 'ai-partner',
    title: 'AI Scene Partner',
    description: 'Practice scenes with an AI reader',
    icon: <Users size={22} color={Colors.accent} />,
    route: '/ai-scene-partner',
    color: Colors.spotlightStrong,
  },
  {
    id: 'teleprompter',
    title: 'Teleprompter',
    description: 'Scroll your lines at custom speed',
    icon: <Monitor size={22} color="#64B5F6" />,
    route: '/teleprompter',
    color: 'rgba(100,181,246,0.12)',
  },
  {
    id: 'cold-read',
    title: 'Cold Read Timer',
    description: 'Practice cold reading under pressure',
    icon: <Timer size={22} color="#FFB74D" />,
    route: '/cold-read-timer',
    color: 'rgba(255,183,77,0.12)',
  },
  {
    id: 'self-tape',
    title: 'Self-Tape Toolkit',
    description: 'Framing guides & checklists',
    icon: <Camera size={22} color="#E57373" />,
    route: '/self-tape-toolkit',
    color: 'rgba(229,115,115,0.12)',
  },
];

const warmupCategories = [
  { id: 'voice', title: 'Voice', icon: <Mic size={18} color="#FF8A65" />, color: 'rgba(255,138,101,0.12)' },
  { id: 'body', title: 'Body', icon: <Wind size={18} color="#81C784" />, color: 'rgba(129,199,132,0.12)' },
  { id: 'emotional', title: 'Emotional', icon: <Heart size={18} color="#E57373" />, color: 'rgba(229,115,115,0.12)' },
  { id: 'focus', title: 'Focus', icon: <Eye size={18} color="#64B5F6" />, color: 'rgba(100,181,246,0.12)' },
];

export default function PracticeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Practice</Text>
        <Text style={styles.subtitle}>Sharpen your skills</Text>

        <View style={styles.toolList}>
          {practiceTools.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={styles.toolCard}
              onPress={() => router.push(tool.route as any)}
              activeOpacity={0.8}
              testID={`practice-${tool.id}`}
            >
              <View style={[styles.toolIcon, { backgroundColor: tool.color }]}>
                {tool.icon}
              </View>
              <View style={styles.toolText}>
                <Text style={styles.toolTitle}>{tool.title}</Text>
                <Text style={styles.toolDesc}>{tool.description}</Text>
              </View>
              <ChevronRight size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.warmupSection}>
          <View style={styles.warmupHeader}>
            <Flame size={20} color="#FF8A65" />
            <Text style={styles.warmupTitle}>Daily Warm-Ups</Text>
          </View>
          <Text style={styles.warmupSubtitle}>Prepare your instrument before every session</Text>

          <View style={styles.warmupGrid}>
            {warmupCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.warmupCard, { backgroundColor: cat.color }]}
                onPress={() => router.push('/daily-warmups' as any)}
                activeOpacity={0.8}
              >
                {cat.icon}
                <Text style={styles.warmupCardTitle}>{cat.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.allWarmupsBtn}
            onPress={() => router.push('/daily-warmups' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.allWarmupsBtnText}>View All Warm-Ups</Text>
            <ChevronRight size={16} color={Colors.accent} />
          </TouchableOpacity>
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
  toolList: {
    gap: 10,
    marginBottom: 32,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
  },
  toolIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  toolText: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  toolDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  warmupSection: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
  },
  warmupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  warmupTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  warmupSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
    marginBottom: 18,
  },
  warmupGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  warmupCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  warmupCardTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  allWarmupsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  allWarmupsBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
});
