import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import {
  Play,
  Pause,
  SkipForward,
  Settings,
  UserPlus,
  FileText,
  ChevronLeft,
} from 'lucide-react-native';
import Colors from '@/constants/colors';

interface SceneLine {
  character: string;
  line: string;
}

export default function AIScenePartner() {
  const router = useRouter();
  const [scriptText, setScriptText] = useState('');
  const [yourCharacter, setYourCharacter] = useState('');
  const [partnerCharacter, setPartnerCharacter] = useState('');
  const [parsedLines, setParsedLines] = useState<SceneLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayedCurrent, setHasPlayedCurrent] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [showSettings, setShowSettings] = useState(false);
  const [isSetup, setIsSetup] = useState(true);

  const parseScript = useCallback(() => {
    if (!scriptText.trim() || !yourCharacter.trim() || !partnerCharacter.trim()) {
      Alert.alert('Missing Info', 'Please paste your sides and enter both character names.');
      return;
    }

    const lines: SceneLine[] = [];
    const rawLines = scriptText.split('\n');
    const yourName = yourCharacter.trim().toUpperCase();
    const partnerName = partnerCharacter.trim().toUpperCase();

    let currentChar = '';
    let currentLine = '';

    // Build flexible matchers: match the name the user typed OR the name as it appears in script
    // Collect all unique uppercase "name-like" lines from the script (short lines, likely character names)
    const allNames = new Set<string>();
    for (const raw of rawLines) {
      const t = raw.trim();
      // A line that looks like a character name: short, no punctuation except maybe a colon
      if (t.length > 0 && t.length <= 30) {
        const nameCandidate = t.replace(/:$/, '').trim().toUpperCase();
        if (nameCandidate === yourName || nameCandidate === partnerName) {
          allNames.add(nameCandidate);
        }
        // Also check if the script uses a similar but different spelling
        // e.g., user typed "Louis" but script has "LOUIE"
      }
    }

    // Helper: does this line represent a character cue?
    const matchesYou = (upper: string): boolean => {
      // Exact: "BENNY:" or "BENNY :" or standalone "BENNY"
      if (upper === yourName) return true;
      if (upper.startsWith(yourName + ':') || upper.startsWith(yourName + ' :')) return true;
      return false;
    };

    const matchesPartner = (upper: string): boolean => {
      if (upper === partnerName) return true;
      if (upper.startsWith(partnerName + ':') || upper.startsWith(partnerName + ' :')) return true;
      return false;
    };

    // Also detect character names by scanning script for all-caps short lines
    // that appear multiple times (likely character cues)
    const nameCounts = new Map<string, number>();
    for (const raw of rawLines) {
      const t = raw.trim();
      if (t.length > 0 && t.length <= 25 && /^[A-Z][A-Z\s.''-]*$/.test(t)) {
        const key = t.replace(/:$/, '').trim();
        nameCounts.set(key, (nameCounts.get(key) || 0) + 1);
      }
    }

    // Find the script name that best matches each user-entered name
    const findScriptName = (userName: string): string[] => {
      const results = [userName];
      for (const [scriptName] of nameCounts) {
        const sUpper = scriptName.toUpperCase();
        if (sUpper === userName) continue;
        // Fuzzy: first 3+ chars match, or one contains the other
        if (userName.length >= 3 && sUpper.length >= 3) {
          if (sUpper.startsWith(userName.substring(0, 3)) || userName.startsWith(sUpper.substring(0, 3))) {
            results.push(sUpper);
          }
        }
        if (sUpper.includes(userName) || userName.includes(sUpper)) {
          results.push(sUpper);
        }
      }
      return [...new Set(results)];
    };

    const yourNames = findScriptName(yourName);
    const partnerNames = findScriptName(partnerName);

    const matchesAnyYou = (upper: string): boolean => {
      for (const name of yourNames) {
        if (upper === name) return true;
        if (upper.startsWith(name + ':') || upper.startsWith(name + ' :')) return true;
      }
      return false;
    };

    const matchesAnyPartner = (upper: string): boolean => {
      for (const name of partnerNames) {
        if (upper === name) return true;
        if (upper.startsWith(name + ':') || upper.startsWith(name + ' :')) return true;
      }
      return false;
    };

    const getDialogueAfterName = (trimmed: string): string => {
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx !== -1) {
        return trimmed.substring(colonIdx + 1).trim();
      }
      return '';
    };

    for (const raw of rawLines) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      const upper = trimmed.toUpperCase();

      // Skip pure stage directions in parentheses
      if (/^\(.*\)$/.test(trimmed)) continue;

      if (matchesAnyYou(upper)) {
        if (currentChar && currentLine) {
          lines.push({ character: currentChar, line: currentLine.trim() });
        }
        currentChar = yourCharacter.trim();
        currentLine = getDialogueAfterName(trimmed);
      } else if (matchesAnyPartner(upper)) {
        if (currentChar && currentLine) {
          lines.push({ character: currentChar, line: currentLine.trim() });
        }
        currentChar = partnerCharacter.trim();
        currentLine = getDialogueAfterName(trimmed);
      } else if (currentChar) {
        // Skip lines that look like stage directions:
        // - Entire line in parentheses: "(They sit down.)"
        // - Line mentions multiple character names as action: "Benny and Louie drink Hennessy."
        const isLikelyStageDirection = (() => {
          // Contains two or more known character names — probably an action line
          const upperTrimmed = trimmed.toUpperCase();
          let nameHits = 0;
          for (const name of [...yourNames, ...partnerNames]) {
            if (upperTrimmed.includes(name)) nameHits++;
          }
          if (nameHits >= 2) return true;
          return false;
        })();

        if (isLikelyStageDirection) continue;

        // Strip ALL inline stage directions like "(then)", "(beat)", "(a moment)"
        const cleaned = trimmed.replace(/\(.*?\)/g, '').trim();
        if (cleaned) {
          currentLine += (currentLine ? ' ' : '') + cleaned;
        }
      }
    }

    if (currentChar && currentLine) {
      lines.push({ character: currentChar, line: currentLine.trim() });
    }

    if (lines.length === 0) {
      Alert.alert(
        'Could Not Parse',
        'Make sure character names appear before their lines. Supported formats:\n\nCHARACTER: Line of dialogue\n\nor\n\nCHARACTER\nLine of dialogue'
      );
      return;
    }

    setParsedLines(lines);
    setCurrentLineIndex(0);
    setIsSetup(false);
  }, [scriptText, yourCharacter, partnerCharacter]);

  const speakLine = useCallback(
    (index: number) => {
      if (index >= parsedLines.length) {
        setIsPlaying(false);
        setHasPlayedCurrent(false);
        setCurrentLineIndex(0);
        return;
      }

      const line = parsedLines[index];
      setCurrentLineIndex(index);
      setHasPlayedCurrent(true);

      if (line.character.toUpperCase() === yourCharacter.trim().toUpperCase()) {
        setIsPlaying(false);
        return;
      }

      setIsPlaying(true);
      Speech.speak(line.line, {
        rate: speechRate,
        pitch: 1.0,
        onDone: () => {
          const nextIndex = index + 1;
          if (nextIndex < parsedLines.length) {
            speakLine(nextIndex);
          } else {
            setIsPlaying(false);
          }
        },
        onError: () => {
          setIsPlaying(false);
        },
      });
    },
    [parsedLines, yourCharacter, speechRate]
  );

  const handlePlay = () => {
    if (isPlaying) {
      // Currently speaking — pause
      Speech.stop();
      setIsPlaying(false);
    } else if (hasPlayedCurrent && currentLineIndex < parsedLines.length - 1) {
      // Current line already played/read — advance to next
      const next = currentLineIndex + 1;
      setHasPlayedCurrent(false);
      setCurrentLineIndex(next);
      speakLine(next);
    } else {
      // First play or replay last line
      speakLine(currentLineIndex);
    }
  };

  const handleNext = () => {
    Speech.stop();
    setIsPlaying(false);
    const next = Math.min(currentLineIndex + 1, parsedLines.length - 1);
    setCurrentLineIndex(next);
    speakLine(next);
  };

  const handleReset = () => {
    Speech.stop();
    setIsPlaying(false);
    setHasPlayedCurrent(false);
    setIsSetup(true);
    setParsedLines([]);
    setCurrentLineIndex(0);
  };

  if (isSetup) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{
        title: 'AI Scene Partner',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <ChevronLeft size={24} color={Colors.accent} />
          </TouchableOpacity>
        ),
      }} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.setupHeader}>
            <View style={styles.setupIconWrap}>
              <UserPlus size={28} color={Colors.accent} />
            </View>
            <Text style={styles.setupTitle}>Set Up Your Scene</Text>
            <Text style={styles.setupSubtitle}>
              Paste your sides below and assign character names. The AI will read your scene partner's lines.
            </Text>
          </View>

          <Text style={styles.inputLabel}>Your Character Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Sarah"
            placeholderTextColor={Colors.textMuted}
            value={yourCharacter}
            onChangeText={setYourCharacter}
            testID="your-character-input"
          />

          <Text style={styles.inputLabel}>Scene Partner's Character Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., David"
            placeholderTextColor={Colors.textMuted}
            value={partnerCharacter}
            onChangeText={setPartnerCharacter}
            testID="partner-character-input"
          />

          <Text style={styles.inputLabel}>Paste Your Sides</Text>
          <TextInput
            style={styles.textArea}
            placeholder={"SARAH: I can't believe you said that.\nDAVID: I know. I'm sorry.\nSARAH: Sorry isn't enough this time."}
            placeholderTextColor={Colors.textMuted}
            value={scriptText}
            onChangeText={setScriptText}
            multiline
            textAlignVertical="top"
            testID="script-input"
          />

          <TouchableOpacity style={styles.startBtn} onPress={parseScript} activeOpacity={0.85}>
            <Text style={styles.startBtnText}>Start Scene</Text>
          </TouchableOpacity>

          <View style={styles.tipCard}>
            <FileText size={16} color={Colors.textSecondary} />
            <Text style={styles.tipText}>
              Format your script with character names before their dialogue.{'\n'}
              Works with "NAME: dialogue" or name on its own line.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{
        title: 'AI Scene Partner',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <ChevronLeft size={24} color={Colors.accent} />
          </TouchableOpacity>
        ),
      }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.sceneHeader}>
          <Text style={styles.sceneInfo}>
            {parsedLines.length} lines · {yourCharacter} & {partnerCharacter}
          </Text>
          <TouchableOpacity onPress={() => setShowSettings(!showSettings)}>
            <Settings size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {showSettings && (
          <View style={styles.settingsCard}>
            <Text style={styles.settingsLabel}>Speech Rate</Text>
            <View style={styles.rateOptions}>
              {[0.6, 0.8, 0.9, 1.0, 1.2].map((rate) => (
                <TouchableOpacity
                  key={rate}
                  style={[styles.rateBtn, speechRate === rate && styles.rateBtnActive]}
                  onPress={() => setSpeechRate(rate)}
                >
                  <Text
                    style={[styles.rateBtnText, speechRate === rate && styles.rateBtnTextActive]}
                  >
                    {rate}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.linesContainer}>
          {parsedLines.map((line, index) => {
            const isYours = line.character.toUpperCase() === yourCharacter.trim().toUpperCase();
            const isCurrent = index === currentLineIndex;
            const isPast = index < currentLineIndex;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.lineCard,
                  isCurrent && styles.lineCardCurrent,
                  isPast && styles.lineCardPast,
                ]}
                onPress={() => {
                  Speech.stop();
                  setIsPlaying(false);
                  setCurrentLineIndex(index);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.lineHeader}>
                  <View
                    style={[
                      styles.characterBadge,
                      isYours ? styles.yourBadge : styles.partnerBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.characterName,
                        isYours ? styles.yourName : styles.partnerName,
                      ]}
                    >
                      {line.character}
                    </Text>
                  </View>
                  {isYours && <Text style={styles.yourTurn}>YOUR LINE</Text>}
                </View>
                <Text style={[styles.lineText, isPast && styles.lineTextPast]}>
                  {line.line}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.8}>
          <Text style={styles.resetBtnText}>New Scene</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.playBtn} onPress={handlePlay} activeOpacity={0.85}>
          {isPlaying ? <Pause size={24} color="#0F0F0F" /> : <Play size={24} color="#0F0F0F" />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.8}>
          <SkipForward size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
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
    paddingBottom: 120,
  },
  setupHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  setupIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.spotlightStrong,
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
    paddingHorizontal: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    minHeight: 180,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    lineHeight: 22,
  },
  startBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#0F0F0F',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  sceneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sceneInfo: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  settingsCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  settingsLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  rateOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  rateBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rateBtnActive: {
    backgroundColor: Colors.spotlightStrong,
    borderColor: Colors.accent,
  },
  rateBtnText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  rateBtnTextActive: {
    color: Colors.accent,
  },
  linesContainer: {
    gap: 8,
  },
  lineCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  lineCardCurrent: {
    borderLeftColor: Colors.accent,
    backgroundColor: Colors.spotlightStrong,
  },
  lineCardPast: {
    opacity: 0.5,
  },
  lineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  characterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  yourBadge: {
    backgroundColor: 'rgba(232,168,56,0.15)',
  },
  partnerBadge: {
    backgroundColor: 'rgba(100,181,246,0.15)',
  },
  characterName: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  yourName: {
    color: Colors.accent,
  },
  partnerName: {
    color: '#64B5F6',
  },
  yourTurn: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.accent,
    letterSpacing: 1,
  },
  lineText: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  lineTextPast: {
    color: Colors.textMuted,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingBottom: 40,
    backgroundColor: Colors.backgroundLight,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  resetBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.card,
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
