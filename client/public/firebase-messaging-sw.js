importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// These values must match your Firebase config
// Service workers cannot access import.meta.env so hardcode them here
firebase.initializeApp({
  apiKey: "AIzaSyBfRcWScxFUg1s_gtcV--rHnyzsoJWF7zE",
  authDomain: "eksathe-8dcad.firebaseapp.com",
  projectId: "eksathe-8dcad",
  messagingSenderId: "341709294314",
  appId: "1:341709294314:web:e6216b74b0b2340c4d2593",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || "EkSathe", {
    body: body || "You have received a new notification",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
  });
});