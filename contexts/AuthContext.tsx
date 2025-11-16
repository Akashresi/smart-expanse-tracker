// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  id: number;
  name: string;
  email: string;
  date_of_birth: string;
  age: number;
  gender: string;
};

type AuthContextType = {
  token: string | null;
  user: User | null;
  login: (user: User, token: string) => Promise<void>; 
  logout: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const login = async (user: User, token: string) => {
    await AsyncStorage.setItem("@token", token);
    await AsyncStorage.setItem("@user", JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("@user");
    await AsyncStorage.removeItem("@token");
    await AsyncStorage.removeItem("@transactions"); // Also clear legacy local data
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        token, 
        user, 
        login, 
        logout, 
        isAuthenticated: !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return ctx;
};