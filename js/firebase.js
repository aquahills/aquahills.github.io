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

  auth.signInWithPopup(provider)
    .then(async (result) => {
      const user = result.user;

      localStorage.setItem("user", user.email);

      await api("saveUser", {
        email: user.email,
        name: user.displayName || "",
        phone: "",
        role: "customer"
      });

      window.location.href = "/home/";
    })
    .catch((error) => {
      alert("Login failed. Please try again.");
      console.error(error);
    });
}
