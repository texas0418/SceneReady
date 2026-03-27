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
  ChevronLeft,
  Trash2,
  Calendar,
  MapPin,
  Film,
  Tv,
  Theater,
  Megaphone,
  Mic2,
  CircleDot,
  Clock,
  Share2,
  CheckCircle2,
  ArrowUpCircle,
  XCircle,
  Star,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuditionTracker, Audition } from '@/providers/AuditionTrackerProvider';

const AUDITION_TYPES: { value: Audition['type']; label: string; icon: any; color: string }[] = [
  { value: 'film', label: 'Film', icon: Film, color: '#64B5F6' },
  { value: 'tv', label: 'TV', icon: Tv, color: '#81C784' },
  { value: 'theater', label: 'Theater', icon: Theater, color: '#CE93D8' },
  { value: 'commercial', label: 'Commercial', icon: Megaphone, color: '#FFB74D' },
  { value: 'voiceover', label: 'V/O', icon: Mic2, color: '#F48FB1' },
  { value: 'other', label: 'Other', icon: CircleDot, color: '#90CAF9' },
];

const STATUS_OPTIONS: { value: Audition['status']; label: string; icon: any; color: string }[] = [
  { value: 'upcoming', label: 'Upcoming', icon: Clock, color: '#64B5F6' },
  { value: 'completed', label: 'Completed', icon: CheckCircle2, color: Colors.textSecondary },
  { value: 'callback', label: 'Callback', icon: ArrowUpCircle, color: '#FFB74D' },
  { value: 'booked', label: 'Booked!', icon: Star, color: '#81C784' },
  { value: 'passed', label: 'Passed', icon: XCircle, color: '#E57373' },
];

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AuditionTrackerScreen() {
  const router = useRouter();
  const { auditions, addAudition, updateAudition, deleteAudition } = useAuditionTracker();
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<Audition['status'] | 'all'>('all');
  const formAnim = useRef(new Animated.Value(0)).current;

  const [projectName, setProjectName] = useState('');
  const [role, setRole] = useState('');
  const [castingDirector, setCastingDirector] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState<Audition['type']>('film');
  const [notes, setNotes] = useState('');
  const [sides, setSides] = useState('');

  const toggleForm = useCallback(() => {
    const toValue = showForm ? 0 : 1;
    setShowForm(!showForm);
    Animated.timing(formAnim, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showForm, formAnim]);

  const resetForm = useCallback(() => {
    setProjectName('');
    setRole('');
    setCastingDirector('');
    setDate('');
    setTime('');
    setLocation('');
    setType('film');
    setNotes('');
    setSides('');
  }, []);

  const handleSave = useCallback(() => {
    if (!projectName.trim()) {
      Alert.alert('Required', 'Please enter a project name.');
      return;
    }
    if (!role.trim()) {
      Alert.alert('Required', 'Please enter the role name.');
      return;
    }

    addAudition({
      projectName: projectName.trim(),
      role: role.trim(),
      castingDirector: castingDirector.trim(),
      date: date.trim(),
      time: time.trim(),
      location: location.trim(),
      type,
      status: 'upcoming',
      notes: notes.trim(),
      sides: sides.trim(),
    });

    resetForm();
    toggleForm();
  }, [projectName, role, castingDirector, date, time, location, type, notes, sides, addAudition, resetForm, toggleForm]);

  const handleStatusChange = useCallback((id: string, newStatus: Audition['status']) => {
    updateAudition(id, { status: newStatus });
  }, [updateAudition]);

  const handleDelete = useCallback((id: string, name: string) => {
    Alert.alert('Delete Audition', `Remove "${name}" from your tracker?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteAudition(id) },
    ]);
  }, [deleteAudition]);

  const handleShare = useCallback(async (audition: Audition) => {
    const typeConfig = AUDITION_TYPES.find((t) => t.value === audition.type);
    const statusConfig = STATUS_OPTIONS.find((s) => s.value === audition.status);
    const parts = [
      `🎬 ${audition.projectName}`,
      `Role: ${audition.role}`,
      typeConfig ? `Type: ${typeConfig.label}` : '',
      audition.castingDirector ? `Casting: ${audition.castingDirector}` : '',
      audition.date ? `Date: ${audition.date}${audition.time ? ' at ' + audition.time : ''}` : '',
      audition.location ? `Location: ${audition.location}` : '',
      statusConfig ? `Status: ${statusConfig.label}` : '',
      audition.notes ? `\nNotes: ${audition.notes}` : '',
    ].filter(Boolean);

    try {
      await Share.share({ message: parts.join('\n') });
    } catch {}
  }, []);

  const getTypeConfig = useCallback((t: Audition['type']) => {
    return AUDITION_TYPES.find((at) => at.value === t) ?? AUDITION_TYPES[0];
  }, []);

  const getStatusConfig = useCallback((s: Audition['status']) => {
    return STATUS_OPTIONS.find((so) => so.value === s) ?? STATUS_OPTIONS[0];
  }, []);

  const filteredAuditions = filterStatus === 'all'
    ? auditions
    : auditions.filter((a) => a.status === filterStatus);

  const formHeight = formAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 720],
  });

  // Stats
  const totalAuditions = auditions.length;
  const callbacks = auditions.filter((a) => a.status === 'callback').length;
  const booked = auditions.filter((a) => a.status === 'booked').length;
  const upcoming = auditions.filter((a) => a.status === 'upcoming').length;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{
        title: 'Audition Tracker',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <ChevronLeft size={24} color={Colors.accent} />
          </TouchableOpacity>
        ),
      }} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {totalAuditions > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{totalAuditions}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#64B5F6' }]}>{upcoming}</Text>
              <Text style={styles.statLabel}>Upcoming</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#FFB74D' }]}>{callbacks}</Text>
              <Text style={styles.statLabel}>Callbacks</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#81C784' }]}>{booked}</Text>
              <Text style={styles.statLabel}>Booked</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={toggleForm}
          activeOpacity={0.8}
        >
          <Plus size={20} color={Colors.accent} />
          <Text style={styles.addButtonText}>
            {showForm ? 'Cancel' : 'New Audition'}
          </Text>
        </TouchableOpacity>

        <Animated.View style={[styles.formWrap, { maxHeight: formHeight, overflow: 'hidden' }]}>
          <View style={styles.form}>
            <Text style={styles.formLabel}>Project Name *</Text>
            <TextInput
              style={styles.input}
              value={projectName}
              onChangeText={setProjectName}
              placeholder="e.g. The Morning Show Season 4"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.formLabel}>Role *</Text>
            <TextInput
              style={styles.input}
              value={role}
              onChangeText={setRole}
              placeholder="e.g. Nurse Jenkins"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.formLabel}>Type</Text>
            <View style={styles.typeRow}>
              {AUDITION_TYPES.map((at) => {
                const Icon = at.icon;
                return (
                  <TouchableOpacity
                    key={at.value}
                    style={[
                      styles.typeChip,
                      type === at.value && { backgroundColor: at.color + '30', borderColor: at.color },
                    ]}
                    onPress={() => setType(at.value)}
                  >
                    <Icon size={14} color={type === at.value ? at.color : Colors.textMuted} />
                    <Text style={[styles.typeChipText, type === at.value && { color: at.color }]}>
                      {at.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.formLabel}>Casting Director</Text>
            <TextInput
              style={styles.input}
              value={castingDirector}
              onChangeText={setCastingDirector}
              placeholder="e.g. Jane Smith Casting"
              placeholderTextColor={Colors.textMuted}
            />

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <Text style={styles.formLabel}>Date</Text>
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholder="e.g. Mar 15, 2026"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.formLabel}>Time</Text>
                <TextInput
                  style={styles.input}
                  value={time}
                  onChangeText={setTime}
                  placeholder="e.g. 2:30 PM"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>

            <Text style={styles.formLabel}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Self-tape / Studio B, Burbank"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.formLabel}>Notes</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Agent notes, wardrobe, direction given..."
              placeholderTextColor={Colors.textMuted}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>Save Audition</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {totalAuditions > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[styles.filterChip, filterStatus === 'all' && styles.filterChipActive]}
                onPress={() => setFilterStatus('all')}
              >
                <Text style={[styles.filterChipText, filterStatus === 'all' && styles.filterChipTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              {STATUS_OPTIONS.map((so) => (
                <TouchableOpacity
                  key={so.value}
                  style={[styles.filterChip, filterStatus === so.value && { backgroundColor: so.color + '25', borderColor: so.color }]}
                  onPress={() => setFilterStatus(so.value)}
                >
                  <Text style={[styles.filterChipText, filterStatus === so.value && { color: so.color }]}>
                    {so.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {filteredAuditions.length === 0 && !showForm && (
          <View style={styles.emptyState}>
            <Calendar size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>
              {totalAuditions === 0 ? 'No Auditions Yet' : 'No matching auditions'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {totalAuditions === 0
                ? 'Log your auditions to track your progress and identify patterns in your bookings.'
                : 'Try a different filter to see your auditions.'}
            </Text>
          </View>
        )}

        {filteredAuditions.map((audition) => {
          const typeConfig = getTypeConfig(audition.type);
          const statusConfig = getStatusConfig(audition.status);
          const TypeIcon = typeConfig.icon;
          const StatusIcon = statusConfig.icon;
          const isExpanded = expandedId === audition.id;

          return (
            <TouchableOpacity
              key={audition.id}
              style={styles.entryCard}
              onPress={() => setExpandedId(isExpanded ? null : audition.id)}
              activeOpacity={0.85}
            >
              <View style={styles.entryHeader}>
                <View style={styles.entryHeaderLeft}>
                  <View style={[styles.typeIcon, { backgroundColor: typeConfig.color + '20' }]}>
                    <TypeIcon size={18} color={typeConfig.color} />
                  </View>
                  <View style={styles.entryTitleWrap}>
                    <Text style={styles.entryTitle} numberOfLines={1}>{audition.projectName}</Text>
                    <Text style={styles.entryRole}>{audition.role}</Text>
                  </View>
                </View>
                <View style={styles.entryHeaderRight}>
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
                    <StatusIcon size={12} color={statusConfig.color} />
                    <Text style={[styles.statusBadgeText, { color: statusConfig.color }]}>
                      {statusConfig.label}
                    </Text>
                  </View>
                  {isExpanded ? (
                    <ChevronUp size={18} color={Colors.textMuted} />
                  ) : (
                    <ChevronDown size={18} color={Colors.textMuted} />
                  )}
                </View>
              </View>

              {audition.date ? (
                <Text style={styles.entryDate}>
                  {audition.date}{audition.time ? ` · ${audition.time}` : ''}
                </Text>
              ) : null}

              {isExpanded && (
                <View style={styles.entryBody}>
                  {audition.castingDirector ? (
                    <View style={styles.entryDetail}>
                      <Text style={styles.entryDetailLabel}>Casting</Text>
                      <Text style={styles.entryDetailText}>{audition.castingDirector}</Text>
                    </View>
                  ) : null}
                  {audition.location ? (
                    <View style={styles.entryDetail}>
                      <MapPin size={13} color={Colors.textMuted} />
                      <Text style={styles.entryDetailText}>{audition.location}</Text>
                    </View>
                  ) : null}
                  {audition.notes ? (
                    <View style={styles.entrySection}>
                      <Text style={styles.entrySectionLabel}>Notes</Text>
                      <Text style={styles.entrySectionText}>{audition.notes}</Text>
                    </View>
                  ) : null}

                  <Text style={[styles.formLabel, { marginTop: 16 }]}>Update Status</Text>
                  <View style={styles.statusRow}>
                    {STATUS_OPTIONS.map((so) => {
                      const SIcon = so.icon;
                      return (
                        <TouchableOpacity
                          key={so.value}
                          style={[
                            styles.statusBtn,
                            audition.status === so.value && { backgroundColor: so.color + '25', borderColor: so.color },
                          ]}
                          onPress={() => handleStatusChange(audition.id, so.value)}
                        >
                          <SIcon size={14} color={audition.status === so.value ? so.color : Colors.textMuted} />
                          <Text style={[styles.statusBtnText, audition.status === so.value && { color: so.color }]}>
                            {so.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleShare(audition)}
                    >
                      <Share2 size={16} color={Colors.accent} />
                      <Text style={styles.actionBtnText}>Share</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleDelete(audition.id, audition.projectName)}
                    >
                      <Trash2 size={16} color={Colors.error} />
                      <Text style={[styles.actionBtnText, { color: Colors.error }]}>Delete</Text>
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
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    fontWeight: '500' as const,
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
    marginBottom: 16,
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
    marginBottom: 16,
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
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  filterScroll: {
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundLight,
  },
  filterChipActive: {
    backgroundColor: Colors.spotlightStrong,
    borderColor: Colors.accent,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textMuted,
  },
  filterChipTextActive: {
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
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
  entryRole: {
    fontSize: 13,
    color: Colors.accent,
    marginTop: 1,
    fontWeight: '500' as const,
  },
  entryDate: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 8,
    marginLeft: 48,
  },
  entryHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  entryBody: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  entryDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  entryDetailLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.textMuted,
  },
  entryDetailText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  entrySection: {
    marginTop: 8,
    marginBottom: 4,
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
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundLight,
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  actionBtnText: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '500' as const,
  },
});
