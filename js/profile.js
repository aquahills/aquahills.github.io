async function saveProfile() {

  const user = firebase.auth().currentUser;

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const data = {
    name: document.getElementById("name").value,
    phone: document.getElementById("phone").value,
    address: {
      house: document.getElementById("house").value,
      street: document.getElementById("street").value,
      city: document.getElementById("city").value,
      pincode: document.getElementById("pincode").value
    }
  };

  if (!data.name || !data.phone || !data.address.house || !data.address.city || !data.address.pincode) {
    alert("Please complete all required fields");
    return;
  }

  await db.collection("users").doc(user.uid).update(data);

  window.location.href = "order.html";
}
