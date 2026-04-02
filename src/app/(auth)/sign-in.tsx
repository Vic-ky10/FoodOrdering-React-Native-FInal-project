import { StyleSheet, Text, View, TextInput } from "react-native";
import React, { useState } from "react";
import Button from "@/components/Button";
import { Link } from "expo-router";

const SignInScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(" ");

  const onSignIn = () => {
    console.log("Sign In", { email, password });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>sign-in</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="password"
        value="{password}"
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <Button text="Signup" style={styles.link} onPress={onSignIn} />

      <Link href="/sign-up" style={styles.link}>
        Don't have an account ? Sign Up
      </Link>
    </View>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({ 
    container : {
        flex : 1,
        justifyContent :'center',
        padding : 20 ,
        backgroundColor : '#fff',

    },
    title : {
        fontSize : 28,
        fontWeight: 'bold',
        marginBottom : 20 ,
        textAlign : 'center'
    },
    input : {
        borderWidth : 1,
        borderColor : '#ccc',
        borderRadius : 10 ,
        padding : 14 ,
        marginBottom : 12 ,

    },

    link : {
        marginTop : 15 ,
        textAlign : 'center',
        color : '#007AFF'
    }

});
