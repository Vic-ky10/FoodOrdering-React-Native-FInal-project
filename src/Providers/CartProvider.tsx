import { CartItem, Product } from "@assets/types";
import { createContext, PropsWithChildren, useContext, useState } from "react";
import { randomUUID } from "expo-crypto";

type CartType = {
  items: CartItem[];
  addItem: (product: Product, size: CartItem["size"]) => void;
  updateQuantity: (itemID: string, amount: -1 | 1) => void;
    total : number , 
};

const CartContext = createContext<CartType>({
  items: [],
  addItem: () => {},
  updateQuantity: () => {},
  total : 0 , 
});

export const CartProvider = ({ children }: PropsWithChildren) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product, size: CartItem["size"]) => {
  
    const existingItem = items.find( 
      (item) => item.product === product && item.size === size 
    );
    if(existingItem) {
      updateQuantity(existingItem.id, 1);
      return    }
 
    // if already in cart, increment quantity
    const newCartItem: CartItem = {
      id: randomUUID(), // generate
      product,
      product_id: product.id,
      size,
      quantity: 1,
    };
    setItems([newCartItem, ...items]);
  };

  // updateQuantity
  const updateQuantity = (itemId: string, amount: -1 | 1) => {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + amount }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const total = items.reduce( 
    (sum , item ) => (sum += item.product.price * item.quantity.toFixed(2) ), 0
  )
  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity , total  }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
