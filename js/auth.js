document.addEventListener("DOMContentLoaded", async () => {
  const email = localStorage.getItem("user");

  if (!email) return;

  try {
    const user = await api("getUser", { email });

    // Show admin button if admin
    if (user && user.role === "admin") {
      const adminBtn = document.getElementById("adminBtn");
      if (adminBtn) {
        adminBtn.style.display = "inline-block";
      }
    }

  } catch (error) {
    console.error("Auth init error:", error);
  }
});

/* =========================
   Navigation Functions
   ========================= */

function safeOrderNow() {
  const email = localStorage.getItem("user");

  if (!email) {
    window.location.href = "login.html";
    return;
  }

  window.location.href = "order.html";
}

function goOrders() {
  const email = localStorage.getItem("user");

  if (!email) {
    window.location.href = "login.html";
    return;
  }

  window.location.href = "orders.html";
}

function goAdmin() {
  const email = localStorage.getItem("user");

  if (!email) {
    window.location.href = "login.html";
    return;
  }

  window.location.href = "admin.html";
}
