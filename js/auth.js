const ADMIN_EMAIL = "aquahillsbeverages@gmail.com";

function login() {
  const email = document.getElementById("email").value;
  localStorage.setItem("user", email);
  if (email === ADMIN_EMAIL) {
    window.location.href = "admin.html";
  } else {
    window.location.href = "index.html";
  }
}

function isLoggedIn() {
  return localStorage.getItem("user");
}

function orderNow() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
  } else {
    window.location.href = "order.html";
  }
}

function goLogin() {
  window.location.href = "login.html";
}

function goOrders() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
  } else {
    window.location.href = "orders.html";
  }
}
