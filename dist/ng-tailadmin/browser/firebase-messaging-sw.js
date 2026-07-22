importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyA9sQMIfec0PmAk4L7UkbAIRQiBLTZ-8Bo",
  authDomain: "cavalier-2aab7.firebaseapp.com",
  projectId: "cavalier-2aab7",
  storageBucket: "cavalier-2aab7.firebasestorage.app",
  messagingSenderId: "660264911901",
  appId: "1:660264911901:web:c09e3ce900cdf12a57b2f4",
  measurementId: "G-CBJSDXD0NR",
});
// firebase.initializeApp({
//   apiKey: "AIzaSyD8ys-ve3XONsOky2FVTVOvr3S6V5vN5vg",
//   authDomain: "cavalierfron.firebaseapp.com",
//   projectId: "cavalierfron",
//   storageBucket: "cavalierfron.firebasestorage.app",
//   messagingSenderId: "169541817136",
//   appId: "1:169541817136:web:123fc1715e208cae9beef5",
//   measurementId: "G-SHEX4NESHX"
// });

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage(function (payload) {
  console.log("📥 [SW Background Message Received]:", payload);

  // 🔥 DIRECT CLIENTS TABS NOTIFICATION DISPATCH (BULLETPROOF WINDOW INJECTION)
  self.clients
    .matchAll({ includeUncontrolled: true, type: "window" })
    .then(function (clients) {
      if (clients && clients.length) {
        clients.forEach(function (client) {
          // Active port messaging to application service layer
          client.postMessage({
            type: "FCM_SERVICE_WORKER_PUSH",
            payload: payload,
          });
        });
      }
    });

  const title =
    payload.notification?.title || payload.data?.title || "Cavalier Update";
  const options = {
    body: payload.notification?.body || payload.data?.body || "",
    icon: "/favicon.ico",
    data: payload.data,
  };

  return self.registration.showNotification(title, options);
});
