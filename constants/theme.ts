export const COLORS = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  accent: '#7C3AED',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  background: '#F8FAFC',
  card: '#FFFFFF',
  textPrimary: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  
  // Legacy compatibility colors
  white: '#FFFFFF',
  grayLight: '#F3F4F6',
  grayMedium: '#9CA3AF',
  grayDark: '#4B5563',
  text: '#1F2937',
};

// Legacy compatibility sizing
export const SIZING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  radius: 8,
  body: 16,
  caption: 12,
  h1: 24,
  h2: 20,
};

export const SPACING = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
};

export const BORDER_RADIUS = {
  card: 16,
  input: 12,
  pill: 50,
};

export const SHADOWS = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
};

export const TYPOGRAPHY = {
  heading: {
    fontFamily: 'Inter-Bold',
    fontSize: 26,
    color: COLORS.textPrimary,
  },
  subheading: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  body: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  caption: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: COLORS.textMuted,
  },
};