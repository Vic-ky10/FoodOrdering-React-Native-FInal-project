import { CartItem, Product } from "@assets/types";
import { createContext, PropsWithChildren, useContext, useState } from "react";
import { randomUUID } from "expo-crypto";

type CartType = {
  items: CartItem[];
  addItem: (product: Product, size: CartItem["size"]) => void;
  updateQuantity: (itemID: string, amount: -1 | 1) => void;
    total : number , 
    removeItem : (itemID : string) => void ;
    clearCart : () => void;
    subtotal :number ,
    deliveryFee : number , 
};

const CartContext = createContext<CartType>({
  items: [],
  addItem: () => {},
  updateQuantity: () => {},
  total : 0 , 
  removeItem : () => {},
  clearCart : () => {},
  subtotal : 0 ,
  deliveryFee : 0,
});

export const CartProvider = ({ children }: PropsWithChildren) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product, size: CartItem["size"]) => {
  
    const existingItem = items.find( 
    (item) => item.product_id === product.id && item.size === size

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
   // removeItem() and clearCart()
    const removeItem = (itemId: string) => {
      setItems((currentItems) => currentItems.filter((item ) => item.id !== itemId));
    }

    const clearCart = () => {
      setItems([]);
    }

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

  const subtotal = items.reduce( 
    (sum , item ) => (sum += item.product.price * item.quantity ), 0
  ) ;

  const deliveryFee = items.length > 0 ? 40 : 0;
  const total = subtotal + deliveryFee
  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity , total ,removeItem , clearCart , subtotal , deliveryFee  }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
