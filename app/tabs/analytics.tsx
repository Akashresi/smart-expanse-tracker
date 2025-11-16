// app/tabs/analytics.tsx
import { AlertCircle, TrendingUp } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, StyleSheet, Text, View } from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import ScreenWrapper from "../../components/ScreenWrapper";
import { COLORS, SIZING } from "../../constants/theme";

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
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categorySpending, setCategorySpending] = useState<CategoryData[]>([]);
  const [weeklyData, setWeeklyData] = useState<number[]>([]);
  const [monthlyData, setMonthlyData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const chartWidth = Dimensions.get("window").width - SIZING.lg * 2;

  const chartConfig = {
    backgroundColor: COLORS.white,
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user?.id) return; 
      setLoading(true);
      try {
        // This route should be protected and get user from token
        const res = await api.get(`/expenses/`); 
        const data = res.data || [];
        setExpenses(data);
        processAnalytics(data);
      } catch (error) {
        console.error("Error fetching expenses:", error);
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
      legendFontColor: "#333",
      legendFontSize: 12,
    }));
    setCategorySpending(categoryList);
  };

  const totalSpent = categorySpending.reduce((sum, c) => sum + c.amount, 0);

  if (loading) {
    return (
      <ScreenWrapper style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Analytics...</Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Analytics</Text>
      </View>

      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <TrendingUp size={24} color="#10b981" />
          <Text style={styles.insightTitle}>Spending Insights</Text>
        </View>
        {expenses.length > 0 ? (
          <Text style={styles.insightText}>
            You spent a total of ₹{totalSpent.toFixed(2)} this period.
          </Text>
        ) : (
          <Text style={styles.insightText}>No spending data yet.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📆 Monthly Trend</Text>
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
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅 Weekly Spending</Text>
        <View style={styles.chartCard}>
        {weeklyData.reduce((a, b) => a + b, 0) === 0 ? (
          <Text style={styles.noDataText}>No weekly data available</Text>
        ) : (
          <BarChart
            data={{
              labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
              datasets: [{ data: weeklyData }],
            }}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            yAxisLabel="₹"
            yAxisSuffix=""
            style={styles.chart}
          />
        )}
        </View>
      </View>

      <View style={styles.section}> 
        <Text style={styles.sectionTitle}>💰 Category Breakdown</Text>
        <View style={styles.chartCard}>
          {categorySpending.length === 0 ? (
            <Text style={styles.noDataText}>No expenses yet</Text>
          ) : (
            <PieChart
              data={categorySpending}
              width={chartWidth}
              height={220}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          )}
        </View>
      </View>

      <View style={styles.tipCard}>
        <View style={styles.tipHeader}>
          <AlertCircle size={24} color={COLORS.warning} />
          <Text style={styles.tipTitle}>Smart Tip</Text>
        </View>
        <Text style={styles.tipText}>
          Try setting a budget for your top spending category to save more!
        </Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.grayLight,
  },
  loadingText: {
    marginTop: SIZING.sm,
    color: COLORS.grayDark,
    fontSize: SIZING.body,
  },
  container: { backgroundColor: COLORS.grayLight, padding: 0 },
  header: {
    padding: SIZING.lg,
    borderBottomColor: COLORS.grayMedium,
    borderBottomWidth: 1,
    backgroundColor: COLORS.white,
  },
  headerTitle: { fontSize: SIZING.h1, fontWeight: "700", color: COLORS.text },
  insightCard: {
    backgroundColor: "#ecfdf5",
    margin: SIZING.lg,
    borderRadius: SIZING.radius,
    padding: SIZING.md,
    borderColor: "#a7f3d0",
    borderWidth: 1,
  },
  insightHeader: { flexDirection: "row", alignItems: "center", marginBottom: SIZING.sm },
  insightTitle: {
    fontSize: SIZING.body,
    fontWeight: "600",
    color: "#065f46",
    marginLeft: SIZING.sm,
  },
  insightText: { fontSize: SIZING.caption, color: "#047857" },
  section: { marginHorizontal: SIZING.lg, marginBottom: SIZING.lg },
  sectionTitle: {
    fontSize: SIZING.h3,
    fontWeight: "600",
    marginBottom: SIZING.sm,
    color: COLORS.text,
  },
  chartCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZING.radius,
    paddingTop: SIZING.md,
    elevation: 3,
    alignItems: "center",
  },
  chart: { 
    borderRadius: SIZING.radius, 
    marginVertical: SIZING.sm 
  },
  noDataText: { color: COLORS.grayDark, paddingVertical: 40 },
  tipCard: {
    backgroundColor: "#fffbeb",
    margin: SIZING.lg,
    borderRadius: SIZING.radius,
    padding: SIZING.md,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  tipHeader: { flexDirection: "row", alignItems: "center", marginBottom: SIZING.sm },
  tipTitle: { fontSize: SIZING.body, fontWeight: "600", color: "#92400e", marginLeft: SIZING.sm },
  tipText: { color: "#b45309", fontSize: SIZING.caption },
});