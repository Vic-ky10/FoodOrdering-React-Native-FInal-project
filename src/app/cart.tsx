import {  FlatList, StyleSheet, Text, View,} from 'react-native'
import React, { useContext } from 'react'
import { StatusBar } from 'expo-status-bar';
import { Platform} from 'react-native';
import { useCart } from '@/Providers/CartProvider';
import CartListItem from '@/components/CartListItems';
import Button from '@/components/Button';

 
const CartScreen = () => {
 const { items , total} = useCart()

  return (
    <View>
     <FlatList  data={items} renderItem={({item}) => <CartListItem cartItem={item}  
     />  }
     contentContainerStyle={{ padding:10 ,gap:10 }}
     />
     <Text style={{ marginTop : 20 ,marginBottom : 10,  fontSize : 20, fontWeight : '500'}}>Total : ${total}</Text>
     <Button  text='checkout'/>

        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  )
}

export default CartScreen

