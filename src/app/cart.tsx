import { FlatList, StyleSheet, Text, View, Pressable } from "react-native";
import React, { useContext } from "react";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { useCart } from "@/Providers/CartProvider";
import CartListItem from "@/components/CartListItems";
import Button from "@/components/Button";

const CartScreen = () => {
  const { items, total, subtotal, deliveryFee , checkout} = useCart();

  return (
    <View>
      <FlatList
        data={items}
        renderItem={({ item }) => <CartListItem cartItem={item} />}
        contentContainerStyle={{ padding: 10, gap: 10 }}
      />
      <View style={{ padding: 20, backgroundColor: "white", gap: 8 }}>
        <Text>Subtotal: ${subtotal.toFixed(2)}</Text>
        <Text>Delivery: ${deliveryFee}</Text>
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>
          <Text>Total: ${total.toFixed(2)}</Text>
        </Text>
      </View>
      <Pressable
        style={{
          backgroundColor: items.length === 0 ? "gray" : "tomato",
          padding: 15,
          borderRadius: 10,
          margin: 10,
          alignItems: "center",
        }}
        disabled={items.length === 0}
      >
        <Text style={{ color: "white", fontWeight: "bold" }} onPress={checkout}>Checkout</Text>
      </Pressable>

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
};

export default CartScreen;
