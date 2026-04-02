import { Stack } from "expo-router";
import React from "react";

import Colors from "@/constants/Colors";

export default function MenuStack() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Orders" }} />
    </Stack>
  );
}
