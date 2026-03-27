import React from 'react';
import { SymbolView } from 'expo-symbols';
import { Link, Tabs } from 'expo-router';
import { Platform, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../components/useColorScheme';
import { useClientOnlyValue } from '../../components/useClientOnlyValue';


function TabBarIcon(props : {
  name :React.ComponentProps<typeof FontAwesome> ["name"];
  color:string;

}) {
  return <FontAwesome  size={20} style = {{ marginBottom :-3 }} {...props}/>
}


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>

        <Tabs.Screen name='index'  options={{href:null}}  />
      <Tabs.Screen
        name="Menu"
        options={{
          title: 'Menu',
          headerShown : false, 
          tabBarIcon: ({ color }) => (
            <TabBarIcon  
              name='cutlery'
              color={color}
            />
          ),
          headerRight: () => (
            <Link href="../modal" asChild>
              <Pressable style={{ marginRight: 15 }}>
                {({ pressed }) => (
                  <SymbolView
                    name={{ ios: 'info.circle', android: 'info', web: 'info' }}
                    size={25}
                    tintColor={Colors[colorScheme].text}
                    style={{ opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => (
           <TabBarIcon 
              name='list'
              color={color}
           />
          ),
        }}
      />
    </Tabs>
  );
}
