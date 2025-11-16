// utils/calculation.ts
import { Expense } from '../types';

export const calculateTotalExpenses = (expenses: Expense[]): number => {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

export const calculateCategoryTotal = (expenses: Expense[], categoryId: string): number => {
  return expenses
    .filter(expense => expense.categoryId === categoryId)
    .reduce((sum, expense) => sum + expense.amount, 0);
};

export const calculateDailyAverage = (expenses: Expense[], days: number = 30): number => {
  const total = calculateTotalExpenses(expenses);
  return total / days;
};

export const calculateProgress = (current: number, target: number): number => {
  if (target === 0) return 0;
  return Math.min((current / target) * 100, 100);
};

export const filterExpensesByDateRange = (
  expenses: Expense[],
  startDate: string,
  endDate: string
): Expense[] => {
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return expenseDate >= start && expenseDate <= end;
  });
};

export const groupExpensesByCategory = (expenses: Expense[]): Map<string, number> => {
  const grouped = new Map<string, number>();

  expenses.forEach(expense => {
    const current = grouped.get(expense.categoryId) || 0;
    grouped.set(expense.categoryId, current + expense.amount);
  });

  return grouped;
};

export const calculateSavingsRate = (income: number, expenses: number): number => {
  if (income === 0) return 0;
  return ((income - expenses) / income) * 100;
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};