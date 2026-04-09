import {  Tables} from "@assets/types";
import Colors from "@/constants/Colors";
import { Image, Pressable, StyleSheet, Text } from "react-native";
import { Link, useSegments } from "expo-router";
import RemoteImage from "./RemoteImage";

type ProductListItemProps = {
  product: Tables<'products'>;
};

export const backupImage =
  "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/peperoni.png";

export const ProductListItem = ({ product }: ProductListItemProps) => {
  const segments = useSegments();
  const rootSegment = segments[0];
  const href = `/${rootSegment}/Menu/${product.id}`;

  return (
    <Link href={href} asChild>
      <Pressable style={styles.container}>
        <RemoteImage
          path={product.image}
          fallback={ backupImage}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>${product.price}</Text>
        
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    margin: 5,
    maxWidth: "50%",
    backgroundColor: "#fcfcfcff",
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderTopLeftRadius: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
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
  link: {
    fontSize: 15,
    fontWeight: "700",
    marginVertical: 10,
  },
});
