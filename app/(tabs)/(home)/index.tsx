import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  Users,
  Monitor,
  BookOpen,
  Timer,
  Flame,
  FileText,
  NotebookPen,
  UserSearch,
  Highlighter,
  CalendarCheck,
  X,
  ChevronRight,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useFavorites } from '@/providers/FavoritesProvider';

const CARD_GAP = 12;

interface ToolCard {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  route: string;
  gradient: string[];
  featured?: boolean;
}

const tools: ToolCard[] = [
  {
    id: 'ai-partner',
    title: 'AI Scene Partner',
    subtitle: 'Practice with AI',
    icon: <Users size={24} color={Colors.accent} />,
    route: '/ai-scene-partner',
    gradient: [Colors.spotlightStrong, Colors.card],
    featured: true,
  },
  {
    id: 'audition-tracker',
    title: 'Audition Tracker',
    subtitle: 'Log & track auditions',
    icon: <CalendarCheck size={22} color="#4DD0E1" />,
    route: '/audition-tracker',
    gradient: ['rgba(77,208,225,0.12)', Colors.card],
  },
  {
    id: 'self-tape',
    title: 'Self-Tape Toolkit',
    subtitle: 'Checklist & guides',
    icon: <Camera size={22} color="#E57373" />,
    route: '/self-tape-toolkit',
    gradient: ['rgba(229,115,115,0.12)', Colors.card],
  },
  {
    id: 'teleprompter',
    title: 'Teleprompter',
    subtitle: 'Scroll your lines',
    icon: <Monitor size={22} color="#64B5F6" />,
    route: '/teleprompter',
    gradient: ['rgba(100,181,246,0.12)', Colors.card],
  },
  {
    id: 'monologues',
    title: 'Monologues',
    subtitle: 'Curated collection',
    icon: <BookOpen size={22} color="#81C784" />,
    route: '/monologue-library',
    gradient: ['rgba(129,199,132,0.12)', Colors.card],
  },
  {
    id: 'cold-read',
    title: 'Cold Read Timer',
    subtitle: 'Pressure practice',
    icon: <Timer size={22} color="#FFB74D" />,
    route: '/cold-read-timer',
    gradient: ['rgba(255,183,77,0.12)', Colors.card],
  },
  {
    id: 'journal',
    title: 'Rehearsal Journal',
    subtitle: 'Track your growth',
    icon: <NotebookPen size={22} color="#CE93D8" />,
    route: '/rehearsal-journal',
    gradient: ['rgba(206,147,216,0.12)', Colors.card],
  },
  {
    id: 'character',
    title: 'Character Builder',
    subtitle: 'Deep script analysis',
    icon: <UserSearch size={22} color="#F48FB1" />,
    route: '/character-breakdown',
    gradient: ['rgba(244,143,177,0.12)', Colors.card],
  },
  {
    id: 'sides',
    title: 'Sides Annotation',
    subtitle: 'Mark up your scripts',
    icon: <Highlighter size={22} color="#90CAF9" />,
    route: '/sides-annotation',
    gradient: ['rgba(144,202,249,0.12)', Colors.card],
  },
  {
    id: 'warmups',
    title: 'Daily Warm-Ups',
    subtitle: 'Voice & body prep',
    icon: <Flame size={22} color="#FF8A65" />,
    route: '/daily-warmups',
    gradient: ['rgba(255,138,101,0.12)', Colors.card],
  },
  {
    id: 'glossary',
    title: 'Glossary',
    subtitle: 'Industry terms',
    icon: <FileText size={22} color="#4DD0E1" />,
    route: '/industry-glossary',
    gradient: ['rgba(77,208,225,0.12)', Colors.card],
  },
];

const ONBOARDING_STEPS = [
  {
    title: 'Welcome to SceneReady',
    subtitle: 'Your complete actor\'s toolkit — everything you need to prep, rehearse, and nail the audition.',
    emoji: '🎬',
  },
  {
    title: 'Prep Your Scripts',
    subtitle: 'Import sides as PDF or text, annotate with beats and objectives, and build deep character breakdowns.',
    emoji: '📝',
  },
  {
    title: 'Practice & Rehearse',
    subtitle: 'Run lines with an AI scene partner, use the teleprompter for self-tapes, and sharpen cold reads under pressure.',
    emoji: '🎭',
  },
  {
    title: 'Track Everything',
    subtitle: 'Log auditions, journal your rehearsals, and warm up your instrument with guided routines.',
    emoji: '📊',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { hasSeenOnboarding, dismissOnboarding } = useFavorites();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnims = useRef(tools.map(() => new Animated.Value(0))).current;

  const [onboardingVisible, setOnboardingVisible] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const onboardingFade = useRef(new Animated.Value(1)).current;

  // Responsive grid
  const numColumns = width >= 600 ? 3 : 2;
  const horizontalPadding = width >= 600 ? 32 : 20;
  const totalGaps = (numColumns - 1) * CARD_GAP;
  const cardWidth = (width - horizontalPadding * 2 - totalGaps) / numColumns;

  useEffect(() => {
    if (!hasSeenOnboarding) {
      setOnboardingVisible(true);
    }
  }, [hasSeenOnboarding]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const cardAnimations = cardAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: 200 + index * 60,
        useNativeDriver: true,
      })
    );
    Animated.stagger(60, cardAnimations).start();
  }, []);

  const handleOnboardingNext = useCallback(() => {
    if (onboardingStep < ONBOARDING_STEPS.length - 1) {
      Animated.timing(onboardingFade, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setOnboardingStep((prev) => prev + 1);
        Animated.timing(onboardingFade, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      dismissOnboarding();
      setOnboardingVisible(false);
    }
  }, [onboardingStep, dismissOnboarding, onboardingFade]);

  const handleOnboardingSkip = useCallback(() => {
    dismissOnboarding();
    setOnboardingVisible(false);
  }, [dismissOnboarding]);

  const handlePress = (route: string) => {
    router.push(route as any);
  };

  const featuredTool = tools[0];
  const gridTools = tools.slice(1);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Onboarding Modal */}
      <Modal
        visible={onboardingVisible}
        animationType="fade"
        transparent
        statusBarTranslucent
      >
        <View style={styles.onboardingOverlay}>
          <View style={styles.onboardingCard}>
            <TouchableOpacity style={styles.onboardingSkip} onPress={handleOnboardingSkip}>
              <Text style={styles.onboardingSkipText}>Skip</Text>
            </TouchableOpacity>

            <Animated.View style={[styles.onboardingContent, { opacity: onboardingFade }]}>
              <Text style={styles.onboardingEmoji}>
                {ONBOARDING_STEPS[onboardingStep].emoji}
              </Text>
              <Text style={styles.onboardingTitle}>
                {ONBOARDING_STEPS[onboardingStep].title}
              </Text>
              <Text style={styles.onboardingSubtitle}>
                {ONBOARDING_STEPS[onboardingStep].subtitle}
              </Text>
            </Animated.View>

            <View style={styles.onboardingDots}>
              {ONBOARDING_STEPS.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.onboardingDot,
                    i === onboardingStep && styles.onboardingDotActive,
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.onboardingBtn}
              onPress={handleOnboardingNext}
              activeOpacity={0.85}
            >
              <Text style={styles.onboardingBtnText}>
                {onboardingStep < ONBOARDING_STEPS.length - 1 ? 'Next' : 'Get Started'}
              </Text>
              <ChevronRight size={18} color="#0F0F0F" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding }]}
      >
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[styles.greeting, width >= 600 && styles.greetingLarge]}>Actor's Toolkit</Text>
          <Text style={styles.subtitle}>Everything you need. One app.</Text>
        </Animated.View>

        <Animated.View style={{ opacity: cardAnims[0], transform: [{ scale: cardAnims[0].interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }] }}>
          <TouchableOpacity
            style={[styles.featuredCard, width >= 600 && styles.featuredCardWide]}
            onPress={() => handlePress(featuredTool.route)}
            activeOpacity={0.85}
            testID="featured-card"
          >
            <View style={styles.featuredGlow} />
            <View style={styles.featuredContent}>
              <View style={styles.featuredIconWrap}>
                {featuredTool.icon}
              </View>
              <View style={styles.featuredText}>
                <Text style={styles.featuredBadge}>FEATURED</Text>
                <Text style={styles.featuredTitle}>{featuredTool.title}</Text>
                <Text style={styles.featuredSubtitle}>
                  Upload sides, assign roles, and practice with AI-powered scene partner
                </Text>
              </View>
            </View>
            <View style={styles.featuredArrow}>
              <Text style={styles.featuredArrowText}>→</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.sectionTitle}>Tools</Text>

        <View style={styles.grid}>
          {gridTools.map((tool, index) => (
            <Animated.View
              key={tool.id}
              style={{
                opacity: cardAnims[index + 1],
                transform: [
                  {
                    translateY: cardAnims[index + 1].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              }}
            >
              <TouchableOpacity
                style={[styles.toolCard, { backgroundColor: tool.gradient[0], width: cardWidth }]}
                onPress={() => handlePress(tool.route)}
                activeOpacity={0.8}
                testID={`tool-card-${tool.id}`}
              >
                <View style={styles.toolIconWrap}>{tool.icon}</View>
                <Text style={styles.toolTitle}>{tool.title}</Text>
                <Text style={styles.toolSubtitle}>{tool.subtitle}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {},
  header: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  greetingLarge: {
    fontSize: 38,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  featuredCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(232,168,56,0.2)',
    overflow: 'hidden',
  },
  featuredCardWide: {
    padding: 28,
  },
  featuredGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(232,168,56,0.08)',
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  featuredIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(232,168,56,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredText: {
    flex: 1,
  },
  featuredBadge: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.accent,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  featuredSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  featuredArrow: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  featuredArrowText: {
    fontSize: 20,
    color: Colors.accent,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  toolCard: {
    borderRadius: 14,
    padding: 16,
    minHeight: 130,
    justifyContent: 'space-between',
  },
  toolIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  toolSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bottomSpacer: {
    height: 30,
  },
  // Onboarding
  onboardingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  onboardingCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  onboardingSkip: {
    position: 'absolute',
    top: 16,
    right: 20,
    padding: 4,
  },
  onboardingSkipText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  onboardingContent: {
    alignItems: 'center',
    marginTop: 8,
  },
  onboardingEmoji: {
    fontSize: 52,
    marginBottom: 20,
  },
  onboardingTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  onboardingSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  onboardingDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  onboardingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  onboardingDotActive: {
    backgroundColor: Colors.accent,
    width: 24,
  },
  onboardingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    width: '100%',
  },
  onboardingBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#0F0F0F',
  },
});
