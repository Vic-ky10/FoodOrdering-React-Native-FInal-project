import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { supabase } from "../../lib/supabase";

type CouponType = "percentage" | "fixed";

export default function Coupons() {
  const [code, setCode] = useState("");
  const [value, setValue] = useState("");
  const [couponType, setCouponType] = useState<CouponType>("percentage");
  const [loading, setLoading] = useState(false);

  const normalizedCode = code.trim().toUpperCase();
  const numericValue = Number(value);

  const previewText = useMemo( () => {
    if(!normalizedCode) return "Coupon Code";
    return normalizedCode;
  },[normalizedCode])

  const valuePreview = useMemo(() => {
    if (!value.trim() || Number.isNaN(numericValue) || numericValue <= 0) {
      return couponType === "percentage" ? "0% OFF" : "$0.00 OFF";
    }

    if (couponType === "percentage") {
      return `${numericValue}% OFF`;
    }

    return `$${numericValue.toFixed(2)} OFF`;
  }, [couponType, numericValue, value]);

  const createCoupon = async () => {
    if (!normalizedCode) {
      Alert.alert("Validation", "Coupon code is required.");
      return;
    }

    if (!value.trim() || Number.isNaN(numericValue) || numericValue <= 0) {
      Alert.alert("Validation", "Enter a valid discount value.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.from("coupons" as any).insert([
        {
          code: normalizedCode,
          type: couponType,
          value: numericValue,
          active: true,
        },
      ]);

      if (error) {
        Alert.alert("Error", error.message || "Failed to create coupon.");
        return;
      }

      Alert.alert("Success", "Coupon created successfully.");
      setCode("");
      setValue("");
      setCouponType("percentage");
    } catch {
      Alert.alert("Error", "Something went wrong while creating the coupon.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.pageTitle}>Create Coupon</Text>
      <Text style={styles.pageSubtitle}>
        Build promo codes that feel polished and easy to use in the cart.
      </Text>

      <View style={styles.previewCard}>
        <View style={styles.previewBadge}>
          <Text style={styles.previewBadgeText}>
            {couponType === "percentage" ? "Percent" : "Fixed"}
          </Text>
        </View>
        <Text style={styles.previewCode}>{previewText}</Text>
        <Text style={styles.previewValue}>{valuePreview}</Text>
        <Text style={styles.previewHint}>
          This is how the coupon will look to customers inside the cart sheet.
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Coupon Code</Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          placeholder="e.g. SAVE20"
          autoCapitalize="characters"
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.label}>Coupon Type</Text>
        <View style={styles.segmentRow}>
          <Pressable
            onPress={() => setCouponType("percentage")}
            style={({ pressed }) => [
              styles.segmentButton,
              couponType === "percentage" && styles.segmentButtonActive,
              pressed && styles.segmentPressed,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                couponType === "percentage" && styles.segmentTextActive,
              ]}
            >
              Percentage
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setCouponType("fixed")}
            style={({ pressed }) => [
              styles.segmentButton,
              couponType === "fixed" && styles.segmentButtonActive,
              pressed && styles.segmentPressed,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                couponType === "fixed" && styles.segmentTextActive,
              ]}
            >
              Fixed amount
            </Text>
          </Pressable>
        </View>

        <Text style={styles.label}>
          {couponType === "percentage" ? "Discount Value (%)" : "Discount Value ($)"}
        </Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder={couponType === "percentage" ? "e.g. 20" : "e.g. 50"}
          keyboardType="numeric"
          placeholderTextColor="#9ca3af"
        />

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && !loading ? styles.buttonPressed : null,
            loading ? styles.buttonDisabled : null,
          ]}
          onPress={createCoupon}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Create Coupon</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f1ff",
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#111827",
  },
  pageSubtitle: {
    marginTop: 8,
    marginBottom: 18,
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 21,
  },
  previewCard: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
  },
  previewBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#7c3aed",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  previewBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  previewCode: {
    marginTop: 12,
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 1,
  },
  previewValue: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "800",
    color: "#d8b4fe",
  },
  previewHint: {
    marginTop: 10,
    fontSize: 13,
    color: "#cbd5e1",
    lineHeight: 19,
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e9e3ff",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  segmentRow: {
    flexDirection: "row",
    gap: 10,
  },
  segmentButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  segmentButtonActive: {
    backgroundColor: "#f5f3ff",
    borderColor: "#c4b5fd",
  },
  segmentPressed: {
    opacity: 0.9,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4b5563",
  },
  segmentTextActive: {
    color: "#6d28d9",
  },
  button: {
    marginTop: 22,
    backgroundColor: "#111827",
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.86,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
