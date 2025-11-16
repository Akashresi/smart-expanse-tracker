// app/tabs/history.tsx
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from "react";
import {
    // ✅ 'Alert' removed
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator
} from "react-native";
// ✅ 'AppButton' removed
import ScreenWrapper from "../../components/ScreenWrapper";
import { COLORS, SIZING } from "../../constants/theme";
import { useExpenses, Expense } from "../../contexts/ExpenseContext";
import { useAuth } from "../../contexts/AuthContext";

export default function HistoryTab() {
  const { expenses, fetchExpenses } = useExpenses();
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);

  const [credits, setCredits] = useState<Expense[]>([]);
  const [debits, setDebits] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState<"credit" | "debit">("debit");

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    await fetchExpenses();
    setLoading(false);
  }, [user, fetchExpenses]);

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused, loadData]);

  // Process expenses from context
  useEffect(() => {
    setCredits(expenses.filter((t) => t.type === "credit"));
    setDebits(expenses.filter((t) => t.type === "debit"));
  }, [expenses]);

  const renderTransaction = ({ item }: { item: Expense }) => (
    <View style={styles.txRow}>
      <View>
        <Text style={styles.txCategory}>{item.category}</Text>
        <Text style={styles.txNote}>{item.description}</Text>
        <Text style={styles.txTime}>
          {new Date(item.date || new Date()).toLocaleString()}
        </Text>
      </View>
      <Text
        style={[
          styles.txAmount,
          item.type === "credit" ? styles.credit : styles.debit,
        ]}
      >
        {item.type === "credit" ? "+" : "-"} ₹{item.amount.toFixed(2)}
      </Text>
    </View>
  );

  const currentData = activeTab === "credit" ? credits : debits;

  return (
    <ScreenWrapper>
      <Text style={styles.header}>Transaction History</Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeTab === "credit" && styles.toggleButtonActiveGreen,
          ]}
          onPress={() => setActiveTab("credit")}
        >
          <Text
            style={[
              styles.toggleText,
              activeTab === "credit" && styles.toggleTextActive,
            ]}
          >
            Balance Added
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleButton,
            activeTab === "debit" && styles.toggleButtonActiveRed,
          ]}
          onPress={() => setActiveTab("debit")}
        >
          <Text
            style={[
              styles.toggleText,
              activeTab === "debit" && styles.toggleTextActive,
            ]}
          >
            Spending
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 20}} />
        ) : currentData.length === 0 ? (
          <Text style={styles.emptyText}>
            {activeTab === "credit"
              ? "No balance additions yet."
              : "No spending history yet."}
          </Text>
        ) : (
          <FlatList
            data={currentData}
            keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())}
            renderItem={renderTransaction}
          />
        )}
      </View>
      
      {/* ✅ Removed the "Clear History" button */}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: SIZING.h1,
    fontWeight: "700",
    marginBottom: SIZING.md,
    textAlign: "center",
    color: COLORS.text,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: SIZING.md,
  },
  toggleButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.grayMedium,
    borderRadius: SIZING.radius,
    alignItems: "center",
  },
  toggleButtonActiveGreen: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  toggleButtonActiveRed: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.danger,
  },
  toggleText: {
    fontSize: SIZING.body,
    fontWeight: "600",
    color: COLORS.text,
  },
  toggleTextActive: {
    color: COLORS.white,
  },
  section: {
    flex: 1,
    backgroundColor: COLORS.grayLight,
    borderRadius: SIZING.radius,
    padding: SIZING.md,
    marginBottom: SIZING.lg,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.grayDark,
    marginVertical: 20,
  },
  txRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayMedium,
  },
  txCategory: { fontWeight: "700", color: COLORS.text },
  txNote: { color: COLORS.grayDark },
  txTime: { color: COLORS.grayDark, fontSize: SIZING.small },
  txAmount: { fontWeight: "700", textAlign: "right" },
  credit: { color: COLORS.success },
  debit: { color: COLORS.danger },
});