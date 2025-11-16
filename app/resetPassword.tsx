// app/resetPassword.tsx
import { useRouter } from "expo-router";
import { useState } from "react";
// ✅ 'View' has been removed from this line
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native"; 
import api from "../api/api";
import AppButton from "../components/AppButton";
import AppTextInput from "../components/AppTextInput";
import ScreenWrapper from "../components/ScreenWrapper";
import { COLORS, SIZING } from "../constants/theme";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function ResetPassword() {
  const router = useRouter();
  
  // State for verification step
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState(""); // YYYY-MM-DD

  // State for reset step
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI State
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!email || !name || !dob) {
      Alert.alert("Error", "Please fill in all verification fields.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/verify-details", {
        email,
        name,
        date_of_birth: dob,
      });
      setIsVerified(true);
      Alert.alert("Success", "User verified. You can now reset your password.");
    } catch (err: any) {
      const message = err?.response?.data?.detail || "Verification failed.";
      Alert.alert("Verification Error", message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email: email, // Use the email from the verification step
        new_password: newPassword,
      });
      Alert.alert("Success", "Your password has been reset. Please log in.", [
        { text: "OK", onPress: () => router.replace("/login") },
      ]);
    } catch (err: any) {
      const message = err?.response?.data?.detail || "Password reset failed.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scrollable style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back-outline" size={28} color={COLORS.primary} />
        <Text style={styles.backButtonText}>Back to Login</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Reset Password</Text>

      {!isVerified ? (
        <>
          <Text style={styles.subtitle}>
            Please verify your identity to continue.
          </Text>
          <AppTextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <AppTextInput 
            placeholder="Full name" 
            value={name} 
            onChangeText={setName} 
          />
          <AppTextInput
            placeholder="Date of Birth (YYYY-MM-DD)"
            value={dob}
            onChangeText={setDob}
          />
          <AppButton
            title="Verify"
            onPress={handleVerify}
            loading={loading}
            disabled={loading}
          />
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>
            Verification successful. Enter your new password.
          </Text>
          <AppTextInput
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <AppTextInput
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <AppButton
            title="Reset Password"
            onPress={handleResetPassword}
            loading={loading}
            disabled={loading}
            variant="success"
          />
        </>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: SIZING.lg, // Add some padding at the top
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZING.lg,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: SIZING.body,
    fontWeight: '600',
    marginLeft: SIZING.xs,
  },
  title: {
    fontSize: SIZING.h1,
    fontWeight: "700",
    marginBottom: SIZING.sm,
    textAlign: "center",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: SIZING.body,
    color: COLORS.grayDark,
    textAlign: 'center',
    marginBottom: SIZING.lg,
  },
});