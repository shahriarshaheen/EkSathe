import admin from "firebase-admin";
import Notification from "../models/Notification.js";

let initialized = false;

const initFirebase = () => {
  if (initialized) return true;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("⚠️ Firebase Admin not configured — push notifications disabled");
    return false;
  }

  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      initialized = true;
      return true;
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

    initialized = true;
    console.log("✅ Firebase Admin initialized successfully");
    return true;
  } catch (err) {
    console.error("❌ Firebase Admin init failed:", err.message);
    return false;
  }
};

export const sendPush = async (userId, fcmToken, title, body, type = "general", metadata = {}) => {
  // Always save to DB
  try {
    await Notification.create({ userId, type, title, message: body, metadata });
    console.log(`📬 Notification saved to DB for user ${userId}: ${title}`);
  } catch (err) {
    console.warn("Failed to save notification to DB:", err.message);
  }

  // Send FCM push if token exists
  if (!fcmToken) {
    console.warn("No FCM token for user — skipping push");
    return;
  }

  const ready = initFirebase();
  if (!ready) {
    console.warn("Firebase not initialized — skipping push");
    return;
  }

  try {
    console.log(`📲 Sending FCM push to token: ${fcmToken.slice(0, 20)}...`);
    const result = await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(metadata).map(([k, v]) => [k, String(v)])
      ),
      webpush: {
        notification: {
          title,
          body,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
        },
      },
    });
    console.log("✅ FCM push sent successfully:", result);
  } catch (err) {
    console.error("❌ FCM push failed:", err.message, err.code);
  }
};