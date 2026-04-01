import { StyleSheet, Text, TextInput, View , Image} from "react-native";
import React, { useState } from "react";
import Button from "@/components/Button";
import { backupImage } from "@/components/ProductListItem";
import Colors from "@/constants/Colors";

import * as ImagePicker from "expo-image-picker"
import { Stack } from "expo-router";

const CreateProductScreen = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [errors, setErrors] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const resetFields = () => {
    (setName(""), setPrice(""));
  };

  function onCreate() {
    if (!validateInput()) {
      return;
    }
    console.log("creating product : ", name, price);

    resetFields();
  }

  const validateInput = () => {
    setErrors("");
    if (!name) {
      setErrors("Name is Required");
      return false;
    } else if (!price) {
      setErrors("Price is Required");
      return false;
    } else if (isNaN(parseFloat(price))) {
      setErrors("price is not number");
      return false;
    } else {
      return true;
    }
  };

    // Profile Image Picker
        const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
             mediaTypes : ImagePicker.MediaTypeOptions.Images,
             allowsEditing : true ,
             aspect: [4,3] ,
             quality: 1,
        });
        console.log(result);
    
        const uri = result.assets?.[0]?.uri;
        if (!result.canceled && uri) {
          setImage(uri);
        }
        }
  return (
    <View style={styles.container}>

       <Stack.Screen  options={{title : 'Create Product'}}/>        
        <Image  source ={{ uri: image ||backupImage}} style ={styles.image} />
        <Text onPress={pickImage} style={styles.textButton}> Select Image </Text>
      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        placeholder="Enter Name"
        style={styles.input}
        onChangeText={setName}
      />

      <Text style={styles.label}>Price</Text>
      <TextInput
        value={price}
        placeholder="Enter Pr ice"
        style={styles.input}
        keyboardType="numeric"
        onChangeText={setPrice}
      />
      <Text style={{ color: "red" }}>{errors}</Text>
      <Button onPress={onCreate} text="click" />
    </View>
  );
};

export default CreateProductScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 10,
  },
  input: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 20,
  },
  label: {
    color: "gray",
    fontSize: 16,
  },
  image:{
    width : '50%',
    aspectRatio: 1,
    alignSelf : 'center',

  }, 
  textButton : {
    alignSelf : 'center',
    fontWeight : 'bold',
    color: Colors.light.tint,
    marginVertical : 10, 
    
  }
});
