import { Stack, useLocalSearchParams } from 'expo-router';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { OrderListItem } from '@/components/OrderListItem';
import OrderItemListItem from '@/components/OrderItemListItem';
import { useOrderDetails } from '@/api/orders';
import { useUpdateOrderSubscription } from '@/api/orders/subscriptions';

dayjs.extend(relativeTime);

export default function OrderDetailsScreen() {
  const { id: idString } = useLocalSearchParams<{ id: string }>();
  const id = parseFloat(typeof idString === "string" ? idString : idString[0])
   const { data : order , isLoading , error} =  useOrderDetails(id)
    useUpdateOrderSubscription(id)

   if(isLoading){
    return <ActivityIndicator />
   }
   if(error){
    return <Text> Failed to fetch</Text>
   }

  if (!order) {

    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Order not found.</Text>
      </View>
    );
  }

  return (
     <View style ={{ padding: 10 , gap: 20  }}> 
      <Stack.Screen options={{title : `Order #${id}`}} />
      <OrderListItem  order={order} />

    <FlatList  
    data={order.order_items}
    renderItem={({item}) => <OrderItemListItem  item={item}/>}
    contentContainerStyle={{ gap : 10 }}
    ListHeaderComponent={() => <OrderListItem order={order}/>}
    />
     </View>
   
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
  },
  metaText: {
    color: '#6b7280',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemPrice: {
    fontWeight: '600',
  },
});
