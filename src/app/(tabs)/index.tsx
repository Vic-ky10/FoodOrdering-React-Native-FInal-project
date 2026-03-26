import Colors from "@/src/constants/Colors";
import { ScrollView, View } from "react-native";

import products from "@/assets/data/products";
import { ProductListItem } from "@/src/components/ProductListItem";

export default function MenuScreen() {
  return (
    <ScrollView>
      <View>
      <ProductListItem product={products[0]} />
          <ProductListItem product={products[1]} />
              <ProductListItem product={products[5]} />
         
    </View>
    
    </ScrollView>
  );
}

