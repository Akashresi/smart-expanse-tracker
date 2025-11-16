// components/expresioncard.tsx
import { StyleSheet, Text, View } from 'react-native';
import { Category, Expense } from '../types';

interface ExpenseCardProps {
  expense: Expense;
  category?: Category;
}

export function ExpenseCard({ expense, category }: ExpenseCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.categoryIcon, { backgroundColor: category?.color + '20' }]}>
        <View style={[styles.categoryDot, { backgroundColor: category?.color }]} />
      </View>
      <View style={styles.details}>
        <Text style={styles.description}>{expense.description}</Text>
        <Text style={styles.category}>{category?.name || 'Uncategorized'}</Text>
      </View>
      <Text style={styles.amount}>${expense.amount.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  details: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#6b7280',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
});