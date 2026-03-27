import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Share,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  Calendar,
  Smile,
  Meh,
  Frown,
  Star,
  Heart,
  ChevronLeft,
  Share2,
  Pencil,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useRehearsalJournal, JournalEntry } from '@/providers/RehearsalJournalProvider';

const SESSION_TYPES: { value: JournalEntry['type']; label: string; color: string }[] = [
  { value: 'rehearsal', label: 'Rehearsal', color: '#81C784' },
  { value: 'class', label: 'Class', color: '#64B5F6' },
  { value: 'audition', label: 'Audition', color: '#E8A838' },
  { value: 'performance', label: 'Performance', color: '#E57373' },
  { value: 'self-practice', label: 'Self Practice', color: '#BA68C8' },
];

const MOOD_ICONS = [
  { value: 1, icon: Frown, label: 'Rough', color: '#E57373' },
  { value: 2, icon: Meh, label: 'Okay', color: '#FFB74D' },
  { value: 3, icon: Smile, label: 'Good', color: '#64B5F6' },
  { value: 4, icon: Star, label: 'Great', color: '#81C784' },
  { value: 5, icon: Heart, label: 'Amazing', color: '#E8A838' },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function RehearsalJournalScreen() {
  const router = useRouter();
  const { entries, addEntry, updateEntry, deleteEntry } = useRehearsalJournal();
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const formAnim = useRef(new Animated.Value(0)).current;

  const [title, setTitle] = useState('');
  const [type, setType] = useState<JournalEntry['type']>('rehearsal');
  const [whatWorked, setWhatWorked] = useState('');
  const [toExplore, setToExplore] = useState('');
  const [emotionalTriggers, setEmotionalTriggers] = useState('');
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState(3);

  const toggleForm = useCallback(() => {
    const toValue = showForm ? 0 : 1;
    if (showForm) {
      resetForm();
    }
    setShowForm(!showForm);
    Animated.timing(formAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showForm, formAnim, resetForm]);

  const resetForm = useCallback(() => {
    setTitle('');
    setType('rehearsal');
    setWhatWorked('');
    setToExplore('');
    setEmotionalTriggers('');
    setNotes('');
    setMood(3);
    setEditingId(null);
  }, []);

  const handleSave = useCallback(() => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a session title.');
      return;
    }

    const data = {
      title: title.trim(),
      type,
      whatWorked: whatWorked.trim(),
      toExplore: toExplore.trim(),
      emotionalTriggers: emotionalTriggers.trim(),
      notes: notes.trim(),
      mood,
    };

    if (editingId) {
      updateEntry(editingId, data);
      setEditingId(null);
    } else {
      addEntry({
        ...data,
        date: new Date().toISOString(),
      });
    }

    resetForm();
    toggleForm();
  }, [title, type, whatWorked, toExplore, emotionalTriggers, notes, mood, editingId, addEntry, updateEntry, resetForm, toggleForm]);

  const handleDelete = useCallback((id: string, entryTitle: string) => {
    Alert.alert('Delete Entry', `Remove "${entryTitle}" from your journal?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteEntry(id) },
    ]);
  }, [deleteEntry]);

  const handleEdit = useCallback((entry: JournalEntry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setType(entry.type);
    setMood(entry.mood);
    setWhatWorked(entry.whatWorked || '');
    setToExplore(entry.toExplore || '');
    setEmotionalTriggers(entry.emotionalTriggers || '');
    setNotes(entry.notes || '');
    setExpandedId(null);
    if (!showForm) {
      setShowForm(true);
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [showForm, formAnim]);

  const handleShare = useCallback(async (entry: JournalEntry) => {
    const typeConfig = getTypeConfig(entry.type);
    const moodConfig = getMoodConfig(entry.mood);
    const parts = [
      `📓 ${entry.title}`,
      `${typeConfig.label} · ${formatDate(entry.date)} · Mood: ${moodConfig.label}`,
      entry.whatWorked ? `\nWhat Worked:\n${entry.whatWorked}` : '',
      entry.toExplore ? `\nTo Explore:\n${entry.toExplore}` : '',
      entry.emotionalTriggers ? `\nEmotional Triggers:\n${entry.emotionalTriggers}` : '',
      entry.notes ? `\nNotes:\n${entry.notes}` : '',
    ].filter(Boolean);
    try {
      await Share.share({ message: parts.join('\n') });
    } catch {}
  }, [getTypeConfig, getMoodConfig]);

  const getTypeConfig = useCallback((t: JournalEntry['type']) => {
    return SESSION_TYPES.find((s) => s.value === t) ?? SESSION_TYPES[0];
  }, []);

  const getMoodConfig = useCallback((m: number) => {
    return MOOD_ICONS.find((mi) => mi.value === m) ?? MOOD_ICONS[2];
  }, []);

  const formHeight = formAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 950],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{
        title: 'Rehearsal Journal',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <ChevronLeft size={24} color={Colors.accent} />
          </TouchableOpacity>
        ),
      }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={toggleForm}
          activeOpacity={0.8}
          testID="add-journal-entry"
        >
          <Plus size={20} color={Colors.accent} />
          <Text style={styles.addButtonText}>
            {showForm ? 'Cancel' : 'New Entry'}
          </Text>
        </TouchableOpacity>

        {showForm && (
          <View style={styles.formWrap}>
          <View style={styles.form}>
            {editingId && (
              <Text style={styles.editingBanner}>Editing Entry</Text>
            )}
            <Text style={styles.formLabel}>Session Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Scene work — Act 2"
              placeholderTextColor={Colors.textMuted}
              testID="journal-title-input"
            />

            <Text style={styles.formLabel}>Session Type</Text>
            <View style={styles.typeRow}>
              {SESSION_TYPES.map((st) => (
                <TouchableOpacity
                  key={st.value}
                  style={[
                    styles.typeChip,
                    type === st.value && { backgroundColor: st.color + '30', borderColor: st.color },
                  ]}
                  onPress={() => setType(st.value)}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      type === st.value && { color: st.color },
                    ]}
                  >
                    {st.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>How did it feel?</Text>
            <View style={styles.moodRow}>
              {MOOD_ICONS.map((mi) => {
                const Icon = mi.icon;
                return (
                  <TouchableOpacity
                    key={mi.value}
                    style={[
                      styles.moodBtn,
                      mood === mi.value && { backgroundColor: mi.color + '25', borderColor: mi.color },
                    ]}
                    onPress={() => setMood(mi.value)}
                  >
                    <Icon size={22} color={mood === mi.value ? mi.color : Colors.textMuted} />
                    <Text style={[styles.moodLabel, mood === mi.value && { color: mi.color }]}>
                      {mi.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.formLabel}>What Worked</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={whatWorked}
              onChangeText={setWhatWorked}
              placeholder="Discoveries, breakthroughs, strong moments..."
              placeholderTextColor={Colors.textMuted}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.formLabel}>To Explore Next</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={toExplore}
              onChangeText={setToExplore}
              placeholder="Areas to dig deeper, questions to answer..."
              placeholderTextColor={Colors.textMuted}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.formLabel}>Emotional Triggers</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={emotionalTriggers}
              onChangeText={setEmotionalTriggers}
              placeholder="Moments that unlocked real emotion..."
              placeholderTextColor={Colors.textMuted}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.formLabel}>Additional Notes</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Anything else worth remembering..."
              placeholderTextColor={Colors.textMuted}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              activeOpacity={0.8}
              testID="save-journal-entry"
            >
              <Text style={styles.saveBtnText}>{editingId ? 'Update Entry' : 'Save Entry'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        )}

        {entries.length === 0 && !showForm && (
          <View style={styles.emptyState}>
            <Calendar size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Journal Entries Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start tracking your rehearsals, classes, and auditions to build self-awareness over time.
            </Text>
          </View>
        )}

        {entries.map((entry) => {
          const typeConfig = getTypeConfig(entry.type);
          const moodConfig = getMoodConfig(entry.mood);
          const MoodIcon = moodConfig.icon;
          const isExpanded = expandedId === entry.id;

          return (
            <TouchableOpacity
              key={entry.id}
              style={styles.entryCard}
              onPress={() => setExpandedId(isExpanded ? null : entry.id)}
              activeOpacity={0.85}
            >
              <View style={styles.entryHeader}>
                <View style={styles.entryHeaderLeft}>
                  <View style={[styles.typeDot, { backgroundColor: typeConfig.color }]} />
                  <View style={styles.entryTitleWrap}>
                    <Text style={styles.entryTitle} numberOfLines={1}>{entry.title}</Text>
                    <Text style={styles.entryMeta}>
                      {typeConfig.label} · {formatDate(entry.date)}
                    </Text>
                  </View>
                </View>
                <View style={styles.entryHeaderRight}>
                  <MoodIcon size={18} color={moodConfig.color} />
                  {isExpanded ? (
                    <ChevronUp size={18} color={Colors.textMuted} />
                  ) : (
                    <ChevronDown size={18} color={Colors.textMuted} />
                  )}
                </View>
              </View>

              {isExpanded && (
                <View style={styles.entryBody}>
                  {entry.whatWorked ? (
                    <View style={styles.entrySection}>
                      <Text style={styles.entrySectionLabel}>What Worked</Text>
                      <Text style={styles.entrySectionText}>{entry.whatWorked}</Text>
                    </View>
                  ) : null}
                  {entry.toExplore ? (
                    <View style={styles.entrySection}>
                      <Text style={styles.entrySectionLabel}>To Explore</Text>
                      <Text style={styles.entrySectionText}>{entry.toExplore}</Text>
                    </View>
                  ) : null}
                  {entry.emotionalTriggers ? (
                    <View style={styles.entrySection}>
                      <Text style={styles.entrySectionLabel}>Emotional Triggers</Text>
                      <Text style={styles.entrySectionText}>{entry.emotionalTriggers}</Text>
                    </View>
                  ) : null}
                  {entry.notes ? (
                    <View style={styles.entrySection}>
                      <Text style={styles.entrySectionLabel}>Notes</Text>
                      <Text style={styles.entrySectionText}>{entry.notes}</Text>
                    </View>
                  ) : null}
                  <View style={styles.entryActions}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => handleEdit(entry)}
                    >
                      <Pencil size={16} color={Colors.accent} />
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.shareBtn}
                      onPress={() => handleShare(entry)}
                    >
                      <Share2 size={16} color={Colors.accent} />
                      <Text style={styles.shareBtnText}>Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(entry.id, entry.title)}
                    >
                      <Trash2 size={16} color={Colors.error} />
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

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
    paddingBottom: 40,
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
  formWrap: {},
  form: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  multilineInput: {
    minHeight: 70,
    paddingTop: 12,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 14,
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
  moodRow: {
    flexDirection: 'row',
    gap: 6,
  },
  moodBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundLight,
    gap: 4,
  },
  moodLabel: {
    fontSize: 10,
    fontWeight: '500' as const,
    color: Colors.textMuted,
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
  entryCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  entryTitleWrap: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  entryMeta: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  entryHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryBody: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  entrySection: {
    marginBottom: 12,
  },
  entrySectionLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  entrySectionText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  deleteBtnText: {
    fontSize: 13,
    color: Colors.error,
    fontWeight: '500' as const,
  },
  entryActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 6,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(232,168,56,0.1)',
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  editingBanner: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.accent,
    textAlign: 'center',
    marginBottom: 12,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  shareBtnText: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '500' as const,
  },
});
