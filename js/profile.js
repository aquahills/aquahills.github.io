async function saveProfile() {
  const email = localStorage.getItem("user");
  if (!email) {
    window.location.href = "login.html";
    return;
  }

  const data = {
    email,
    name: document.getElementById("name").value,
    phone: document.getElementById("phone").value,
    house: document.getElementById("house").value,
    street: document.getElementById("street").value,
    city: document.getElementById("city").value,
    pincode: document.getElementById("pincode").value
  };

  if (!data.name || !data.phone || !data.house || !data.city || !data.pincode) {
    alert("Please complete all required fields");
    return;
  }

  await api("saveUser", data);
  window.location.href = "order.html";
}
