import { Stack, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useOrderDetails, useUpdateOrder } from "@/api/orders";
import OrderItemListItem from "@/components/OrderItemListItem";
import { OrderListItem } from "@/components/OrderListItem";
import Colors from "@/constants/Colors";
import { OrderStatus, OrderStatusList } from "@assets/types";

export default function OrderDetailsScreen() {
  const { id: idParam } = useLocalSearchParams<{ id: string | string[] }>();
  const id = Number(Array.isArray(idParam) ? idParam[0] : idParam);

  const { data: order, isLoading, error } = useOrderDetails(id);
  const { mutate: updateOrder, isPending } = useUpdateOrder();

  const updateStatus = (status: OrderStatus) => {
    updateOrder({
      id,
      updateFields: { status },
    });
  };

  if (!Number.isFinite(id)) {
    return (
      <View style={styles.centered}>
        <Text>Invalid order id.</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.centered}>
        <Text>Failed to fetch order.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Order #${id}` }} />

      <FlatList
        data={order.order_items ?? []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <OrderItemListItem item={item} />}
        contentContainerStyle={styles.content}
        ListHeaderComponent={() => <OrderListItem order={order} />}
        ListFooterComponent={() => (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>

            <View style={styles.statusRow}>
              {OrderStatusList.map((status) => {
                const isActive = order.status === status;

                return (
                  <Pressable
                    key={status}
                    disabled={isPending}
                    onPress={() => updateStatus(status)}
                    style={[
                      styles.statusButton,
                      isActive && styles.activeStatusButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        isActive && styles.activeStatusText,
                      ]}
                    >
                      {status}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  container: {
    flex: 1,
    padding: 10,
  },
  content: {
    gap: 10,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontWeight: "bold",
  },
  section: {
    gap: 10,
  },
  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusButton: {
    borderColor: Colors.light.tint,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  activeStatusButton: {
    backgroundColor: Colors.light.tint,
  },
  statusText: {
    color: Colors.light.tint,
    fontWeight: "600",
  },
  activeStatusText: {
    color: "white",
  },
});
