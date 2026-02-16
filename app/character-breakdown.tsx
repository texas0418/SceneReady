import React, { useState, useCallback } from 'react';
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
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  Plus,
  ChevronRight,
  ChevronLeft,
  Trash2,
  X,
  Target,
  Shield,
  Zap,
  BookOpen,
  Users,
  Eye,
  Brain,
  Activity,
  Mic,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useCharacterBreakdowns, CharacterBreakdown } from '@/providers/CharacterBreakdownProvider';

interface FieldConfig {
  key: keyof Omit<CharacterBreakdown, 'id' | 'createdAt' | 'updatedAt' | 'characterName' | 'projectName'>;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  hint: string;
}

const FIELDS: FieldConfig[] = [
  {
    key: 'objective',
    label: 'Super Objective',
    placeholder: "What does your character want more than anything?",
    icon: <Target size={18} color="#E8A838" />,
    hint: 'The driving desire behind everything they do.',
  },
  {
    key: 'obstacles',
    label: 'Obstacles',
    placeholder: "What stands in their way?",
    icon: <Shield size={18} color="#E57373" />,
    hint: 'Internal and external forces blocking the objective.',
  },
  {
    key: 'tactics',
    label: 'Tactics',
    placeholder: "How do they try to get what they want?",
    icon: <Zap size={18} color="#FFB74D" />,
    hint: 'The strategies and actions they use moment to moment.',
  },
  {
    key: 'backstory',
    label: 'Backstory',
    placeholder: "What shaped this character before the story begins?",
    icon: <BookOpen size={18} color="#64B5F6" />,
    hint: 'Key life events, trauma, formative experiences.',
  },
  {
    key: 'relationships',
    label: 'Relationships',
    placeholder: "How do they relate to other characters?",
    icon: <Users size={18} color="#81C784" />,
    hint: 'Dynamics, power structures, history with others.',
  },
  {
    key: 'sensoryWork',
    label: 'Sensory Work',
    placeholder: "What does their world look, smell, taste, feel like?",
    icon: <Eye size={18} color="#BA68C8" />,
    hint: 'Sense memory anchors to ground you in the character.',
  },
  {
    key: 'innerLife',
    label: 'Inner Life',
    placeholder: "What are they thinking but not saying?",
    icon: <Brain size={18} color="#4DD0E1" />,
    hint: 'Subtext, secrets, unspoken desires.',
  },
  {
    key: 'physicality',
    label: 'Physicality',
    placeholder: "How do they move, sit, stand, gesture?",
    icon: <Activity size={18} color="#FF8A65" />,
    hint: 'Body language, posture, physical habits, tempo.',
  },
  {
    key: 'voiceNotes',
    label: 'Voice & Speech',
    placeholder: "How do they sound? Rhythm, pitch, accent?",
    icon: <Mic size={18} color="#AED581" />,
    hint: 'Speech patterns, vocabulary, vocal quality.',
  },
];

export default function CharacterBreakdownScreen() {
  const { breakdowns, addBreakdown, updateBreakdown, deleteBreakdown } = useCharacterBreakdowns();
  const router = useRouter();
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editId, setEditId] = useState<string | null>(null);

  const [characterName, setCharacterName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [fields, setFields] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    FIELDS.forEach((f) => { initial[f.key] = ''; });
    return initial;
  });

  const resetForm = useCallback(() => {
    setCharacterName('');
    setProjectName('');
    const initial: Record<string, string> = {};
    FIELDS.forEach((f) => { initial[f.key] = ''; });
    setFields(initial);
    setEditId(null);
  }, []);

  const handleNew = useCallback(() => {
    resetForm();
    setMode('create');
  }, [resetForm]);

  const handleEdit = useCallback((breakdown: CharacterBreakdown) => {
    setCharacterName(breakdown.characterName);
    setProjectName(breakdown.projectName);
    const loaded: Record<string, string> = {};
    FIELDS.forEach((f) => { loaded[f.key] = breakdown[f.key] ?? ''; });
    setFields(loaded);
    setEditId(breakdown.id);
    setMode('edit');
  }, []);

  const handleSave = useCallback(() => {
    if (!characterName.trim()) {
      Alert.alert('Required', 'Please enter a character name.');
      return;
    }

    const data = {
      characterName: characterName.trim(),
      projectName: projectName.trim(),
      objective: fields.objective ?? '',
      obstacles: fields.obstacles ?? '',
      tactics: fields.tactics ?? '',
      backstory: fields.backstory ?? '',
      relationships: fields.relationships ?? '',
      sensoryWork: fields.sensoryWork ?? '',
      innerLife: fields.innerLife ?? '',
      physicality: fields.physicality ?? '',
      voiceNotes: fields.voiceNotes ?? '',
    };

    if (mode === 'edit' && editId) {
      updateBreakdown(editId, data);
    } else {
      addBreakdown(data);
    }

    resetForm();
    setMode('list');
  }, [characterName, projectName, fields, mode, editId, addBreakdown, updateBreakdown, resetForm]);

  const handleDelete = useCallback((id: string, name: string) => {
    Alert.alert('Delete Breakdown', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteBreakdown(id);
          if (editId === id) {
            resetForm();
            setMode('list');
          }
        },
      },
    ]);
  }, [deleteBreakdown, editId, resetForm]);

  const updateField = useCallback((key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  }, []);

  const filledCount = useCallback((breakdown: CharacterBreakdown) => {
    return FIELDS.filter((f) => (breakdown[f.key] ?? '').trim().length > 0).length;
  }, []);

  if (mode === 'create' || mode === 'edit') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Stack.Screen
          options={{
            title: mode === 'edit' ? 'Edit Breakdown' : 'New Breakdown',
            headerLeft: () => (
              <TouchableOpacity onPress={() => { resetForm(); setMode('list'); }} style={{ padding: 4 }}>
                <X size={22} color={Colors.accent} />
              </TouchableOpacity>
            ),
          }}
        />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.nameSection}>
            <TextInput
              style={styles.nameInput}
              value={characterName}
              onChangeText={setCharacterName}
              placeholder="Character Name"
              placeholderTextColor={Colors.textMuted}
              testID="character-name-input"
            />
            <TextInput
              style={styles.projectInput}
              value={projectName}
              onChangeText={setProjectName}
              placeholder="Project / Play / Film"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          {FIELDS.map((field) => (
            <View key={field.key} style={styles.fieldCard}>
              <View style={styles.fieldHeader}>
                {field.icon}
                <Text style={styles.fieldLabel}>{field.label}</Text>
              </View>
              <Text style={styles.fieldHint}>{field.hint}</Text>
              <TextInput
                style={styles.fieldInput}
                value={fields[field.key]}
                onChangeText={(v) => updateField(field.key, v)}
                placeholder={field.placeholder}
                placeholderTextColor={Colors.textMuted}
                multiline
                textAlignVertical="top"
              />
            </View>
          ))}

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveBtnText}>
              {mode === 'edit' ? 'Update Breakdown' : 'Save Breakdown'}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{
        title: 'Character Breakdown',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <ChevronLeft size={24} color={Colors.accent} />
          </TouchableOpacity>
        ),
      }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleNew}
          activeOpacity={0.8}
          testID="new-breakdown"
        >
          <Plus size={20} color={Colors.accent} />
          <Text style={styles.addButtonText}>New Character</Text>
        </TouchableOpacity>

        {breakdowns.length === 0 && (
          <View style={styles.emptyState}>
            <Target size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No Character Breakdowns</Text>
            <Text style={styles.emptySubtitle}>
              Build detailed character profiles with objectives, obstacles, tactics, backstory, and more.
            </Text>
          </View>
        )}

        {breakdowns.map((b) => (
          <TouchableOpacity
            key={b.id}
            style={styles.breakdownCard}
            onPress={() => handleEdit(b)}
            activeOpacity={0.85}
          >
            <View style={styles.breakdownHeader}>
              <View style={styles.breakdownAvatar}>
                <Text style={styles.breakdownAvatarText}>
                  {b.characterName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.breakdownInfo}>
                <Text style={styles.breakdownName}>{b.characterName}</Text>
                {b.projectName ? (
                  <Text style={styles.breakdownProject}>{b.projectName}</Text>
                ) : null}
                <View style={styles.progressRow}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${(filledCount(b) / FIELDS.length) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {filledCount(b)}/{FIELDS.length}
                  </Text>
                </View>
              </View>
              <View style={styles.breakdownActions}>
                <TouchableOpacity
                  onPress={() => handleDelete(b.id, b.characterName)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Trash2 size={16} color={Colors.textMuted} />
                </TouchableOpacity>
                <ChevronRight size={18} color={Colors.textMuted} />
              </View>
            </View>
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
  breakdownCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(232,168,56,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  breakdownAvatarText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.accent,
  },
  breakdownInfo: {
    flex: 1,
  },
  breakdownName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  breakdownProject: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.backgroundLight,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accent,
  },
  progressText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
  breakdownActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 8,
  },
  nameSection: {
    marginBottom: 20,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  projectInput: {
    fontSize: 16,
    color: Colors.textSecondary,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginTop: 4,
  },
  fieldCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  fieldHint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 10,
  },
  fieldInput: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 80,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#0F0F0F',
  },
});
