import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icons';
import { ScheduleCard } from '../components/ScheduleCard';
import { EmptyState } from '../components/EmptyState';
import { useNavigation } from '@react-navigation/native';

const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export const HomeScreen = () => {
  const { colors, toggleTheme, dark } = useTheme();
  const { schedules, logs, toggleSchedule, deleteSchedule } = useApp();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const activeCount = useMemo(() => {
    const now = new Date();
    const currentDay = DAY_NAMES[now.getDay()];
    const currentMin = now.getHours() * 60 + now.getMinutes();
    return schedules.filter(s => {
      if (!s.active || !s.days.includes(currentDay)) return false;
      const [sh, sm] = s.start.split(':').map(Number);
      const [eh, em] = s.end.split(':').map(Number);
      const startMin = sh * 60 + sm;
      const endMin = eh * 60 + em;
      return currentMin >= startMin && currentMin <= endMin;
    }).length;
  }, [schedules]);

  const statusText = useMemo(() => {
    if (activeCount > 0) {
      const names = schedules
        .filter(s => {
          const now = new Date();
          const currentDay = DAY_NAMES[now.getDay()];
          const currentMin = now.getHours() * 60 + now.getMinutes();
          if (!s.active || !s.days.includes(currentDay)) return false;
          const [sh, sm] = s.start.split(':').map(Number);
          const [eh, em] = s.end.split(':').map(Number);
          return currentMin >= sh * 60 + sm && currentMin <= eh * 60 + em;
        })
        .map(s => s.name)
        .join(', ');
      return names;
    }
    if (schedules.some(s => s.active)) return 'Scheduled';
    return 'No active schedules';
  }, [activeCount, schedules]);

  const isActive = useCallback((schedule) => {
    const now = new Date();
    const currentDay = DAY_NAMES[now.getDay()];
    const currentMin = now.getHours() * 60 + now.getMinutes();
    if (!schedule.active || !schedule.days.includes(currentDay)) return false;
    const [sh, sm] = schedule.start.split(':').map(Number);
    const [eh, em] = schedule.end.split(':').map(Number);
    return currentMin >= sh * 60 + sm && currentMin <= eh * 60 + em;
  }, []);

  const handleLongPress = useCallback((id) => {
    deleteSchedule(id);
  }, [deleteSchedule]);

  const recentLogs = useMemo(() => logs.slice(0, 6), [logs]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top > 0 ? 8 : 16 }]}>
          <Text style={[styles.brand, { color: colors.blue }]}>Stay Away</Text>
          <Pressable onPress={toggleTheme} hitSlop={8}>
            <Icon name={dark ? 'moon' : 'sun'} size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>Active Now</Text>
          <Text style={[styles.heroValue, { color: colors.textPrimary }]}>{activeCount}</Text>
          <Text style={[styles.heroSub, { color: colors.textSecondary }]} numberOfLines={1}>
            {statusText}
          </Text>
        </View>

        {/* CTA */}
        <Pressable
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: colors.blue, opacity: pressed ? 0.9 : 1 },
          ]}
          onPress={() => navigation.navigate('NewSchedule')}
        >
          <Icon name="plus" size={22} color="#fff" />
          <Text style={styles.ctaText}>New Schedule</Text>
        </Pressable>

        {/* Schedules */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Active Schedules</Text>
        {schedules.length === 0 ? (
          <EmptyState icon="clock" title="No Schedules" subtitle="Tap the button above to create your first blocking schedule" />
        ) : (
          <View style={styles.list}>
            {schedules.map(s => (
              <ScheduleCard
                key={s.id}
                schedule={s}
                isActive={isActive(s)}
                onToggle={toggleSchedule}
                onLongPress={handleLongPress}
              />
            ))}
          </View>
        )}

        {/* Activity */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 28 }]}>Recent Activity</Text>
        <View style={[styles.logCard, { backgroundColor: colors.groupedSurface }]}>
          {recentLogs.length === 0 ? (
            <EmptyState icon="clock" title="" subtitle="No recent activity" />
          ) : (
            recentLogs.map((log, i) => (
              <View key={i} style={[styles.logItem, i < recentLogs.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.separator }]}>
                <View style={[
                  styles.logIcon,
                  { backgroundColor: log.type === 'block' ? 'rgba(255,59,48,0.12)' : 'rgba(52,199,89,0.12)' }
                ]}>
                  <Icon name={log.type} size={16} color={log.type === 'block' ? colors.red : colors.green} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.logTitle, { color: colors.textPrimary }]}>{log.message}</Text>
                  <Text style={[styles.logTime, { color: colors.textSecondary }]}>
                    {new Date(log.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  brand: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 28,
    letterSpacing: -0.03,
  },
  hero: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
  },
  heroLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.06,
    marginBottom: 6,
  },
  heroValue: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 52,
    letterSpacing: -0.03,
    lineHeight: 56,
  },
  heroSub: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    marginTop: 6,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 28,
    height: 56,
    borderRadius: 14,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  ctaText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: '#fff',
    letterSpacing: -0.01,
  },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.06,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  list: {
    paddingHorizontal: 20,
  },
  logCard: {
    marginHorizontal: 20,
    borderRadius: 14,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  logIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    letterSpacing: -0.01,
    marginBottom: 2,
  },
  logTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
});
