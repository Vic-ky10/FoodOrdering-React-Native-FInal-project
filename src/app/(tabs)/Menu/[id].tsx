import { Alert, StyleSheet, Text, View, Image, Pressable } from "react-native";
import React, { useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import products from "@assets/data/products";
import { backupImage } from "@/components/ProductListItem";
import Button from "@/components/Button";
import { useCart } from "@/Providers/CartProvider";
import { PizzaSize } from "@assets/types";

const sizes:PizzaSize[] = ["S", "M", "L", "XL"];

const ProductDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const [selectedSize, setSelectedSize] = useState<PizzaSize>("M");
   
  const {addItem} = useCart()

  const router = useRouter()


  const product = products.find((P) => P.id.toString() === id);
    if (!product) {
    return <Text>product not found </Text>;
  }

  const addToCart = () => {
    if (!selectedSize) {
      Alert.alert("Select a size", "Please choose a size before adding this item to your cart.");
      return;
    }

    Alert.alert("Added to cart", `${product?.name} (${selectedSize}) was added to your cart.`);
    addItem(product , selectedSize)

    router.push('/cart')
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: product?.name }} />
      <Image
        source={{ uri: product.image || backupImage }}
        style={styles.image}
      />

      <Text>Select size</Text>
      <View style={styles.sizes}>
        {sizes.map((size) => (
          <Pressable
            onPress={() => setSelectedSize(size)}
            key={size}
            style={[
              styles.size,
              selectedSize === size && styles.sizeSelected,
            ]}
          >
            <Text
              style={[
                styles.text,
                { color: selectedSize === size ? "black" : "gray" },
              ]}
            >
              {size}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.price}>${product.price}</Text>
      <Button text="Add to cart" onPress={addToCart} />
    </View>
  );
};

export default ProductDetailsScreen;

const styles = StyleSheet.create({
  container: { backgroundColor: "white", flex: 1, padding: 10 },
  image: {
    width: "100%",
    aspectRatio: 1,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
  },
  sizes: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  size: {
    backgroundColor: "white",
    width: 50,
    aspectRatio: 1,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "gainsboro",
  },
  sizeSelected: {
    backgroundColor: "gainsboro",
  },
  text: {
    color: "black",
    fontSize: 30,
  },
});
