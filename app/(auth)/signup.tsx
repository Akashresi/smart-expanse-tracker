import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import api from '../../api/api';
import { COLORS } from '../../constants/theme';

export default function Signup() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    age: '',
    gender: '', // 'Male' | 'Female' | 'Other'
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  // Validate Field
  const validateField = (field: string, value: string | boolean) => {
    let err = '';
    switch (field) {
      case 'fullName':
        if (!value || typeof value !== 'string' || value.length < 2) err = 'Name must be at least 2 characters';
        break;
      case 'username':
        const unRegex = /^[a-zA-Z0-9_]+$/;
        if (!value || typeof value !== 'string' || value.length < 3) err = 'Username must be at least 3 characters';
        else if (!unRegex.test(value)) err = 'Username can only contain letters, numbers, _';
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value as string)) err = 'Enter a valid email address';
        break;
      case 'phone':
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(value as string)) err = 'Enter a valid 10-digit Indian mobile number';
        break;
      case 'age':
        const ageNum = parseInt(value as string, 10);
        if (!ageNum || ageNum < 13 || ageNum > 100) err = 'Age must be between 13 and 100';
        break;
      case 'gender':
        if (!value) err = 'Please select a gender';
        break;
      case 'password':
        if (typeof value === 'string' && value.length < 8) err = 'Password must be at least 8 characters';
        break;
      case 'confirmPassword':
        if (value !== form.password) err = 'Passwords do not match';
        break;
      case 'agreedToTerms':
        if (value !== true) err = 'You must agree to the Terms of Service';
        break;
    }
    return err;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, (form as any)[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '#E2E8F0' };
    if (pass.length < 6) return { score: 1, label: 'Weak', color: COLORS.danger };
    if (pass.length < 8) return { score: 2, label: 'Fair', color: COLORS.warning };
    const hasNumSym = /[0-9!@#$%^&*]/.test(pass);
    const hasUpper = /[A-Z]/.test(pass);
    if (pass.length >= 8 && hasNumSym && !hasUpper) return { score: 3, label: 'Good', color: COLORS.primary };
    if (pass.length >= 10 && hasNumSym && hasUpper) return { score: 4, label: 'Strong', color: COLORS.success };
    return { score: 2, label: 'Fair', color: COLORS.warning }; // fallback
  };

  const strength = calculatePasswordStrength(form.password);

  const handleSignup = async () => {
    setApiError('');
    // Trigger validation for ALL fields
    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};
    let firstErrorField = '';

    Object.keys(form).forEach((key) => {
      newTouched[key] = true;
      const err = validateField(key, (form as any)[key]);
      if (err) {
        newErrors[key] = err;
        if (!firstErrorField) firstErrorField = key;
      }
    });

    setTouched(newTouched);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Validation Error', 'Please fix the highlighted errors before submitting.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: form.fullName, // matching backend schema currently
        username: form.username,
        email: form.email,
        phone: form.phone,
        age: parseInt(form.age, 10),
        gender: form.gender.toLowerCase(),
        password: form.password,
      };

      const res = await api.post('/auth/register', payload);
      
      if (res.status === 200 || res.status === 201) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)/home'); // Usually home is inside tabs
      }
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setApiError(e?.response?.data?.detail || 'An unexpected error occurred during sign up.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper for rendering input wrapper dynamically based on state
  const getInputStyle = (field: string) => {
    if (touched[field] && errors[field]) return [styles.inputContainer, styles.inputError];
    if (touched[field] && !errors[field] && (form as any)[field]) return [styles.inputContainer, styles.inputSuccess];
    return styles.inputContainer;
  };

  return (
    <View style={styles.container}>
      {/* Hero Section */}
      <LinearGradient colors={[COLORS.primary, '#7C3AED']} style={styles.hero}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.logoContainer}>
            <Ionicons name="wallet-outline" size={48} color={COLORS.card} />
            <Text style={styles.appName}>SpendSmart</Text>
            <Text style={styles.tagline}>Track. Save. Grow.</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Main Scrollable Form */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainerWrapper}
      >
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.formTitle}>Create Account</Text>
          <Text style={styles.formSubtitle}>Fill in your details to get started</Text>

          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
          <View style={getInputStyle('fullName')}>
            <Ionicons name="person-outline" size={18} color="#64748B" style={styles.leftIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={form.fullName}
              onChangeText={(txt) => handleChange('fullName', txt)}
              onBlur={() => handleBlur('fullName')}
            />
            {touched.fullName && !errors.fullName && form.fullName.length > 1 && (
              <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
            )}
          </View>
          {touched.fullName && errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

          {/* Username */}
          <Text style={styles.label}>Username</Text>
          <View style={getInputStyle('username')}>
            <Ionicons name="at-outline" size={18} color="#64748B" style={styles.leftIcon} />
            <TextInput
              style={styles.input}
              placeholder="Choose a username"
              value={form.username}
              autoCapitalize="none"
              onChangeText={(txt) => handleChange('username', txt)}
              onBlur={() => handleBlur('username')}
            />
             {touched.username && !errors.username && form.username.length > 2 && (
              <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
            )}
          </View>
          {touched.username && errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

          {/* Email */}
          <Text style={styles.label}>Email Address</Text>
          <View style={getInputStyle('email')}>
            <Ionicons name="mail-outline" size={18} color="#64748B" style={styles.leftIcon} />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              value={form.email}
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={(txt) => handleChange('email', txt)}
              onBlur={() => handleBlur('email')}
            />
          </View>
          {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* Phone */}
          <Text style={styles.label}>Phone Number</Text>
          <View style={getInputStyle('phone')}>
            <Ionicons name="call-outline" size={18} color="#64748B" style={styles.leftIcon} />
            <TextInput
              style={styles.input}
              placeholder="10-digit mobile number"
              value={form.phone}
              keyboardType="phone-pad"
              maxLength={10}
              onChangeText={(txt) => handleChange('phone', txt)}
              onBlur={() => handleBlur('phone')}
            />
          </View>
          {touched.phone && errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

          {/* Age */}
          <Text style={styles.label}>Age</Text>
          <View style={getInputStyle('age')}>
            <Ionicons name="calendar-outline" size={18} color="#64748B" style={styles.leftIcon} />
            <TextInput
              style={styles.input}
              placeholder="Your age"
              value={form.age}
              keyboardType="numeric"
              maxLength={3}
              onChangeText={(txt) => handleChange('age', txt)}
              onBlur={() => handleBlur('age')}
            />
          </View>
          {touched.age && errors.age && <Text style={styles.errorText}>{errors.age}</Text>}

          {/* Gender (Segmented Control) */}
          <Text style={styles.label}>Gender</Text>
          <View style={styles.segmentedControl}>
            {['Male', 'Female', 'Other'].map((option) => {
              const sel = form.gender === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.segmentBtn, sel && styles.segmentBtnActive]}
                  onPress={() => {
                     handleChange('gender', option);
                     handleBlur('gender');
                  }}
                >
                  <Text style={[styles.segmentTxt, sel && styles.segmentTxtActive]}>
                    {option === 'Male' ? '👨 ' : option === 'Female' ? '👩 ' : '🧑 '}{option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {touched.gender && errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <View style={getInputStyle('password')}>
            <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.leftIcon} />
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              value={form.password}
              secureTextEntry={!showPassword}
              onChangeText={(txt) => handleChange('password', txt)}
              onBlur={() => handleBlur('password')}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#64748B" />
            </TouchableOpacity>
          </View>
          {/* Password Strength */}
          {form.password.length > 0 && (
            <View style={styles.strengthContainer}>
               <View style={styles.strengthBars}>
                  {[1, 2, 3, 4].map((i) => (
                    <View key={i} style={[styles.strengthPip, { 
                      backgroundColor: strength.score >= i ? strength.color : '#E2E8F0' 
                    }]} />
                  ))}
               </View>
               <Text style={[styles.strengthText, { color: strength.color }]}>{strength.label}</Text>
            </View>
          )}
          {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          {/* Confirm Password */}
          <Text style={styles.label}>Confirm Password</Text>
          <View style={getInputStyle('confirmPassword')}>
            <Ionicons name="lock-closed-outline" size={18} color="#64748B" style={styles.leftIcon} />
            <TextInput
              style={styles.input}
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              secureTextEntry={!showConfirmPassword}
              onChangeText={(txt) => handleChange('confirmPassword', txt)}
              onBlur={() => handleBlur('confirmPassword')}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color="#64748B" />
            </TouchableOpacity>
          </View>
          {touched.confirmPassword && errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

          {/* T&C */}
          <View style={styles.termsContainer}>
            <TouchableOpacity 
              style={[styles.checkbox, form.agreedToTerms && styles.checkboxActive]}
              onPress={() => handleChange('agreedToTerms', !form.agreedToTerms)}
            >
              {form.agreedToTerms && <Ionicons name="checkmark" size={16} color="white" />}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              I agree to the <Text style={styles.linkText} onPress={() => Alert.alert('Terms')}>Terms of Service</Text> and <Text style={styles.linkText} onPress={() => Alert.alert('Privacy')}>Privacy Policy</Text>
            </Text>
          </View>
          {touched.agreedToTerms && errors.agreedToTerms && <Text style={[styles.errorText, {marginTop:-10}]}>{errors.agreedToTerms}</Text>}

          {/* API Error Banner */}
          {apiError ? (
            <View style={styles.apiErrorBanner}>
              <Text style={styles.apiErrorText}>{apiError}</Text>
            </View>
          ) : null}

          {/* Submit */}
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleSignup}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isLoading ? [COLORS.primary, COLORS.primary] : [COLORS.primary, '#7C3AED']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.gradientButton, { opacity: isLoading ? 0.8 : 1 }]}
            >
              {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionButtonText}>Create Account</Text>}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>  OR  </Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign Up */}
          <TouchableOpacity style={styles.googleButton} onPress={() => Alert.alert('Coming Soon!')}>
            <Text style={styles.googleIconText}>G</Text>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.signupText}>Sign In</Text>
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
    backgroundColor: '#F8FAFC',
  },
  hero: {
    height: height * 0.3,
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
    marginTop: 10,
  },
  tagline: {
    color: COLORS.card,
    fontSize: 13,
    opacity: 0.85,
    marginTop: 4,
  },
  formContainerWrapper: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -30,
    overflow: 'hidden',
  },
  formContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 50,
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
  inputError: {
    borderColor: COLORS.danger,
  },
  inputSuccess: {
    borderColor: COLORS.success,
  },
  leftIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: -10,
    marginBottom: 14,
    marginLeft: 4,
  },
  segmentedControl: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    flexDirection: 'row',
    marginBottom: 14,
  },
  segmentBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: COLORS.card,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  segmentTxt: {
    color: '#64748B',
    fontSize: 14,
  },
  segmentTxtActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -8,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  strengthBars: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    marginRight: 10,
  },
  strengthPip: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    width: 45,
    textAlign: 'right',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  termsText: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
    lineHeight: 18,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  apiErrorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  apiErrorText: {
    color: '#EF4444',
    fontSize: 13,
    textAlign: 'center',
  },
  actionButton: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
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
    backgroundColor: '#FFFFFF',
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
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
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
