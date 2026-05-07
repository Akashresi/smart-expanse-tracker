import React, { useCallback, useEffect, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Animated,
  Platform,
  KeyboardAvoidingView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { PieChart } from "react-native-chart-kit";
import { useIsFocused } from '@react-navigation/native';
import api from "../../api/api";
import AppButton from "../../components/AppButton";
import AppTextInput from "../../components/AppTextInput";
import { useThemeColors, SIZING, SHADOWS } from "../../constants/theme";

const { width, height } = Dimensions.get("window");

type Transaction = {
  id: string;
  type: "credit" | "debit";
  amount: number;
  category: string;
  source: "bank" | "cash";
  note?: string;
  timestamp: string;
};

const spendingCategories = [
  { name: "Food", icon: "fast-food", color: "#f97316" },
  { name: "Transport", icon: "car", color: "#3b82f6" },
  { name: "Shopping", icon: "cart", color: "#a855f7" },
  { name: "Bills", icon: "document-text", color: "#ef4444" },
  { name: "Misc", icon: "cube", color: "#64748b" },
];

export default function HomeTab() {
  const COLORS = useThemeColors();
  const styles = getStyles(COLORS);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankBalance, setBankBalance] = useState(0);
  const [cashBalance, setCashBalance] = useState(0);
  const [bankSpending, setBankSpending] = useState(0);
  const [cashSpending, setCashSpending] = useState(0);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"balance" | "spending" | "scan">("spending");
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Form states
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [source, setSource] = useState<"bank" | "cash">("bank");
  const [scanText, setScanText] = useState("");

  const isFocused = useIsFocused();

  // Mount animation
  const mountAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(mountAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const openModal = (type: "balance" | "spending" | "scan") => {
    setModalType(type);
    setAmount("");
    setCategory("");
    setSource("bank");
    setScanText("");
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start(() => setModalVisible(false));
  };

  const calculateBalancesAndSpendings = (txs: Transaction[]) => {
    let bankBal = 0, cashBal = 0, bankSpend = 0, cashSpend = 0;
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
      const parsed: Transaction[] = res.data.map((e: any) => ({
        id: e.id.toString(),
        type: e.type,
        amount: e.amount,
        category: e.category,
        source: e.source,
        note: e.description || "",
        timestamp: e.date,
      }));
      parsed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setTransactions(parsed);
      calculateBalancesAndSpendings(parsed);
    } catch (e) {
      console.warn("Load transactions error", e);
    }
  }, []);

  useEffect(() => {
    if (isFocused) loadTransactions();
  }, [isFocused, loadTransactions]);

  const handleSubmit = async () => {
    if (modalType === "scan") {
      if (!scanText.trim()) return;
      const text = scanText.toLowerCase();
      const isCredit = text.includes("credited") || text.includes("added") || text.includes("received");
      const src = text.includes("cash") ? "cash" : "bank";
      const amountMatch = text.match(/\d+(\.\d+)?/);
      const amt = amountMatch ? amountMatch[0] : "0";
      
      setAmount(amt);
      setSource(src);
      setCategory("Misc");
      setModalType(isCredit ? "balance" : "spending");
      return;
    }

    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !category.trim()) {
      Alert.alert("Invalid Input", "Please enter valid amount and category.");
      return;
    }

    if (modalType === "spending") {
      const currentBalance = source === "bank" ? bankBalance : cashBalance;
      if (amt > currentBalance) {
        Alert.alert("Insufficient Funds", `Not enough ${source} balance.`);
        return;
      }
    }

    try {
      const userStr = await AsyncStorage.getItem("@user");
      if (!userStr) {
        Alert.alert("Error", "Not logged in");
        return;
      }
      const user = JSON.parse(userStr);

      const payload = {
        type: modalType === "balance" ? "credit" : "debit",
        source: source,
        category: category.trim(),
        amount: amt,
        description: modalType === "balance" ? `Added ₹${amt} to ${source}` : `Spent ₹${amt} from ${source}`,
        user_id: user.id
      };

      await api.post("/expenses/", payload);
      closeModal();
      loadTransactions();
    } catch (e) {
      console.warn("Error processing transaction", e);
      Alert.alert("Error", "Failed to process transaction.");
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
    color: spendingCategories.find(c => c.name === name)?.color || `rgba(${(i * 60) % 255}, ${(150 + i * 30) % 255}, ${(100 + i * 20) % 255}, 1)`,
    legendFontColor: COLORS.textMuted,
    legendFontSize: 12,
  }));

  const totalSpent = bankSpending + cashSpending;
  const totalBalance = bankBalance + cashBalance;
  const spendRatio = totalBalance > 0 ? (totalSpent / (totalBalance + totalSpent)) * 100 : 0;

  return (
    <View style={styles.container}>
      <Animated.ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ opacity: mountAnim, transform: [{ translateY: mountAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Overview</Text>
          <TouchableOpacity style={styles.profileBtn}>
            <Ionicons name="person-circle" size={36} color={COLORS.primary} />
          </TouchableOpacity>
        </View>


        <View style={styles.cardsContainer}>
          <LinearGradient colors={['#1a56db', '#3b82f6']} style={styles.balanceCardVertical} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
            <View style={styles.cardTop}>
              <Ionicons name="business" size={24} color={COLORS.white} />
              <Text style={styles.cardType}>Bank</Text>
            </View>
            <Text style={styles.cardBalance}>₹{bankBalance.toLocaleString()}</Text>
            <View style={styles.cardBottom}>
              <Text style={styles.cardSpent}>Spent: ₹{bankSpending.toLocaleString()}</Text>
            </View>
          </LinearGradient>

          <LinearGradient colors={['#16a34a', '#22c55e']} style={styles.balanceCardVertical} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
            <View style={styles.cardTop}>
              <Ionicons name="wallet" size={24} color={COLORS.white} />
              <Text style={styles.cardType}>Cash</Text>
            </View>
            <Text style={styles.cardBalance}>₹{cashBalance.toLocaleString()}</Text>
            <View style={styles.cardBottom}>
              <Text style={styles.cardSpent}>Spent: ₹{cashSpending.toLocaleString()}</Text>
            </View>
          </LinearGradient>
        </View>


        <View style={styles.ratioCard}>
          <View style={styles.ratioHeader}>
            <Text style={styles.sectionTitle}>Monthly Spend Ratio</Text>
            <Text style={styles.ratioPercent}>{spendRatio.toFixed(0)}%</Text>
          </View>
          <View style={styles.ratioBarContainer}>
            <View style={[styles.ratioBarFill, { width: `${Math.min(spendRatio, 100)}%`, backgroundColor: spendRatio > 80 ? COLORS.danger : COLORS.primary }]} />
          </View>
          <Text style={styles.ratioSub}>₹{totalSpent.toLocaleString()} of ₹{(totalBalance + totalSpent).toLocaleString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
          {pieData.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="pie-chart-outline" size={48} color={COLORS.border} />
              <Text style={styles.noDataText}>No spending data yet</Text>
            </View>
          ) : (
            <View style={styles.chartCard}>
              <PieChart
                data={pieData}
                width={width - 56}
                height={160}
                chartConfig={{ color: (opacity = 1) => `rgba(0,0,0, ${opacity})` }}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"10"}
                absolute
              />
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>


      <View style={styles.fabContainer}>
         <TouchableOpacity style={[styles.fab, {backgroundColor: COLORS.success, marginBottom: 12, width: 44, height: 44}]} onPress={() => openModal("balance")} activeOpacity={0.8}>
          <Ionicons name="arrow-down" size={20} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.fab, {backgroundColor: COLORS.warning, marginBottom: 12, width: 44, height: 44}]} onPress={() => openModal("scan")} activeOpacity={0.8}>
          <Ionicons name="scan" size={20} color={COLORS.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.fab} onPress={() => openModal("spending")} activeOpacity={0.8}>
          <Ionicons name="add" size={28} color={COLORS.white} />
        </TouchableOpacity>
      </View>


      {modalVisible && (
        <Modal transparent visible={modalVisible} animationType="none" onRequestClose={closeModal}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalBg}>
            <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
              <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={closeModal} />
            </Animated.View>
            <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.modalDragHandle} />
              <Text style={styles.modalTitle}>
                {modalType === "balance" ? "Add Balance" : modalType === "scan" ? "AI Scan SMS" : "New Expense"}
              </Text>
              
              {modalType === "scan" ? (
                <>
                  <Text style={styles.label}>Paste Notification / SMS</Text>
                  <AppTextInput
                    placeholder="e.g. Spent Rs. 500 at Amazon"
                    value={scanText}
                    onChangeText={setScanText}
                    multiline
                  />
                </>
              ) : (
                <>
                  <Text style={styles.label}>Amount (₹)</Text>
                  <AppTextInput
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                  />

                  <Text style={styles.label}>Category</Text>
                  {modalType === "spending" ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 16}}>
                      {spendingCategories.map((c) => {
                         const isSel = category === c.name;
                         return (
                          <TouchableOpacity
                            key={c.name}
                            style={[styles.categoryChip, isSel && { borderColor: c.color, backgroundColor: c.color + '10' }]}
                            onPress={() => setCategory(c.name)}
                          >
                            <Ionicons name={c.icon as any} size={16} color={isSel ? c.color : COLORS.textMuted} />
                            <Text style={[styles.categoryChipText, isSel && { color: c.color, fontWeight: '600' }]}>{c.name}</Text>
                          </TouchableOpacity>
                        )
                      })}
                    </ScrollView>
                  ) : (
                    <AppTextInput
                      placeholder="e.g., Salary, Gift"
                      value={category}
                      onChangeText={setCategory}
                    />
                  )}

                  <Text style={styles.label}>Source</Text>
                  <View style={styles.sourceSwitchRow}>
                    <TouchableOpacity
                      style={[styles.sourceBox, source === "bank" && styles.sourceBoxActive]}
                      onPress={() => setSource("bank")}
                    >
                      <Ionicons name="business" size={20} color={source === "bank" ? COLORS.primary : COLORS.textMuted} />
                      <Text style={[styles.sourceBoxText, source === "bank" && {color: COLORS.primary, fontWeight: '600'}]}>Bank</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.sourceBox, source === "cash" && styles.sourceBoxActive]}
                      onPress={() => setSource("cash")}
                    >
                      <Ionicons name="wallet" size={20} color={source === "cash" ? COLORS.primary : COLORS.textMuted} />
                      <Text style={[styles.sourceBoxText, source === "cash" && {color: COLORS.primary, fontWeight: '600'}]}>Cash</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <AppButton
                title={modalType === "balance" ? "Add Funds" : modalType === "scan" ? "Scan Text" : "Save Expense"}
                onPress={handleSubmit}
                variant={modalType === "balance" ? "success" : modalType === "scan" ? "primary" : "primary"}
              />
            </Animated.View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </View>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingTop: 50, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  greeting: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary },
  profileBtn: { padding: 4 },
  cardsContainer: { paddingHorizontal: 16, paddingBottom: 20 },
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
  
  ratioCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: SIZING.radius,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  ratioHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  ratioPercent: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  ratioBarContainer: { height: 8, backgroundColor: COLORS.grayLight, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  ratioBarFill: { height: '100%', borderRadius: 4 },
  ratioSub: { fontSize: 12, color: COLORS.textMuted },

  section: { marginHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 12 },
  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZING.radius,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  emptyState: {
    backgroundColor: COLORS.card,
    borderRadius: SIZING.radius,
    padding: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: { color: COLORS.textMuted, marginTop: 12, fontSize: 14 },
  
  fabContainer: { position: 'absolute', bottom: 100, right: 20, alignItems: 'center' },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.card,
    elevation: 5,
  },

  modalBg: { flex: 1, justifyContent: 'flex-end' },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalDragHandle: { width: 40, height: 4, backgroundColor: COLORS.grayMedium, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 20 },
  label: { fontSize: 13, color: COLORS.textMuted, marginBottom: 8, fontWeight: '500' },
  
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    marginRight: 8,
  },
  categoryChipText: { fontSize: 13, color: COLORS.textPrimary, marginLeft: 6 },
  
  sourceSwitchRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  sourceBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    gap: 8,
  },
  sourceBoxActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  sourceBoxText: { fontSize: 15, color: COLORS.textMuted },
});