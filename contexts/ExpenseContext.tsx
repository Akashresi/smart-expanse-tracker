// contexts/ExpenseContext.tsx
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";
import api from "../api/api";
import { useAuth } from "./AuthContext";

export type Expense = {
  id?: number;
  user_id: number;
  category: string;
  amount: number;
  description?: string;
  date?: string;
  type: "credit" | "debit"; // This type is now required
};

type ExpenseContextType = {
  expenses: Expense[];
  fetchExpenses: () => Promise<void>;
  addExpense: (e: Omit<Expense, "id">) => Promise<void>;
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const fetchExpenses = useCallback(async () => {
    if (!user?.id) {
      setExpenses([]);
      return;
    }
    try {
      // This route is protected and gets expenses for the token's user
      const res = await api.get(`/expenses/`);
      setExpenses(res.data || []);
    } catch (err) {
      console.warn("fetchExpenses error", err);
    }
  }, [user]);

  const addExpense = async (e: Omit<Expense, "id">) => {
    try {
      // This route is protected
      await api.post("/expenses/", e);
      await fetchExpenses(); // Refresh the list
    } catch (err) {
      console.warn("addExpense error", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return (
    <ExpenseContext.Provider value={{ expenses, fetchExpenses, addExpense }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export function useExpenses() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error("useExpenses must be used inside ExpenseProvider");
  return ctx;
}