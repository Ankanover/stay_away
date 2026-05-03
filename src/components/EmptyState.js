import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from './Icons';
import { useTheme } from '../context/ThemeContext';

export const EmptyState = React.memo(({ icon, title, subtitle }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconBox, { backgroundColor: colors.separatorLight }]}>
        <Icon name={icon} size={32} color={colors.textTertiary} />
      </View>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    letterSpacing: -0.02,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 240,
  },
});
