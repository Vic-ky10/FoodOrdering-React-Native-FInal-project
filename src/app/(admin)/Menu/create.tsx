import { StyleSheet, Text, TextInput, View, Image, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import Button from "@/components/Button";
import { backupImage } from "@/components/ProductListItem";
import Colors from "@/constants/Colors";

import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  useDeleteProuducts,
  useInsertProduct,
  useProduct,
  useUpdateProduct,
} from "@/api/products";

const CreateProductScreen = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [errors, setErrors] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const { id: idString } = useLocalSearchParams();

  const id = parseFloat(
    typeof idString === "string" ? idString : idString?.[0],
  );

  const isUpdating = !!id;
  const router = useRouter();

  const { mutate: insertProduct } = useInsertProduct();
  const { mutate: updateProduct } = useUpdateProduct();
  const { data: updatingProduct } = useProduct(id);
  const { mutate: deleteProducts } = useDeleteProuducts();

  useEffect(() => {
    if (updatingProduct) {
      setName(updatingProduct.name);
      setPrice(updatingProduct.price.toString());
      setImage(updatingProduct.image);
    }
  }, [updatingProduct]);

  const resetFields = () => {
    (setName(""), setPrice(""));
  };

  const onSubmit = () => {
    if (isUpdating) {
      // update
      onUpdate();
    } else {
      onCreate();
    }
  };

  function onUpdate() {
    if (!validateInput()) {
      return;
    }
    updateProduct(
      { id, name, price: parseFloat(price), image },
      {
        onSuccess: () => {
          resetFields();
          router.back();
        },
      },
    );

    Alert.alert("Updating product :  ", name);
  }

  function onCreate() {
    if (!validateInput()) {
      return;
    }
    Alert.alert("Creating  product :", name);

    // save in the database
    insertProduct(
      { name, price: parseFloat(price), image },
      {
        onSuccess: () => {
          resetFields();
          router.back();
        },
      },
    );
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    console.log(result);

    const uri = result.assets?.[0]?.uri;
    if (!result.canceled && uri) {
      setImage(uri);
    }
  };
 

  // for delete a products
  const onDelete = () => {
    Alert.alert("Delete!!!");
    deleteProducts(id, {
      onSuccess: () => {
        resetFields();
        router.replace("/(admin)");
      },
    });
  };
  const confirmDelete = () => {
    Alert.alert("Cofirm", "Are you sure you want to delete this products", [
      {
        text: "Cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: onDelete,
      },
    ]);
  };
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ title: isUpdating ? "Update Product" : "Create Product" }}
      />
      <Image source={{ uri: image || backupImage }} style={styles.image} />
      <Text onPress={pickImage} style={styles.textButton}>
        {" "}
        Select Image{" "}
      </Text>
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
        placeholder="Enter Price"
        style={styles.input}
        keyboardType="numeric"
        onChangeText={setPrice}
      />
      <Text style={{ color: "red" }}>{errors}</Text>
      <Button onPress={onSubmit} text={isUpdating ? "Update" : "Create"} />

      {isUpdating && (
        <Text onPress={confirmDelete} style={styles.textButton}>
          Delete
        </Text>
      )}
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
  image: {
    width: "50%",
    aspectRatio: 1,
    alignSelf: "center",
  },
  textButton: {
    alignSelf: "center",
    fontWeight: "bold",
    color: Colors.light.tint,
    marginVertical: 10,
  },
});
