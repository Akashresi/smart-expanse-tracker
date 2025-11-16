// app/signup.tsx
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons"; 
import api from "../api/api"; 
import AppButton from "../components/AppButton"; 
import AppTextInput from "../components/AppTextInput"; 
import ScreenWrapper from "../components/ScreenWrapper"; 
import { useAuth } from "../contexts/AuthContext"; 
import { COLORS, SIZING } from "../constants/theme"; 

export default function Signup() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState(""); // YYYY-MM-DD
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const validateAndSubmit = async () => {
    if (!name || !email || !dob || !age || !gender || !password) {
      Alert.alert("All fields are required");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      Alert.alert("Date of birth must be YYYY-MM-DD");
      return;
    }

    const payload = {
      name,
      email,
      password,
      date_of_birth: dob,
      age: parseInt(age, 10),
      gender,
    };

    setLoading(true);
    try {
      const res = await api.post("/auth/register", payload);

      if (res.data && res.data.user && res.data.access_token) {
        const user = res.data.user;
        const token = res.data.access_token;

        await login(user, token); // This function now handles storage
        
        Alert.alert("Registered", "You are now logged in.", [
          { text: "OK", onPress: () => router.replace("/tabs") },
        ]);
      } else {
        Alert.alert("Registration failed");
      }
    } catch (err: any) {
      console.warn(err);
      const message = err?.response?.data?.detail || err.message || "Error registering";
      Alert.alert("Error", message.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scrollable> 
      <Text style={styles.title}>Create account</Text>

      <AppTextInput placeholder="Full name" value={name} onChangeText={setName} />
      <AppTextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <View style={styles.passwordContainer}>
        <AppTextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!isPasswordVisible}
          style={styles.passwordInput}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <Ionicons
            name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
            size={24}
            color={COLORS.grayDark}
          />
        </TouchableOpacity>
      </View>

      <AppTextInput
        placeholder="Date of Birth (YYYY-MM-DD)"
        value={dob}
        onChangeText={setDob}
      />
      <AppTextInput
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
      <AppTextInput
        placeholder="Gender"
        value={gender}
        onChangeText={setGender}
      />

      <AppButton
        title="Register"
        onPress={validateAndSubmit}
        loading={loading}
        disabled={loading}
      />

      <TouchableOpacity onPress={() => router.push("/login")} style={styles.loginLink}>
        <Text style={styles.loginText}>
          Already have an account? <Text style={styles.loginLinkText}>Login</Text>
        </Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: SIZING.h1,
    fontWeight: "700",
    marginBottom: SIZING.lg,
    textAlign: "center",
    color: COLORS.text,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: SIZING.md - 4, 
  },
  passwordInput: {
    flex: 1,
    marginBottom: 0, 
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: SIZING.sm,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: SIZING.sm,
  },
  loginText: {
    fontSize: SIZING.body,
    color: COLORS.grayDark,
  },
  loginLinkText: {
    color: COLORS.primary,
    fontWeight: '600',
  }
});