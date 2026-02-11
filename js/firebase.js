const firebaseConfig = {
  apiKey: "AIzaSyBBs9dJyBGo8Rg8i0B2TktSqfvcyGKZbr4",
  authDomain: "aquahills-3fdcc.firebaseapp.com",
  projectId: "aquahills-3fdcc",
  appId: "1:1014475952575:web:5a91df107d3a376548510a"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

function startGoogleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
    .then(async result => {

      const user = result.user;

      // Create user document if not exists
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

      window.location.href = "index.html";
    })
    .catch(err => {
      console.error(err);
      alert("Login failed.");
    });
}
