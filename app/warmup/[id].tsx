import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Play, Pause, SkipForward, RotateCcw, Clock, CheckCircle2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { warmups } from '@/mocks/warmups';

export default function WarmupDetail() {
  const { id } = useLocalSearchParams();
  const warmup = warmups.find((w) => w.id === id);
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (warmup) {
      Animated.timing(progressAnim, {
        toValue: completedSteps.size / warmup.steps.length,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [completedSteps.size, warmup, progressAnim]);

  const completeStep = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(currentStep);
      return next;
    });

    if (warmup && currentStep < warmup.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, warmup]);

  const handleReset = () => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setIsActive(false);
  };

  if (!warmup) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Not Found' }} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Warm-up not found</Text>
        </View>
      </View>
    );
  }

  const allDone = completedSteps.size === warmup.steps.length;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: warmup.title }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{warmup.title}</Text>
          <Text style={styles.description}>{warmup.description}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Clock size={12} color={Colors.textMuted} />
              <Text style={styles.metaText}>{warmup.duration}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>{warmup.steps.length} steps</Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>{warmup.category}</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>
            {completedSteps.size}/{warmup.steps.length} completed
          </Text>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {allDone && (
          <View style={styles.doneCard}>
            <Text style={styles.doneEmoji}>✨</Text>
            <Text style={styles.doneTitle}>Warm-Up Complete!</Text>
            <Text style={styles.doneSubtitle}>You're ready to perform.</Text>
            <TouchableOpacity style={styles.resetLink} onPress={handleReset}>
              <RotateCcw size={14} color={Colors.accent} />
              <Text style={styles.resetLinkText}>Start Over</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.stepsList}>
          {warmup.steps.map((step, index) => {
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === currentStep && !allDone;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.stepCard,
                  isCurrent && styles.stepCardCurrent,
                  isCompleted && styles.stepCardDone,
                ]}
                onPress={() => {
                  if (!isCompleted) {
                    setCurrentStep(index);
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.stepHeader}>
                  <View style={styles.stepNumber}>
                    {isCompleted ? (
                      <CheckCircle2 size={20} color={Colors.success} />
                    ) : (
                      <Text style={[styles.stepNumberText, isCurrent && styles.stepNumberTextActive]}>
                        {index + 1}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.stepDuration}>{step.duration}</Text>
                </View>
                <Text style={[styles.stepInstruction, isCompleted && styles.stepInstructionDone]}>
                  {step.instruction}
                </Text>
                {isCurrent && !isCompleted && (
                  <TouchableOpacity
                    style={styles.completeBtn}
                    onPress={completeStep}
                    activeOpacity={0.85}
                  >
                    <CheckCircle2 size={16} color="#0F0F0F" />
                    <Text style={styles.completeBtnText}>Mark Complete</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
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
  title: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.card,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500' as const,
    textTransform: 'capitalize' as const,
  },
  progressRow: {
    marginBottom: 20,
  },
  progressLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 2,
  },
  doneCard: {
    backgroundColor: 'rgba(76,175,80,0.08)',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.2)',
  },
  doneEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  doneTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  doneSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  resetLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resetLinkText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  stepsList: {
    gap: 8,
  },
  stepCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  stepCardCurrent: {
    borderLeftColor: Colors.accent,
    backgroundColor: Colors.spotlightStrong,
  },
  stepCardDone: {
    opacity: 0.6,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textMuted,
  },
  stepNumberTextActive: {
    color: Colors.accent,
  },
  stepDuration: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  stepInstruction: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  stepInstructionDone: {
    color: Colors.textMuted,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.accent,
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 14,
  },
  completeBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
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
