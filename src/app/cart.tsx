import {  FlatList, StyleSheet, Text, View,} from 'react-native'
import React, { useContext } from 'react'
import { StatusBar } from 'expo-status-bar';
import { Platform} from 'react-native';
import { useCart } from '@/Providers/CartProvider';
import CartListItem from '@/components/CartListItems';

 
const CartScreen = () => {
 const { items} = useCart()

  return (
    <View>
     <FlatList  data={items} renderItem={({item}) => <CartListItem cartItem={item}  
     />  }
     contentContainerStyle={{ padding:10 ,gap:10 }}
     />

        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  )
}

export default CartScreen

