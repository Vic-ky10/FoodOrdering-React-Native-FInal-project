
// import {
//   ActivityIndicator,
//   Alert,
//   Image,
//   Pressable,
//   ScrollView,
//   StyleSheet,
//   Text,
//   View,
// } from "react-native";
// import React, { useState } from "react";
// import { Stack, useLocalSearchParams, useRouter } from "expo-router";
// import products from "@assets/data/products";
// import { PizzaSize } from "@assets/types";
// import { backupImage } from "@/components/ProductListItem";
// import Button from "@/components/Button";
// import { useCart } from "@/Providers/CartProvider";
// import RemoteImage from "@/components/RemoteImage";


// const sizes: PizzaSize[] = ["S", "M", "L", "XL"];

// const ProductDetailsScreen = () => {
//   const { id } = useLocalSearchParams();
//   const router = useRouter();
//   const { addItem } = useCart();

//   const [selectedSize, setSelectedSize] = useState<PizzaSize | null>(null);
//   const [quantity, setQuantity] = useState(1);

//   const product = products.find((item) => item.id.toString() === id);

//   if (!product) {
//     return (
//       <View style={styles.centered}>
//         <Text style={styles.notFoundTitle}>Product not found</Text>
//         <Text style={styles.notFoundText}>
//           We could not find the item you selected.
//         </Text>
//       </View>
//     );
//   }

 
//   const addToCart = () => {
//     if (!selectedSize) {
//       Alert.alert("Select a size", "Please choose a pizza size first.");
//       return;
//     }

//     for (let i = 0; i < quantity; i++) {
//       addItem(product, selectedSize);
//     }

//     Alert.alert(
//       "Added to cart",
//       `${product.name} (${selectedSize}) x${quantity} added successfully.`,
//     );

//     router.push("/cart");
//   };


//   // if (isLoading) {
//   //   return <ActivityIndicator />;
//   // }

//   // if (error) {
//   //   return <Text>Failed to fetch products: {error.message}</Text>;
//   // }


//   return (
//     <View style={styles.container}>
//       <Stack.Screen options={{ title: product.name }} />

//       <ScrollView contentContainerStyle={styles.content}> 

//         <RemoteImage
//        path={product.image}
//        fallback={backupImage}
//           style={styles.image}
//           resizeMode="contain"
//         />

//         <View style={styles.infoBlock}>
//           <Text style={styles.title}>{product.name}</Text>
//           <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          
//         </View>

//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Choose size</Text>
//           <View style={styles.sizesRow}>
//             {sizes.map((size) => {
//               const isSelected = selectedSize === size;

//               return (
//                 <Pressable
//                   key={size}
//                   onPress={() => setSelectedSize(size)}
//                   style={[styles.sizeButton, isSelected && styles.sizeButtonSelected]}
//                 >
//                   <Text
//                     style={[
//                       styles.sizeButtonText,
//                       isSelected && styles.sizeButtonTextSelected,
//                     ]}
//                   >
//                     {size}
//                   </Text>
//                 </Pressable>
//               );
//             })}
//           </View>
//         </View>


//         <View style={styles.summaryCard}>
//           <Text style={styles.summaryText}>Selected size: {selectedSize || "-"}</Text>
//           <Text style={styles.summaryText}>
//             Items: {quantity}
//           </Text>
//           <Text style={styles.summaryTotal}>
//             Total: ${(product.price * quantity).toFixed(2)}
//           </Text>
//         </View>
//       </ScrollView>

//       <View style={styles.footer}>
//         <Button text="Add to cart" onPress={addToCart} />
//       </View>
//     </View>
//   );
// };

// export default ProductDetailsScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff8f2",
//   },
//   content: {
//     padding: 16,
//     paddingBottom: 32,
//   },
//   image: {
//     width: "100%",
//     height: 280,
//     marginBottom: 20,
//     backgroundColor: "#ffffff",
//     borderRadius: 20,
//   },
//   infoBlock: {
//     marginBottom: 24,
//     gap: 8,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "700",
//     color: "#1f1f1f",
//   },
//   price: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#d35400",
//   },
//   description: {
//     fontSize: 15,
//     lineHeight: 22,
//     color: "#5f5f5f",
//   },
//   section: {
//     marginBottom: 24,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "600",
//     marginBottom: 12,
//     color: "#1f1f1f",
//   },
//   sizesRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     gap: 10,
//   },
//   sizeButton: {
//     flex: 1,
//     height: 52,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: "#e3d5ca",
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#ffffff",
//   },
//   sizeButtonSelected: {
//     backgroundColor: "#ffd8bf",
//     borderColor: "#d4c7bdff",
//   },
//   sizeButtonText: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#7a7a7a",
//   },
//   sizeButtonTextSelected: {
//     color: "#1f1f1f",
//   },
 

//   quantityButtonText: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#1f1f1f",
//   },
//   quantityText: {
//     fontSize: 22,
//     fontWeight: "700",
//     minWidth: 30,
//     textAlign: "center",
//   },
//   summaryCard: {
//     backgroundColor: "#ffffff",
//     borderRadius: 18,
//     padding: 16,
//     gap: 8,
//     borderWidth: 1,
//     borderColor: "#f0e2d7",
//   },
//   summaryText: {
//     fontSize: 15,
//     color: "#4f4f4f",
//   },
//   summaryTotal: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#d35400",
//     marginTop: 4,
//   },
//   footer: {
//     padding: 16,
//     paddingTop: 10,
//     borderTopWidth: 1,
//     borderTopColor: "#f0e2d7",
//     backgroundColor: "#ffffff",
//   },
//   centered: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   notFoundTitle: {
//     fontSize: 22,
//     fontWeight: "700",
//     marginBottom: 8,
//     color: "#1f1f1f",
//   },
//   notFoundText: {
//     fontSize: 15,
//     color: "#666",
//     textAlign: "center",
//   },
// });


import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import products from "@assets/data/products";
import { PizzaSize } from "@assets/types";
import { backupImage } from "@/components/ProductListItem";
import Button from "@/components/Button";
import { useCart } from "@/Providers/CartProvider";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link } from "expo-router";
import Colors from "@/constants/Colors";
import { useProduct } from "@/api/products";
import { isDayjs } from "dayjs";
import RemoteImage from "@/components/RemoteImage";

const sizes: PizzaSize[] = ["S", "M", "L", "XL"];

const ProductDetailsScreen = () => {
  const { id: idString } = useLocalSearchParams();
  const id = parseFloat(typeof idString === "string" ? idString : idString[0]);


  const { data: product, error, isLoading } = useProduct(id);

  const { addItem } = useCart();
    const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<PizzaSize | null>(null);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundTitle}>Product not found</Text>
        <Text style={styles.notFoundText}>
          We could not find the item you selected.
        </Text>
      </View>
    );
  }

  const addToCart = () => {
    if (!selectedSize) {
      Alert.alert("Select a size", "Please choose a pizza size first.");
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedSize);
    }

    Alert.alert(
      "Added to cart",
      `${product.name} (${selectedSize}) x${quantity} added successfully.`,
    );

    router.push("/cart");
  };


    if (isLoading) {
      return <ActivityIndicator />;
    }
  
    if (error) {
      return <Text>Failed to fetch products: {error.message}</Text>;
    }
  
  return (

    <View style={styles.container}>
      <Stack.Screen options={{ title: product.name }} />

      <ScrollView contentContainerStyle={styles.content}> 

        <RemoteImage
       path={product.image}
       fallback={backupImage}
          style={styles.image}
          resizeMode="contain"
        />

        <View style={styles.infoBlock}>
          <Text style={styles.title}>{product.name}</Text>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose size</Text>
          <View style={styles.sizesRow}>
            {sizes.map((size) => {
              const isSelected = selectedSize === size;

              return (
                <Pressable
                  key={size}
                  onPress={() => setSelectedSize(size)}
                  style={[styles.sizeButton, isSelected && styles.sizeButtonSelected]}
                >
                  <Text
                    style={[
                      styles.sizeButtonText,
                      isSelected && styles.sizeButtonTextSelected,
                    ]}
                  >
                    {size}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>


        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>Selected size: {selectedSize || "-"}</Text>
          <Text style={styles.summaryText}>
            Items: {quantity}
          </Text>
          <Text style={styles.summaryTotal}>
            Total: ${(product.price * quantity).toFixed(2)}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button text="Add to cart" onPress={addToCart} />
      </View>
    </View>
  );
};

export default ProductDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff8f2",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  image: {
    width: "100%",
    height: 280,
    marginBottom: 20,
    backgroundColor: "#ffffff",
    borderRadius: 20,
  },
  infoBlock: {
    marginBottom: 24,
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f1f1f",
  },
  price: {
    fontSize: 22,
    fontWeight: "700",
    color: "#d35400",
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#5f5f5f",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1f1f1f",
  },
  sizesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  sizeButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e3d5ca",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  sizeButtonSelected: {
    backgroundColor: "#ffd8bf",
    borderColor: "#d4c7bdff",
  },
  sizeButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7a7a7a",
  },
  sizeButtonTextSelected: {
    color: "#1f1f1f",
  },
 

  quantityButtonText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f1f1f",
  },
  quantityText: {
    fontSize: 22,
    fontWeight: "700",
    minWidth: 30,
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "#f0e2d7",
  },
  summaryText: {
    fontSize: 15,
    color: "#4f4f4f",
  },
  summaryTotal: {
    fontSize: 20,
    fontWeight: "700",
    color: "#d35400",
    marginTop: 4,
  },
  footer: {
    padding: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0e2d7",
    backgroundColor: "#ffffff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  notFoundTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    color: "#1f1f1f",
  },
  notFoundText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },
});
