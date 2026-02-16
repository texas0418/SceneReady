import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { Stack } from 'expo-router';
import * as Speech from 'expo-speech';
import {
  Play,
  Pause,
  SkipForward,
  Settings,
  UserPlus,
  FileText,
  Plus,
  X,
  Mic,
  ChevronRight,
  Volume2,
  Check,
} from 'lucide-react-native';
import Colors from '@/constants/colors';

interface SceneLine {
  character: string;
  line: string;
}

interface VoiceInfo {
  identifier: string;
  name: string;
  language: string;
  quality: string;
}

const PARTNER_COLORS = [
  { bg: 'rgba(100,181,246,0.15)', text: '#64B5F6' },
  { bg: 'rgba(129,199,132,0.15)', text: '#81C784' },
  { bg: 'rgba(206,147,216,0.15)', text: '#CE93D8' },
  { bg: 'rgba(255,138,101,0.15)', text: '#FF8A65' },
  { bg: 'rgba(77,208,225,0.15)', text: '#4DD0E1' },
  { bg: 'rgba(240,98,146,0.15)', text: '#F06292' },
  { bg: 'rgba(174,213,129,0.15)', text: '#AED581' },
  { bg: 'rgba(149,117,205,0.15)', text: '#9575CD' },
];

const getVoiceQualityTier = (voice: any): string => {
  const q = voice.quality || '';
  const name = (voice.name || '').toLowerCase();
  const id = (voice.identifier || '').toLowerCase();

  if (q === 'Enhanced' || id.includes('premium') || id.includes('enhanced')) return 'premium';
  if (name.includes('siri') || id.includes('siri')) return 'premium';
  if (id.includes('compact')) return 'default';
  return 'standard';
};

const getQualityLabel = (tier: string): string => {
  if (tier === 'premium') return '★ Premium';
  if (tier === 'standard') return 'Standard';
  return 'Default';
};

const getQualityColor = (tier: string): string => {
  if (tier === 'premium') return Colors.accent;
  if (tier === 'standard') return Colors.textSecondary;
  return Colors.textMuted;
};

export default function AIScenePartner() {
  const [scriptText, setScriptText] = useState('');
  const [yourCharacter, setYourCharacter] = useState('');
  const [partnerCharacters, setPartnerCharacters] = useState<string[]>(['']);
  const [partnerVoices, setPartnerVoices] = useState<{ [key: number]: string }>({});
  const [parsedLines, setParsedLines] = useState<SceneLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.9);
  const [showSettings, setShowSettings] = useState(false);
  const [isSetup, setIsSetup] = useState(true);

  const [availableVoices, setAvailableVoices] = useState<VoiceInfo[]>([]);
  const [voicePickerVisible, setVoicePickerVisible] = useState(false);
  const [voicePickerIndex, setVoicePickerIndex] = useState(0);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      const englishVoices = voices
        .filter((v: any) => {
          const lang = (v.language || '').toLowerCase();
          return lang.startsWith('en');
        })
        .map((v: any) => ({
          identifier: v.identifier,
          name: v.name || v.identifier,
          language: v.language,
          quality: getVoiceQualityTier(v),
        }))
        .sort((a: VoiceInfo, b: VoiceInfo) => {
          const order: { [key: string]: number } = { premium: 0, standard: 1, default: 2 };
          return (order[a.quality] || 2) - (order[b.quality] || 2);
        });

      setAvailableVoices(englishVoices);

      // Auto-assign premium voices to partners if available
      const premiumVoices = englishVoices.filter((v: VoiceInfo) => v.quality === 'premium');
      if (premiumVoices.length > 0) {
        const autoAssign: { [key: number]: string } = {};
        for (let i = 0; i < 8; i++) {
          autoAssign[i] = premiumVoices[i % premiumVoices.length].identifier;
        }
        setPartnerVoices(autoAssign);
      }
    } catch (e) {
      console.log('Could not load voices', e);
    }
  };

  const addPartner = () => {
    if (partnerCharacters.length >= 8) {
      Alert.alert('Limit Reached', 'You can add up to 8 scene partners.');
      return;
    }
    setPartnerCharacters([...partnerCharacters, '']);
  };

  const removePartner = (index: number) => {
    if (partnerCharacters.length <= 1) return;
    setPartnerCharacters(partnerCharacters.filter((_, i) => i !== index));
    const newVoices: { [key: number]: string } = {};
    Object.keys(partnerVoices).forEach((k) => {
      const ki = parseInt(k);
      if (ki < index) newVoices[ki] = partnerVoices[ki];
      else if (ki > index) newVoices[ki - 1] = partnerVoices[ki];
    });
    setPartnerVoices(newVoices);
  };

  const updatePartner = (index: number, value: string) => {
    const updated = [...partnerCharacters];
    updated[index] = value;
    setPartnerCharacters(updated);
  };

  const getPartnerColor = (characterName: string) => {
    const index = partnerCharacters.findIndex(
      (p) => p.trim().toUpperCase() === characterName.trim().toUpperCase()
    );
    return PARTNER_COLORS[index >= 0 ? index % PARTNER_COLORS.length : 0];
  };

  const getPartnerVoiceId = (characterName: string): string | undefined => {
    const index = partnerCharacters.findIndex(
      (p) => p.trim().toUpperCase() === characterName.trim().toUpperCase()
    );
    return index >= 0 ? partnerVoices[index] : undefined;
  };

  const getVoiceDisplayName = (index: number): string => {
    const voiceId = partnerVoices[index];
    if (!voiceId) return 'Default Voice';
    const voice = availableVoices.find((v) => v.identifier === voiceId);
    if (!voice) return 'Default Voice';
    let name = voice.name;
    name = name.replace(/^com\.apple\.(speech\.synthesis\.voice|voice)\./, '');
    if (name.length > 25) name = name.substring(0, 22) + '...';
    return name;
  };

  const openVoicePicker = (partnerIndex: number) => {
    setVoicePickerIndex(partnerIndex);
    setVoicePickerVisible(true);
  };

  const selectVoice = (voiceId: string) => {
    setPartnerVoices({ ...partnerVoices, [voicePickerIndex]: voiceId });
    setVoicePickerVisible(false);
  };

  const previewVoice = (voiceId: string) => {
    Speech.stop();
    setPreviewingVoice(voiceId);
    const sampleText = 'I need to tell you something important.';
    Speech.speak(sampleText, {
      voice: voiceId,
      rate: speechRate,
      onDone: () => setPreviewingVoice(null),
      onError: () => setPreviewingVoice(null),
    });
  };

  const parseScript = useCallback(() => {
    const filledPartners = partnerCharacters.filter((p) => p.trim());

    if (!scriptText.trim() || !yourCharacter.trim() || filledPartners.length === 0) {
      Alert.alert('Missing Info', 'Please paste your sides and enter all character names.');
      return;
    }

    const lines: SceneLine[] = [];
    const scriptLines = scriptText.split('\n').filter((l) => l.trim());
    const yourName = yourCharacter.trim().toUpperCase();
    const partnerNames = filledPartners.map((p) => p.trim().toUpperCase());
    const allCharNames = [yourName, ...partnerNames];

    let currentChar = '';
    let currentLine = '';

    for (const line of scriptLines) {
      const trimmed = line.trim();
      const upper = trimmed.toUpperCase();

      let matchedChar = '';
      for (const charName of allCharNames) {
        if (upper.startsWith(charName + ':') || upper.startsWith(charName + ' :')) {
          matchedChar = charName;
          break;
        }
      }

      if (matchedChar) {
        if (currentChar && currentLine) {
          lines.push({ character: currentChar, line: currentLine.trim() });
        }
        if (matchedChar === yourName) {
          currentChar = yourCharacter.trim();
        } else {
          const partnerIndex = partnerNames.indexOf(matchedChar);
          currentChar = filledPartners[partnerIndex];
        }
        currentLine = trimmed.substring(trimmed.indexOf(':') + 1).trim();
      } else if (currentChar) {
        currentLine += ' ' + trimmed;
      }
    }

    if (currentChar && currentLine) {
      lines.push({ character: currentChar, line: currentLine.trim() });
    }

    if (lines.length === 0) {
      Alert.alert(
        'Could Not Parse',
        'Make sure your script uses the format:\nCHARACTER: Line of dialogue'
      );
      return;
    }

    setParsedLines(lines);
    setCurrentLineIndex(0);
    setIsSetup(false);
  }, [scriptText, yourCharacter, partnerCharacters]);

  const speakLine = useCallback(
    (index: number) => {
      if (index >= parsedLines.length) {
        setIsPlaying(false);
        setCurrentLineIndex(0);
        return;
      }

      const line = parsedLines[index];
      setCurrentLineIndex(index);

      if (line.character.toUpperCase() === yourCharacter.trim().toUpperCase()) {
        setIsPlaying(false);
        return;
      }

      setIsPlaying(true);
      const voiceId = getPartnerVoiceId(line.character);

      const speechOptions: any = {
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
      };

      if (voiceId) {
        speechOptions.voice = voiceId;
      }

      Speech.speak(line.line, speechOptions);
    },
    [parsedLines, yourCharacter, speechRate, partnerVoices, partnerCharacters]
  );

  const handlePlay = () => {
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
    } else {
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
    setIsSetup(true);
    setParsedLines([]);
    setCurrentLineIndex(0);
  };

  const filledPartners = partnerCharacters.filter((p) => p.trim());
  const partnerSummary = filledPartners.length > 0 ? filledPartners.join(', ') : '';
  const premiumCount = availableVoices.filter((v) => v.quality === 'premium').length;

  const renderVoicePicker = () => (
    <Modal
      visible={voicePickerVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => {
        Speech.stop();
        setPreviewingVoice(null);
        setVoicePickerVisible(false);
      }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Choose Voice</Text>
          <TouchableOpacity
            onPress={() => {
              Speech.stop();
              setPreviewingVoice(null);
              setVoicePickerVisible(false);
            }}
          >
            <X size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {premiumCount > 0 && (
          <View style={styles.voiceHint}>
            <Mic size={14} color={Colors.accent} />
            <Text style={styles.voiceHintText}>
              ★ Premium voices use enhanced Siri voices for more natural speech.
              {Platform.OS === 'ios'
                ? ' Download more in Settings → Accessibility → Spoken Content → Voices.'
                : ''}
            </Text>
          </View>
        )}

        <FlatList
          data={availableVoices}
          keyExtractor={(item) => item.identifier}
          contentContainerStyle={styles.voiceList}
          renderItem={({ item }) => {
            const isSelected = partnerVoices[voicePickerIndex] === item.identifier;
            const isPreviewing = previewingVoice === item.identifier;

            return (
              <TouchableOpacity
                style={[styles.voiceRow, isSelected && styles.voiceRowSelected]}
                onPress={() => selectVoice(item.identifier)}
                activeOpacity={0.7}
              >
                <View style={styles.voiceInfo}>
                  <View style={styles.voiceNameRow}>
                    <Text style={[styles.voiceName, isSelected && styles.voiceNameSelected]}>
                      {item.name}
                    </Text>
                    {isSelected && <Check size={16} color={Colors.accent} />}
                  </View>
                  <View style={styles.voiceMeta}>
                    <Text style={[styles.voiceQuality, { color: getQualityColor(item.quality) }]}>
                      {getQualityLabel(item.quality)}
                    </Text>
                    <Text style={styles.voiceLang}>{item.language}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.previewBtn, isPreviewing && styles.previewBtnActive]}
                  onPress={() => previewVoice(item.identifier)}
                  activeOpacity={0.7}
                >
                  <Volume2 size={16} color={isPreviewing ? Colors.accent : Colors.textSecondary} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyVoices}>
              <Text style={styles.emptyVoicesText}>No English voices found on this device.</Text>
            </View>
          }
        />
      </View>
    </Modal>
  );

  if (isSetup) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'AI Scene Partner' }} />
        {renderVoicePicker()}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.setupHeader}>
            <View style={styles.setupIconWrap}>
              <UserPlus size={28} color={Colors.accent} />
            </View>
            <Text style={styles.setupTitle}>Set Up Your Scene</Text>
            <Text style={styles.setupSubtitle}>
              Paste your sides below and assign character names. The AI will read all scene partner lines.
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

          <View style={styles.partnersHeader}>
            <Text style={styles.inputLabel}>Scene Partners</Text>
            <TouchableOpacity style={styles.addPartnerBtn} onPress={addPartner} activeOpacity={0.7}>
              <Plus size={14} color={Colors.accent} />
              <Text style={styles.addPartnerText}>Add Partner</Text>
            </TouchableOpacity>
          </View>

          {partnerCharacters.map((partner, index) => (
            <View key={index} style={styles.partnerBlock}>
              <View style={styles.partnerRow}>
                <View
                  style={[
                    styles.partnerColorDot,
                    { backgroundColor: PARTNER_COLORS[index % PARTNER_COLORS.length].text },
                  ]}
                />
                <TextInput
                  style={styles.partnerInput}
                  placeholder={`Partner ${index + 1} name, e.g., ${
                    ['David', 'Maria', 'James', 'Emily', 'Chen', 'Alex', 'Rosa', 'Marcus'][index] || 'Character'
                  }`}
                  placeholderTextColor={Colors.textMuted}
                  value={partner}
                  onChangeText={(val) => updatePartner(index, val)}
                />
                {partnerCharacters.length > 1 && (
                  <TouchableOpacity
                    style={styles.removePartnerBtn}
                    onPress={() => removePartner(index)}
                    activeOpacity={0.7}
                  >
                    <X size={16} color={Colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
              {availableVoices.length > 0 && (
                <TouchableOpacity
                  style={styles.voiceSelector}
                  onPress={() => openVoicePicker(index)}
                  activeOpacity={0.7}
                >
                  <Mic size={14} color={PARTNER_COLORS[index % PARTNER_COLORS.length].text} />
                  <Text style={styles.voiceSelectorText} numberOfLines={1}>
                    {getVoiceDisplayName(index)}
                  </Text>
                  <ChevronRight size={14} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          ))}

          <Text style={[styles.inputLabel, { marginTop: 24 }]}>Paste Your Sides</Text>
          <TextInput
            style={styles.textArea}
            placeholder={"SARAH: I can't believe you said that.\nDAVID: I know. I'm sorry.\nMARIA: He didn't mean it, Sarah.\nSARAH: Stay out of this, Maria."}
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
              Format your script with character names followed by a colon.{'\n'}
              Example: CHARACTER: Their dialogue here.{'\n'}
              Tap the voice selector to assign different voices to each partner.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'AI Scene Partner' }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.sceneHeader}>
          <Text style={styles.sceneInfo}>
            {parsedLines.length} lines · {yourCharacter}{filledPartners.length > 0 ? ` & ${partnerSummary}` : ''}
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
            const partnerColor = !isYours ? getPartnerColor(line.character) : null;

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
                      isYours
                        ? styles.yourBadge
                        : { backgroundColor: partnerColor?.bg || 'rgba(100,181,246,0.15)' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.characterName,
                        isYours
                          ? styles.yourName
                          : { color: partnerColor?.text || '#64B5F6' },
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
  partnersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addPartnerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.spotlightStrong,
  },
  addPartnerText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  partnerBlock: {
    marginBottom: 12,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  partnerColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  partnerInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  removePartnerBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  voiceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    marginLeft: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  voiceSelectorText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
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
    flex: 1,
    marginRight: 8,
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
  characterName: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  yourName: {
    color: Colors.accent,
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
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  voiceHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    margin: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: Colors.spotlightStrong,
  },
  voiceHintText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  voiceList: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 4,
  },
  voiceRowSelected: {
    backgroundColor: Colors.spotlightStrong,
  },
  voiceInfo: {
    flex: 1,
  },
  voiceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceName: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500' as const,
  },
  voiceNameSelected: {
    color: Colors.accent,
    fontWeight: '600' as const,
  },
  voiceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  voiceQuality: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  voiceLang: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  previewBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewBtnActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.spotlightStrong,
  },
  emptyVoices: {
    padding: 40,
    alignItems: 'center',
  },
  emptyVoicesText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
