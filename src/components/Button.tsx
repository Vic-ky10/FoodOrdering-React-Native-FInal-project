import React, { forwardRef } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import Colors from "@/constants/Colors";

type ButtonProps = {
  text: string;
} & React.ComponentPropsWithoutRef<typeof Pressable>;

const Button = forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  ({ text, ...pressableProps }, ref) => {
    return (
      <Pressable ref={ref} {...pressableProps} style={styles.container}>
        <Text style={styles.text}>{text}</Text>
      </Pressable>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    marginVertical: 8,
    width: "100%",
    minHeight: 56,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  
});

export default Button;
