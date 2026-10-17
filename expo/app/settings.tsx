import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as Speech from 'expo-speech';
import * as Clipboard from 'expo-clipboard';
import { ChevronLeft, Volume2, Download, Upload } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useSettings } from '@/providers/SettingsProvider';
import { exportAllData, importAllData } from '@/utils/backup';

const RATE_OPTIONS = [0.6, 0.8, 0.9, 1.0, 1.2] as const;
const SAMPLE_LINE = 'This is how your scene partner will sound.';

interface VoiceOption {
  identifier: string;
  name: string;
  language: string;
}

export default function SettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { settings, update } = useSettings();
  const [voices, setVoices] = useState<VoiceOption[]>([]);

  useEffect(() => {
    let active = true;
    Speech.getAvailableVoicesAsync()
      .then((list) => {
        if (!active) return;
        const en = list
          .filter((v) => v.language?.toLowerCase().startsWith('en'))
          .map((v) => ({ identifier: v.identifier, name: v.name, language: v.language }));
        setVoices(en);
      })
      .catch(() => {
        if (active) setVoices([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const testVoice = useCallback(() => {
    Speech.stop();
    Speech.speak(SAMPLE_LINE, {
      rate: settings.speechRate,
      voice: settings.voiceId ?? undefined,
    });
  }, [settings.speechRate, settings.voiceId]);

  const handleExport = useCallback(async () => {
    try {
      const json = await exportAllData();
      await Clipboard.setStringAsync(json);
      Alert.alert('Backup Copied', 'Your data was copied as text. Paste it somewhere safe to keep it.');
    } catch {
      Alert.alert('Export Failed', 'Could not read your data to back it up.');
    }
  }, []);

  const handleImport = useCallback(async () => {
    const json = await Clipboard.getStringAsync();
    if (!json.trim()) {
      Alert.alert('Nothing to Restore', 'Copy a SceneReady backup first, then tap Restore.');
      return;
    }
    Alert.alert(
      'Restore From Clipboard?',
      'This replaces matching data on this device with the backup on your clipboard.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            try {
              const count = await importAllData(json);
              await queryClient.invalidateQueries();
              Alert.alert('Restored', `Brought back ${count} data ${count === 1 ? 'section' : 'sections'}.`);
            } catch (e) {
              Alert.alert('Restore Failed', e instanceof Error ? e.message : 'That backup could not be read.');
            }
          },
        },
      ]
    );
  }, [queryClient]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
              <ChevronLeft size={24} color={Colors.accent} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Scene Partner Voice</Text>
        <View style={styles.card}>
          <Text style={styles.rowLabel}>Speaking Rate</Text>
          <View style={styles.rateRow}>
            {RATE_OPTIONS.map((rate) => (
              <TouchableOpacity
                key={rate}
                style={[styles.rateBtn, settings.speechRate === rate && styles.rateBtnActive]}
                onPress={() => update({ speechRate: rate })}
              >
                <Text style={[styles.rateBtnText, settings.speechRate === rate && styles.rateBtnTextActive]}>
                  {rate}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {voices.length > 0 && (
            <>
              <Text style={[styles.rowLabel, { marginTop: 18 }]}>Voice</Text>
              <View style={styles.voiceList}>
                <TouchableOpacity
                  style={[styles.voiceChip, settings.voiceId === null && styles.voiceChipActive]}
                  onPress={() => update({ voiceId: null })}
                >
                  <Text style={[styles.voiceChipText, settings.voiceId === null && styles.voiceChipTextActive]}>
                    System Default
                  </Text>
                </TouchableOpacity>
                {voices.map((v) => (
                  <TouchableOpacity
                    key={v.identifier}
                    style={[styles.voiceChip, settings.voiceId === v.identifier && styles.voiceChipActive]}
                    onPress={() => update({ voiceId: v.identifier })}
                  >
                    <Text
                      style={[styles.voiceChipText, settings.voiceId === v.identifier && styles.voiceChipTextActive]}
                      numberOfLines={1}
                    >
                      {v.name || v.identifier}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <TouchableOpacity style={styles.testBtn} onPress={testVoice} activeOpacity={0.85}>
            <Volume2 size={16} color={Colors.accent} />
            <Text style={styles.testBtnText}>Test Voice</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Feedback</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.rowLabel}>Haptics</Text>
              <Text style={styles.rowHint}>Vibrate on taps and pins</Text>
            </View>
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={(v) => update({ hapticsEnabled: v })}
              trackColor={{ false: Colors.border, true: Colors.accentDark }}
              thumbColor={Platform.OS === 'android' ? (settings.hapticsEnabled ? Colors.accent : Colors.textMuted) : undefined}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Backup</Text>
        <Text style={styles.sectionHint}>
          SceneReady keeps everything on this device. Copy a backup before switching phones, then restore it on the new one.
        </Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRow} onPress={handleExport} activeOpacity={0.8}>
            <Download size={18} color={Colors.accent} />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Back Up My Data</Text>
              <Text style={styles.rowHint}>Copy all data to the clipboard as text</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.actionRow} onPress={handleImport} activeOpacity={0.8}>
            <Upload size={18} color={Colors.accent} />
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Restore From Clipboard</Text>
              <Text style={styles.rowHint}>Replace data with a copied backup</Text>
            </View>
          </TouchableOpacity>
        </View>

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
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHint: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 19,
    marginBottom: 10,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  rowHint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  rateRow: {
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
  voiceList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  voiceChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: '100%',
  },
  voiceChipActive: {
    backgroundColor: Colors.spotlightStrong,
    borderColor: Colors.accent,
  },
  voiceChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  voiceChipTextActive: {
    color: Colors.accent,
    fontWeight: '600' as const,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.spotlightStrong,
  },
  testBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.accent,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchText: {
    flex: 1,
    paddingRight: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 6,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
});
