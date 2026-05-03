import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icons';
import { WheelTimePicker } from '../components/WheelTimePicker';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export const NewScheduleSheet = ({ navigation }) => {
  const { colors } = useTheme();
  const { contacts, contactsPermission, toggleContact, resetSelections, addSchedule } = useApp();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [selectedDays, setSelectedDays] = useState([]);
  const [search, setSearch] = useState('');

  const toggleDay = useCallback((day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  }, []);

  const selectedContacts = contacts.filter(c => c.selected);

  const handleCreate = useCallback(() => {
    if (!name.trim()) return;
    if (selectedContacts.length === 0) return;
    if (selectedDays.length === 0) return;

    const schedule = {
      id: Date.now().toString(),
      name: name.trim(),
      start: startTime,
      end: endTime,
      days: selectedDays,
      contacts: selectedContacts.map(c => ({ ...c })),
      active: true,
      createdAt: new Date().toISOString(),
    };

    addSchedule(schedule);
    resetSelections();
    navigation.goBack();
  }, [name, startTime, endTime, selectedDays, selectedContacts, addSchedule, resetSelections, navigation]);

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.separator }]}>
          <Pressable onPress={() => { resetSelections(); navigation.goBack(); }} hitSlop={8}>
            <Text style={[styles.headerBtn, { color: colors.textSecondary }]}>Cancel</Text>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>New Schedule</Text>
          <Pressable onPress={handleCreate} hitSlop={8}>
            <Text style={[styles.headerBtn, { color: colors.blue, opacity: (!name || selectedContacts.length === 0) ? 0.4 : 1 }]}>
              Create
            </Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
          {/* Name */}
          <View style={[styles.group, { backgroundColor: colors.groupedSurface, marginTop: 20 }]}>
            <View style={[styles.inputRow, { borderBottomColor: colors.separator }]}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Name</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Work Hours"
                placeholderTextColor={colors.textTertiary}
                value={name}
                onChangeText={setName}
                maxLength={30}
              />
            </View>
          </View>

          {/* Time */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Time Range</Text>
          <View style={[styles.timePickerCard, { backgroundColor: colors.groupedSurface }]}>
            <View style={styles.timePickerRow}>
              <View style={styles.timePickerSide}>
                <WheelTimePicker label="Start" value={startTime} onChange={setStartTime} />
              </View>
              <View style={[styles.timePickerDivider, { backgroundColor: colors.separator }]} />
              <View style={styles.timePickerSide}>
                <WheelTimePicker label="End" value={endTime} onChange={setEndTime} />
              </View>
            </View>
          </View>

          {/* Days */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Repeat</Text>
          <View style={styles.daysRow}>
            {DAYS.map(day => (
              <Pressable
                key={day}
                onPress={() => toggleDay(day)}
                style={[
                  styles.dayChip,
                  {
                    backgroundColor: selectedDays.includes(day) ? colors.blue : colors.groupedSurface,
                    transform: [{ scale: selectedDays.includes(day) ? 1.05 : 1 }],
                  },
                ]}
              >
                <Text style={[
                  styles.dayText,
                  { color: selectedDays.includes(day) ? '#fff' : colors.textPrimary }
                ]}>{day[0]}</Text>
              </Pressable>
            ))}
          </View>

          {/* Contacts */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Block Contacts</Text>
          <TextInput
            style={[styles.search, { backgroundColor: colors.groupedSurface, color: colors.textPrimary }]}
            placeholder="Search"
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />

          {contactsPermission === 'denied' && (
            <View style={{ marginBottom: 10, padding: 12, backgroundColor: 'rgba(255,59,48,0.1)', borderRadius: 10 }}>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: '#FF3B30', textAlign: 'center' }}>
                Contacts permission denied. Go to Settings → Privacy → Contacts to enable it.
              </Text>
            </View>
          )}
          <View style={[styles.contactList, { backgroundColor: colors.groupedSurface }]}>
            {filteredContacts.map((contact, i) => (
              <Pressable
                key={contact.id}
                onPress={() => toggleContact(contact.id)}
                style={[
                  styles.contactRow,
                  i < filteredContacts.length - 1 && { borderBottomColor: colors.separator, borderBottomWidth: 0.5 },
                  contact.selected && { backgroundColor: 'rgba(0,122,255,0.06)' },
                ]}
              >
                <View style={[styles.avatar, { backgroundColor: colors.blue }]}>
                  <Text style={styles.avatarText}>{contact.avatar}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.contactName, { color: colors.textPrimary }]}>{contact.name}</Text>
                  <Text style={[styles.contactNumber, { color: colors.textSecondary }]}>{contact.number}</Text>
                </View>
                <View style={[
                  styles.check,
                  {
                    backgroundColor: contact.selected ? colors.blue : 'transparent',
                    borderColor: contact.selected ? colors.blue : colors.textTertiary,
                  }
                ]}>
                  {contact.selected && <Icon name="check" size={12} color="#fff" />}
                </View>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.count, { color: colors.textSecondary }]}>
            {selectedContacts.length} selected
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
    letterSpacing: -0.01,
  },
  headerBtn: {
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    minWidth: 60,
    textAlign: 'center',
  },
  group: {
    marginHorizontal: 20,
    borderRadius: 14,
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    width: 70,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    textAlign: 'right',
  },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.06,
    marginTop: 24,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  timePickerCard: {
    marginHorizontal: 20,
    borderRadius: 14,
    overflow: 'hidden',
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timePickerSide: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  timePickerDivider: {
    width: 0.5,
    height: 120,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 8,
  },
  dayChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  dayText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  search: {
    marginHorizontal: 20,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    marginBottom: 12,
  },
  contactList: {
    marginHorizontal: 20,
    borderRadius: 14,
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#fff',
  },
  contactName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    letterSpacing: -0.01,
    marginBottom: 1,
  },
  contactNumber: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
  },
});
