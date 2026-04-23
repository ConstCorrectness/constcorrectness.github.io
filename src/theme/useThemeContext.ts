import { useContext } from 'react';
import { ThemeContext, type ThemeContextType } from './ThemeContextDefinition';

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
