import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

const ITEM_H = 48;
const VISIBLE = 5;
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINS  = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

function WheelColumn({ items, initialIndex, onSelect }) {
  const { colors } = useTheme();
  const ref = useRef(null);
  const [current, setCurrent] = useState(initialIndex);
  const lastHaptic = useRef(initialIndex);

  useEffect(() => {
    const t = setTimeout(() => {
      ref.current?.scrollTo({ y: initialIndex * ITEM_H, animated: false });
    }, 80);
    return () => clearTimeout(t);
  }, []);

  const handleScroll = useCallback((e) => {
    const i = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
    if (i !== lastHaptic.current && i >= 0 && i < items.length) {
      lastHaptic.current = i;
      setCurrent(i);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [items.length]);

  const handleEnd = useCallback((e) => {
    const i = Math.max(0, Math.min(Math.round(e.nativeEvent.contentOffset.y / ITEM_H), items.length - 1));
    setCurrent(i);
    onSelect(i);
  }, [items, onSelect]);

  const handleDragEnd = useCallback((e) => {
    const raw = e.nativeEvent.contentOffset.y / ITEM_H;
    const snapped = Math.round(raw) * ITEM_H;
    ref.current?.scrollTo({ y: snapped, animated: true });
    const i = Math.max(0, Math.min(Math.round(raw), items.length - 1));
    setCurrent(i);
    onSelect(i);
  }, [items, onSelect]);

  return (
    <View style={{ width: 64, height: ITEM_H * VISIBLE, overflow: 'hidden', position: 'relative' }}>
      <View style={{
        position: 'absolute', top: ITEM_H * 2, left: 4, right: 4,
        height: ITEM_H, borderTopWidth: 0.5, borderBottomWidth: 0.5,
        borderColor: colors.blue, zIndex: 2, pointerEvents: 'none',
      }} />
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={8}
        onMomentumScrollEnd={handleEnd}
        onScrollEndDrag={handleDragEnd}
        contentContainerStyle={{ paddingVertical: ITEM_H * 2 }}
      >
        {items.map((label, i) => {
          const dist = Math.abs(i - current);
          const opacity = dist === 0 ? 1 : dist === 1 ? 0.55 : dist === 2 ? 0.25 : 0.1;
          const fontSize = dist === 0 ? 26 : dist === 1 ? 22 : 18;
          const fontFamily = dist === 0 ? 'Inter_700Bold' : 'Inter_400Regular';
          const color = dist === 0 ? colors.blue : colors.textPrimary;
          return (
            <View key={i} style={{ height: ITEM_H, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize, fontFamily, color, opacity }}>{label}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

export function WheelTimePicker({ value, onChange, label }) {
  const { colors } = useTheme();
  const parts = value.split(':').map(Number);
  const hRef = useRef(parts[0]);
  const mRef = useRef(parts[1]);

  const onHour = useCallback((i) => {
    hRef.current = i;
    onChange(`${String(i).padStart(2, '0')}:${String(mRef.current).padStart(2, '0')}`);
  }, [onChange]);

  const onMin = useCallback((i) => {
    mRef.current = i;
    onChange(`${String(hRef.current).padStart(2, '0')}:${String(i).padStart(2, '0')}`);
  }, [onChange]);

  return (
    <View style={{ alignItems: 'center' }}>
      {label && (
        <Text style={{
          fontFamily: 'Inter_600SemiBold', fontSize: 11,
          color: colors.textSecondary, textTransform: 'uppercase',
          letterSpacing: 0.8, marginBottom: 6,
        }}>{label}</Text>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
        <WheelColumn items={HOURS} initialIndex={parts[0]} onSelect={onHour} />
        <Text style={{
          fontSize: 28, fontFamily: 'Inter_700Bold',
          color: colors.textPrimary, marginBottom: 4, paddingHorizontal: 2,
        }}>:</Text>
        <WheelColumn items={MINS} initialIndex={parts[1]} onSelect={onMin} />
      </View>
    </View>
  );
}
