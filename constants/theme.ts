// constants/theme.ts
import { Dimensions } from 'react-native';

export const COLORS = {
  primary: '#007AFF', // Main blue
  primaryDark: '#0056b3',
  secondary: '#3b82f6', // Chatbot blue
  
  success: '#2ecc71', // History green
  successLight: '#6BCB77',
  danger: '#ff6b6b', // History red
  dangerLight: '#ff7675',
  warning: '#f59e0b', // Analytics tip
  
  white: '#FFFFFF',
  black: '#000000',
  
  // Grays
  grayLight: '#f9fafb', // Lightest background
  grayMedium: '#e5e7eb', // Borders
  grayDark: '#6b7280', // Subtitles, inactive icons
  text: '#111827', // Main text
};

export const SIZING = {
  // Spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,

  // Borders
  radius: 8,
  
  // Font Sizes
  h1: 24,
  h2: 22,
  h3: 18,
  body: 16,
  caption: 14,
  small: 12,
};

export const screenWidth = Dimensions.get('window').width;
export const screenHeight = Dimensions.get('window').height;