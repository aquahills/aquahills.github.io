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

  if (!user || !user.house) {
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

function updateLoginButton() {
  const btn = document.querySelector('nav button:last-child');
  const user = localStorage.getItem("user");

  if (!btn) return;

  if (user) {
    btn.innerText = "Logout";
    btn.onclick = () => {
      localStorage.clear();
      window.location.href = "index.html";
    };
  } else {
    btn.innerText = "Login / Register";
    btn.onclick = goLogin;
  }
}

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

window.addEventListener("load", () => {
  updateLoginButton();
  updateOrderBadge();
});
