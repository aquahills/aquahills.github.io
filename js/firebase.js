/* =========================
   1. GOOGLE PROJECT DETAILS
   ========================= */

const firebaseConfig = {
  apiKey: "AIzaSyBSs9dJyBGo8Rg8i0B2TktSqFvcyGKZbr4",
  authDomain: "aquahills-3fdcc.firebaseapp.com",
  projectId: "aquahills-3fdcc",
  storageBucket: "aquahills-3fdcc.firebasestorage.app",
  messagingSenderId: "1014475952575",
  appId: "1:1014475952575:web:5a91df107d3a376548510a"
};

/* =========================
   2. START GOOGLE LOGIN
   ========================= */

// Start Firebase
firebase.initializeApp(firebaseConfig);

// Get login service
const auth = firebase.auth();

// Runs when user clicks "Continue with Google"
function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
    .then(async (result) => {
      const user = result.user;

      // Remember logged-in user
      localStorage.setItem("user", user.email);

      // Save user to Google Sheet
      await api("saveUser", {
        email: user.email,
        name: user.displayName || "",
        phone: "",
        role: "customer"
      });

      // Go back to home page
      window.location.href = "../index.html";
    })
    .catch((error) => {
      alert("Login failed. Please try again.");
      console.error(error);
    });
}
