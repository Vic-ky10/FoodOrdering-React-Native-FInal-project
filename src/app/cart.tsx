import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import Modal from "react-native-modal";
import { FontAwesome } from "@expo/vector-icons";
import { useCart } from "@/Providers/CartProvider";
import CartListItem from "@/components/CartListItems";
import { supabase } from "@/lib/supabase";

type Coupon = {
  code: string;
  type: string;
  value: number;
  active: boolean;
};

const formatMoney = (amount: number) => `$${amount.toFixed(2)}`;

const CartScreen = () => {
  const { items, total, subtotal, deliveryFee, checkout } = useCart();

  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [showCoupons, setShowCoupons] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchCoupons = async () => {
    try {
      setLoadingCoupons(true);
      setFetchError(null);

      const { data, error } = await supabase
        .from("coupons" as any)
        .select("*")
        .eq("active", true);

      if (error) {
        setFetchError(error.message);
        return;
      }

      setCoupons((data ?? []) as unknown as Coupon[]);
    } catch {
      setFetchError("Failed to load coupons.");
    } finally {
      setLoadingCoupons(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const appliedDiscount = useMemo<number>(() => {
    if (!coupon) return 0;

    const rawDiscount =
      coupon.type === "percentage"
        ? subtotal * (coupon.value / 100)
        : coupon.value;

    return Math.min(rawDiscount, total);
  }, [coupon, subtotal, total]);

  const finalTotal = Math.max(total - appliedDiscount, 0);

  const bestCoupon = useMemo<Coupon | null>(() => {
    let best: Coupon | null = null;
    let bestDiscount = 0;

    coupons.forEach((item) => {
      const discount =
        item.type === "percentage" ? subtotal * (item.value / 100) : item.value;

      if (discount > bestDiscount) {
        bestDiscount = discount;
        best = item;
      }
    });

    return best;
  }, [coupons, subtotal]);

  const bestCouponDiscount = useMemo<number>(() => {
    if (!bestCoupon) return 0;

    const rawDiscount =
      bestCoupon.type === "percentage"
        ? subtotal * (bestCoupon.value / 100)
        : bestCoupon.value;

    return Math.min(rawDiscount, total);
  }, [bestCoupon, subtotal, total]);

  const applyCoupon = (item: Coupon | null) => {
    if (!item) {
      Alert.alert("Coupon", "Coupon not available.");
      return;
    }

    setCoupon(item);
    setCouponCode(item.code);
    setShowCoupons(false);
  };

  const applyCouponCode = () => {
    const normalizedCode = couponCode.trim().toUpperCase();

    if (!normalizedCode) {
      Alert.alert("Validation", "Enter a coupon code.");
      return;
    }

    const foundCoupon = coupons.find(
      (item) => item.code.trim().toUpperCase() === normalizedCode,
    );

    if (!foundCoupon) {
      Alert.alert("Invalid Coupon", "That coupon code was not found.");
      return;
    }

    applyCoupon(foundCoupon);
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponCode("");
  };

  const renderCouponText = (item: Coupon) =>
    item.type === "percentage"
      ? `${item.value}% OFF`
      : `${formatMoney(item.value)} OFF`;

  const EmptyCart = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <FontAwesome name="shopping-cart" size={30} color="#8b5cf6" />
      </View>
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptyText}>
        Add a few items and we’ll show your order summary, coupons, and checkout
        total here.
      </Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CartListItem cartItem={item} />}
        contentContainerStyle={[
          styles.listContent,
          items.length === 0 && styles.listContentEmpty,
        ]}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.pageTitle}>Your Cart</Text>
            <Text style={styles.pageSubtitle}>
              {items.length} item{items.length === 1 ? "" : "s"} ready for
              checkout
            </Text>

            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  {formatMoney(subtotal)}
                </Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Delivery</Text>
                <Text style={styles.summaryValue}>
                  {formatMoney(deliveryFee)}
                </Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total</Text>
                <Text style={styles.summaryValue}>{formatMoney(total)}</Text>
              </View>
            </View>

            <View style={styles.couponSection}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Coupons</Text>
                <Pressable onPress={fetchCoupons} style={styles.refreshButton}>
                  {loadingCoupons ? (
                    <ActivityIndicator size="small" color="#7c3aed" />
                  ) : (
                    <Text style={styles.refreshText}>Refresh</Text>
                  )}
                </Pressable>
              </View>

              {coupon ? (
                <View style={styles.appliedCouponCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.appliedCouponLabel}>Applied coupon</Text>
                    <Text style={styles.appliedCouponCode}>{coupon.code}</Text>
                    <Text style={styles.appliedCouponValue}>
                      You saved {formatMoney(appliedDiscount)}
                    </Text>
                  </View>

                  <Pressable onPress={removeCoupon} style={styles.removeChip}>
                    <Text style={styles.removeChipText}>Remove</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  {bestCoupon ? (
                    <View style={styles.bestCouponCard}>
                      <View style={styles.bestCouponBadge}>
                        <Text style={styles.bestCouponBadgeText}>Best pick</Text>
                      </View>
                      <Text style={styles.bestCouponCode}>
                        {bestCoupon.code}
                      </Text>
                      <Text style={styles.bestCouponText}>
                        Save {formatMoney(bestCouponDiscount)} with{" "}
                        {renderCouponText(bestCoupon)}.
                      </Text>

                      <Pressable
                        onPress={() => applyCoupon(bestCoupon)}
                        style={styles.applyBestButton}
                      >
                        <Text style={styles.applyBestButtonText}>
                          Apply Best Coupon
                        </Text>
                      </Pressable>
                    </View>
                  ) : null}

                  <View style={styles.codeRow}>
                    <TextInput
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChangeText={setCouponCode}
                      autoCapitalize="characters"
                      placeholderTextColor="#9ca3af"
                      style={styles.codeInput}
                    />
                    <Pressable onPress={applyCouponCode} style={styles.codeButton}>
                      <Text style={styles.codeButtonText}>Apply</Text>
                    </Pressable>
                  </View>

                  <Pressable
                    onPress={() => setShowCoupons(true)}
                    style={styles.viewCouponsButton}
                  >
                    <Text style={styles.viewCouponsText}>
                      View available coupons
                    </Text>
                  </Pressable>

                  {fetchError ? (
                    <Text style={styles.errorText}>{fetchError}</Text>
                  ) : null}
                </>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={EmptyCart}
        ListFooterComponent={
          <View style={styles.footer}>
            <View style={styles.finalCard}>
              <View style={styles.finalRow}>
                <Text style={styles.finalLabel}>Order total</Text>
                <Text style={styles.finalValue}>{formatMoney(finalTotal)}</Text>
              </View>
              <Text style={styles.finalNote}>
                Final amount includes delivery and any applied coupon discount.
              </Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.checkoutButton,
                items.length === 0 && styles.checkoutDisabled,
                pressed && items.length > 0 && styles.checkoutPressed,
              ]}
              disabled={items.length === 0}
              onPress={() => checkout(finalTotal)}
            >
              <Text style={styles.checkoutText}>Checkout</Text>
            </Pressable>
          </View>
        }
      />

      <Modal
        isVisible={showCoupons}
        onBackdropPress={() => setShowCoupons(false)}
        style={styles.modal}
      >
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Available Coupons</Text>
            <Text style={styles.modalSubtitle}>
              Tap a card to apply it instantly.
            </Text>
          </View>

          {loadingCoupons ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#7c3aed" />
              <Text style={styles.loadingText}>Loading coupons...</Text>
            </View>
          ) : coupons.length === 0 ? (
            <View style={styles.loadingState}>
              <Text style={styles.loadingText}>No active coupons right now.</Text>
            </View>
          ) : (
            <FlatList
              data={coupons}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingBottom: 8 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => applyCoupon(item)}
                  style={({ pressed }) => [
                    styles.couponCard,
                    pressed && styles.couponCardPressed,
                  ]}
                >
                  <View style={styles.couponCardTopRow}>
                    <View style={styles.couponBadge}>
                      <Text style={styles.couponBadgeText}>
                        {item.type === "percentage" ? "Percent" : "Fixed"}
                      </Text>
                    </View>
                    <Text style={styles.couponSaveText}>
                      Save {renderCouponText(item)}
                    </Text>
                  </View>

                  <Text style={styles.couponCode}>{item.code}</Text>
                  <Text style={styles.couponHint}>
                    Tap to apply this coupon to your cart.
                  </Text>
                </Pressable>
              )}
            />
          )}
        </View>
      </Modal>

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f4f1ff",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  header: {
    gap: 14,
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
  },
  pageSubtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e9e3ff",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  couponSection: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e9e3ff",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  refreshButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#f4efff",
  },
  refreshText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7c3aed",
  },
  appliedCouponCard: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#effaf4",
    borderWidth: 1,
    borderColor: "#ccefd8",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  appliedCouponLabel: {
    fontSize: 12,
    color: "#166534",
    marginBottom: 4,
  },
  appliedCouponCode: {
    fontSize: 20,
    fontWeight: "900",
    color: "#14532d",
  },
  appliedCouponValue: {
    marginTop: 4,
    fontSize: 13,
    color: "#166534",
    fontWeight: "600",
  },
  removeChip: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  removeChipText: {
    color: "#166534",
    fontWeight: "800",
    fontSize: 12,
  },
  bestCouponCard: {
    backgroundColor: "#f8f5ff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#dbcdfd",
    gap: 6,
  },
  bestCouponBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#7c3aed",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  bestCouponBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  bestCouponCode: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    marginTop: 2,
  },
  bestCouponText: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 19,
  },
  applyBestButton: {
    marginTop: 8,
    backgroundColor: "#7c3aed",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  applyBestButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  codeRow: {
    flexDirection: "row",
    gap: 10,
  },
  codeInput: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  codeButton: {
    backgroundColor: "#7c3aed",
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  codeButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  viewCouponsButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#f5f3ff",
  },
  viewCouponsText: {
    color: "#6d28d9",
    fontWeight: "700",
    fontSize: 13,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 12,
  },
  finalCard: {
    backgroundColor:  "#1f172dff",
    borderRadius: 22,
    padding: 16,
  },
  finalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  finalLabel: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "600",
  },
  finalValue: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
  },
  finalNote: {
    marginTop: 8,
    color: "#cbd5e1",
    fontSize: 12,
    lineHeight: 18,
  },
  checkoutButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },
  checkoutPressed: {
    opacity: 0.88,
  },
  checkoutDisabled: {
    backgroundColor: "#9ca3af",
  },
  
  checkoutText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: 80,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#efe7ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 20,
    maxHeight: "68%",
  },
  modalHandle: {
    width: 52,
    height: 5,
    borderRadius: 999,
    backgroundColor: "#d1d5db",
    alignSelf: "center",
    marginBottom: 14,
  },
  modalHeader: {
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
  },
  modalSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7280",
  },
  loadingState: {
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    color: "#6b7280",
    fontSize: 13,
  },
  couponCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 18,
    padding: 14,
    gap: 8,
  },
  couponCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  couponCardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  couponBadge: {
    backgroundColor: "#ede9fe",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  couponBadgeText: {
    color: "#6d28d9",
    fontSize: 11,
    fontWeight: "800",
  },
  couponSaveText: {
    flexShrink: 1,
    color: "#111827",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
  },
  couponCode: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: 0.6,
  },
  couponHint: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 18,
  },
});

export default CartScreen;
