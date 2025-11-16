// components/ScreenWrapper.tsx
import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZING } from '../constants/theme';

type ScreenWrapperProps = {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
};

export default function ScreenWrapper({
  children,
  scrollable = false,
  style,
}: ScreenWrapperProps) {
  const Container = scrollable ? ScrollView : View;
  
  const contentStyle = [
    styles.content,
    scrollable && { flexGrow: 1 }
  ];

  return (
    <SafeAreaView style={[styles.container, style]}>
      <Container style={styles.container} contentContainerStyle={contentStyle}>
        {children}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    padding: SIZING.lg,
  },
});