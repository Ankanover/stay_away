import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Icon } from './Icons';
import { IOSToggle } from './IOSToggle';
import { useTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';

const DAY_MAP = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export const ScheduleCard = React.memo(({ schedule, isActive, onToggle, onLongPress }) => {
  const { colors } = useTheme();

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onLongPress(schedule.id);
  }, [schedule.id, onLongPress]);

  return (
    <Pressable 
      onLongPress={handleLongPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.groupedSurface },
        pressed && { transform: [{ scale: 0.98 }] }
      ]}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{schedule.name}</Text>
          <View style={styles.timeRow}>
            <Icon name="clock" size={14} color={colors.textSecondary} />
            <Text style={[styles.time, { color: colors.textSecondary }]}>
              {formatTime(schedule.start)} – {formatTime(schedule.end)}
            </Text>
          </View>
        </View>
        <IOSToggle value={schedule.active} onValueChange={() => onToggle(schedule.id)} />
      </View>

      <View style={styles.daysRow}>
        {DAY_MAP.map(d => (
          <View
            key={d}
            style={[
              styles.dayPill,
              { backgroundColor: schedule.days.includes(d) ? 'rgba(0,122,255,0.12)' : colors.separatorLight },
            ]}
          >
            <Text style={[
              styles.dayText,
              { color: schedule.days.includes(d) ? colors.blue : colors.textSecondary }
            ]}>{d}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.footer, { borderTopColor: colors.separator }]}>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {schedule.contacts.length} contact{schedule.contacts.length !== 1 ? 's' : ''}
        </Text>
        <View style={[
          styles.status,
          { backgroundColor: isActive ? 'rgba(52,199,89,0.12)' : 'rgba(142,142,147,0.12)' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: isActive ? colors.green : colors.textSecondary }
          ]}>{isActive ? 'Active Now' : 'Scheduled'}</Text>
        </View>
      </View>
    </Pressable>
  );
});

function formatTime(timeStr) {
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  name: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    letterSpacing: -0.01,
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  time: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  dayPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 100,
  },
  dayText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 0.5,
  },
  meta: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  status: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 100,
  },
  statusText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.3,
  },
});
