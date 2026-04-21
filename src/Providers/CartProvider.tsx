import { CartItem, Tables } from "@assets/types";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from "react";
import { randomUUID } from "expo-crypto";
import { Alert } from "react-native";
import { useInsertOrder } from "@/api/orders";
import { useRouter } from "expo-router";
import { useInsertOrderItems } from "@/api/Order-items";

type Product = Tables<"products">;

type CartType = {
  items: CartItem[];
  addItem: (product: Tables<"products">, size: CartItem["size"]) => void;
  updateQuantity: (itemID: string, amount: -1 | 1) => void;
  total: number;
  removeItem: (itemID: string) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryFee: number;
  itemCount: number;
  hasItems: boolean;
  checkout: (overrideTotal?: number) => void;
};

const CartContext = createContext<CartType>({
  items: [],
  addItem: () => {},
  updateQuantity: () => {},
  total: 0,
  removeItem: () => {},
  clearCart: () => {},
  subtotal: 0,
  deliveryFee: 0,
  itemCount: 0,
  hasItems: false,
  checkout: () => {},
});

export const CartProvider = ({ children }: PropsWithChildren) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const router = useRouter();

  const { mutate: insertOrder } = useInsertOrder();
  const { mutate: insertOrderItems } = useInsertOrderItems();

  const addItem = (product: Product, size: CartItem["size"]) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.product_id === product.id && item.size === size,
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      const newCartItem: CartItem = {
        id: randomUUID(),
        product,
        product_id: product.id,
        size,
        quantity: 1,
      };

      return [newCartItem, ...currentItems];
    });
  };
  // removeItem() and clearCart()
  const removeItem = (itemId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId),
    );
  };

  const clearCart = () => {
    setItems([]);
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

  const subtotal = items.reduce(
    (sum, item) => (sum += item.product.price * item.quantity),
    0,
  );
  const deliveryFee = items.length > 0 ? 40 : 0;
  const total = subtotal + deliveryFee;
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );
  const hasItems = items.length > 0;

  const checkout = (overrideTotal?: number) => {
    if (!hasItems) {
      Alert.alert("Cart", "Your cart is empty.");
      return;
    }

    const finalTotal = overrideTotal ?? total;

    insertOrder(
      { total: finalTotal },
      {
        onSuccess: savedOrderItems,
        onError: (error) => {
          Alert.alert(
            "Checkout Error",
            error?.message || "Failed to create your order.",
          );
        },
      },
    );
  };

  const savedOrderItems = (order: Tables<"orders">) => {
    const orderItems = items.map((cartItem) => ({
      order_id: order.id,
      product_id: cartItem.product_id,
      quantity: cartItem.quantity,
      size: cartItem.size,
    }));

    insertOrderItems(orderItems, {
      onSuccess() {
        clearCart();
        router.push(`/(user)/orders/${order.id}`);
      },
      onError: (error) => {
        Alert.alert(
          "Order Items Error",
          error?.message || "Your order was saved, but items could not be added.",
        );
      },
    });
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        total,
        removeItem,
        clearCart,
        subtotal,
        deliveryFee,
        itemCount,
        hasItems,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
