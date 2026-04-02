import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import Button from "@/components/Button";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.overlay}>
          <Text style={styles.title}>Food Ordering App</Text>
          <Text style={styles.subtitle}>
            Fresh food, fast delivery, and easy ordering
          </Text>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <Text style={styles.heading}>Welcome</Text>
        <Text style={styles.description}>
          Choose how you want to continue in the app
        </Text>

        <Link href="/(user)" asChild>
          <Button text="Continue as User" />
        </Link>

        <Link href="/(admin)" asChild>
          <Button text="Continue as Admin" />
        </Link>

        <Link href="/sign-in" asChild>
          <Button text="Sign In" />
        </Link>

        <Link href="/sign-up" asChild>
          <Button text="Sign Up" />
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    height: "25%",
    position: "relative",
  },

  overlay: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "rgba(0,0,0,0.35)",
    textAlign: "center",

    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    color: "rgba(0,0,0,0.35)",
  },
  bottomSection: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    marginBottom: 80,
  },
  heading: {
    fontSize: 30,
    fontWeight: "700",
     color: "rgba(0, 0, 0, 0.35)",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
  },
});
