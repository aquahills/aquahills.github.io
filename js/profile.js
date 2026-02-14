document.addEventListener("DOMContentLoaded", () => {

  const messageArea = document.getElementById("messageArea");
  const saveBtn = document.getElementById("saveProfileBtn");

  const params = new URLSearchParams(window.location.search);

  if (params.get("incomplete") === "true") {
    messageArea.innerHTML = `
      <div class="card message-card">
        <h3>Almost There</h3>
        <p>Please complete your delivery details so we can process your order.</p>
      </div>
    `;
  }

  firebase.auth().onAuthStateChanged(async (user) => {

    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const doc = await db.collection("users").doc(user.uid).get();
    const data = doc.data();

    if (!data) return;

    if (data.name) document.getElementById("name").value = data.name;
    if (data.phone) document.getElementById("phone").value = data.phone;

    if (data.address) {
      document.getElementById("house").value = data.address.house || "";
      document.getElementById("street").value = data.address.street || "";
      document.getElementById("city").value = data.address.city || "";
      document.getElementById("pincode").value = data.address.pincode || "";
    }

  });

  saveBtn.addEventListener("click", saveProfile);

});


async function saveProfile() {

  const user = firebase.auth().currentUser;

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const house = document.getElementById("house").value.trim();
  const street = document.getElementById("street").value.trim();
  const city = document.getElementById("city").value.trim();
  const pincode = document.getElementById("pincode").value.trim();

  const errorDiv = document.getElementById("formError");

  if (!phone) {
    errorDiv.innerText = "Phone number is required.";
    errorDiv.style.display = "block";
    return;
  }

  errorDiv.style.display = "none";

  await db.collection("users").doc(user.uid).set({
    name: name,
    phone: phone,
    address: {
      house: house,
      street: street,
      city: city,
      pincode: pincode
    }
  }, { merge: true });

  window.location.href = "order.html";
}
