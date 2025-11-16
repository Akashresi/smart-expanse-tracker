// types/index.ts
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Expense {
  id: string;
  categoryId: string;
  amount: number;
  description: string;
  date: string;
}

export interface Budget {
  id: string;
  categoryId?: string;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

export interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: Date;
  isUser: boolean;
}