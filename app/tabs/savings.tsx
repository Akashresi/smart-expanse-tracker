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
    ScrollView // Import ScrollView
} from "react-native";
import api from "../../api/api";
import AppButton from "../../components/AppButton";
import AppTextInput from "../../components/AppTextInput";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { COLORS, SIZING } from "../../constants/theme";

interface SavingGoal {
  id: number;
  title: string;
  target_amount: number;
  saved_amount: number;
  user_id: number;
}

const SavingsScreen: React.FC = () => {
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
  const [lastWeekSpent, setLastWeekSpent] = useState(0);
  const [thisMonthSpent, setThisMonthSpent] = useState(0);
  const [lastMonthSpent, setLastMonthSpent] = useState(0);
  const [weeklySaved, setWeeklySaved] = useState(0);
  const [monthlySaved, setMonthlySaved] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // These routes must be protected on the backend
      const [resGoals, resAnalysis] = await Promise.all([
        api.get(`/goals/user/${user.id}`), 
        api.get(`/expenses/analysis/${user.id}`),
      ]);

      setGoals(resGoals.data || []);
      const data = resAnalysis.data;
      setThisWeekSpent(data.this_week_spent);
      setLastWeekSpent(data.last_week_spent);
      setThisMonthSpent(data.this_month_spent);
      setLastMonthSpent(data.last_month_spent);
      setWeeklySaved(data.saved_this_week);
      setMonthlySaved(data.saved_this_month);
      
    } catch (error: any) {
      console.error("Error fetching data:", error?.response?.data || error.message);
      Alert.alert("Error", "Unable to fetch savings data.");
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
    if (!user?.id) {
      Alert.alert("Error", "No user found. Please log in again.");
      return;
    }

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
      console.error("Error adding goal:", error);
      Alert.alert("Network Error", "Could not connect to the server.");
    }
  };

  const updateSavedAmount = async () => {
    if (!selectedGoal || !saveAmount) return;

    const newTotalSavedAmount =
      parseFloat(selectedGoal.saved_amount.toString()) + parseFloat(saveAmount);

    try {
      // The interceptor adds user_id as a query param
      const res = await api.patch(`/goals/${selectedGoal.id}`, { 
        saved_amount: newTotalSavedAmount 
      });

      setGoals((prev) =>
        prev.map((g) => (g.id === res.data.id ? res.data : g))
      );
      setSaveModalVisible(false);
      setSaveAmount("");
    } catch (error) {
      console.error("Error updating goal:", error);
      Alert.alert("Error", "Could not update the goal.");
    }
  };
  
  if (loading) {
    return (
      <ScreenWrapper style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable style={styles.container}>
      <Text style={styles.header}>Your Savings Overview</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>₹{thisWeekSpent.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Spent this week</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>₹{lastWeekSpent.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Spent last week</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>₹{thisMonthSpent.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Spent this month</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>₹{lastMonthSpent.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Spent last month</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>₹{weeklySaved.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Saved this week</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>₹{monthlySaved.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Saved this month</Text>
        </View>
      </View>

      {/* Wrap goals list in ScrollView - this was missing */}
      <ScrollView> 
        {goals.length > 0 ? (
          goals.map((goal) => {
            const progress =
              (goal.saved_amount / goal.target_amount) * 100 || 0;
            return (
              <View key={goal.id} style={styles.goalCard}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                <Text style={styles.goalProgress}>
                  ₹{goal.saved_amount} / ₹{goal.target_amount}
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[styles.progressFill, { width: `${progress}%` }]}
                  />
                </View>
                <AppButton
                  title="+ Add Savings"
                  onPress={() => {
                    setSelectedGoal(goal);
                    setSaveModalVisible(true);
                  }}
                  variant="success"
                />
              </View>
            );
          })
        ) : (
          <Text style={styles.noGoals}>No goals yet. Start by adding one!</Text>
        )}
      </ScrollView>

      <AppButton
        title="+ Add New Goal"
        onPress={() => setModalVisible(true)}
        style={{ marginTop: SIZING.md }}
      />

      {/* Add Goal Modal */}
      <Modal animationType="slide" transparent visible={modalVisible}>
        <View style={styles.modalContainer}>
         <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Add New Goal</Text>
            <AppTextInput
              placeholder="Goal Title (e.g., New Laptop)"
              value={newGoal}
              onChangeText={setNewGoal}
            />
            <AppTextInput
              placeholder="Target Amount (₹)"
              keyboardType="numeric"
              value={targetAmount}
              onChangeText={setTargetAmount}
            />
            <AppButton title="Save Goal" onPress={addGoal} />
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
         </View>
        </View>
      </Modal>
      
      {/* Add Savings Modal */}
      <Modal animationType="slide" transparent visible={saveModalVisible}>
        <View style={styles.modalContainer}>
         <View style={styles.modalView}>
            <Text style={styles.modalTitle}>
              Add Savings for {selectedGoal?.title}
            </Text>
            <AppTextInput
              placeholder="Amount to add (₹)"
              keyboardType="numeric"
              value={saveAmount}
              onChangeText={setSaveAmount}
            />
            <AppButton title="Update" onPress={updateSavedAmount} />
            <TouchableOpacity style={styles.cancelButton} onPress={() => setSaveModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
         </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.grayLight, padding: SIZING.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.grayLight },
  header: {
    fontSize: SIZING.h1,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SIZING.md,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: SIZING.md,
  },
  statBox: {
    backgroundColor: COLORS.white,
    borderRadius: SIZING.radius,
    padding: SIZING.md,
    alignItems: "center",
    width: "48%",
    elevation: 3,
  },
  statValue: { fontSize: 20, fontWeight: "700", color: COLORS.primary },
  statLabel: { fontSize: 14, color: COLORS.grayDark, marginTop: 5, textAlign: "center" },
  goalCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZING.radius,
    padding: SIZING.md,
    marginBottom: SIZING.sm,
    elevation: 2,
  },
  goalTitle: { fontSize: 18, fontWeight: "600", color: COLORS.text },
  goalProgress: { fontSize: 14, color: COLORS.grayDark, marginTop: 5 },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.grayMedium,
    borderRadius: 4,
    overflow: "hidden",
    marginVertical: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
  noGoals: { textAlign: "center", color: COLORS.grayDark, marginTop: 30 },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: COLORS.white,
    padding: SIZING.lg,
    borderRadius: SIZING.radius,
    width: "90%",
  },
  modalTitle: {
    fontSize: SIZING.h3,
    fontWeight: "700",
    marginBottom: SIZING.md,
    textAlign: "center",
    color: COLORS.text,
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: COLORS.grayLight,
    paddingVertical: 14,
    borderRadius: SIZING.radius,
  },
  cancelButtonText: { textAlign: "center", color: COLORS.text, fontWeight: "600" },
});

export default SavingsScreen;