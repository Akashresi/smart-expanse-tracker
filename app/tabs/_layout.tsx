// app/tabs/_layout.tsx
import { Tabs } from "expo-router";
import { View } from 'react-native';
import Ionicons from "react-native-vector-icons/Ionicons";
import { ExpenseProvider } from "../../contexts/ExpenseContext";
import { useThemeColors, SIZING } from "../../constants/theme";

export default function TabsLayout() {
  const COLORS = useThemeColors();
  return (
    <ExpenseProvider>
      <Tabs
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: COLORS.primary,
          tabBarShowLabel: true,
          tabBarStyle: {
            backgroundColor: COLORS.card,
            height: 70,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
            paddingBottom: 10,
            paddingTop: 10,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 4,
          },
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => {
            let iconName: any = "home";

            switch (route.name) {
              case "index":
                iconName = focused ? "home" : "home-outline";
                break;
              case "analytics":
                iconName = focused ? "pie-chart" : "pie-chart-outline";
                break;
              case "chatbot":
                iconName = focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline";
                break;
              case "history":
                iconName = focused ? "time" : "time-outline";
                break;
              case "savings":
                iconName = focused ? "wallet" : "wallet-outline";
                break;
              case "settings":
                iconName = focused ? "settings" : "settings-outline";
                break;
            }
            
            return (
              <View style={{
                alignItems: 'center', 
                justifyContent: 'center',
                width: 40,
                height: 40,
              }}>
                {focused && (
                  <View style={{
                    position: 'absolute',
                    top: -10, // places it right at the top border of the tab bar
                    width: 20,
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: COLORS.primary
                  }} />
                )}
                <Ionicons name={iconName} size={24} color={focused ? COLORS.primary : COLORS.textMuted} />
              </View>
            );
          },
        })}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="analytics" options={{ title: "Insights" }} />
        <Tabs.Screen name="chatbot" options={{ title: "Chatbot" }} />
        <Tabs.Screen name="history" options={{ title: "History" }} />
        <Tabs.Screen name="savings" options={{ title: "Saving" }} />
        <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      </Tabs>
    </ExpenseProvider>
  );
}