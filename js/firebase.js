const firebaseConfig = {
  apiKey: "AIzaSyBBs9dJyBGo8Rg8i0B2TktSqfvcyGKZbr4",
  authDomain: "aquahills-3fdcc.firebaseapp.com",
  projectId: "aquahills-3fdcc",
  appId: "1:1014475952575:web:5a91df107d3a376548510a"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithRedirect(provider);
}

/* 🔴 FAIL-SAFE: redirect result handler */
auth.getRedirectResult().then((result) => {
  if (result.user) {
    localStorage.setItem("user", result.user.email);
    localStorage.setItem("name", result.user.displayName || "");
    window.location.replace("/");
  }
}).catch(() => {
  // ignore
});

/* 🔴 FAIL-SAFE: auth state watcher */
auth.onAuthStateChanged((user) => {
  if (user) {
    localStorage.setItem("user", user.email);
    localStorage.setItem("name", user.displayName || "");

    // Agar login page pe ho, to home bhej do
    if (location.pathname.endsWith("/login.html")) {
      window.location.replace("/");
    }
  } else {
    localStorage.removeItem("user");
    localStorage.removeItem("name");
  }
});
