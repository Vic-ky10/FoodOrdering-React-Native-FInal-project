import { ActivityIndicator, FlatList, Text } from "react-native";
import { Stack } from "expo-router";
import { OrderListItem } from "@/components/OrderListItem";
import { useMyOrderList } from "@/api/orders";

export default function OrdersScreen() {
  const { data: orders, isLoading, error } = useMyOrderList();

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (error) {
    return <Text>Failed to fetch orders: {error.message}</Text>;
  }

  if (!orders?.length) {
    return <Text>No orders found</Text>;
  }

  return (
    <>
      <Stack.Screen options={{ title: "Users Orders" }} />
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ gap: 10, padding: 10 }}
        renderItem={({ item }) => <OrderListItem order={item } />}
      />
    </>
  );
}
