import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/Icons';
import { EmptyState } from '../components/EmptyState';

export const ContactsScreen = () => {
  const { colors } = useTheme();
  const { contacts, schedules } = useApp();
  const insets = useSafeAreaInsets();

  const blockedIds = useMemo(() => {
    const ids = new Set();
    schedules.forEach(s => {
      if (s.active) s.contacts.forEach(c => ids.add(c.id));
    });
    return ids;
  }, [schedules]);

  const blocked = useMemo(() => contacts.filter(c => blockedIds.has(c.id)), [contacts, blockedIds]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: insets.top > 0 ? 8 : 16 }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Blocked</Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Currently Blocked</Text>

        {blocked.length === 0 ? (
          <EmptyState icon="shield" title="All Clear" subtitle="No contacts are currently being blocked" />
        ) : (
          <View style={[styles.list, { backgroundColor: colors.groupedSurface }]}>
            {blocked.map((contact, i) => (
              <View
                key={contact.id}
                style={[
                  styles.item,
                  i < blocked.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.separator }
                ]}
              >
                <View style={[styles.avatar, { backgroundColor: colors.blue }]}>
                  <Text style={styles.avatarText}>{contact.avatar}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: colors.textPrimary }]}>{contact.name}</Text>
                  <Text style={[styles.number, { color: colors.textSecondary }]}>{contact.number}</Text>
                </View>
                <View style={{ opacity: 0.8 }}>
                  <Icon name="block" size={20} color={colors.red} />
                </View>
              </View>
            ))}
          </View>
        )}
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
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.06,
    marginBottom: 10,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  list: {
    marginHorizontal: 20,
    borderRadius: 14,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
  name: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    letterSpacing: -0.01,
    marginBottom: 1,
  },
  number: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
  },
});
