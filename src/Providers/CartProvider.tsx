import { CartItem, Tables } from "@assets/types";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { randomUUID } from "expo-crypto";
import { Alert } from "react-native";
import { useInsertOrder } from "@/api/orders";
import { useRouter } from "expo-router";
import { useInsertOrderItems } from "@/api/Order-items";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Product = Tables<"products">;

type Coupon = {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  active: boolean;
  minimum_order_amount?: number | null;
  expires_at?: string | null;
  first_order_only?: boolean | null;
};

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
  appliedCoupon: Coupon | null;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
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
  appliedCoupon: null,
  applyCoupon: () => {},
  removeCoupon: () => {},
  checkout: () => {},
});

const CART_STORAGE_KEY = "cart_items";
const COUPON_STORAGE_KEY = "cart_coupon";

const parseStoredCoupon = (value: string): Coupon | null => {
  try {
    const parsed = JSON.parse(value) as unknown;

    if (
      parsed &&
      typeof parsed === "object" &&
      typeof (parsed as Coupon).code === "string" &&
      typeof (parsed as Coupon).type === "string" &&
      typeof (parsed as Coupon).value === "number"
    ) {
      return parsed as Coupon;
    }
  } catch {
    return null;
  }

  return null;
};

export const CartProvider = ({ children }: PropsWithChildren) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedItems = await AsyncStorage.getItem(CART_STORAGE_KEY);
        const savedCoupon = await AsyncStorage.getItem(COUPON_STORAGE_KEY);

        if (savedItems) {
          setItems(JSON.parse(savedItems));
        }

        if (savedCoupon) {
          setAppliedCoupon(parseStoredCoupon(savedCoupon));
        }
      } catch (error) {
        console.log("Failed to load cart state", error);
      } finally {
        setHydrated(true);
      }
    };

    loadCart();
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const saveCart = async () => {
      try {
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.log("Failed to save cart", error);
      }
    };

    saveCart();
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    const saveCoupon = async () => {
      try {
        if (appliedCoupon) {
          await AsyncStorage.setItem(
            COUPON_STORAGE_KEY,
            JSON.stringify(appliedCoupon),
          );
        } else {
          await AsyncStorage.removeItem(COUPON_STORAGE_KEY);
        }
      } catch (error) {
        console.log("Failed to save coupon", error);
      }
    };

    saveCoupon();
  }, [appliedCoupon, hydrated]);

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

  const applyCoupon = (coupon: Coupon) => {
    setAppliedCoupon(coupon);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const clearCart = async () => {
    setItems([]);
    setAppliedCoupon(null);

    try {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
      await AsyncStorage.removeItem(COUPON_STORAGE_KEY);
    } catch (error) {
      console.log("Failed to clear cart storage", error);
    }
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
      qunatity: cartItem.quantity,
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
          error?.message ||
            "Your order was saved, but items could not be added.",
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
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
