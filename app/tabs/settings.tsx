// app/tabs/settings.tsx
import { useRouter } from "expo-router";
import { ActivityIndicator, Alert, StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { useThemeColors, SIZING, SHADOWS, SPACING, TYPOGRAPHY } from "../../constants/theme";
import { LinearGradient } from 'expo-linear-gradient';

export default function Settings() {
  const COLORS = useThemeColors();
  const styles = getStyles(COLORS);

  const router = useRouter();
  const { user, logout } = useAuth(); 

  const handleLogout = () => {
    Alert.alert(
      "Log Out", 
      "Are you sure you want to log out of your account?", 
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/(auth)/login"); // Adjusted path if needed
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.substring(0, 2).toUpperCase();
  };

  const SettingRow = ({ icon, label, value, showChevron = false, isAction = false, danger = false, onPress }: any) => (
    <TouchableOpacity 
      style={styles.settingRow} 
      onPress={onPress} 
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconBox, danger && {backgroundColor: COLORS.danger + '15'}]}>
          <Ionicons name={icon} size={20} color={danger ? COLORS.danger : COLORS.primary} />
        </View>
        <Text style={[styles.settingLabel, danger && {color: COLORS.danger}]}>{label}</Text>
      </View>
      <View style={styles.settingRight}>
        {value ? <Text style={styles.settingValue}>{value}</Text> : null}
        {showChevron && <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 100}}>
      <View style={styles.header}>
        <Text style={TYPOGRAPHY.heading}>Settings</Text>
      </View>

      <LinearGradient colors={[COLORS.primary, '#7C3AED']} style={styles.profileCard} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(user.full_name || user.name)}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user.full_name || user.name || "User"}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </View>
        <TouchableOpacity style={styles.editBtn}>
          <Ionicons name="pencil" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.sectionCard}>
          <SettingRow icon="person-outline" label="Username" value={user.username || user.name} />
          {user.date_of_birth && <SettingRow icon="calendar-outline" label="Date of Birth" value={user.date_of_birth} />}
          {user.age && <SettingRow icon="body-outline" label="Age" value={user.age.toString()} />}
          {user.gender && <SettingRow icon="transgender-outline" label="Gender" value={user.gender.charAt(0).toUpperCase() + user.gender.slice(1)} />}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.sectionCard}>
          <SettingRow icon="notifications-outline" label="Notifications" showChevron onPress={() => {}} />
          <SettingRow icon="moon-outline" label="Dark Mode" value="Off" showChevron onPress={() => {}} />
          <SettingRow icon="shield-checkmark-outline" label="Security" showChevron onPress={() => {}} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.sectionCard}>
          <SettingRow icon="help-circle-outline" label="Help Center" showChevron onPress={() => {}} />
          <SettingRow icon="information-circle-outline" label="About App" value="v1.0.0" />
        </View>
      </View>

      <TouchableOpacity 
        style={styles.logoutBtn} 
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={20} color={COLORS.danger} style={{marginRight: 8}} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 50,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background,
  },
  
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: 20,
    marginBottom: SPACING.xl,
    ...SHADOWS.card,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: '#fff' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 4 },
  profileEmail: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  editBtn: {
    backgroundColor: '#fff',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
  
  section: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted, marginBottom: 8, marginLeft: 4, textTransform: 'uppercase' },
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZING.radius,
    overflow: 'hidden',
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingLabel: { fontSize: 15, fontWeight: '500', color: COLORS.textPrimary },
  settingRight: { flexDirection: 'row', alignItems: 'center' },
  settingValue: { fontSize: 14, color: COLORS.textMuted, marginRight: 8 },
  
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.lg,
    padding: 16,
    borderRadius: SIZING.radius,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginTop: 10,
    ...SHADOWS.sm,
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: COLORS.danger },
});