import { darkPremium, lightPremium } from '@/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type Colors = typeof lightPremium;

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  colors: Colors;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
  colors: lightPremium,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemTheme = useColorScheme();
  const [preference, setPreference] = useState<boolean | null>(null);
  const isDark = preference ?? systemTheme === 'dark';

  useEffect(() => {
    AsyncStorage.getItem('darkMode').then(val => {
      if (val === 'true' || val === 'false') setPreference(val === 'true');
    }).catch(() => {});
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setPreference(next);
    void AsyncStorage.setItem('darkMode', String(next));
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors: isDark ? darkPremium : lightPremium }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
export const usePremiumTheme = () => useContext(ThemeContext);
