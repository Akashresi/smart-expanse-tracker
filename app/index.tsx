import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  // 👇 Auto navigate to /tabs after short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/tabs");
    }, 2000); // 2 seconds delay

    return () => clearTimeout(timer);
  }, [router]); // ✅ Fixes the missing dependency warning

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MyApp</Text>
      <Text style={styles.subtitle}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#007AFF",
  },
  subtitle: {
    fontSize: 18,
    color: "#555",
    marginTop: 8,
  },
});
