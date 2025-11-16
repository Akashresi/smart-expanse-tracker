// components/AppButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { COLORS, SIZING } from '../constants/theme';

type AppButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'success' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style = {},
}: AppButtonProps) {
  
  const getVariantStyle = () => {
    switch (variant) {
      case 'success':
        return styles.success;
      case 'danger':
        return styles.danger;
      case 'primary':
      default:
        return styles.primary;
    }
  };

  const buttonStyle = [
    styles.button,
    getVariantStyle(),
    (disabled || loading) && styles.disabled,
    style,
  ];

  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress} disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <Text style={styles.btnText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: SIZING.md - 2,
    borderRadius: SIZING.radius,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginVertical: SIZING.sm,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  success: {
    backgroundColor: COLORS.success,
  },
  danger: {
    backgroundColor: COLORS.danger,
  },
  disabled: {
    backgroundColor: COLORS.grayMedium,
  },
  btnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: SIZING.body,
  },
});