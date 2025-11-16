// app/tabs/_layout.tsx
import { Tabs } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ExpenseProvider } from "../../contexts/ExpenseContext";
import { COLORS, SIZING } from "../../constants/theme";

export default function TabsLayout() {
  return (
    <ExpenseProvider>
      <Tabs
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.grayDark,
          tabBarStyle: {
            backgroundColor: COLORS.white,
            borderTopWidth: 1,
            borderTopColor: COLORS.grayMedium,
            height: 60,
            paddingBottom: SIZING.xs,
          },
          tabBarLabelStyle: {
            fontSize: SIZING.small,
            fontWeight: '600',
          },
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => {
            let iconName: any = "home"; // Default

            if (route.name === "index") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "analytics") {
              iconName = focused ? "pie-chart" : "pie-chart-outline";
            } else if (route.name === "chatbot") {
              iconName = focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline";
            } else if (route.name === "savings") {
              iconName = focused ? "save" : "save-outline";
            } else if (route.name === "history") {
              iconName = focused ? "time" : "time-outline";
            } else if (route.name === "settings") {
              iconName = focused ? "settings" : "settings-outline";
            }
            
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="analytics" options={{ title: "Analysis" }} />
        <Tabs.Screen name="chatbot" options={{ title: "Chatbot" }} />
        <Tabs.Screen name="savings" options={{ title: "Saving" }} />
        <Tabs.Screen name="history" options={{ title: "History" }} />
        <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      </Tabs>
    </ExpenseProvider>
  );
}