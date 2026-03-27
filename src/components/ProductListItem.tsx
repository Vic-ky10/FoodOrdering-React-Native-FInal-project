import { Product } from "@assets/types";
import Colors from "@/constants/Colors";
import { Image, StyleSheet, Text, View } from "react-native";

type ProductListItemProps = {
    product : Product;
}

const backupImage =  'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/peperoni.png'


export const ProductListItem = ({product} :ProductListItemProps ) => {

  return (
    <View style={styles.container}>
      <Image
       source={{ uri: product.image || backupImage  }} style={styles.image}
       resizeMode="contain"
       />
      <Text style={styles.title}>{product.name }</Text>
      <Text style={styles.price}>${product.price}</Text>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
   flex: 1 ,
    alignItems: "center",
    padding: 10,
    borderRadius: 20,
    margin: 5,
    backgroundColor:"black",
    maxWidth :'50%'
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
