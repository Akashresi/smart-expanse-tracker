// app/tabs/history.tsx
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Animated
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useThemeColors, SIZING, SHADOWS, SPACING, TYPOGRAPHY } from "../../constants/theme";
import { useExpenses, Expense } from "../../contexts/ExpenseContext";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/api";

const getCategoryIcon = (category: string) => {
  const c = category.toLowerCase();
  if (c.includes('food')) return { name: 'fast-food', color: '#f97316' };
  if (c.includes('trans') || c.includes('travel')) return { name: 'car', color: '#3b82f6' };
  if (c.includes('shop')) return { name: 'cart', color: '#a855f7' };
  if (c.includes('bill') || c.includes('util')) return { name: 'document-text', color: '#ef4444' };
  if (c.includes('salary') || c.includes('income')) return { name: 'cash', color: '#10b981' };
  return { name: 'cube', color: '#64748b' };
};

export default function HistoryTab() {
  const COLORS = useThemeColors();
  const styles = getStyles(COLORS);

  const { expenses, fetchExpenses } = useExpenses();
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [credits, setCredits] = useState<Expense[]>([]);
  const [debits, setDebits] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState<"credit" | "debit">("debit");
  
  // Track open swipeables to close them when scrolling or deleting
  const swipeableRefs = useRef(new Map()).current;

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

  useEffect(() => {
    setCredits(expenses.filter((t) => t.type === "credit"));
    setDebits(expenses.filter((t) => t.type === "debit"));
  }, [expenses]);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/expenses/${id}`);
      await fetchExpenses();
    } catch (e) {
      console.warn("Delete error", e);
    }
  };

  const renderRightActions = (progress: any, dragX: any, id: number) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity 
        style={styles.deleteAction} 
        onPress={() => {
          swipeableRefs.get(id)?.close();
          handleDelete(id);
        }}
      >
        <Animated.View style={[{ transform: [{ scale }] }]}>
          <Ionicons name="trash" size={24} color={COLORS.white} />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderTransaction = ({ item }: { item: Expense }) => {
    const iconData = getCategoryIcon(item.category);
    const isCredit = item.type === "credit";
    
    return (
      <Swipeable
        ref={ref => {
          if (ref && item.id) swipeableRefs.set(item.id, ref);
        }}
        renderRightActions={(p, d) => renderRightActions(p, d, item.id!)}
        friction={2}
        rightThreshold={40}
      >
        <View style={styles.txCard}>
          <View style={styles.txLeft}>
            <View style={[styles.iconContainer, { backgroundColor: iconData.color + '15' }]}>
              <Ionicons name={iconData.name as any} size={20} color={iconData.color} />
            </View>
            <View style={styles.txInfo}>
              <Text style={styles.txCategory}>{item.category || (isCredit ? 'Added Funds' : 'Expense')}</Text>
              {item.description ? <Text style={styles.txNote} numberOfLines={1}>{item.description}</Text> : null}
              <Text style={styles.txTime}>
                {new Date(item.date || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
          <View style={styles.txRight}>
            <Text style={[styles.txAmount, isCredit ? styles.credit : styles.debit]}>
              {isCredit ? "+" : "-"} ₹{item.amount.toFixed(2)}
            </Text>
            <View style={[styles.sourcePill, { backgroundColor: item.source === 'bank' ? '#eff6ff' : '#ecfdf5' }]}>
              <Text style={[styles.sourceText, { color: item.source === 'bank' ? '#3b82f6' : '#10b981' }]}>
                {(item.source || 'cash').charAt(0).toUpperCase() + (item.source || 'cash').slice(1)}
              </Text>
            </View>
          </View>
        </View>
      </Swipeable>
    );
  };

  const currentData = activeTab === "credit" ? credits : debits;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={TYPOGRAPHY.heading}>History</Text>
      </View>

      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === "credit" && styles.segmentBtnActive]}
          onPress={() => setActiveTab("credit")}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentTxt, activeTab === "credit" && styles.segmentTxtActive]}>
            Balance Added
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === "debit" && styles.segmentBtnActive]}
          onPress={() => setActiveTab("debit")}
          activeOpacity={0.8}
        >
          <Text style={[styles.segmentTxt, activeTab === "debit" && styles.segmentTxtActive]}>
            Spending
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : currentData.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBg}>
            <Ionicons name="receipt-outline" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.emptyTitle}>
            {activeTab === "credit" ? "No Balance History" : "No Spending History"}
          </Text>
          <Text style={styles.emptySub}>
            {activeTab === "credit"
              ? "You haven't added any funds to your accounts yet."
              : "Looks like you haven't made any expenses yet."}
          </Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => router.replace('/')}>
            <Text style={styles.addBtnText}>Add a Transaction</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={currentData}
          keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())}
          renderItem={renderTransaction}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => {
            // Close any open swipeables on scroll
            swipeableRefs.forEach(ref => ref.close());
          }}
        />
      )}
    </View>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 50,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: COLORS.border,
    borderRadius: 14,
    padding: 4,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
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
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  segmentTxtActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 100,
    paddingTop: 8,
  },
  txCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: SIZING.radius,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
    paddingRight: 10,
  },
  txCategory: { 
    fontSize: 15,
    fontWeight: "600", 
    color: COLORS.textPrimary,
    marginBottom: 2
  },
  txNote: { 
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 4
  },
  txTime: { 
    fontSize: 11,
    color: COLORS.textMuted 
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: { 
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6
  },
  credit: { color: COLORS.success },
  debit: { color: COLORS.textPrimary }, // Displaying negative as standard dark text is often preferred, but kept red below? Actually design says red for expense
  
  sourcePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  sourceText: {
    fontSize: 10,
    fontWeight: '600'
  },
  deleteAction: {
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    marginBottom: 10,
    borderTopRightRadius: SIZING.radius,
    borderBottomRightRadius: SIZING.radius,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.lg,
    marginTop: 60,
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
  emptySub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    ...SHADOWS.card,
  },
  addBtnText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 15
  }
});