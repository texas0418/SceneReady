import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { FileUp, Type, ChevronDown, X, Check } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useUserMonologues } from '@/providers/UserMonologuesProvider';
import { extractTextFromPDF, isPDFFile } from '@/utils/pdfExtractor';

type MonologueType = 'dramatic' | 'comedic' | 'classical' | 'contemporary';
type MonologueGender = 'male' | 'female' | 'neutral';

const TYPES: { label: string; value: MonologueType }[] = [
  { label: 'Dramatic', value: 'dramatic' },
  { label: 'Comedic', value: 'comedic' },
  { label: 'Classical', value: 'classical' },
  { label: 'Contemporary', value: 'contemporary' },
];

const GENDERS: { label: string; value: MonologueGender }[] = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Neutral', value: 'neutral' },
];

const AGE_RANGES = ['16-25', '20-30', '20-35', '25-40', '30-45', '30-50', '40+'];

export default function AddMonologue() {
  const router = useRouter();
  const { addMonologue } = useUserMonologues();

  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [author, setAuthor] = useState('');
  const [type, setType] = useState<MonologueType>('contemporary');
  const [gender, setGender] = useState<MonologueGender>('neutral');
  const [ageRange, setAgeRange] = useState('20-35');
  const [tone, setTone] = useState('');
  const [duration, setDuration] = useState('');
  const [text, setText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [pdfFileName, setPdfFileName] = useState('');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showAgeDropdown, setShowAgeDropdown] = useState(false);

  const handlePickPDF = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
      });


      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];
      const fileName = asset.name || 'document.pdf';

      if (!isPDFFile(fileName, asset.mimeType ?? undefined)) {
        Alert.alert('Invalid File', 'Please select a PDF file.');
        return;
      }

      setIsExtracting(true);
      setPdfFileName(fileName);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      let webFile: File | null = null;
      if (Platform.OS === 'web' && asset.file) {
        webFile = asset.file as File;
      }

      const extracted = await extractTextFromPDF(asset.uri, webFile);

      if (!extracted || extracted.trim().length === 0) {
        Alert.alert(
          'No Text Found',
          'Could not extract text from this PDF. It may be image-based or scanned. Try a text-based PDF.'
        );
        setIsExtracting(false);
        setPdfFileName('');
        return;
      }

      setText(extracted);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (!title && fileName) {
        const nameWithoutExt = fileName.replace(/\.pdf$/i, '');
        setTitle(nameWithoutExt);
      }

    } catch (error) {
      Alert.alert('Error', 'Failed to load PDF. Please try again or paste the text manually.');
    } finally {
      setIsExtracting(false);
    }
  }, [title]);

  const handleSave = useCallback(() => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for the monologue.');
      return;
    }
    if (!text.trim()) {
      Alert.alert('Missing Text', 'Please upload a PDF or enter the monologue text.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    addMonologue({
      title: title.trim(),
      source: source.trim() || 'Personal Collection',
      author: author.trim() || 'Unknown',
      type,
      gender,
      ageRange: ageRange,
      tone: tone.trim() || 'Various',
      duration: duration.trim() || '1-2 min',
      text: text.trim(),
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }, [title, source, author, type, gender, ageRange, tone, duration, text, addMonologue, router]);

  const renderDropdown = (
    visible: boolean,
    onClose: () => void,
    items: { label: string; value: string }[],
    selectedValue: string,
    onSelect: (value: string) => void,
  ) => {
    if (!visible) return null;
    return (
      <View style={styles.dropdown}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.value}
            style={[styles.dropdownItem, selectedValue === item.value && styles.dropdownItemActive]}
            onPress={() => {
              onSelect(item.value);
              onClose();
              Haptics.selectionAsync();
            }}
          >
            <Text style={[styles.dropdownItemText, selectedValue === item.value && styles.dropdownItemTextActive]}>
              {item.label}
            </Text>
            {selectedValue === item.value && <Check size={16} color={Colors.accent} />}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          title: 'Add Monologue',
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} testID="save-monologue-btn">
              <Text style={styles.saveHeaderBtn}>Save</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.uploadSection}>
          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={handlePickPDF}
            activeOpacity={0.7}
            disabled={isExtracting}
            testID="upload-pdf-btn"
          >
            {isExtracting ? (
              <ActivityIndicator color={Colors.accent} size="small" />
            ) : (
              <FileUp size={22} color={Colors.accent} />
            )}
            <View style={styles.uploadTextContainer}>
              <Text style={styles.uploadBtnTitle}>
                {isExtracting ? 'Extracting text...' : pdfFileName ? pdfFileName : 'Upload PDF'}
              </Text>
              <Text style={styles.uploadBtnSubtitle}>
                {pdfFileName ? 'Tap to replace' : 'Import monologue from a PDF file'}
              </Text>
            </View>
            {pdfFileName && !isExtracting && (
              <TouchableOpacity
                onPress={() => {
                  setPdfFileName('');
                  setText('');
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or type below</Text>
            <View style={styles.dividerLine} />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Details</Text>

        <View style={styles.fieldGroup}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="Monologue title"
              placeholderTextColor={Colors.textMuted}
              value={title}
              onChangeText={setTitle}
              testID="monologue-title-input"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Source</Text>
            <TextInput
              style={styles.input}
              placeholder="Play, film, or original work"
              placeholderTextColor={Colors.textMuted}
              value={source}
              onChangeText={setSource}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Author</Text>
            <TextInput
              style={styles.input}
              placeholder="Playwright or author"
              placeholderTextColor={Colors.textMuted}
              value={author}
              onChangeText={setAuthor}
            />
          </View>

          <View style={styles.rowFields}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Tone</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Raw, Vulnerable"
                placeholderTextColor={Colors.textMuted}
                value={tone}
                onChangeText={setTone}
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Duration</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 2-3 min"
                placeholderTextColor={Colors.textMuted}
                value={duration}
                onChangeText={setDuration}
              />
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Classification</Text>

        <View style={styles.fieldGroup}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Type</Text>
            <TouchableOpacity
              style={styles.selectBtn}
              onPress={() => {
                setShowTypeDropdown(!showTypeDropdown);
                setShowGenderDropdown(false);
                setShowAgeDropdown(false);
              }}
            >
              <Text style={styles.selectBtnText}>
                {TYPES.find((t) => t.value === type)?.label}
              </Text>
              <ChevronDown size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
            {renderDropdown(
              showTypeDropdown,
              () => setShowTypeDropdown(false),
              TYPES,
              type,
              (v) => setType(v as MonologueType),
            )}
          </View>

          <View style={styles.rowFields}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Gender</Text>
              <TouchableOpacity
                style={styles.selectBtn}
                onPress={() => {
                  setShowGenderDropdown(!showGenderDropdown);
                  setShowTypeDropdown(false);
                  setShowAgeDropdown(false);
                }}
              >
                <Text style={styles.selectBtnText}>
                  {GENDERS.find((g) => g.value === gender)?.label}
                </Text>
                <ChevronDown size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
              {renderDropdown(
                showGenderDropdown,
                () => setShowGenderDropdown(false),
                GENDERS,
                gender,
                (v) => setGender(v as MonologueGender),
              )}
            </View>

            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Age Range</Text>
              <TouchableOpacity
                style={styles.selectBtn}
                onPress={() => {
                  setShowAgeDropdown(!showAgeDropdown);
                  setShowTypeDropdown(false);
                  setShowGenderDropdown(false);
                }}
              >
                <Text style={styles.selectBtnText}>{ageRange}</Text>
                <ChevronDown size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
              {renderDropdown(
                showAgeDropdown,
                () => setShowAgeDropdown(false),
                AGE_RANGES.map((a) => ({ label: a, value: a })),
                ageRange,
                setAgeRange,
              )}
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Monologue Text *</Text>

        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Paste or type your monologue text here..."
            placeholderTextColor={Colors.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            textAlignVertical="top"
            testID="monologue-text-input"
          />
          {text.length > 0 && (
            <Text style={styles.charCount}>{text.length} characters</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, (!title.trim() || !text.trim()) && styles.saveBtnDisabled]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={!title.trim() || !text.trim()}
          testID="save-monologue-bottom-btn"
        >
          <Text style={[styles.saveBtnText, (!title.trim() || !text.trim()) && styles.saveBtnTextDisabled]}>
            Save Monologue
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  saveHeaderBtn: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  uploadSection: {
    marginBottom: 8,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    gap: 14,
  },
  uploadTextContainer: {
    flex: 1,
  },
  uploadBtnTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  uploadBtnSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 12,
    color: Colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 12,
  },
  fieldGroup: {
    gap: 12,
  },
  field: {
    position: 'relative' as const,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rowFields: {
    flexDirection: 'row',
    gap: 12,
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectBtnText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  dropdown: {
    backgroundColor: Colors.cardHover,
    borderRadius: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
    zIndex: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  dropdownItemActive: {
    backgroundColor: Colors.spotlightStrong,
  },
  dropdownItemText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  dropdownItemTextActive: {
    color: Colors.accent,
    fontWeight: '600' as const,
  },
  textAreaContainer: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  textArea: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 24,
    padding: 16,
    minHeight: 200,
  },
  charCount: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'right' as const,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnDisabled: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#0F0F0F',
  },
  saveBtnTextDisabled: {
    color: Colors.textMuted,
  },
});
