import { createClient } from "npm:@supabase/supabase-js@2";

type OrderRow = {
  id: number;
  status: string;
  total: number;
  user_id: string | null;
};

type PushTokenRow = {
  expo_push_token: string;
};

type PushEventPayload = {
  eventType: "order_created" | "order_status_changed";
  orderId: number;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const getUserClient = (authorization: string) =>
  createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authorization,
      },
    },
  });

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

function buildNotificationContent({
  eventType,
  order,
}: {
  eventType: PushEventPayload["eventType"];
  order: OrderRow;
}) {
  if (eventType === "order_created") {
    return {
      title: `New order #${order.id}`,
      body: `A new order worth Rs ${order.total.toFixed(2)} was placed.`,
    };
  }

  return {
    title: `Order #${order.id} updated`,
    body: `Your order is now ${order.status}.`,
  };
}

async function getCallerProfileGroup(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("group")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return data.group;
}

async function getOrder(orderId: number) {
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id, status, total, user_id")
    .eq("id", orderId)
    .single<OrderRow>();

  if (error) {
    throw error;
  }

  return data;
}

async function getAdminProfileIds() {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("group", "ADMIN");

  if (error) {
    throw error;
  }

  return data.map((profile) => profile.id);
}

async function getPushTokens(profileIds: string[]) {
  if (!profileIds.length) {
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("push_tokens")
    .select("expo_push_token")
    .in("profile_id", profileIds)
    .returns<PushTokenRow[]>();

  if (error) {
    throw error;
  }

  return data
    .map((row) => row.expo_push_token)
    .filter((token) => token.startsWith("ExponentPushToken["));
}

async function deleteInvalidTokens(tokens: string[]) {
  if (!tokens.length) {
    return;
  }

  const { error } = await supabaseAdmin
    .from("push_tokens")
    .delete()
    .in("expo_push_token", tokens);

  if (error) {
    console.error("Failed to delete invalid push tokens.", error);
  }
}

async function sendExpoPushMessages({
  tokens,
  title,
  body,
  orderId,
  status,
}: {
  tokens: string[];
  title: string;
  body: string;
  orderId: number;
  status: string;
}) {
  if (!tokens.length) {
    return { sentCount: 0, invalidTokens: [] as string[] };
  }

  const messages = tokens.map((token) => ({
    to: token,
    sound: "default",
    channelId: "orders",
    priority: "high",
    title,
    body,
    data: {
      orderId,
      status,
    },
  }));

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messages),
  });

  const responseBody = await response.json();

  if (!response.ok) {
    throw new Error(
      `Expo push request failed with status ${response.status}: ${JSON.stringify(responseBody)}`
    );
  }

  const invalidTokens = Array.isArray(responseBody?.data)
    ? responseBody.data
        .map((ticket: { status?: string; details?: { error?: string } }, index: number) =>
          ticket?.status === "error" && ticket?.details?.error === "DeviceNotRegistered"
            ? tokens[index]
            : null
        )
        .filter(Boolean)
    : [];

  return {
    sentCount: messages.length,
    invalidTokens,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed." }), {
      status: 405,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const authorization = req.headers.get("Authorization");

    if (!authorization) {
      return new Response(JSON.stringify({ error: "Missing authorization header." }), {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const payload = (await req.json()) as PushEventPayload;

    if (!payload?.eventType || !Number.isFinite(payload?.orderId)) {
      return new Response(JSON.stringify({ error: "Invalid payload." }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const userClient = getUserClient(authorization);
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized." }), {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const callerGroup = await getCallerProfileGroup(user.id);
    const order = await getOrder(payload.orderId);

    let recipientProfileIds: string[] = [];

    if (payload.eventType === "order_created") {
      if (order.user_id !== user.id && callerGroup !== "ADMIN") {
        return new Response(JSON.stringify({ error: "Forbidden." }), {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        });
      }

      recipientProfileIds = await getAdminProfileIds();
    } else {
      if (callerGroup !== "ADMIN") {
        return new Response(JSON.stringify({ error: "Only admins can send status updates." }), {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        });
      }

      recipientProfileIds = order.user_id ? [order.user_id] : [];
    }

    const tokens = await getPushTokens(recipientProfileIds);
    const notificationContent = buildNotificationContent({
      eventType: payload.eventType,
      order,
    });

    const { sentCount, invalidTokens } = await sendExpoPushMessages({
      tokens,
      title: notificationContent.title,
      body: notificationContent.body,
      orderId: order.id,
      status: order.status,
    });

    await deleteInvalidTokens(invalidTokens);

    return new Response(
      JSON.stringify({
        ok: true,
        sentCount,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unexpected error.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
