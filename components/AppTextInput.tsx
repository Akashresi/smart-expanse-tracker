// components/AppTextInput.tsx
import React from 'react';
import { 
  TextInput, 
  StyleSheet, 
  TextInputProps, 
  View, 
  StyleProp,
  TextStyle
} from 'react-native';
import { COLORS, SIZING } from '../constants/theme';

interface AppTextInputProps extends TextInputProps {
  style?: StyleProp<TextStyle>;
}

export default function AppTextInput(props: AppTextInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, props.style]}
        placeholderTextColor={COLORS.grayDark}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: SIZING.md - 4,
  },
  input: {
    backgroundColor: COLORS.grayLight,
    borderWidth: 1,
    borderColor: COLORS.grayMedium,
    padding: SIZING.md - 2,
    borderRadius: SIZING.radius,
    fontSize: SIZING.body,
    color: COLORS.text,
  },
});