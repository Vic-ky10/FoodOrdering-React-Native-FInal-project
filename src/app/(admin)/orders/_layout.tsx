import { Stack } from "expo-router";
import React from "react";

import Colors from "@/constants/Colors";

export default function MenuStack() {
  return (
    <Stack>
      <Stack.Screen name="list" options={{ title: "Orders", headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: "Order Details" }} />
    </Stack>
  );
}
