import { Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { supabase } from '@/lib/supabase'

const ProfileScreen = () => {
  return (
    <View>
      <Text>profile</Text>
      <Button title='Sign Out'
      onPress={async() => supabase.auth.signOut()} />
    </View>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({})