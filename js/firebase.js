const firebaseConfig = {
  apiKey: "AIzaSyBBs9dJyBGo8Rg8i0B2TktSqfvcyGKZbr4",
  authDomain: "aquahills-3fdcc.firebaseapp.com",
  projectId: "aquahills-3fdcc",
  appId: "1:1014475952575:web:5a91df107d3a376548510a"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

function startGoogleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
    .then(async result => {

      const token = await result.user.getIdToken();

      localStorage.setItem("user", result.user.email);
      localStorage.setItem("name", result.user.displayName || "");

      // AUTO SAVE USER TO SHEET
      await api("saveUser", {
        name: result.user.displayName || ""
      });

      window.location.href = "index.html";
    })
    .catch(err => {
      console.error(err);
      alert("Login failed. Check Firebase authorized domains.");
    });
}

auth.onAuthStateChanged(user => {
  if (user) {
    localStorage.setItem("user", user.email);
  } else {
    localStorage.removeItem("user");
  }
});
