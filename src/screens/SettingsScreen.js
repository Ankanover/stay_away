import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { IOSToggle } from '../components/IOSToggle';

export const SettingsScreen = () => {
  const { colors, dark, toggleTheme } = useTheme();
  const { settings, updateSettings } = useApp();
  const insets = useSafeAreaInsets();

  const renderGroup = (title, children) => (
    <View style={{ marginBottom: 28 }}>
      <Text style={[styles.groupLabel, { color: colors.textSecondary }]}>{title}</Text>
      <View style={[styles.group, { backgroundColor: colors.groupedSurface }]}>
        {children}
      </View>
    </View>
  );

  const renderItem = (title, subtitle, right) => (
    <View style={[styles.item, { borderBottomColor: colors.separator }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle && <Text style={[styles.itemSub, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: insets.top > 0 ? 8 : 16 }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
        </View>

        <View style={[styles.infoBanner, { backgroundColor: 'rgba(255,149,0,0.12)', borderColor: 'rgba(255,149,0,0.3)' }]}>
          <Text style={[styles.infoTitle, { color: '#FF9500' }]}>⚠️  Call Blocking Limitation</Text>
          <Text style={[styles.infoBody, { color: colors.textSecondary }]}>
            Real call blocking requires a native CallKit extension and cannot run in Expo Go. Build a standalone app via EAS Build to enable actual call interception. All schedules and contacts work fully here.
          </Text>
        </View>

        {renderGroup('Call Blocking', (
          <>
            {renderItem('Emergency Bypass', 'Auto-unblock after repeated calls',
              <IOSToggle value={settings.emergencyBypass} onValueChange={(v) => updateSettings({ emergencyBypass: v })} />
            )}
            {renderItem('Call Threshold', 'Calls needed to trigger unblock',
              <Text style={[styles.detail, { color: colors.textSecondary }]}>{settings.threshold} Calls</Text>
            )}
          </>
        ))}

        {renderGroup('Notifications', (
          <>
            {renderItem('Block Alerts', 'Show notification when call is blocked',
              <IOSToggle value={settings.notifications} onValueChange={(v) => updateSettings({ notifications: v })} />
            )}
          </>
        ))}

        {renderGroup('Appearance', (
          <>
            {renderItem('Dark Mode', '',
              <IOSToggle value={dark} onValueChange={toggleTheme} />
            )}
          </>
        ))}

        <View style={{ alignItems: 'center', marginTop: 20, paddingHorizontal: 20 }}>
          <Text style={[styles.footer, { color: colors.textTertiary }]}>Stay Away v1.0</Text>
          <Text style={[styles.footerSub, { color: colors.textTertiary }]}>Designed for iOS</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    letterSpacing: -0.01,
  },
  groupLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.06,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  group: {
    marginHorizontal: 20,
    borderRadius: 14,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 52,
    borderBottomWidth: 0.5,
  },
  itemTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    letterSpacing: -0.01,
  },
  itemSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    marginTop: 1,
  },
  detail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  infoBanner: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 0.5,
    padding: 14,
  },
  infoTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    marginBottom: 6,
  },
  infoBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  footerSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    marginTop: 4,
  },
});
