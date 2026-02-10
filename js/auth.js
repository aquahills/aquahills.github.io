importScripts = importScripts || function(){};

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

async function orderNow() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
    return;
  }

  const email = localStorage.getItem("user");
  const user = await api("getUser", { email });

  if (!user.house) {
    window.location.href = "address.html";
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
function updateBadge() {
  const badge = document.getElementById("orderBadge");
  if (!badge) return;

  const user = localStorage.getItem("user");
  if (!user) return;

  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const unseen = orders.filter(o =>
    o.status === "Pending" &&
    (user === ADMIN_EMAIL || o.email === user)
  ).length;

  if (unseen > 0) {
    badge.innerText = unseen;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}
updateBadge();
function updateLoginButton() {
  const btn = document.querySelector('nav button:last-child');
  const user = localStorage.getItem("user");

  if (btn && user) {
    btn.innerText = "Logout";
    btn.onclick = () => {
      localStorage.clear();
      location.reload();
    };
  }
}
updateLoginButton();
async function updateOrderBadge() {
  const badge = document.getElementById("orderBadge");
  const email = localStorage.getItem("user");

  if (!badge || !email) return;

  const res = await api("getUnseenCount", { email });

  if (res.count > 0) {
    badge.innerText = res.count;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

updateOrderBadge();
