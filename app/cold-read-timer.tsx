import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Play, Pause, RotateCcw, Clock, Minus, Plus, AlertTriangle   ChevronLeft,
} from 'lucide-react-native';
import Colors from '@/constants/colors';

type Phase = 'setup' | 'prep' | 'perform' | 'done';

export default function ColdReadTimer() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('setup');
  const [prepMinutes, setPrepMinutes] = useState(3);
  const [performMinutes, setPerformMinutes] = useState(5);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sidesText, setSidesText] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setIsRunning(false);

            if (phase === 'prep') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              setPhase('perform');
              setTimeLeft(performMinutes * 60);
              return performMinutes * 60;
            } else if (phase === 'perform') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setPhase('done');
              return 0;
            }
            return 0;
          }

          if (prev <= 11 && prev > 1) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }

          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, phase, performMinutes]);

  useEffect(() => {
    if (phase === 'prep' || phase === 'perform') {
      startPulse();
    } else {
      pulseAnim.setValue(1);
    }
  }, [phase, startPulse, pulseAnim]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setPhase('prep');
    setTimeLeft(prepMinutes * 60);
    setIsRunning(true);
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setPhase('setup');
    setTimeLeft(0);
  };

  const togglePause = () => {
    setIsRunning(!isRunning);
  };

  if (phase === 'setup') {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{
        title: 'Cold Read Timer',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <ChevronLeft size={24} color={Colors.accent} />
          </TouchableOpacity>
        ),
      }} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.setupHeader}>
            <View style={styles.setupIcon}>
              <Clock size={28} color="#FFB74D" />
            </View>
            <Text style={styles.setupTitle}>Cold Read Practice</Text>
            <Text style={styles.setupSubtitle}>
              Set your prep time, paste sides, then read under pressure when the timer switches.
            </Text>
          </View>

          <View style={styles.timeSetup}>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Prep Time</Text>
              <View style={styles.timeControls}>
                <TouchableOpacity
                  style={styles.timeBtn}
                  onPress={() => setPrepMinutes(Math.max(1, prepMinutes - 1))}
                >
                  <Minus size={16} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.timeValue}>{prepMinutes} min</Text>
                <TouchableOpacity
                  style={styles.timeBtn}
                  onPress={() => setPrepMinutes(Math.min(15, prepMinutes + 1))}
                >
                  <Plus size={16} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.timeDivider} />

            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>Perform Time</Text>
              <View style={styles.timeControls}>
                <TouchableOpacity
                  style={styles.timeBtn}
                  onPress={() => setPerformMinutes(Math.max(1, performMinutes - 1))}
                >
                  <Minus size={16} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.timeValue}>{performMinutes} min</Text>
                <TouchableOpacity
                  style={styles.timeBtn}
                  onPress={() => setPerformMinutes(Math.min(30, performMinutes + 1))}
                >
                  <Plus size={16} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Text style={styles.inputLabel}>Paste Your Sides (Optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Paste the sides you want to cold read..."
            placeholderTextColor={Colors.textMuted}
            value={sidesText}
            onChangeText={setSidesText}
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.85}>
            <Play size={20} color="#0F0F0F" />
            <Text style={styles.startBtnText}>Begin Cold Read</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (phase === 'done') {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{
        title: 'Cold Read Timer',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <ChevronLeft size={24} color={Colors.accent} />
          </TouchableOpacity>
        ),
      }} />
        <View style={styles.doneContainer}>
          <Text style={styles.doneEmoji}>🎬</Text>
          <Text style={styles.doneTitle}>Scene!</Text>
          <Text style={styles.doneSubtitle}>Great work. Cold reading builds instinct and confidence.</Text>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.85}>
            <RotateCcw size={18} color={Colors.accent} />
            <Text style={styles.resetBtnText}>Go Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isPrep = phase === 'prep';
  const totalTime = isPrep ? prepMinutes * 60 : performMinutes * 60;
  const progress = totalTime > 0 ? timeLeft / totalTime : 0;
  const isLowTime = timeLeft <= 10;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{
        title: 'Cold Read Timer',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <ChevronLeft size={24} color={Colors.accent} />
          </TouchableOpacity>
        ),
      }} />
      <View style={styles.timerContainer}>
        <View style={[styles.phaseBadge, isPrep ? styles.prepBadge : styles.performBadge]}>
          {!isPrep && <AlertTriangle size={14} color="#E57373" />}
          <Text style={[styles.phaseText, !isPrep && { color: '#E57373' }]}>
            {isPrep ? 'PREP TIME' : 'PERFORM'}
          </Text>
        </View>

        <Text style={styles.phaseInstruction}>
          {isPrep ? 'Study your sides' : 'Deliver your read'}
        </Text>

        <Animated.View style={[styles.timerCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={[styles.timerText, isLowTime && styles.timerTextWarning]}>
            {formatTime(timeLeft)}
          </Text>
        </Animated.View>

        <View style={styles.progressBarOuter}>
          <View style={[styles.progressBarInner, { width: `${progress * 100}%` as any }]} />
        </View>

        {sidesText && isPrep && (
          <ScrollView style={styles.sidesPreview} showsVerticalScrollIndicator={false}>
            <Text style={styles.sidesPreviewText}>{sidesText}</Text>
          </ScrollView>
        )}

        <View style={styles.timerControls}>
          <TouchableOpacity style={styles.timerControlBtn} onPress={handleReset}>
            <RotateCcw size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.timerPlayBtn} onPress={togglePause}>
            {isRunning ? <Pause size={28} color="#0F0F0F" /> : <Play size={28} color="#0F0F0F" />}
          </TouchableOpacity>
          <View style={{ width: 50 }} />
        </View>
      </View>
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
    paddingBottom: 40,
  },
  setupHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  setupIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,183,77,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  setupTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  setupSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  timeSetup: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.textPrimary,
  },
  timeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  timeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.accent,
    minWidth: 50,
    textAlign: 'center',
  },
  timeDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  textArea: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    minHeight: 120,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    lineHeight: 22,
  },
  startBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#0F0F0F',
  },
  timerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  phaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  prepBadge: {
    backgroundColor: 'rgba(232,168,56,0.15)',
  },
  performBadge: {
    backgroundColor: 'rgba(229,115,115,0.15)',
  },
  phaseText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.accent,
    letterSpacing: 1.5,
  },
  phaseInstruction: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.accent,
    marginBottom: 24,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '200' as const,
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  timerTextWarning: {
    color: '#E57373',
  },
  progressBarOuter: {
    width: '80%',
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBarInner: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  sidesPreview: {
    maxHeight: 150,
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  sidesPreviewText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  timerControlBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.card,
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
  doneContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  doneEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  doneTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  doneSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  resetBtnText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
});
