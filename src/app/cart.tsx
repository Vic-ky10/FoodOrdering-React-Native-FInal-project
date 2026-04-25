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
  type: "percentage" | "fixed";
  value: number;
  active: boolean;
  minimum_order_amount?: number | null;
  expires_at?: string | null;
  first_order_only?: boolean | null;
};
const formatMoney = (amount: number) => `$${amount.toFixed(2)}`;

const isCouponExpired = (coupon: Coupon) => {
  if (!coupon.expires_at) return false;

  const expiryDate = new Date(coupon.expires_at);
  if (Number.isNaN(expiryDate.getTime())) return false;

  expiryDate.setHours(23, 59, 59, 999);
  return expiryDate.getTime() < Date.now();
};
const getCouponEligibility = (
  coupon: Coupon,
  subtotal: number,
  hasPlacedOrder = false,
) => {
  if (!coupon.active) {
    return { eligible: false, reason: "This coupon is not active." };
  }
  if (isCouponExpired(coupon)) {
    return { eligible: false, reason: "This coupon has expired." };
  }
  if (coupon.first_order_only && hasPlacedOrder) {
    return {
      eligible: false,
      reason: "This coupon is only valid on your first order.",
    };
  }
  const minimumOrderAmount = coupon.minimum_order_amount ?? 0;
  if (subtotal < minimumOrderAmount) {
    return {
      eligible: false,
      reason: `Add ${formatMoney(minimumOrderAmount - subtotal)} more to use this coupon.`,
    };
  }

  return { eligible: true, reason: "" };
};

const calculateCouponDiscount = (
  coupon: Coupon | null,
  subtotal: number,
  total: number,
) => {
  if (!coupon) return 0;

  const rawDiscount =
    coupon.type === "percentage"
      ? subtotal * (coupon.value / 100)
      : coupon.value;

  return Math.min(rawDiscount, total);
};

const getClosestLockedCoupon = (
  coupons: Coupon[],
  subtotal: number,
  hasPlacedOrder: boolean,
) => {
  let closestCoupon: Coupon | null = null;
  let smallestRemainingAmount = Number.POSITIVE_INFINITY;

  coupons.forEach((coupon) => {
    if (!coupon.active) return;
    if (isCouponExpired(coupon)) return;
    if (coupon.first_order_only && hasPlacedOrder) return;

    const minimumOrderAmount = coupon.minimum_order_amount ?? 0;

    if (minimumOrderAmount <= subtotal) return;

    const remainingAmount = minimumOrderAmount - subtotal;

    if (remainingAmount < smallestRemainingAmount) {
      smallestRemainingAmount = remainingAmount;
      closestCoupon = coupon;
    }
  });

  return closestCoupon;
};

const CartScreen = () => {
  const {
    items,
    total,
    subtotal,
    deliveryFee,
    checkout,
    appliedCoupon,
    applyCoupon: applySharedCoupon,
    removeCoupon: removeSharedCoupon,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [hasPlacedOrder, setHasPlacedOrder] = useState(false);

  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [showCoupons, setShowCoupons] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const checkPreviousOrders = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("orders")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (!error) {
        setHasPlacedOrder((data?.length ?? 0) > 0);
      }
    };

    checkPreviousOrders();
  }, []);

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

  useEffect(() => {
    setCouponCode(appliedCoupon?.code ?? "");
  }, [appliedCoupon]);

  useEffect(() => {
    if (!appliedCoupon) return;

    const eligibility = getCouponEligibility(
      appliedCoupon,
      subtotal,
      hasPlacedOrder,
    );
    if (eligibility.eligible) return;

    removeSharedCoupon();
    setCouponCode("");
    Alert.alert("Coupon Removed", eligibility.reason);
  }, [appliedCoupon, subtotal, hasPlacedOrder, removeSharedCoupon]);
                           
  const appliedDiscount = useMemo<number>(() => {
    if (!appliedCoupon) return 0;
    if (
      !getCouponEligibility(appliedCoupon, subtotal, hasPlacedOrder).eligible
    ) {
      return 0;
    }
                   
    return calculateCouponDiscount(appliedCoupon, subtotal, total);
  }, [appliedCoupon, subtotal, total, hasPlacedOrder]);

  const finalTotal = Math.max(total - appliedDiscount, 0);

  const bestCoupon = useMemo<Coupon | null>(() => {
    let best: Coupon | null = null;
    let bestDiscount = 0;

    coupons.forEach((item) => {
      if (!getCouponEligibility(item, subtotal, hasPlacedOrder).eligible)
        return;

      const discount = calculateCouponDiscount(item, subtotal, total);

      if (discount > bestDiscount) {
        bestDiscount = discount;
        best = item;
      }
    });

    return best;
  }, [coupons, subtotal, total, hasPlacedOrder]);

  const bestCouponDiscount = useMemo<number>(() => {
    if (!bestCoupon) return 0;

    return calculateCouponDiscount(bestCoupon, subtotal, total);
  }, [bestCoupon, subtotal, total]);

  const lockedCoupon = useMemo<Coupon | null>(() => {
    if (appliedCoupon) return null;

    return getClosestLockedCoupon(coupons, subtotal, hasPlacedOrder);
  }, [appliedCoupon, coupons, subtotal, hasPlacedOrder]);

  const lockedCouponRemainingAmount = lockedCoupon?.minimum_order_amount
    ? lockedCoupon.minimum_order_amount - subtotal
    : 0;

  const handleApplyCoupon = (item: Coupon | null) => {
    if (!item) {
      Alert.alert("Coupon", "Coupon not available.");
      return;
    }

    const eligibility = getCouponEligibility(item, subtotal, hasPlacedOrder);
    if (!eligibility.eligible) {
      Alert.alert("Coupon Not Eligible", eligibility.reason);
      return;
    }

    applySharedCoupon(item);
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

    handleApplyCoupon(foundCoupon);
  };

  const handleRemoveCoupon = () => {
    removeSharedCoupon();
    setCouponCode("");
  };

  const renderCouponText = (item: Coupon) =>
    item.type === "percentage"
      ? `${item.value}% OFF`
      : `${formatMoney(item.value)} OFF`;

  const renderCouponMeta = (item: Coupon) => {
    const details = [];

    if (item.minimum_order_amount && item.minimum_order_amount > 0) {
      details.push(`Min order ${formatMoney(item.minimum_order_amount)}`);
    }

    if (item.expires_at) {
      details.push(`Expires ${new Date(item.expires_at).toLocaleDateString()}`);
    }

    if (item.first_order_only) {
      details.push("First order only");
    }

    return details.join(" • ");
  };

  const EmptyCart = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <FontAwesome name="shopping-cart" size={30} color={palette.primary} />
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
                <Text style={styles.summaryValue}>{formatMoney(subtotal)}</Text>
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
                    <ActivityIndicator size="small" color={palette.primary} />
                  ) : (
                    <Text style={styles.refreshText}>Refresh</Text>
                  )}
                </Pressable>
              </View>

              {appliedCoupon ? (
                <View style={styles.appliedCouponCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.appliedCouponLabel}>
                      Applied coupon
                    </Text>
                    <Text style={styles.appliedCouponCode}>
                      {appliedCoupon.code}
                    </Text>
                    <Text style={styles.appliedCouponValue}>
                      You saved {formatMoney(appliedDiscount)}
                    </Text>
                  </View>

                  <Pressable
                    onPress={handleRemoveCoupon}
                    style={styles.removeChip}
                  >
                    <Text style={styles.removeChipText}>Remove</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  {bestCoupon ? (
                    <View style={styles.bestCouponCard}>
                      <View style={styles.bestCouponBadge}>
                        <Text style={styles.bestCouponBadgeText}>
                          Best pick
                        </Text>
                      </View>
                      <Text style={styles.bestCouponCode}>
                        {bestCoupon.code}
                      </Text>
                      <Text style={styles.bestCouponText}>
                        Save {formatMoney(bestCouponDiscount)} with{" "}
                        {renderCouponText(bestCoupon)}.
                      </Text>

                      <Pressable
                        onPress={() => handleApplyCoupon(bestCoupon)}
                        style={styles.applyBestButton}
                      >
                        <Text style={styles.applyBestButtonText}>
                          Apply Best Coupon
                        </Text>
                      </Pressable>
                    </View>
                  ) : null}

                  {lockedCoupon && lockedCouponRemainingAmount > 0 ? (
                    <View style={styles.unlockCard}>
                      <Text style={styles.unlockTitle}>Almost there</Text>
                      <Text style={styles.unlockText}>
                        Add {formatMoney(lockedCouponRemainingAmount)} more to
                        unlock {lockedCoupon.code}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.codeRow}>
                    <TextInput
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChangeText={setCouponCode}
                      autoCapitalize="characters"
                      placeholderTextColor={palette.muted}
                      style={styles.codeInput}
                    />
                    <Pressable
                      onPress={applyCouponCode}
                      style={styles.codeButton}
                    >
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
        onBackButtonPress={() => setShowCoupons(false)}
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
              <ActivityIndicator size="large" color={palette.primary} />
              <Text style={styles.loadingText}>Loading coupons...</Text>
            </View>
          ) : coupons.length === 0 ? (
            <View style={styles.loadingState}>
              <Text style={styles.loadingText}>
                No active coupons right now.
              </Text>
            </View>
          ) : (
            <FlatList
              data={coupons}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingBottom: 8 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleApplyCoupon(item)}
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
                    {renderCouponMeta(item) ||
                      "Tap to apply this coupon to your cart."}
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
} ; 

const palette = {
  background: "#f4f1ff",
  surface: "#ffffff",
  surfaceWarm: "#faf8ff",
  border: "#e9e3ff",
  borderSoft: "#ede9fe",

  primary: "#7c3aed",
  primaryDark: "#5b21b6",
  primarySoft: "#f3e8ff",
  primaryMuted: "#a78bfa",

  success: "#16a34a",
  successDark: "#166534",
  successSoft: "#dcfce7",
  successBorder: "#bbf7d0",

  danger: "#dc2626",
  text: "#0069fbff",
  textStrong: "#111827",
  muted: "#6b7280",
  mutedSoft: "#f9fafb",
  dark: "#181533ff",
  darkMuted: "#ddd6fe",
  disabled: "#9ca3af",
  inverse: "#ffffff",
};


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
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
    color: palette.textStrong,
  },
  pageSubtitle: {
    fontSize: 14,
    color: palette.muted,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  summaryLabel: {
    fontSize: 12,
    color: palette.muted,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "800",
    color: palette.textStrong,
  },
  couponSection: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: palette.textStrong,
  },
  refreshButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: palette.primarySoft,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: "700",
    color: palette.primaryDark,
  },
  appliedCouponCard: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: palette.successSoft,
    borderWidth: 1,
    borderColor: palette.successBorder,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  appliedCouponLabel: {
    fontSize: 12,
    color: palette.successDark,
    marginBottom: 4,
  },
  appliedCouponCode: {
    fontSize: 20,
    fontWeight: "900",
    color: palette.successDark,
  },
  appliedCouponValue: {
    marginTop: 4,
    fontSize: 13,
    color: palette.successDark,
    fontWeight: "600",
  },
  removeChip: {
    backgroundColor: palette.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  removeChipText: {
    color: palette.successDark,
    fontWeight: "800",
    fontSize: 12,
  },
  bestCouponCard: {
    backgroundColor: palette.surfaceWarm,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 6,
  },
  bestCouponBadge: {
    alignSelf: "flex-start",
    backgroundColor: palette.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  bestCouponBadgeText: {
    color: palette.inverse,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0,
  },
  bestCouponCode: {
    fontSize: 22,
    fontWeight: "900",
    color: palette.textStrong,
    marginTop: 2,
  },
  bestCouponText: {
    fontSize: 13,
    color: palette.muted,
    lineHeight: 19,
  },
  applyBestButton: {
    marginTop: 8,
    backgroundColor: palette.primary,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  applyBestButtonText: {
    color: palette.inverse,
    fontSize: 14,
    fontWeight: "800",
  },
  codeRow: {
    flexDirection: "row",
    gap: 10,
  },
  codeInput: {
    flex: 1,
    backgroundColor: palette.mutedSoft,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: palette.textStrong,
  },
  codeButton: {
    backgroundColor: palette.dark,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  codeButtonText: {
    color: palette.inverse,
    fontSize: 14,
    fontWeight: "800",
  },
  viewCouponsButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: palette.primarySoft,
  },
  viewCouponsText: {
    color: palette.primaryDark,
    fontWeight: "700",
    fontSize: 13,
  },
  errorText: {
    color: palette.danger,
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
    backgroundColor: palette.dark,
    borderRadius: 20,
    padding: 16,
  },
  finalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  finalLabel: {
    color: palette.darkMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  finalValue: {
    color: palette.inverse,
    fontSize: 24,
    fontWeight: "900",
  },
  finalNote: {
    marginTop: 8,
    color: palette.darkMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  checkoutButton: {
    backgroundColor: palette.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  checkoutPressed: {
    opacity: 0.88,
  },
  checkoutDisabled: {
    backgroundColor: palette.disabled,
  },

  checkoutText: {
    color: palette.inverse,
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
    backgroundColor: palette.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: palette.textStrong,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: palette.muted,
    textAlign: "center",
    lineHeight: 22,
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalSheet: {
    backgroundColor: palette.surface,
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
    backgroundColor: palette.border,
    alignSelf: "center",
    marginBottom: 14,
  },
  modalHeader: {
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: palette.textStrong,
  },
  modalSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: palette.muted,
  },
  loadingState: {
    paddingVertical: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    color: palette.muted,
    fontSize: 13,
  },
  couponCard: {
    backgroundColor: palette.surfaceWarm,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    borderRadius: 16,
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
    backgroundColor: palette.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  couponBadgeText: {
    color: palette.primaryDark,
    fontSize: 11,
    fontWeight: "800",
  },
  couponSaveText: {
    flexShrink: 1,
    color: palette.textStrong,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
  },
  couponCode: {
    fontSize: 20,
    fontWeight: "900",
    color: palette.textStrong,
    letterSpacing: 0,
  },
  couponHint: {
    fontSize: 12,
    color: palette.muted,
    lineHeight: 18,
  }, 
  unlockCard: {
    backgroundColor: palette.primarySoft,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  unlockTitle: {
    color: palette.primaryDark,
    fontSize: 13,
    fontWeight: "800",
  },
  unlockText: {
    color: palette.primaryDark,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },

});

export default CartScreen;
