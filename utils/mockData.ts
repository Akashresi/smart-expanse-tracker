// utils/mockData.ts
import { Category, Expense, Budget, SavingsGoal } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Dining', icon: 'utensils', color: '#ef4444' },
  { id: '2', name: 'Transport', icon: 'car', color: '#f59e0b' },
  { id: '3', name: 'Shopping', icon: 'shopping-bag', color: '#ec4899' },
  { id: '4', name: 'Entertainment', icon: 'film', color: '#8b5cf6' },
  { id: '5', name: 'Bills & Utilities', icon: 'receipt', color: '#3b82f6' },
  { id: '6', name: 'Healthcare', icon: 'heart-pulse', color: '#10b981' },
  { id: '7', name: 'Education', icon: 'graduation-cap', color: '#06b6d4' },
  { id: '8', name: 'Other', icon: 'tag', color: '#6b7280' },
];

export const SAMPLE_EXPENSES: Expense[] = [
  {
    id: '1',
    categoryId: '1',
    amount: 45.50,
    description: 'Grocery shopping',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: '2',
    categoryId: '2',
    amount: 15.00,
    description: 'Uber ride',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: '3',
    categoryId: '4',
    amount: 25.00,
    description: 'Movie tickets',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
  },
];

export const SAMPLE_BUDGETS: Budget[] = [
  {
    id: '1',
    categoryId: '1',
    amount: 500,
    period: 'monthly',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
  },
];

export const SAMPLE_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: '1',
    name: 'Emergency Fund',
    targetAmount: 10000,
    currentAmount: 3500,
    deadline: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
  },
  {
    id: '2',
    name: 'Vacation',
    targetAmount: 3000,
    currentAmount: 1200,
    deadline: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
  },
];