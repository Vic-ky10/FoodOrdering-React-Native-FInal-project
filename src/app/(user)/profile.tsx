import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

const ProfileScreen = () => {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signOut();

    setLoading(false);

    if (error) {
      Alert.alert("Sign out failed", error.message);
      return;
    }

    router.replace("/sign-in");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Button
        title={loading ? "Signing Out..." : "Sign Out"}
        onPress={handleSignOut}
        disabled={loading}
      />
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
});
