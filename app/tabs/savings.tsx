// app/tabs/savings.tsx
import { useIsFocused } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import api from "../../api/api";
import AppButton from "../../components/AppButton";
import AppTextInput from "../../components/AppTextInput";
import { useAuth } from "../../contexts/AuthContext";
import { useThemeColors, SIZING, SHADOWS, SPACING, TYPOGRAPHY } from "../../constants/theme";

interface SavingGoal {
  id: number;
  title: string;
  target_amount: number;
  saved_amount: number;
  user_id: number;
}

const SavingsScreen: React.FC = () => {
  const COLORS = useThemeColors();
  const styles = getStyles(COLORS);

  const { user } = useAuth();
  const isFocused = useIsFocused();
  
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingGoal | null>(null);
  const [saveAmount, setSaveAmount] = useState("");
  const [thisWeekSpent, setThisWeekSpent] = useState(0);
  const [thisMonthSpent, setThisMonthSpent] = useState(0);
  const [monthlySaved, setMonthlySaved] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [resGoals, resAnalysis] = await Promise.all([
        api.get(`/goals/user/${user.id}`), 
        api.get(`/expenses/analysis/${user.id}`),
      ]);

      setGoals(resGoals.data || []);
      const data = resAnalysis.data;
      setThisWeekSpent(data.this_week_spent);
      setThisMonthSpent(data.this_month_spent);
      setMonthlySaved(data.saved_this_month);
    } catch (error: any) {
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [loadData, isFocused]);

  const addGoal = async () => {
    if (!newGoal.trim() || !targetAmount) {
      Alert.alert("Missing info", "Please enter both goal name and amount.");
      return;
    }
    if (!user?.id) return;

    const goalData = {
      title: newGoal.trim(),
      target_amount: parseFloat(targetAmount),
      user_id: user.id,
    };

    try {
      const res = await api.post(`/goals/`, goalData);
      setGoals((prev) => [...prev, res.data]);
      setModalVisible(false);
      setNewGoal("");
      setTargetAmount("");
    } catch (error) {
      Alert.alert("Network Error", "Could not connect to the server.");
    }
  };

  const updateSavedAmount = async () => {
    if (!selectedGoal || !saveAmount) return;

    const newTotalSavedAmount = parseFloat(selectedGoal.saved_amount.toString()) + parseFloat(saveAmount);

    try {
      const res = await api.patch(`/goals/${selectedGoal.id}`, { 
        saved_amount: newTotalSavedAmount 
      });
      setGoals((prev) => prev.map((g) => (g.id === res.data.id ? res.data : g)));
      setSaveModalVisible(false);
      setSaveAmount("");
    } catch (error) {
      Alert.alert("Error", "Could not update the goal.");
    }
  };
  
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 100}}>
        <View style={styles.header}>
          <Text style={TYPOGRAPHY.heading}>Savings</Text>
        </View>

        <View style={styles.cardsContainer}>
          <LinearGradient colors={['#3b82f6', '#2563eb']} style={styles.balanceCardVertical} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
            <View style={styles.cardTop}>
              <Ionicons name="calendar-outline" size={24} color={COLORS.white} />
              <Text style={styles.cardType}>Week Spent</Text>
            </View>
            <Text style={styles.cardBalance}>₹{thisWeekSpent.toLocaleString()}</Text>
          </LinearGradient>

          <LinearGradient colors={['#a855f7', '#9333ea']} style={styles.balanceCardVertical} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
            <View style={styles.cardTop}>
              <Ionicons name="pie-chart-outline" size={24} color={COLORS.white} />
              <Text style={styles.cardType}>Month Spent</Text>
            </View>
            <Text style={styles.cardBalance}>₹{thisMonthSpent.toLocaleString()}</Text>
          </LinearGradient>

          <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.balanceCardVertical} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
            <View style={styles.cardTop}>
              <Ionicons name="wallet-outline" size={24} color={COLORS.white} />
              <Text style={styles.cardType}>Total Saved</Text>
            </View>
            <Text style={styles.cardBalance}>₹{monthlySaved.toLocaleString()}</Text>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Goals</Text>
          
          {goals.length > 0 ? (
            goals.map((goal) => {
              const progress = Math.min((goal.saved_amount / goal.target_amount) * 100 || 0, 100);
              return (
                <TouchableOpacity 
                  key={goal.id} 
                  style={styles.goalCard}
                  onPress={() => {
                    setSelectedGoal(goal);
                    setSaveModalVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.goalHeader}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <Text style={styles.goalPercent}>{progress.toFixed(0)}%</Text>
                  </View>
                  
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                  </View>
                  
                  <View style={styles.goalFooter}>
                     <Text style={styles.goalAmtSaved}>₹{goal.saved_amount.toLocaleString()}</Text>
                     <Text style={styles.goalAmtTarget}>of ₹{goal.target_amount.toLocaleString()}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="rocket-outline" size={48} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>No Goals Yet</Text>
              <Text style={styles.emptySub}>Set a savings goal and track your progress to reach your financial dreams.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>

      {/* Add Goal Modal */}
      <Modal animationType="fade" transparent visible={modalVisible}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalBg}>
          <View style={styles.modalOverlay} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Savings Goal</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Goal Title</Text>
            <AppTextInput
              placeholder="e.g., Vacation, Laptop"
              value={newGoal}
              onChangeText={setNewGoal}
            />
            <Text style={styles.label}>Target Amount (₹)</Text>
            <AppTextInput
              placeholder="0.00"
              keyboardType="numeric"
              value={targetAmount}
              onChangeText={setTargetAmount}
            />
            <AppButton title="Create Goal" onPress={addGoal} style={{marginTop: 10}} />
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Add Savings Modal */}
      <Modal animationType="fade" transparent visible={saveModalVisible}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalBg}>
          <View style={styles.modalOverlay} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add to {selectedGoal?.title}</Text>
              <TouchableOpacity onPress={() => setSaveModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Amount to Add (₹)</Text>
            <AppTextInput
              placeholder="0.00"
              keyboardType="numeric"
              value={saveAmount}
              onChangeText={setSaveAmount}
            />
            <AppButton title="Deposit to Goal" onPress={updateSavedAmount} style={{marginTop: 10}} />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const getStyles = (COLORS: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 50,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background,
  },
  metricsScroll: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  cardsContainer: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.lg },
  balanceCardVertical: {
    width: '100%',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    ...SHADOWS.card,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardType: { color: COLORS.white, fontSize: 16, fontWeight: '600', marginLeft: 8, opacity: 0.9 },
  cardBalance: { color: COLORS.white, fontSize: 32, fontWeight: '700', marginBottom: 8 },
  cardBottom: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start' },
  cardSpent: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
  metricCard: {
    width: 140,
    padding: 16,
    borderRadius: SIZING.radius,
    marginRight: 12,
    ...SHADOWS.sm,
  },
  metricIconBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricTitle: { fontSize: 13, color: COLORS.white, opacity: 0.9, marginBottom: 4, fontWeight: '500' },
  metricAmount: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  
  section: { marginHorizontal: SPACING.md },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  
  goalCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZING.radius,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  goalTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  goalPercent: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  
  progressBarBg: { height: 8, backgroundColor: COLORS.grayLight, borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  progressBarFill: { height: '100%', backgroundColor: COLORS.success, borderRadius: 4 },
  
  goalFooter: { flexDirection: 'row', alignItems: 'center' },
  goalAmtSaved: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  goalAmtTarget: { fontSize: 13, color: COLORS.textMuted, marginLeft: 4 },
  
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.md,
    marginTop: 40,
    padding: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: SIZING.radius,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed'
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
  
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.card,
    elevation: 5,
  },

  modalBg: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: SIZING.radius,
    padding: 24,
    width: '90%',
    ...SHADOWS.card,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  label: { fontSize: 13, color: COLORS.textMuted, marginBottom: 8, fontWeight: '500' },
});

export default SavingsScreen;