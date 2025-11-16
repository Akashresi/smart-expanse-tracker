// components/progressBar.tsx
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ progress, color = '#3b82f6', height = 8 }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={[styles.container, { height }]}>
      <View
        style={[
          styles.progress,
          { width: `${clampedProgress}%`, backgroundColor: color, height },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    borderRadius: 4,
  },
});