importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyD8ys-ve3XONsOky2FVTVOvr3S6V5vN5vg",
  authDomain: "cavalierfron.firebaseapp.com",
  projectId: "cavalierfron",
  storageBucket: "cavalierfron.firebasestorage.app",
  messagingSenderId: "169541817136",
  appId: "1:169541817136:web:123fc1715e208cae9beef5"
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage(function(payload) {
  console.log("📥 [SW Background Message Received]:", payload);

  // Payload structure normalization (Notification OR Data fields check)
  const title = payload.notification?.title || payload.data?.title || 'Cavalier Update';
  const options = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: "/favicon.ico"
  };

  return self.registration.showNotification(title, options);
});