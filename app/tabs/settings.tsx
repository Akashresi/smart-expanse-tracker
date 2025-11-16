// app/tabs/settings.tsx
import { useRouter } from "expo-router";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import AppButton from "../../components/AppButton";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { COLORS, SIZING } from "../../constants/theme";

export default function Settings() {
  const router = useRouter();
  const { user, logout } = useAuth(); 

  const handleLogout = async () => {
    Alert.alert("Logout", "Do you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  if (!user) {
    return (
      <ScreenWrapper style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Username</Text>
          <Text style={styles.value}>{user.name}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Date of Birth</Text>
          <Text style={styles.value}>{user.date_of_birth}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Age</Text>
          <Text style={styles.value}>{user.age}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Gender</Text>
          <Text style={styles.value}>{user.gender}</Text>
        </View>
      </View>

      <AppButton
        title="Logout"
        onPress={handleLogout}
        variant="danger"
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { 
    fontSize: SIZING.h1, 
    fontWeight: "700", 
    marginBottom: SIZING.lg,
    color: COLORS.text,
  },
  card: {
    backgroundColor: COLORS.grayLight,
    borderRadius: SIZING.radius,
    padding: SIZING.md,
    marginBottom: SIZING.xl,
  },
  row: { 
    marginBottom: SIZING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayMedium,
    paddingBottom: SIZING.sm,
  },
  label: { fontSize: SIZING.caption, color: COLORS.grayDark },
  value: { fontSize: SIZING.body, fontWeight: "600", color: COLORS.text },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});