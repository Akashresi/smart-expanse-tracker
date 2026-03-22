import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../constants/theme';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = () => {
    if (!email) return;
    setIsLoading(true);
    // Mock API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Arrow */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#0F172A" />
      </TouchableOpacity>

      <View style={styles.content}>
        <Ionicons name="mail-open-outline" size={64} color={COLORS.primary} style={styles.icon} />
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your email and we'll send you a reset link</Text>

        {!success ? (
          <>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={18} color="#64748B" style={styles.leftIcon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity style={styles.actionButton} onPress={handleReset} disabled={isLoading || !email}>
              <LinearGradient
                colors={isLoading || !email ? [COLORS.primary, COLORS.primary] : [COLORS.primary, '#7C3AED']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.gradientButton, { opacity: isLoading || !email ? 0.8 : 1 }]}
              >
                {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionButtonText}>Send Reset Link</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.successCard}>
            <Text style={styles.successText}>✓ Reset link sent! Check your inbox.</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  backButton: { padding: 16, marginTop: 10 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 100 },
  icon: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 32, paddingHorizontal: 20 },
  inputContainer: {
    backgroundColor: '#F1F5F9', borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0',
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, height: 52, marginBottom: 24, width: '100%'
  },
  leftIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: '#0F172A' },
  actionButton: { width: '100%', height: 54, borderRadius: 27, overflow: 'hidden' },
  gradientButton: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  actionButtonText: { color: COLORS.card, fontSize: 16, fontWeight: 'bold' },
  successCard: { backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#10B981', padding: 16, borderRadius: 12, width: '100%' },
  successText: { color: '#10B981', fontWeight: 'bold', textAlign: 'center', fontSize: 15 }
});
