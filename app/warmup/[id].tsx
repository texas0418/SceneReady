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
import * as Speech from 'expo-speech';
import { Play, Pause, SkipForward, RotateCcw, Clock, CheckCircle2, Volume2, VolumeX } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { warmups } from '@/mocks/warmups';

function parseDurationToSeconds(duration: string): number {
  const match = duration.match(/(\d+)\s*min/);
  if (match) return parseInt(match[1], 10) * 60;
  const secMatch = duration.match(/(\d+)\s*sec/);
  if (secMatch) return parseInt(secMatch[1], 10);
  return 60;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function WarmupDetail() {
  const { id } = useLocalSearchParams();
  const warmup = warmups.find((w) => w.id === id);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [audioEnabled, setAudioEnabled] = useState(true);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (warmup) {
      setTimeRemaining(parseDurationToSeconds(warmup.steps[0].duration));
    }
  }, [warmup]);

  useEffect(() => {
    if (warmup) {
      Animated.timing(progressAnim, {
        toValue: completedSteps.size / warmup.steps.length,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [completedSteps.size, warmup, progressAnim]);

  // Timer countdown
  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Timer finished for this step
            clearInterval(timerRef.current!);
            handleStepComplete();
            return 0;
          }
          // Haptic at 10 seconds remaining
          if (prev === 11) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          // Haptic at 3, 2, 1
          if (prev <= 4) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timeRemaining]);

  // Pulse animation for timer
  useEffect(() => {
    if (isTimerRunning && timeRemaining <= 10 && timeRemaining > 0) {
      Animated.sequence([
        Animated.timing(timerAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
        Animated.timing(timerAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [timeRemaining, isTimerRunning]);

  const handleStepComplete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (audioEnabled) {
      Speech.speak('Next', { rate: 1.0, pitch: 1.0 });
    }

    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(currentStep);
      return next;
    });

    if (warmup && currentStep < warmup.steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setTimeRemaining(parseDurationToSeconds(warmup.steps[nextStep].duration));
      // Keep timer running for auto-advance
    } else {
      setIsTimerRunning(false);
      if (audioEnabled && warmup) {
        setTimeout(() => {
          Speech.speak('Warm-up complete. You\'re ready to perform.', { rate: 0.9, pitch: 1.0 });
        }, 500);
      }
    }
  }, [currentStep, warmup, audioEnabled]);

  const handlePlayPause = useCallback(() => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      setIsTimerRunning(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (audioEnabled && warmup && !completedSteps.has(currentStep)) {
        // Read current step instruction
        Speech.speak(warmup.steps[currentStep].instruction, { rate: 0.85, pitch: 1.0 });
      }
    }
  }, [isTimerRunning, audioEnabled, warmup, currentStep, completedSteps]);

  const handleSkip = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    Speech.stop();
    handleStepComplete();
  }, [handleStepComplete]);

  const handleStepTap = useCallback((index: number) => {
    if (completedSteps.has(index)) return;
    if (timerRef.current) clearInterval(timerRef.current);
    Speech.stop();
    setCurrentStep(index);
    if (warmup) {
      setTimeRemaining(parseDurationToSeconds(warmup.steps[index].duration));
    }
    setIsTimerRunning(false);
  }, [completedSteps, warmup]);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    Speech.stop();
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setIsTimerRunning(false);
    if (warmup) {
      setTimeRemaining(parseDurationToSeconds(warmup.steps[0].duration));
    }
  }, [warmup]);

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
  const stepDurationSec = parseDurationToSeconds(warmup.steps[currentStep]?.duration || '1 min');
  const timerProgress = stepDurationSec > 0 ? (stepDurationSec - timeRemaining) / stepDurationSec : 0;

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
            <TouchableOpacity
              style={styles.metaBadge}
              onPress={() => setAudioEnabled(!audioEnabled)}
            >
              {audioEnabled ? (
                <Volume2 size={12} color={Colors.accent} />
              ) : (
                <VolumeX size={12} color={Colors.textMuted} />
              )}
              <Text style={[styles.metaText, audioEnabled && { color: Colors.accent }]}>
                {audioEnabled ? 'Audio On' : 'Audio Off'}
              </Text>
            </TouchableOpacity>
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

        {/* Timer Display */}
        {!allDone && (
          <View style={styles.timerCard}>
            <Text style={styles.timerStepLabel}>
              Step {currentStep + 1} of {warmup.steps.length}
            </Text>
            <Animated.Text style={[styles.timerDisplay, { transform: [{ scale: timerAnim }] }]}>
              {formatTime(timeRemaining)}
            </Animated.Text>
            <View style={styles.timerProgressBar}>
              <View style={[styles.timerProgressFill, { width: `${timerProgress * 100}%` }]} />
            </View>
            <View style={styles.timerControls}>
              <TouchableOpacity style={styles.timerBtn} onPress={handleReset}>
                <RotateCcw size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.timerPlayBtn, isTimerRunning && styles.timerPauseBtn]}
                onPress={handlePlayPause}
              >
                {isTimerRunning ? (
                  <Pause size={28} color="#0F0F0F" />
                ) : (
                  <Play size={28} color="#0F0F0F" style={{ marginLeft: 3 }} />
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.timerBtn} onPress={handleSkip}>
                <SkipForward size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

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
                onPress={() => handleStepTap(index)}
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
    flexWrap: 'wrap',
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
  timerCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(232,168,56,0.2)',
  },
  timerStepLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 8,
  },
  timerDisplay: {
    fontSize: 56,
    fontWeight: '200' as const,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
    marginBottom: 16,
  },
  timerProgressBar: {
    width: '100%',
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 20,
  },
  timerProgressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  timerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerPlayBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerPauseBtn: {
    backgroundColor: Colors.accentLight,
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
