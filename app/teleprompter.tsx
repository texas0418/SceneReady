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
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  X,
  Minus,
  Plus,
  FlipHorizontal,
  FileUp,
  FileText,
  Type,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { extractTextFromPDF, isPDFFile } from '@/utils/pdfExtractor';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type InputMode = 'text' | 'document';

async function readFileContent(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    return '';
  }
  try {
    const { File } = await import('expo-file-system');
    const file = new File(uri);
    const content = await file.text();
    return content;
  } catch (error) {
    console.log('Error reading file with new API, trying legacy:', error);
    try {
      const FileSystemLegacy = await import('expo-file-system/legacy');
      const content = await FileSystemLegacy.readAsStringAsync(uri);
      return content;
    } catch (legacyError) {
      console.log('Error reading file with legacy API:', legacyError);
      throw legacyError;
    }
  }
}

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
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
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

  const handlePickDocument = useCallback(async () => {
    try {
      setIsLoadingFile(true);
      console.log('Opening document picker...');
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'text/html', 'text/rtf', 'text/markdown', 'application/rtf', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log('Document picking cancelled');
        setIsLoadingFile(false);
        return;
      }

      const asset = result.assets[0];
      console.log('Picked document:', asset.name, asset.mimeType, asset.size);
      setUploadedFileName(asset.name);

      const isPDF = isPDFFile(asset.name, asset.mimeType ?? undefined);
      console.log('Is PDF:', isPDF);

      if (isPDF) {
        const text = await extractTextFromPDF(asset.uri, Platform.OS === 'web' ? asset.file : null);
        console.log('Extracted PDF text, length:', text.length);
        if (!text.trim()) {
          setUploadedFileName(null);
          setScriptText('');
          if (Platform.OS === 'web') {
            alert('Could not extract text from this PDF. It may be scanned/image-based. Try a text-based PDF or paste the text manually.');
          } else {
            const { Alert } = await import('react-native');
            Alert.alert('PDF Error', 'Could not extract text from this PDF. It may be scanned/image-based. Try a text-based PDF or paste the text manually.');
          }
        } else {
          setScriptText(text);
        }
      } else if (Platform.OS === 'web' && asset.file) {
        const text = await asset.file.text();
        console.log('Read file content on web, length:', text.length);
        setScriptText(text);
      } else {
        const text = await readFileContent(asset.uri);
        console.log('Read file content on native, length:', text.length);
        setScriptText(text);
      }
    } catch (error) {
      console.log('Error picking document:', error);
      setUploadedFileName(null);
    } finally {
      setIsLoadingFile(false);
    }
  }, []);

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

        <View style={styles.modeSwitcher}>
          <TouchableOpacity
            style={[styles.modeTab, inputMode === 'text' && styles.modeTabActive]}
            onPress={() => setInputMode('text')}
            testID="mode-text"
          >
            <Type size={16} color={inputMode === 'text' ? Colors.accent : Colors.textMuted} />
            <Text style={[styles.modeTabText, inputMode === 'text' && styles.modeTabTextActive]}>
              Plain Text
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, inputMode === 'document' && styles.modeTabActive]}
            onPress={() => setInputMode('document')}
            testID="mode-document"
          >
            <FileText size={16} color={inputMode === 'document' ? Colors.accent : Colors.textMuted} />
            <Text style={[styles.modeTabText, inputMode === 'document' && styles.modeTabTextActive]}>
              Upload File
            </Text>
          </TouchableOpacity>
        </View>

        {inputMode === 'document' && (
          <View style={styles.uploadSection}>
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={handlePickDocument}
              disabled={isLoadingFile}
              testID="upload-document-btn"
            >
              {isLoadingFile ? (
                <ActivityIndicator size="small" color={Colors.accent} />
              ) : (
                <FileUp size={28} color={Colors.accent} />
              )}
              <Text style={styles.uploadBtnTitle}>
                {isLoadingFile ? 'Reading file...' : 'Choose a file'}
              </Text>
              <Text style={styles.uploadBtnSubtitle}>
                Supports .pdf, .txt, .rtf, .html, .md files
              </Text>
            </TouchableOpacity>
            {uploadedFileName && (
              <View style={styles.fileInfoRow}>
                <FileText size={14} color={Colors.accent} />
                <Text style={styles.fileInfoText} numberOfLines={1}>
                  {uploadedFileName}
                </Text>
              </View>
            )}
          </View>
        )}

        <TextInput
          style={styles.editInput}
          placeholder={inputMode === 'document' ? 'File content will appear here. You can also edit it...' : 'Paste your script here...'}
          placeholderTextColor={Colors.textMuted}
          value={scriptText}
          onChangeText={setScriptText}
          multiline
          textAlignVertical="top"
          autoFocus={inputMode === 'text'}
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
  modeSwitcher: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 10,
    padding: 3,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modeTabActive: {
    backgroundColor: Colors.card,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  modeTabTextActive: {
    color: Colors.accent,
  },
  uploadSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 10,
  },
  uploadBtn: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.spotlight,
    gap: 8,
  },
  uploadBtnTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  uploadBtnSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  fileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  fileInfoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
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
