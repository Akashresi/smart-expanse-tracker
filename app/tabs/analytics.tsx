// app/tabs/analytics.tsx
import { AlertCircle, TrendingUp, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import { useThemeColors, SIZING, SHADOWS, SPACING, TYPOGRAPHY } from "../../constants/theme";

const { width } = Dimensions.get("window");

interface Expense {
  id: number;
  category: string;
  amount: number;
  date: string;
  user_id: number;
}

interface CategoryData {
  name: string;
  amount: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

export default function AnalyticsScreen() {
  const COLORS = useThemeColors();
  const styles = getStyles(COLORS);

  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categorySpending, setCategorySpending] = useState<CategoryData[]>([]);
  const [weeklyData, setWeeklyData] = useState<number[]>([]);
  const [monthlyData, setMonthlyData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTip, setShowTip] = useState(true);

  const chartWidth = width - SPACING.md * 2 - 32;

  const chartConfig = {
    backgroundColor: COLORS.card,
    backgroundGradientFrom: COLORS.card,
    backgroundGradientTo: COLORS.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(26, 86, 219, ${opacity})`, // primary color
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`, // textMuted
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: COLORS.card
    }
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user?.id) return; 
      setLoading(true);
      try {
        const res = await api.get(`/expenses/`); 
        const data = res.data || [];
        setExpenses(data);
        processAnalytics(data);
      } catch (error) {
        setExpenses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchExpenses();
  }, [user]);

  const processAnalytics = (data: Expense[]) => {
    if (data.length === 0) return;
    const now = new Date();
    // ---- WEEKLY ----
    const weekData = [0, 0, 0, 0, 0, 0, 0];
    data.forEach((exp) => {
      const date = new Date(exp.date);
      const day = date.getDay();
      const dayIndex = day === 0 ? 6 : day - 1;
      if (date >= new Date(new Date().setDate(now.getDate() - 7))) {
        weekData[dayIndex] += exp.amount;
      }
    });
    setWeeklyData(weekData);
    // ---- MONTHLY ----
    const monthlyTotals: { [key: string]: number } = {};
    data.forEach((exp) => {
      const date = new Date(exp.date);
      const month = date.toLocaleString("default", { month: "short" });
      monthlyTotals[month] = (monthlyTotals[month] || 0) + exp.amount;
    });
    const sortedMonths = Object.keys(monthlyTotals).slice(-6);
    const monthValues = sortedMonths.map((m) => monthlyTotals[m]);
    setMonthlyData(monthValues);
    // ---- CATEGORY BREAKDOWN ----
    const categories: { [key: string]: number } = {};
    data.forEach((exp) => {
      categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
    });
    const categoryList = Object.entries(categories).map(([name, amount], i) => ({
      name,
      amount,
      color: `rgba(${(i * 60) % 255}, ${(150 + i * 30) % 255}, ${(100 + i * 20) % 255}, 1)`,
      legendFontColor: COLORS.textPrimary,
      legendFontSize: 13,
    }));
    setCategorySpending(categoryList);
  };

  const totalSpent = categorySpending.reduce((sum, c) => sum + c.amount, 0);
  const isHealthy = totalSpent < 50000; // Arbitrary metric for color highlight

  if (loading) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Analytics...</Text>
      </View>
    );
  }

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconBg}>
        <Ionicons name="bar-chart" size={48} color={COLORS.primary} />
      </View>
      <Text style={styles.emptyTitle}>No Insights Yet</Text>
      <Text style={styles.emptySub}>Add your first expense to see your financial trends and insights here.</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 100}}>
      <View style={styles.header}>
        <Text style={TYPOGRAPHY.heading}>Analytics</Text>
      </View>

      {expenses.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <LinearGradient 
            colors={isHealthy ? [COLORS.success, '#10b981'] : [COLORS.warning, '#d97706']} 
            style={styles.insightCard} 
            start={{x: 0, y: 0}} 
            end={{x: 1, y: 1}}
          >
            <View style={styles.insightHeader}>
              <TrendingUp size={22} color="#ffffff" />
              <Text style={styles.insightTitle}>Spending Insights</Text>
            </View>
            <Text style={styles.insightText}>
              You spent a total of ₹{totalSpent.toFixed(2)} this period.
            </Text>
          </LinearGradient>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Trend</Text>
            <View style={styles.chartCard}>
              {monthlyData.length === 0 ? (
                <Text style={styles.noDataText}>No monthly data available</Text>
              ) : (
                <LineChart
                  data={{
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                    datasets: [{ data: monthlyData }],
                  }}
                  width={chartWidth}
                  height={180}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(26, 86, 219, ${opacity})`,
                  }}
                  bezier
                  style={styles.chart}
                  withInnerLines={false}
                  withOuterLines={false}
                />
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Weekly Spending</Text>
            <View style={styles.chartCard}>
            {weeklyData.reduce((a, b) => a + b, 0) === 0 ? (
              <Text style={styles.noDataText}>No weekly data available</Text>
            ) : (
              <BarChart
                data={{
                  labels: ["M", "T", "W", "T", "F", "S", "S"],
                  datasets: [{ data: weeklyData }],
                }}
                width={chartWidth}
                height={180}
                chartConfig={{
                  ...chartConfig,
                  color: () => COLORS.primary,
                }}
                yAxisLabel="₹"
                yAxisSuffix=""
                style={styles.chart}
                showBarTops={false}
                withInnerLines={false}
              />
            )}
            </View>
          </View>

          <View style={styles.section}> 
            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            <View style={styles.chartCard}>
              {categorySpending.length === 0 ? (
                <Text style={styles.noDataText}>No expenses yet</Text>
              ) : (
                <PieChart
                  data={categorySpending}
                  width={chartWidth + 30}
                  height={180}
                  chartConfig={chartConfig}
                  accessor="amount"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              )}
            </View>
          </View>
        </>
      )}

      {showTip && (
        <View style={styles.tipCard}>
          <TouchableOpacity 
            style={styles.tipClose} 
            onPress={() => setShowTip(false)}
            hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}
          >
            <X size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
          <View style={styles.tipHeader}>
            <AlertCircle size={20} color={COLORS.warning} />
            <Text style={styles.tipTitle}>Smart Tip</Text>
          </View>
          <Text style={styles.tipText}>
            Try setting a budget for your top spending category to save more!
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const getStyles = (COLORS: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    padding: SPACING.md,
    paddingTop: 50,
  },
  loadingText: { marginTop: 12, color: COLORS.textMuted, fontSize: 16 },
  
  insightCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: SIZING.radius,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  insightHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  insightTitle: { fontSize: 16, fontWeight: "600", color: "#ffffff", marginLeft: 8 },
  insightText: { fontSize: 14, color: "rgba(255,255,255,0.9)" },
  
  section: { marginHorizontal: SPACING.md, marginBottom: SPACING.lg },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 12 },
  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZING.radius,
    padding: 16,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  chart: { borderRadius: SIZING.radius },
  noDataText: { color: COLORS.textMuted, paddingVertical: 40, fontSize: 14 },
  
  tipCard: {
    backgroundColor: COLORS.warning + '15',
    marginHorizontal: SPACING.md,
    borderRadius: SIZING.radius,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.warning + '40',
    position: 'relative'
  },
  tipClose: { position: 'absolute', top: 12, right: 12, zIndex: 10 },
  tipHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  tipTitle: { fontSize: 15, fontWeight: "600", color: COLORS.warning, marginLeft: 8 },
  tipText: { color: COLORS.textPrimary, fontSize: 13, lineHeight: 18 },

  emptyState: {
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
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
  emptySub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 }
});