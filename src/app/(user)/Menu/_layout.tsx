


import { Stack } from "expo-router";
import React from "react";
import { SymbolView } from "expo-symbols";
import { Link } from "expo-router";
import { Pressable } from "react-native";

import Colors from "@/constants/Colors";

export default function MenuStack() {
  return (
    <Stack
      screenOptions={{
        headerRight: () => (
          <Link href="/cart" asChild>
            <Pressable style={{ marginRight: 15 }}>
              {({ pressed }) => (
                <SymbolView
                  name={{  android: "shopping_cart" }}
                  size={25}
                  tintColor={Colors.light.tint}
                  style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          </Link>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: "Menu" }} />
    </Stack>
  );
}
