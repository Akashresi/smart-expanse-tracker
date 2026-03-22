// app/tabs/index.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
// ✅ FIX: Corrected paths to go up two levels
import { useIsFocused } from '@react-navigation/native';
import api from "../../api/api";
import AppButton from "../../components/AppButton";
import AppTextInput from "../../components/AppTextInput";
import ScreenWrapper from "../../components/ScreenWrapper";
import { COLORS, SIZING } from "../../constants/theme";

type Transaction = {
  id: string;
  type: "credit" | "debit";
  amount: number;
  category: string;
  source: "bank" | "cash";
  note?: string;
  timestamp: string;
};

const STORAGE_KEY = "@transactions";
const spendingCategories = ["Food", "Transport", "Shopping", "Bills", "Misc"];

export default function HomeTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankBalance, setBankBalance] = useState(0);
  const [cashBalance, setCashBalance] = useState(0);
  const [bankSpending, setBankSpending] = useState(0);
  const [cashSpending, setCashSpending] = useState(0);
  const [addAmount, setAddAmount] = useState("");
  const [addCategory, setAddCategory] = useState("");
  const [addSource, setAddSource] = useState<"bank" | "cash">("bank");
  const [spendingAmount, setSpendingAmount] = useState("");
  const [spendCategory, setSpendCategory] = useState("");
  const [spendSource, setSpendSource] = useState<"bank" | "cash">("bank");

  const isFocused = useIsFocused();

  const calculateBalancesAndSpendings = (txs: Transaction[]) => {
    let bankBal = 0,
      cashBal = 0,
      bankSpend = 0,
      cashSpend = 0;
    txs.forEach((t) => {
      if (t.source === "bank") {
        if (t.type === "credit") bankBal += t.amount;
        else { bankBal -= t.amount; bankSpend += t.amount; }
      } else if (t.source === "cash") {
        if (t.type === "credit") cashBal += t.amount;
        else { cashBal -= t.amount; cashSpend += t.amount; }
      }
    });
    setBankBalance(bankBal);
    setCashBalance(cashBal);
    setBankSpending(bankSpend);
    setCashSpending(cashSpend);
  };

  const loadTransactions = useCallback(async () => {
    try {
      const res = await api.get("/expenses/");
      // Map the backend DB expenses back to frontend Transaction type
      const parsed: Transaction[] = res.data.map((e: any) => ({
        id: e.id.toString(),
        type: e.type,
        amount: e.amount,
        category: e.category,
        source: e.source,
        note: e.description || "",
        timestamp: e.date,
      }));
      // Sort oldest to newest or newest to oldest
      parsed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setTransactions(parsed);
      calculateBalancesAndSpendings(parsed);
    } catch (e) {
      console.warn("Load transactions error", e);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadTransactions();
    }
  }, [isFocused, loadTransactions]);

  const addBalance = async () => {
    const amount = parseFloat(addAmount);
    if (!amount || amount <= 0 || !addCategory.trim()) {
      Alert.alert("Invalid Input", "Please enter valid amount and category.");
      return;
    }

    try {
      const userStr = await AsyncStorage.getItem("@user");
      if (!userStr) {
        Alert.alert("Error", "Not logged in");
        return;
      }
      const user = JSON.parse(userStr);

      const payload = {
        type: "credit",
        source: addSource,
        category: addCategory.trim(),
        amount: amount,
        description: `Added ₹${amount} to ${addSource}`,
        user_id: user.id
      };

      await api.post("/expenses/", payload);
      setAddAmount("");
      setAddCategory("");
      Alert.alert("Success", `₹${amount} added to ${addSource} balance.`);
      loadTransactions();
    } catch (e) {
      console.warn("Error adding balance", e);
      Alert.alert("Error", "Failed to add balance to server.");
    }
  };

  const addSpending = async () => {
    const amount = parseFloat(spendingAmount);
    if (!amount || amount <= 0 || !spendCategory.trim()) {
      Alert.alert("Invalid Input", "Please enter valid amount and category.");
      return;
    }
    const currentBalance = spendSource === "bank" ? bankBalance : cashBalance;
    if (amount > currentBalance) {
      Alert.alert("Insufficient Funds", `Not enough ${spendSource} balance.`);
      return;
    }

    try {
      const userStr = await AsyncStorage.getItem("@user");
      if (!userStr) {
        Alert.alert("Error", "Not logged in");
        return;
      }
      const user = JSON.parse(userStr);

      const payload = {
        type: "debit",
        source: spendSource,
        category: spendCategory.trim(),
        amount: amount,
        description: `Spent ₹${amount} from ${spendSource}`,
        user_id: user.id
      };

      await api.post("/expenses/", payload);
      setSpendingAmount("");
      setSpendCategory("");
      Alert.alert("Success", `₹${amount} spent from ${spendSource}.`);
      loadTransactions();
    } catch (e) {
      console.warn("Error adding spending", e);
      Alert.alert("Error", "Failed to add spending to server.");
    }
  };

  const spendingOnly = transactions.filter((t) => t.type === "debit");
  const categoryTotals = spendingOnly.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});
  const pieData = Object.entries(categoryTotals).map(([name, amt], i) => ({
    name,
    population: amt,
    color: `rgba(${(i * 60) % 255}, ${(150 + i * 30) % 255}, ${(100 + i * 20) % 255
      }, 1)`,
    legendFontColor: "#7F7F7F",
    legendFontSize: 12,
  }));

  return (
    // ✅ FIX: The ScreenWrapper now has children, fixing the error
    <ScreenWrapper scrollable>
      <Text style={styles.header}>Your Finances</Text>

      {/* This View uses the 'bankBalance' and 'cashBalance' variables */}
      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>🏦 Bank Balance</Text>
          <Text style={styles.summaryValue}>₹{bankBalance.toFixed(2)}</Text>
          <Text style={styles.spendText}>
            Spent: ₹{bankSpending.toFixed(2)}
          </Text>
        </View>
        <View>
          <Text style={styles.summaryLabel}>💵 Cash Balance</Text>
          <Text style={styles.summaryValue}>₹{cashBalance.toFixed(2)}</Text>
          <Text style={styles.spendText}>
            Spent: ₹{cashSpending.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* This View uses 'addAmount', 'setAddAmount', 'addCategory', 'setAddCategory', 'addSource', 'setAddSource', and 'addBalance' */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Balance</Text>
        <AppTextInput
          placeholder="Amount (₹)"
          keyboardType="numeric"
          value={addAmount}
          onChangeText={setAddAmount}
        />
        <AppTextInput
          placeholder="Category (e.g., Salary, Gift)"
          value={addCategory}
          onChangeText={setAddCategory}
        />
        <View style={styles.sourceSwitch}>
          <TouchableOpacity
            style={[
              styles.sourceButton,
              addSource === "bank" && styles.activeSource,
            ]}
            onPress={() => setAddSource("bank")}
          >
            <Text
              style={[
                styles.sourceText,
                addSource === "bank" && styles.activeText,
              ]}
            >
              Bank
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sourceButton,
              addSource === "cash" && styles.activeSource,
            ]}
            onPress={() => setAddSource("cash")}
          >
            <Text
              style={[
                styles.sourceText,
                addSource === "cash" && styles.activeText,
              ]}
            >
              Cash
            </Text>
          </TouchableOpacity>
        </View>

        <AppButton
          title="Add Balance"
          onPress={addBalance}
          variant="success"
        />
      </View>

      {/* This View uses all the 'spending' variables and 'spendingCategories' */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Spending</Text>
        <AppTextInput
          placeholder="Amount (₹)"
          keyboardType="numeric"
          value={spendingAmount}
          onChangeText={setSpendingAmount}
        />
        <AppTextInput
          placeholder="Category (e.g., Food, Shopping)"
          value={spendCategory}
          onChangeText={setSpendCategory}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {spendingCategories.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.chip, spendCategory === c && styles.chipActive]}
              onPress={() => setSpendCategory(c)}
            >
              <Text
                style={
                  spendCategory === c ? styles.chipTextActive : styles.chipText
                }
              >
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.sourceSwitch}>
          <TouchableOpacity
            style={[
              styles.sourceButton,
              spendSource === "bank" && styles.activeSource,
            ]}
            onPress={() => setSpendSource("bank")}
          >
            <Text
              style={[
                styles.sourceText,
                spendSource === "bank" && styles.activeText,
              ]}
            >
              Bank
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sourceButton,
              spendSource === "cash" && styles.activeSource,
            ]}
            onPress={() => setSpendSource("cash")}
          >
            <Text
              style={[
                styles.sourceText,
                spendSource === "cash" && styles.activeText,
              ]}
            >
              Cash
            </Text>
          </TouchableOpacity>
        </View>

        <AppButton
          title="Add Spending"
          onPress={addSpending}
          variant="danger"
        />
      </View>

      {/* This View uses 'spendingOnly' (via pieData) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Spending by Category</Text>
        {pieData.length === 0 ? (
          <Text style={styles.noDataText}>No spending data yet</Text>
        ) : (
          <PieChart
            data={pieData}
            width={Dimensions.get("window").width - SIZING.lg * 2 - SIZING.md * 2}
            height={180}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
            }}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute
          />
        )}
      </View>
    </ScreenWrapper>
  );
}

// ✅ ALL styles are now included
const styles = StyleSheet.create({
  header: { fontSize: SIZING.h1, fontWeight: "700", marginBottom: SIZING.md, color: COLORS.text },
  section: {
    marginBottom: SIZING.lg,
    backgroundColor: COLORS.grayLight,
    padding: SIZING.md,
    borderRadius: SIZING.radius,
  },
  sectionTitle: { fontSize: SIZING.h3, fontWeight: "700", marginBottom: SIZING.sm, color: COLORS.text },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.grayMedium,
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.text },
  chipTextActive: { color: COLORS.white },
  sourceSwitch: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 8,
  },
  sourceButton: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: COLORS.grayMedium,
    borderRadius: 20,
    marginHorizontal: 6,
  },
  activeSource: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  sourceText: { color: COLORS.text, fontWeight: "600" },
  activeText: { color: COLORS.white },
  summaryCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#eef2ff",
    padding: SIZING.md,
    borderRadius: SIZING.radius,
    marginBottom: SIZING.lg,
  },
  summaryLabel: { fontWeight: "700", color: COLORS.grayDark },
  summaryValue: { fontSize: SIZING.h3, fontWeight: "700", color: COLORS.text },
  spendText: { fontSize: SIZING.caption, color: COLORS.grayDark, marginTop: 2 },
  noDataText: {
    color: COLORS.grayDark,
    textAlign: 'center',
    paddingVertical: 20,
  }
});