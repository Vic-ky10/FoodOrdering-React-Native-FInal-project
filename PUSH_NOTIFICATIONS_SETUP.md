# Push Notifications Setup

This project now includes:

- Expo client registration for push permissions and Expo push tokens
- A `push_tokens` table in Supabase
- A Supabase Edge Function called `send-order-push`
- Order hooks that trigger push sends after order creation and status updates

## 1. Set your app identifiers

Add your real package IDs in `app.json` before building:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.foodproject"
    },
    "android": {
      "package": "com.yourcompany.foodproject"
    }
  }
}
```

## 2. Create or link your EAS project

Run:

```bash
npx eas init
```

After EAS creates the project, add the project ID to `.env`:

```env
EXPO_PUBLIC_EAS_PROJECT_ID=your-eas-project-id
```

## 3. Apply the new Supabase migration

For your local project:

```bash
npx supabase db reset
```

If you want to push the migration to a linked remote project:

```bash
npx supabase db push
```

## 4. Deploy the edge function

Run:

```bash
npx supabase functions deploy send-order-push
```

For local testing, you can also serve it locally:

```bash
npx supabase functions serve send-order-push
```

## 5. Configure Expo push credentials

Android:

```bash
npx eas credentials
```

Add your Firebase Cloud Messaging V1 credentials for Android.

iOS:

Use EAS credentials to create or upload your APNs key. A paid Apple Developer account is required.

## 6. Build a development app

Push notifications must be tested on a physical device.

Android:

```bash
npx eas build --profile development --platform android
```

iOS:

```bash
npx eas build --profile development --platform ios
```

## 7. Test the flow

1. Install the development build on a physical device.
2. Sign in as a customer and allow notification permission.
3. Sign in as an admin on another physical device and allow notification permission.
4. Create an order from the customer device.
5. Confirm the admin device receives a new-order push notification.
6. Change the order status from the admin device.
7. Confirm the customer device receives the status update push notification.

## Notes

- Expo push tokens are saved in `public.push_tokens`.
- The app only registers push tokens for signed-in users.
- Logging out removes the current device token from Supabase.
- Existing TypeScript errors outside the push notification files still need to be cleaned up separately.
