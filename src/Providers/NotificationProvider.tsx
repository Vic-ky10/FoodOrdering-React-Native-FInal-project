import { PropsWithChildren, useEffect, useRef } from "react";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { useAuth } from "@/Providers/AuthProvider";
import { supabase } from "@/lib/supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const getProjectId = () => {
  const easProjectId =
    Constants.easConfig?.projectId ??
    Constants.expoConfig?.extra?.eas?.projectId ??
    process.env.EXPO_PUBLIC_EAS_PROJECT_ID;

  return typeof easProjectId === "string" && easProjectId.trim()
    ? easProjectId.trim()
    : null;
};

async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("orders", {
      name: "Order updates",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2563eb",
    });
  }

  if (!Device.isDevice) {
    console.log("Push notifications require a physical device.");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push notifications permission was not granted.");
    return null;
  }

  const projectId = getProjectId();

  if (!projectId) {
    console.warn(
      "Expo push notifications need an EAS project ID. Add EXPO_PUBLIC_EAS_PROJECT_ID to your .env or build with EAS."
    );
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
}

async function upsertPushToken({
  profileId,
  expoPushToken,
}: {
  profileId: string;
  expoPushToken: string;
}) {
  const { error } = await supabase.from("push_tokens").upsert(
    {
      profile_id: profileId,
      expo_push_token: expoPushToken,
      platform: Platform.OS,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "expo_push_token" }
  );

  if (error) {
    throw error;
  }
}

async function deletePushToken(expoPushToken: string) {
  const { error } = await supabase
    .from("push_tokens")
    .delete()
    .eq("expo_push_token", expoPushToken);

  if (error) {
    throw error;
  }
}

export default function NotificationProvider({
  children,
}: PropsWithChildren) {
  const { session } = useAuth();
  const pushTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!session?.user.id) {
      return;
    }

    let cancelled = false;

    const syncPushToken = async () => {
      try {
        const expoPushToken = await registerForPushNotificationsAsync();

        if (!expoPushToken || cancelled) {
          return;
        }

        pushTokenRef.current = expoPushToken;

        await upsertPushToken({
          profileId: session.user.id,
          expoPushToken,
        });
      } catch (error) {
        console.error("Failed to register the device for push notifications.", error);
      }
    };

    void syncPushToken();

    return () => {
      cancelled = true;
    };
  }, [session?.user.id]);

  useEffect(() => {
    if (session?.user.id || !pushTokenRef.current) {
      return;
    }

    const tokenToDelete = pushTokenRef.current;
    pushTokenRef.current = null;

    void deletePushToken(tokenToDelete).catch((error) => {
      console.error("Failed to remove the device push token.", error);
    });
  }, [session?.user.id]);

  return children;
}
