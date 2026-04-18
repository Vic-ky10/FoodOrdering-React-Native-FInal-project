import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Image,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    const currentUser = data.user;

    setUser(currentUser);
    setUsername(currentUser?.user_metadata?.username || "");
    setAvatar(currentUser?.user_metadata?.avatar_url || null);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const updateProfile = async () => {
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      data: {
        username: username,
        avatar_url: avatar,
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert("Update Failed", error.message);
    } else {
      Alert.alert("Success", "Profile updated successfully");
      loadProfile(); // refresh profile
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/sign-in");
  };

  const deleteAccount = async () => {
    Alert.alert("Delete Account", "Are you sure you want to delete your account?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.rpc("delete_user");

          if (error) {
            Alert.alert("Error", error.message);
          } else {
            router.replace("/sign-in");
          }
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
   <View style={styles.container}>
  <Text style={styles.title}>My Profile</Text>

  <TouchableOpacity style={styles.profileHeader} onPress={pickImage}>
    <Image
      source={{
        uri:
          avatar ||
          "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      }}
      style={styles.avatar}
    />

    <Text style={styles.changePhoto}>Change Photo</Text>

    <View style={styles.usernameContainer}>
      <Text style={styles.label}>Username</Text>
      <Text style={styles.username}>{username}</Text>
    </View>
  </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.email}>{user.email}</Text>

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
        />

        <Button
          title={loading ? "Saving..." : "Save Profile"}
          onPress={updateProfile}
        />
      </View>

      <View style={styles.actions}>
        <Button title="Sign Out" color="orange" onPress={signOut} />
      
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 20,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
  },

  changePhoto: {
    textAlign: "center",
    marginTop: 6,
    color: "#007AFF",
  },

  card: {
    backgroundColor: "#f5f5f5",
    padding: 20,
    borderRadius: 12,
    gap: 10,
  },

  label: {
    fontWeight: "600",
  },

  email: {
    fontSize: 16,
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
  },

  actions: {
    gap: 10,
  },
  profileHeader: {
  alignItems: "center",
  gap: 10,
},

usernameContainer: {
  marginTop: 10,
  alignItems: "center",
  backgroundColor: "#f2f2f2",
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 10,
},

username: {
  fontSize: 18,
  fontWeight: "600",
  color: "#333",
},

label: {
  fontSize: 13,
  color: "#888",
  marginBottom: 2,
},
});