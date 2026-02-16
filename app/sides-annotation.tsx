import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  Plus,
  FileText,
  FileUp,
  Trash2,
  ChevronRight,
  ChevronLeft,
  X,
  Bookmark,
  Zap,
  MessageSquare,
  Heart,
  Bold,
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import Colors from '@/constants/colors';
import { useSidesAnnotation, Annotation, AnnotatedSide } from '@/providers/SidesAnnotationProvider';
import { extractTextFromPDF, isPDFFile } from '@/utils/pdfExtractor';

const ANNOTATION_TYPES: { value: Annotation['type']; label: string; color: string; icon: React.ReactNode }[] = [
  { value: 'beat', label: 'Beat', color: '#E8A838', icon: <Bookmark size={16} color="#E8A838" /> },
  { value: 'action', label: 'Action', color: '#81C784', icon: <Zap size={16} color="#81C784" /> },
  { value: 'note', label: 'Note', color: '#64B5F6', icon: <MessageSquare size={16} color="#64B5F6" /> },
  { value: 'emotion', label: 'Emotion', color: '#E57373', icon: <Heart size={16} color="#E57373" /> },
  { value: 'emphasis', label: 'Emphasis', color: '#BA68C8', icon: <Bold size={16} color="#BA68C8" /> },
];

export default function SidesAnnotationScreen() {
  const { sides, addSide, addAnnotation, removeAnnotation, deleteSide } = useSidesAnnotation();
  const router = useRouter();
  const [mode, setMode] = useState<'list' | 'add' | 'view'>('list');
  const [activeSideId, setActiveSideId] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newScript, setNewScript] = useState('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handlePickDocument = useCallback(async () => {
    try {
      setIsLoadingFile(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'text/html', 'text/rtf', 'text/markdown', 'application/rtf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setIsLoadingFile(false);
        return;
      }

      const asset = result.assets[0];
      setUploadedFileName(asset.name);

      // Extract title from filename (remove extension)
      const titleFromFile = asset.name.replace(/\.[^.]+$/, '');
      if (!newTitle.trim()) {
        setNewTitle(titleFromFile);
      }

      const isPDF = isPDFFile(asset.name, asset.mimeType ?? undefined);

      if (isPDF) {
        const text = await extractTextFromPDF(asset.uri, Platform.OS === 'web' ? asset.file : null);
        if (!text.trim()) {
          setUploadedFileName(null);
          Alert.alert('PDF Error', 'Could not extract text from this PDF. It may be scanned/image-based. Try a text-based PDF or paste the text manually.');
        } else {
          setNewScript(text);
        }
      } else if (Platform.OS === 'web' && asset.file) {
        const text = await asset.file.text();
        setNewScript(text);
      } else {
        try {
          const { File } = await import('expo-file-system');
          const file = new File(asset.uri);
          const content = await file.text();
          setNewScript(content);
        } catch {
          const FileSystemLegacy = await import('expo-file-system/legacy');
          const content = await FileSystemLegacy.readAsStringAsync(asset.uri);
          setNewScript(content);
        }
      }
    } catch (error) {
      console.log('Error picking document:', error);
      setUploadedFileName(null);
    } finally {
      setIsLoadingFile(false);
    }
  }, [newTitle]);

  const [selectedText, setSelectedText] = useState('');
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [annotationNote, setAnnotationNote] = useState('');
  const [annotationType, setAnnotationType] = useState<Annotation['type']>('beat');

  const activeSide = useMemo(() => {
    if (!activeSideId) return null;
    return sides.find((s) => s.id === activeSideId) ?? null;
  }, [sides, activeSideId]);

  const handleAddSide = useCallback(() => {
    if (!newTitle.trim() || !newScript.trim()) {
      Alert.alert('Required', 'Please enter both a title and script text.');
      return;
    }
    const id = addSide({ title: newTitle.trim(), scriptText: newScript.trim() });
    setNewTitle('');
    setNewScript('');
    setUploadedFileName(null);
    setActiveSideId(id);
    setMode('view');
  }, [newTitle, newScript, addSide]);

  const handleDeleteSide = useCallback((id: string, title: string) => {
    Alert.alert('Delete Script', `Remove "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteSide(id);
          if (activeSideId === id) {
            setActiveSideId(null);
            setMode('list');
          }
        },
      },
    ]);
  }, [deleteSide, activeSideId]);

  const handleTextSelection = useCallback((event: { nativeEvent: { selection: { start: number; end: number } } }) => {
    const { start, end } = event.nativeEvent.selection;
    if (start !== end && activeSide) {
      const text = activeSide.scriptText.substring(start, end);
      setSelectedText(text);
      setSelectionStart(start);
      setSelectionEnd(end);
    }
  }, [activeSide]);

  const handleAnnotate = useCallback(() => {
    if (!selectedText.trim()) {
      Alert.alert('Select Text', 'Please select some text in the script first, then tap "Add Annotation".');
      return;
    }
    setShowAnnotationModal(true);
  }, [selectedText]);

  const handleSaveAnnotation = useCallback(() => {
    if (!activeSideId) return;
    const typeConfig = ANNOTATION_TYPES.find((t) => t.value === annotationType);
    addAnnotation(activeSideId, {
      startIndex: selectionStart,
      endIndex: selectionEnd,
      type: annotationType,
      text: annotationNote.trim() || selectedText,
      color: typeConfig?.color ?? '#E8A838',
    });
    setShowAnnotationModal(false);
    setAnnotationNote('');
    setSelectedText('');
    console.log('Annotation saved:', annotationType, selectionStart, selectionEnd);
  }, [activeSideId, selectionStart, selectionEnd, annotationType, annotationNote, selectedText, addAnnotation]);

  const renderAnnotatedScript = useCallback((side: AnnotatedSide) => {
    if (side.annotations.length === 0) {
      return <Text style={styles.scriptText}>{side.scriptText}</Text>;
    }

    const sorted = [...side.annotations].sort((a, b) => a.startIndex - b.startIndex);
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    sorted.forEach((ann, i) => {
      if (ann.startIndex > lastIndex) {
        elements.push(
          <Text key={`text-${i}`} style={styles.scriptText}>
            {side.scriptText.substring(lastIndex, ann.startIndex)}
          </Text>
        );
      }
      elements.push(
        <Text
          key={`ann-${ann.id}`}
          style={[styles.scriptText, { backgroundColor: ann.color + '30', borderRadius: 2 }]}
        >
          {side.scriptText.substring(ann.startIndex, ann.endIndex)}
        </Text>
      );
      lastIndex = ann.endIndex;
    });

    if (lastIndex < side.scriptText.length) {
      elements.push(
        <Text key="text-end" style={styles.scriptText}>
          {side.scriptText.substring(lastIndex)}
        </Text>
      );
    }

    return <Text>{elements}</Text>;
  }, []);

  if (mode === 'add') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Stack.Screen
          options={{
            title: 'Add Script',
            headerLeft: () => (
              <TouchableOpacity onPress={() => setMode('list')} style={{ padding: 4 }}>
                <X size={22} color={Colors.accent} />
              </TouchableOpacity>
            ),
          }}
        />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.formLabel}>Script Title</Text>
          <TextInput
            style={styles.input}
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="e.g. Scene 3 — The Confrontation"
            placeholderTextColor={Colors.textMuted}
            testID="side-title-input"
          />

          <Text style={[styles.formLabel, { marginTop: 16 }]}>Script Text</Text>
          <Text style={styles.formHint}>Upload a PDF or paste your sides below</Text>

          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={handlePickDocument}
            disabled={isLoadingFile}
          >
            {isLoadingFile ? (
              <ActivityIndicator size="small" color={Colors.accent} />
            ) : (
              <FileUp size={24} color={Colors.accent} />
            )}
            <Text style={styles.uploadBtnTitle}>
              {isLoadingFile ? 'Reading file...' : 'Upload Sides (PDF, TXT)'}
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

          <TextInput
            style={[styles.input, styles.scriptInput]}
            value={newScript}
            onChangeText={setNewScript}
            placeholder="Paste your script text here..."
            placeholderTextColor={Colors.textMuted}
            multiline
            textAlignVertical="top"
            testID="side-script-input"
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleAddSide} activeOpacity={0.8}>
            <Text style={styles.saveBtnText}>Add Script</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (mode === 'view' && activeSide) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: activeSide.title,
            headerLeft: () => (
              <TouchableOpacity onPress={() => { setMode('list'); setActiveSideId(null); }} style={{ padding: 4 }}>
                <X size={22} color={Colors.accent} />
              </TouchableOpacity>
            ),
          }}
        />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.annotationToolbar}>
            <Text style={styles.toolbarLabel}>Select text below, then:</Text>
            <TouchableOpacity
              style={styles.annotateBtn}
              onPress={handleAnnotate}
              activeOpacity={0.8}
            >
              <Plus size={16} color={Colors.accent} />
              <Text style={styles.annotateBtnText}>Add Annotation</Text>
            </TouchableOpacity>
          </View>

          {selectedText ? (
            <View style={styles.selectionPreview}>
              <Text style={styles.selectionLabel}>Selected:</Text>
              <Text style={styles.selectionText} numberOfLines={2}>"{selectedText}"</Text>
            </View>
          ) : null}

          <View style={styles.scriptCard}>
            <TextInput
              style={styles.scriptTextInput}
              value={activeSide.scriptText}
              multiline
              editable={true}
              scrollEnabled={false}
              onSelectionChange={handleTextSelection}
              textAlignVertical="top"
            />
          </View>

          {activeSide.annotations.length > 0 && (
            <View style={styles.annotationsList}>
              <Text style={styles.annotationsTitle}>
                Annotations ({activeSide.annotations.length})
              </Text>
              {activeSide.annotations.map((ann) => {
                const typeConfig = ANNOTATION_TYPES.find((t) => t.value === ann.type);
                return (
                  <View key={ann.id} style={[styles.annotationItem, { borderLeftColor: ann.color }]}>
                    <View style={styles.annotationItemHeader}>
                      {typeConfig?.icon}
                      <Text style={[styles.annotationTypeLabel, { color: ann.color }]}>
                        {typeConfig?.label}
                      </Text>
                      <TouchableOpacity
                        style={styles.removeAnnotationBtn}
                        onPress={() => removeAnnotation(activeSide.id, ann.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <X size={14} color={Colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.annotationExcerpt} numberOfLines={1}>
                      "{activeSide.scriptText.substring(ann.startIndex, ann.endIndex)}"
                    </Text>
                    {ann.text !== activeSide.scriptText.substring(ann.startIndex, ann.endIndex) && (
                      <Text style={styles.annotationNoteText}>{ann.text}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.legendSection}>
            <Text style={styles.legendTitle}>Legend</Text>
            <View style={styles.legendGrid}>
              {ANNOTATION_TYPES.map((t) => (
                <View key={t.value} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: t.color }]} />
                  <Text style={styles.legendLabel}>{t.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        <Modal
          visible={showAnnotationModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAnnotationModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Annotation</Text>
                <TouchableOpacity onPress={() => setShowAnnotationModal(false)}>
                  <X size={22} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSelectedText} numberOfLines={2}>
                "{selectedText}"
              </Text>

              <Text style={styles.modalLabel}>Type</Text>
              <View style={styles.typeRow}>
                {ANNOTATION_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    style={[
                      styles.typeChip,
                      annotationType === t.value && { backgroundColor: t.color + '30', borderColor: t.color },
                    ]}
                    onPress={() => setAnnotationType(t.value)}
                  >
                    {t.icon}
                    <Text
                      style={[
                        styles.typeChipText,
                        annotationType === t.value && { color: t.color },
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Note (optional)</Text>
              <TextInput
                style={styles.modalInput}
                value={annotationNote}
                onChangeText={setAnnotationNote}
                placeholder="Add a note about this moment..."
                placeholderTextColor={Colors.textMuted}
                multiline
              />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAnnotation} activeOpacity={0.8}>
                <Text style={styles.saveBtnText}>Save Annotation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{
        title: 'Sides Annotation',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <ChevronLeft size={24} color={Colors.accent} />
          </TouchableOpacity>
        ),
      }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setMode('add')}
          activeOpacity={0.8}
          testID="add-side"
        >
          <Plus size={20} color={Colors.accent} />
          <Text style={styles.addButtonText}>Add Script</Text>
        </TouchableOpacity>

        {sides.length === 0 && (
          <View style={styles.emptyState}>
            <FileText size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Scripts Added</Text>
            <Text style={styles.emptySubtitle}>
              Add your sides or scripts, then highlight and annotate with beats, actions, and notes.
            </Text>
          </View>
        )}

        {sides.map((side) => (
          <TouchableOpacity
            key={side.id}
            style={styles.sideCard}
            onPress={() => { setActiveSideId(side.id); setMode('view'); }}
            activeOpacity={0.85}
          >
            <View style={styles.sideHeader}>
              <View style={styles.sideIconWrap}>
                <FileText size={20} color="#64B5F6" />
              </View>
              <View style={styles.sideInfo}>
                <Text style={styles.sideName}>{side.title}</Text>
                <Text style={styles.sideMeta}>
                  {side.annotations.length} annotation{side.annotations.length !== 1 ? 's' : ''} · {side.scriptText.length} chars
                </Text>
              </View>
              <View style={styles.sideActions}>
                <TouchableOpacity
                  onPress={() => handleDeleteSide(side.id, side.title)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Trash2 size={16} color={Colors.textMuted} />
                </TouchableOpacity>
                <ChevronRight size={18} color={Colors.textMuted} />
              </View>
            </View>
            {side.annotations.length > 0 && (
              <View style={styles.sideAnnotationPreview}>
                {ANNOTATION_TYPES.map((t) => {
                  const count = side.annotations.filter((a) => a.type === t.value).length;
                  if (count === 0) return null;
                  return (
                    <View key={t.value} style={[styles.annotBadge, { backgroundColor: t.color + '20' }]}>
                      <View style={[styles.annotBadgeDot, { backgroundColor: t.color }]} />
                      <Text style={[styles.annotBadgeText, { color: t.color }]}>
                        {count} {t.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </TouchableOpacity>
        ))}

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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.spotlight,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(232,168,56,0.2)',
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  sideCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(100,181,246,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sideInfo: {
    flex: 1,
  },
  sideName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  sideMeta: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  sideActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 8,
  },
  sideAnnotationPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  annotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  annotBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  annotBadgeText: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  formHint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 8,
    marginTop: -4,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    backgroundColor: Colors.spotlight,
    marginBottom: 12,
  },
  uploadBtnTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  fileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  fileInfoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
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
  scriptInput: {
    minHeight: 300,
    lineHeight: 22,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#0F0F0F',
  },
  annotationToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  toolbarLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  annotateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.spotlight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(232,168,56,0.2)',
  },
  annotateBtnText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  selectionPreview: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.accent + '40',
  },
  selectionLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.accent,
    marginBottom: 4,
  },
  selectionText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontStyle: 'italic' as const,
  },
  scriptCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  scriptText: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  scriptTextInput: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 24,
    padding: 0,
  },
  annotationsList: {
    marginBottom: 20,
  },
  annotationsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  annotationItem: {
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  annotationItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  annotationTypeLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    flex: 1,
  },
  removeAnnotationBtn: {
    padding: 4,
  },
  annotationExcerpt: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic' as const,
  },
  annotationNoteText: {
    fontSize: 13,
    color: Colors.textPrimary,
    marginTop: 4,
  },
  legendSection: {
    marginBottom: 10,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  modalSelectedText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic' as const,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundLight,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textMuted,
  },
  modalInput: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 60,
    marginBottom: 8,
  },
});
