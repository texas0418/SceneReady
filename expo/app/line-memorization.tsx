import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Eye, RotateCcw, Brain } from 'lucide-react-native';
import Colors from '@/constants/colors';
import {
  parseScriptLines,
  extractCharacters,
  maskLine,
  ScriptLine,
} from '@/utils/scriptParser';

const LEVELS = [
  { value: 0, label: 'Full Text' },
  { value: 1, label: 'First Letters' },
  { value: 2, label: 'Blanks' },
] as const;

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ padding: 4 }}>
      <ChevronLeft size={24} color={Colors.accent} />
    </TouchableOpacity>
  );
}

export default function LineMemorization() {
  const router = useRouter();
  const [scriptText, setScriptText] = useState('');
  const [lines, setLines] = useState<ScriptLine[]>([]);
  const [characters, setCharacters] = useState<string[]>([]);
  const [myCharacter, setMyCharacter] = useState<string | null>(null);
  const [level, setLevel] = useState<number>(1);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [isSetup, setIsSetup] = useState(true);

  const handleParse = useCallback(() => {
    const parsed = parseScriptLines(scriptText);
    if (parsed.length === 0) {
      Alert.alert(
        'Could Not Read Script',
        'Put character names before their lines, like "SARAH: ..." or SARAH on its own line.'
      );
      return;
    }
    const chars = extractCharacters(parsed);
    setLines(parsed);
    setCharacters(chars);
    setMyCharacter(chars[0] ?? null);
    setRevealed(new Set());
    setLevel(1);
    setIsSetup(false);
  }, [scriptText]);

  const toggleReveal = useCallback((index: number) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const pickCharacter = useCallback((name: string) => {
    setMyCharacter(name);
    setRevealed(new Set());
  }, []);

  const changeLevel = useCallback((value: number) => {
    setLevel(value);
    setRevealed(new Set());
  }, []);

  const myLineCount = useMemo(
    () => lines.filter((l) => l.character === myCharacter).length,
    [lines, myCharacter]
  );

  if (isSetup) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Line Memorization',
            headerLeft: () => <BackButton onPress={() => router.back()} />,
          }}
        />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.setupHeader}>
            <View style={styles.setupIconWrap}>
              <Brain size={28} color={Colors.accent} />
            </View>
            <Text style={styles.setupTitle}>Drill Your Lines</Text>
            <Text style={styles.setupSubtitle}>
              Paste a scene, choose your character, then hide your lines a little more each pass until you have them cold.
            </Text>
          </View>

          <Text style={styles.inputLabel}>Paste Your Scene</Text>
          <TextInput
            style={styles.textArea}
            placeholder={'SARAH: I can\'t believe you said that.\nDAVID: I know. I\'m sorry.\nSARAH: Sorry isn\'t enough this time.'}
            placeholderTextColor={Colors.textMuted}
            value={scriptText}
            onChangeText={setScriptText}
            multiline
            textAlignVertical="top"
            testID="memorization-script-input"
          />

          <TouchableOpacity style={styles.startBtn} onPress={handleParse} activeOpacity={0.85}>
            <Text style={styles.startBtnText}>Load Scene</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Line Memorization',
          headerLeft: () => <BackButton onPress={() => router.back()} />,
        }}
      />

      <View style={styles.controlsHeader}>
        <Text style={styles.controlsLabel}>Your Character</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.charScroll}>
          <View style={styles.charRow}>
            {characters.map((name) => (
              <TouchableOpacity
                key={name}
                style={[styles.charChip, myCharacter === name && styles.charChipActive]}
                onPress={() => pickCharacter(name)}
              >
                <Text style={[styles.charChipText, myCharacter === name && styles.charChipTextActive]}>
                  {name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.levelRow}>
          {LEVELS.map((lvl) => (
            <TouchableOpacity
              key={lvl.value}
              style={[styles.levelBtn, level === lvl.value && styles.levelBtnActive]}
              onPress={() => changeLevel(lvl.value)}
            >
              <Text style={[styles.levelBtnText, level === lvl.value && styles.levelBtnTextActive]}>
                {lvl.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{myLineCount} of your lines · tap a hidden line to peek</Text>
          {revealed.size > 0 && (
            <TouchableOpacity style={styles.resetPeek} onPress={() => setRevealed(new Set())}>
              <RotateCcw size={13} color={Colors.accent} />
              <Text style={styles.resetPeekText}>Hide all</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.linesContent}>
        {lines.map((line, index) => {
          const isMine = line.character === myCharacter;
          const isRevealed = revealed.has(index);
          const shouldMask = isMine && level > 0 && !isRevealed;
          const display = shouldMask ? maskLine(line.line, level) : line.line;

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={isMine ? 0.7 : 1}
              onPress={isMine ? () => toggleReveal(index) : undefined}
              style={[styles.lineCard, isMine && styles.myLineCard]}
            >
              <View style={styles.lineHeader}>
                <Text style={[styles.charName, isMine ? styles.myName : styles.otherName]}>
                  {line.character}
                </Text>
                {isMine && shouldMask && <Eye size={14} color={Colors.textMuted} />}
              </View>
              <Text style={[styles.lineText, shouldMask && styles.lineTextMasked]}>{display}</Text>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() => {
            setIsSetup(true);
            setLines([]);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.newBtnText}>New Scene</Text>
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
    paddingBottom: 40,
  },
  setupHeader: {
    alignItems: 'center',
    marginBottom: 28,
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
    paddingHorizontal: 10,
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
    minHeight: 220,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    lineHeight: 22,
  },
  startBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#0F0F0F',
  },
  controlsHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  controlsLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  charScroll: {
    marginHorizontal: -4,
  },
  charRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  charChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  charChipActive: {
    backgroundColor: Colors.spotlightStrong,
    borderColor: Colors.accent,
  },
  charChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  charChipTextActive: {
    color: Colors.accent,
  },
  levelRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  levelBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  levelBtnActive: {
    backgroundColor: Colors.spotlightStrong,
    borderColor: Colors.accent,
  },
  levelBtnText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  levelBtnTextActive: {
    color: Colors.accent,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
    flex: 1,
  },
  resetPeek: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resetPeekText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  linesContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  lineCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  myLineCard: {
    borderLeftColor: Colors.accent,
  },
  lineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  charName: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  myName: {
    color: Colors.accent,
  },
  otherName: {
    color: '#64B5F6',
  },
  lineText: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  lineTextMasked: {
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  footer: {
    paddingVertical: 14,
    paddingBottom: 34,
    paddingHorizontal: 20,
    backgroundColor: Colors.backgroundLight,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  newBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.card,
  },
  newBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
});
