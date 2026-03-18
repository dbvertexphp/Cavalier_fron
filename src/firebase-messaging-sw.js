importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD8ys-ve3XONsOky2FVTVOvr3S6V5vN5vg",
  authDomain: "cavalierfron.firebaseapp.com",
  projectId: "cavalierfron",
  storageBucket: "cavalierfron.firebasestorage.app",
  messagingSenderId: "169541817136",
  appId: "1:169541817136:web:123fc1715e208cae9beef5",
  measurementId: "G-SHEX4NESHX"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Background message1212:', payload);

  const title = payload.notification?.title || 'New Notification';
  const options = {
    body: payload.notification?.body || '',
    icon: '/favicon.ico'
  };

  self.registration.showNotification(title, options);
});