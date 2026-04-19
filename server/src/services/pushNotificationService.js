import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import api from "../lib/api.js";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

let messagingInstance = null;

const getMessagingInstance = () => {
  if (messagingInstance) return messagingInstance;
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  messagingInstance = getMessaging(app);
  return messagingInstance;
};

export const requestPushPermission = async () => {
  try {
    if (!("Notification" in window)) return { granted: false };
    if (Notification.permission === "denied") return { granted: false };

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return { granted: false };

    const messaging = getMessagingInstance();
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      ),
    });

    if (token) {
      await api.post("/user/fcm-token", { token });
      return { granted: true, token };
    }

    return { granted: false };
  } catch (err) {
    console.warn("Push permission error:", err.message);
    return { granted: false };
  }
};

export const onForegroundMessage = (callback) => {
  try {
    const messaging = getMessagingInstance();
    return onMessage(messaging, callback);
  } catch {
    return () => {};
  }
};