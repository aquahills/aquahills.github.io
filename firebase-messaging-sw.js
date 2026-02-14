importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBBs9dJyBGo8Rg8i0B2TktSqfvcyGKZbr4",
  authDomain: "aquahills-3fdcc.firebaseapp.com",
  projectId: "aquahills-3fdcc",
  appId: "1:1014475952575:web:5a91df107d3a376548510a"
});

const messaging = firebase.messaging();

// Background push
messaging.onBackgroundMessage(function(payload) {

  const notificationTitle = payload.notification?.title || "New Order Received";
  const notificationOptions = {
    body: payload.notification?.body || "A new order needs assignment",
    icon: "/assets/logo.png",
    badge: "/assets/logo.png",
    requireInteraction: true,
    data: {
      url: "/admin.html"
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Click handling
self.addEventListener("notificationclick", function(event) {

  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );

});
