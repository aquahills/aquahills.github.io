const firebaseConfig = {
  apiKey: "AIzaSyBBs9dJyBGo8Rg8i0B2TktSqfvcyGKZbr4",
  authDomain: "aquahills-3fdcc.firebaseapp.com",
  projectId: "aquahills-3fdcc",
  appId: "1:1014475952575:web:5a91df107d3a376548510a"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

/* Called when user clicks "Continue with Google" */
function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithRedirect(provider);
}

/* Handle redirect result ONCE after login */
auth.getRedirectResult().catch((error) => {
  console.error("Redirect login error:", error);
});

/* Keep UI + localStorage in sync */
auth.onAuthStateChanged((user) => {
  if (user) {
    localStorage.setItem("user", user.email);
    localStorage.setItem("name", user.displayName || "");

    if (window.location.pathname.includes("login.html")) {
      window.location.href = "/";
    }

  } else {
    localStorage.removeItem("user");
    localStorage.removeItem("name");
  }
});
