import { useColorScheme } from "react-native";

export const LIGHT_COLORS = {
  primary: '#1a56db',
  primaryDark: '#1e40af',
  accent: '#16a34a',
  success: '#16a34a',
  danger: '#dc2626',
  warning: '#f59e0b',
  background: '#f8fafc',
  card: '#ffffff',
  textPrimary: '#0f172a',
  textMuted: '#64748b',
  border: '#e2e8f0',
  white: '#ffffff',
  grayLight: '#f1f5f9',
  grayMedium: '#cbd5e1',
  grayDark: '#475569',
  text: '#1e293b',
};

export const DARK_COLORS = {
  primary: '#3b82f6',
  primaryDark: '#1e40af',
  accent: '#22c55e',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  background: '#0f172a',
  card: '#1e293b',
  textPrimary: '#f8fafc',
  textMuted: '#94a3b8',
  border: '#334155',
  white: '#ffffff',
  grayLight: '#334155',
  grayMedium: '#475569',
  grayDark: '#94a3b8',
  text: '#f8fafc',
};

export const useThemeColors = () => {
  const theme = useColorScheme();
  return theme === "dark" ? DARK_COLORS : LIGHT_COLORS;
};

// Fallback for non-reactive contexts
export const COLORS = LIGHT_COLORS;

// Legacy & New Hybrid Sizing
export const SIZING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  radius: 12,              // Card border radius
  body: 16,                // Body text size
  caption: 13,             // Caption text size
  h1: 28,
  h2: 24,                  // Headings size
  h3: 20,
  small: 11,
};

export const SPACING = {
  xs: 8,
  sm: 12,
  md: 16,                  // Consistent 16px horizontal pad
  lg: 24,
  xl: 32,
  screenPad: 16,
};

export const BORDER_RADIUS = {
  card: 12,                // Card border radius
  input: 10,
  pill: 50,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
};

export const TYPOGRAPHY = {
  heading: {
    fontFamily: 'System',
    fontSize: 24,
    color: COLORS.textPrimary,
    fontWeight: '700' as const,
  },
  subheading: {
    fontFamily: 'System',
    fontSize: 18,
    color: COLORS.textPrimary,
    fontWeight: '600' as const,
  },
  body: {
    fontFamily: 'System',
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '400' as const,
  },
  caption: {
    fontFamily: 'System',
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '400' as const,
  },
};