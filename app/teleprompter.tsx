import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  X,
  Minus,
  Plus,
  FlipHorizontal,
} from 'lucide-react-native';
import Colors from '@/constants/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Teleprompter() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [scriptText, setScriptText] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(3);
  const [fontSize, setFontSize] = useState(32);
  const [isMirrored, setIsMirrored] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollPosition = useRef(0);

  const startScrolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      scrollPosition.current += speed * 0.5;
      scrollRef.current?.scrollTo({ y: scrollPosition.current, animated: false });
    }, 16);
  }, [speed]);

  const stopScrolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startScrolling();
    } else {
      stopScrolling();
    }
    return () => stopScrolling();
  }, [isPlaying, startScrolling, stopScrolling]);

  const handleStart = () => {
    if (!scriptText.trim()) return;
    setIsEditing(false);
    scrollPosition.current = 0;
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const handleReset = () => {
    setIsPlaying(false);
    scrollPosition.current = 0;
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  if (isEditing) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.editHeader}>
          <TouchableOpacity onPress={() => router.back()}>
            <X size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.editTitle}>Teleprompter</Text>
          <TouchableOpacity
            style={[styles.goBtn, !scriptText.trim() && styles.goBtnDisabled]}
            onPress={handleStart}
            disabled={!scriptText.trim()}
          >
            <Text style={[styles.goBtnText, !scriptText.trim() && styles.goBtnTextDisabled]}>
              Start
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.editInput}
          placeholder="Paste your script here..."
          placeholderTextColor={Colors.textMuted}
          value={scriptText}
          onChangeText={setScriptText}
          multiline
          textAlignVertical="top"
          autoFocus
          testID="teleprompter-input"
        />
      </View>
    );
  }

  return (
    <View style={styles.prompterContainer}>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={() => setShowControls(!showControls)}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.prompterScroll}
          contentContainerStyle={[
            styles.prompterContent,
            { paddingTop: SCREEN_HEIGHT * 0.4, paddingBottom: SCREEN_HEIGHT * 0.6 },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={(e) => {
            scrollPosition.current = e.nativeEvent.contentOffset.y;
          }}
        >
          <Text
            style={[
              styles.prompterText,
              { fontSize },
              isMirrored && styles.mirroredText,
            ]}
          >
            {scriptText}
          </Text>
        </ScrollView>

        <View style={[styles.guideLine, { top: SCREEN_HEIGHT * 0.35 }]} />
      </TouchableOpacity>

      {showControls && (
        <>
          <View style={[styles.topControls, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity
              onPress={() => {
                setIsPlaying(false);
                setIsEditing(true);
              }}
            >
              <X size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowSettings(!showSettings)}>
              <Settings size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {showSettings && (
            <View style={styles.settingsPanel}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Speed</Text>
                <View style={styles.settingControls}>
                  <TouchableOpacity onPress={() => setSpeed(Math.max(1, speed - 1))}>
                    <Minus size={18} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.settingValue}>{speed}</Text>
                  <TouchableOpacity onPress={() => setSpeed(Math.min(10, speed + 1))}>
                    <Plus size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Font Size</Text>
                <View style={styles.settingControls}>
                  <TouchableOpacity onPress={() => setFontSize(Math.max(16, fontSize - 4))}>
                    <Minus size={18} color="#fff" />
                  </TouchableOpacity>
                  <Text style={styles.settingValue}>{fontSize}</Text>
                  <TouchableOpacity onPress={() => setFontSize(Math.min(60, fontSize + 4))}>
                    <Plus size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.mirrorBtn, isMirrored && styles.mirrorBtnActive]}
                onPress={() => setIsMirrored(!isMirrored)}
              >
                <FlipHorizontal size={18} color={isMirrored ? Colors.accent : '#fff'} />
                <Text style={[styles.mirrorBtnText, isMirrored && styles.mirrorBtnTextActive]}>
                  Mirror Mode
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 16 }]}>
            <TouchableOpacity style={styles.controlBtn} onPress={handleReset}>
              <RotateCcw size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.playBtnLarge}
              onPress={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={28} color="#000" /> : <Play size={28} color="#000" />}
            </TouchableOpacity>
            <View style={styles.speedBadge}>
              <Text style={styles.speedBadgeText}>{speed}x</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  goBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  goBtnDisabled: {
    backgroundColor: Colors.border,
  },
  goBtnText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#0F0F0F',
  },
  goBtnTextDisabled: {
    color: Colors.textMuted,
  },
  editInput: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  prompterContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  prompterScroll: {
    flex: 1,
  },
  prompterContent: {
    paddingHorizontal: 24,
  },
  prompterText: {
    color: '#fff',
    lineHeight: 48,
    fontWeight: '400' as const,
  },
  mirroredText: {
    transform: [{ scaleX: -1 }],
  },
  guideLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(232,168,56,0.5)',
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  settingsPanel: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(30,30,32,0.95)',
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500' as const,
  },
  settingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.accent,
    minWidth: 30,
    textAlign: 'center',
  },
  mirrorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 4,
  },
  mirrorBtnActive: {
    backgroundColor: Colors.spotlightStrong,
  },
  mirrorBtnText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#fff',
  },
  mirrorBtnTextActive: {
    color: Colors.accent,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingTop: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedBadgeText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#fff',
  },
});
