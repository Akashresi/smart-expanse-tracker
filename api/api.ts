// api/api.ts
import axios, { AxiosInstance } from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const LOCAL_API_URL = "http://10.63.3.210:8000"; // 👈 Your PC's IP

const apiUrl =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.REACT_NATIVE_API_URL ||
  LOCAL_API_URL;

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ENHANCEMENT: Use an interceptor to automatically add auth tokens
api.interceptors.request.use(
  async (config) => {
    // 1. Get the token from storage
    const token = await AsyncStorage.getItem("@token");
    
    // 2. If the token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 3. For your saving goals PATCH request, add user_id as a query param
    if (config.method === 'patch' && config.url?.includes('/goals/')) {
        const userRaw = await AsyncStorage.getItem("@user");
        if (userRaw) {
            const user = JSON.parse(userRaw);
            config.params = { ...config.params, user_id: user.id };
        }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;