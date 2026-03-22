import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import api from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

const { height } = Dimensions.get('window');

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [identifierType, setIdentifierType] = useState<'username' | 'email' | ''>('');

  useEffect(() => {
    setIdentifierType(
      identifier.includes('@') ? 'email' : identifier.length > 0 ? 'username' : ''
    );
  }, [identifier]);

  const handleLogin = async () => {
    setError('');
    if (!identifier || !password) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError('Please enter both username/email and password');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', identifier);
      formData.append('password', password);

      const res = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.user && res.data?.access_token) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await login(res.data.user, res.data.access_token);
        router.replace('/(tabs)/home'); // Usually tabs is the root
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError('Login failed: Unexpected response.');
      }
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(e?.response?.data?.detail || 'Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert('Coming Soon', 'Google sign-in will be available soon!');
  };

  return (
    <View style={styles.container}>
      {/* Top 35% Hero Area */}
      <LinearGradient colors={[COLORS.primary, '#7C3AED']} style={styles.hero}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.logoContainer}>
            <Ionicons name="shield-checkmark" size={52} color={COLORS.card} />
            <Text style={styles.appName}>Welcome Back</Text>
            <Text style={styles.tagline}>Sign in to your account</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Bottom 65% Card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.formTitle}>Sign In</Text>
          <Text style={styles.formSubtitle}>Enter your username or email and password</Text>

          {/* Identifier Field */}
          <Text style={styles.label}>Username or Email</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-circle-outline" size={18} color={COLORS.textMuted} style={styles.leftIcon} />
            <TextInput
              style={styles.input}
              placeholder="Username or email address"
              placeholderTextColor={COLORS.textMuted}
              value={identifier}
              onChangeText={setIdentifier}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
            {identifierType === 'email' && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Email</Text>
              </View>
            )}
            {identifierType === 'username' && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Username</Text>
              </View>
            )}
          </View>

          {/* Password Field */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.leftIcon} />
            <TextInput
              style={styles.input}
              placeholder="Your password"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.rightIcon}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Remember Me & Forgot Password */}
          <View style={styles.optionsRow}>
            <View style={styles.rememberRow}>
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                style={{ transform: [{ scale: 0.8 }] }}
              />
              <Text style={styles.rememberText}>Remember me</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Error Banner */}
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}

          {/* Sign In Button */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary, '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.card} />
              ) : (
                <Text style={styles.actionButtonText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>  OR  </Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Button */}
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
            <Text style={styles.googleIconText}>G</Text>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Biometric Placeholder */}
          <View style={styles.biometricContainer}>
            <TouchableOpacity onPress={() => Alert.alert('Coming soon!')} style={styles.biometricBtn}>
              <Ionicons name="finger-print" size={32} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.biometricText}>Use Biometric Login</Text>
          </View>

          {/* Footer Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.signupText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // fallback BG
  },
  hero: {
    height: height * 0.35,
    width: '100%',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: -20,
  },
  appName: {
    color: COLORS.card,
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 12,
  },
  tagline: {
    color: COLORS.card,
    fontSize: 13,
    opacity: 0.85,
    marginTop: 4,
  },
  formContainer: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -40,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  formSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 24,
    marginTop: 4,
  },
  label: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  inputContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 14,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    padding: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  badge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    fontSize: 13,
    color: '#64748B',
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: '#EF4444',
    fontSize: 13,
    textAlign: 'center',
  },
  actionButton: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  gradientButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 13,
    color: '#64748B',
  },
  googleButton: {
    width: '100%',
    height: 52,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  googleIconText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#4285F4',
    marginRight: 10,
  },
  googleButtonText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
  },
  biometricContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  biometricBtn: {
    padding: 8,
  },
  biometricText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  footerText: {
    color: '#64748B',
    fontSize: 14,
  },
  signupText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
