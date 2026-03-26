import Colors from "@/src/constants/Colors";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";




export const ProductListItem = ({product} ) => {

  return (
    <View style={styles.container}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.price}>${product.price}</Text>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
   
    alignItems: "center",
    padding: 10,
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    marginVertical: 10,
  },

  price: {
    color: Colors.light.tint,
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    aspectRatio: 1,
  },
});
