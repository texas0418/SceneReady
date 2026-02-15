import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  Users,
  Monitor,
  BookOpen,
  Timer,
  Globe,
  Flame,
  FileText,
} from 'lucide-react-native';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = (width - 48 - CARD_GAP) / 2;

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
    id: 'dialects',
    title: 'Dialects',
    subtitle: 'Accent reference',
    icon: <Globe size={22} color="#BA68C8" />,
    route: '/dialect-reference',
    gradient: ['rgba(186,104,200,0.12)', Colors.card],
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

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnims = useRef(tools.map(() => new Animated.Value(0))).current;

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

  const handlePress = (route: string) => {
    router.push(route as any);
  };

  const featuredTool = tools[0];
  const gridTools = tools.slice(1);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
          <Text style={styles.greeting}>Actor's Toolkit</Text>
          <Text style={styles.subtitle}>Everything you need. One app.</Text>
        </Animated.View>

        <Animated.View style={{ opacity: cardAnims[0], transform: [{ scale: cardAnims[0].interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }] }}>
          <TouchableOpacity
            style={styles.featuredCard}
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
                style={[styles.toolCard, { backgroundColor: tool.gradient[0] }]}
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
  scrollContent: {
    paddingHorizontal: 20,
  },
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
    width: CARD_WIDTH,
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
});
