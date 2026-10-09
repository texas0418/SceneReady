// components/MoreApps.tsx
// The "More from Simon Shih" list at the foot of the home hub. Three sibling
// apps, each opening its App Store page, styled to sit alongside the tool cards
// without competing with them.
//
// No network: the list is static data from lib/moreApps.

import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/colors';
import { FleetApp, relatedApps, storeUrl } from '@/lib/moreApps';

export default function MoreApps() {
  const apps = relatedApps();
  if (apps.length === 0) return null;

  const open = (app: FleetApp) => {
    // openURL rejects when nothing can handle the scheme; nothing useful to say.
    Linking.openURL(storeUrl(app)).catch(() => {});
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionTitle}>More from Simon Shih</Text>
      <View style={styles.list}>
        {apps.map((app, i) => (
          <Pressable
            key={app.key}
            style={i === apps.length - 1 ? styles.itemLast : styles.item}
            onPress={() => open(app)}
            accessibilityRole="link"
            accessibilityLabel={`${app.name}, ${app.line}. Opens the App Store.`}
          >
            <Text style={styles.title}>{app.name}</Text>
            <Text style={styles.sub}>{app.line}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  list: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  itemLast: { paddingHorizontal: 16, paddingVertical: 13 },
  title: { fontSize: 15, fontWeight: '600' as const, color: Colors.textPrimary },
  sub: { fontSize: 12, color: Colors.textSecondary, marginTop: 3 },
});
