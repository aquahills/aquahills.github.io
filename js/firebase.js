const firebaseConfig = {
  apiKey: "AIzaSyBBs9dJyBGo8Rg8i0B2TktSqfvcyGKZbr4",
  authDomain: "aquahills-3fdcc.firebaseapp.com",
  projectId: "aquahills-3fdcc",
  appId: "1:1014475952575:web:5a91df107d3a376548510a"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// DEBUG AUTH
auth.onAuthStateChanged((user) => {
  console.log("Auth state:", user ? user.email : "No user");
});

function startGoogleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
    .then(async (result) => {

      const user = result.user;

      const userRef = db.collection("users").doc(user.uid);
      const doc = await userRef.get();

      if (!doc.exists) {
        await userRef.set({
          email: user.email,
          name: user.displayName || "",
          phone: "",
          address: {
            house: "",
            street: "",
            city: "",
            pincode: ""
          },
          role: "customer",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }

      console.log("Login success");
      window.location.href = "index.html";
    })
    .catch(err => {
      console.error("Login error:", err);
      alert("Login failed.");
    });
}
firebase.auth().onAuthStateChanged(async (user)=>{
  if(!user) return;

  const doc = await db.collection("users").doc(user.uid).get();
  const data = doc.data();

  if(data?.guest && data?.phone){
    localStorage.setItem("guestPhone", data.phone);
  }
});
// ===== FCM SETUP =====
if ("serviceWorker" in navigator) {

  navigator.serviceWorker.register("/firebase-messaging-sw.js")
  .then((registration) => {

    const messaging = firebase.messaging();

    messaging.useServiceWorker(registration);

  })
  .catch(err => console.log("SW error", err));
}
