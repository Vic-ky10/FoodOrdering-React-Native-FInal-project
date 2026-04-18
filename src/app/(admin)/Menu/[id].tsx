import React from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack, Link, useLocalSearchParams, useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";

import Colors from "@/constants/Colors";
import { useDeleteProuducts, useProduct } from "@/api/products";
import RemoteImage from "@/components/RemoteImage";
import { backupImage } from "@/components/ProductListItem";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const ProductDetailsScreen = () => {
  const router = useRouter();
  const { id: idString } = useLocalSearchParams();
  const id = Number(Array.isArray(idString) ? idString[0] : idString);

  const { data: product, error, isLoading } = useProduct(id);
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProuducts();

  const confirmDelete = () => {
    if (!product) {
      return;
    }

    Alert.alert(
      "Delete product",
      `Remove ${product.name} from the menu? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteProduct(id, {
              onSuccess: () => router.replace("/(admin)/Menu"),
            }),
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.helperText}>Loading product details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundTitle}>Could not load product</Text>
        <Text style={styles.notFoundText}>
          {error.message || "Something went wrong while fetching the item."}
        </Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundTitle}>Product not found</Text>
        <Text style={styles.notFoundText}>
          We could not find the menu item you selected.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: product.name,
          headerRight: () => (
            <View style={styles.headerActions}>
              <Link href={`/(admin)/Menu/create?id=${product.id}`} asChild>
                <Pressable style={styles.headerActionButton}>
                  {({ pressed }) => (
                    <FontAwesome
                      name="pencil"
                      size={20}
                      color={Colors.light.tint}
                      style={{ opacity: pressed ? 0.55 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
              <Pressable
                onPress={confirmDelete}
                style={({ pressed }) => [
                  styles.headerActionButton,
                  isDeleting && styles.disabledButton,
                  pressed && !isDeleting && styles.pressedButton,
                ]}
                disabled={isDeleting}
              >
                <FontAwesome name="trash" size={20} color="#c0392b" />
              </Pressable>
            </View>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <RemoteImage
            path={product.image}
            fallback={backupImage}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Product #{product.id}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.titleRow}>
            <View style={styles.titleGroup}>
              <Text style={styles.label}>Menu item</Text>
              <Text style={styles.title}>{product.name}</Text>
            </View>
            <View style={styles.pricePill}>
              <Text style={styles.priceText}>{formatCurrency(product.price)}</Text>
            </View>
          </View>

          <Text style={styles.description}>
            A clean product snapshot for admins. Review the current image, price,
            and metadata before editing or deleting this menu item.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick facts</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>ID</Text>
              <Text style={styles.statValue}>{product.id}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Price</Text>
              <Text style={styles.statValue}>{formatCurrency(product.price)}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Image</Text>
              <Text style={styles.statValue}>
                {product.image ? "Linked" : "Missing"}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Created</Text>
              <Text style={styles.statValue}>
                {formatDate(product.created_at)}
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <Link href={`/(admin)/Menu/create?id=${product.id}`} asChild>
          <Pressable style={styles.primaryButton}>
            {({ pressed }) => (
              <Text style={[styles.primaryButtonText, pressed && styles.pressedText]}>
                Edit product
              </Text>
            )}
          </Pressable>
        </Link>

        <Pressable
          onPress={confirmDelete}
          style={({ pressed }) => [
            styles.secondaryButton,
            isDeleting && styles.disabledButton,
            pressed && !isDeleting && styles.pressedButton,
          ]}
          disabled={isDeleting}
        >
          <Text style={styles.secondaryButtonText}>
            {isDeleting ? "Deleting..." : "Delete product"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ProductDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  heroCard: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 300,
    backgroundColor: "#fff",
  },
  badge: {
    position: "absolute",
    left: 16,
    top: 16,
    backgroundColor: "rgba(0,0,0,0.72)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#f1e2d9",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  titleGroup: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#b55d27",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1f1f1f",
    lineHeight: 34,
  },
  pricePill: {
    backgroundColor: "#ffe2cc",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  priceText: {
    color: "#b34700",
    fontWeight: "800",
    fontSize: 16,
  },
  description: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 22,
    color: "#5f5f5f",
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1f1f1f",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#f1e2d9",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8f8f8f",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f1f1f",
    lineHeight: 20,
  },
  noteCard: {
    backgroundColor: "#fff1e8",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f2d7c8",
  },
  noteText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#6a4b38",
  },
  footer: {
    padding: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0e2d7",
    backgroundColor: "#ffffff",
    gap: 10,
  },
  primaryButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    backgroundColor: "#fff2f0",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f3c0b9",
  },
  secondaryButtonText: {
    color: "#c0392b",
    fontSize: 16,
    fontWeight: "800",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 4,
  },
  headerActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  pressedButton: {
    opacity: 0.6,
  },
  pressedText: {
    opacity: 0.85,
  },
  disabledButton: {
    opacity: 0.5,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff8f2",
  },
  helperText: {
    marginTop: 12,
    fontSize: 15,
    color: "#666",
  },
  notFoundTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
    color: "#1f1f1f",
  },
  notFoundText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
});
