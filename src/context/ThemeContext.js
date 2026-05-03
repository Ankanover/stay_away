import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const Colors = {
  ios: {
    blue: '#007AFF',
    blueLight: '#5AC8FA',
    green: '#34C759',
    red: '#FF3B30',
    orange: '#FF9500',
    yellow: '#FFCC00',
    purple: '#AF52DE',
    teal: '#5AC8FA',
    pink: '#FF2D55',
    indigo: '#5856D6',
  },
  light: {
    bg: '#F2F2F7',
    surface: '#FFFFFF',
    surfaceSecondary: '#FFFFFF',
    groupedBg: '#F2F2F7',
    groupedSurface: '#FFFFFF',
    textPrimary: '#000000',
    textSecondary: '#8E8E93',
    textTertiary: '#C7C7CC',
    separator: '#E5E5EA',
    separatorLight: '#F2F2F7',
    overlay: 'rgba(0,0,0,0.4)',
  },
  dark: {
    bg: '#000000',
    surface: '#1C1C1E',
    surfaceSecondary: '#2C2C2E',
    groupedBg: '#000000',
    groupedSurface: '#1C1C1E',
    textPrimary: '#FFFFFF',
    textSecondary: '#8E8E93',
    textTertiary: '#48484A',
    separator: '#38383A',
    separatorLight: '#1C1C1E',
    overlay: 'rgba(0,0,0,0.7)',
  }
};

const ThemeContext = createContext({
  dark: false,
  colors: { ...Colors.light, ...Colors.ios },
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(systemScheme === 'dark');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('stayaway-theme').then(val => {
      if (val !== null) setDarkMode(val === 'dark');
      else setDarkMode(systemScheme === 'dark');
      setLoaded(true);
    });
  }, [systemScheme]);

  const toggleTheme = async () => {
    const next = !darkMode;
    setDarkMode(next);
    await AsyncStorage.setItem('stayaway-theme', next ? 'dark' : 'light');
  };

  const colors = {
    ...Colors.ios,
    ...(darkMode ? Colors.dark : Colors.light),
  };

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ dark: darkMode, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
