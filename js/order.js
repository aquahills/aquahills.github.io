let price = 75;

(async () => {
  try {
    const settings = await api("getSettings");
    price = Number(settings.price || 75);
    document.getElementById("total").innerText = price;
  } catch {
    alert("Unable to fetch price.");
  }
})();

document.getElementById("qty").addEventListener("input", e => {
  document.getElementById("total").innerText = e.target.value * price;
});

async function confirmOrder() {
  try {
    const qty = Number(document.getElementById("qty").value);
    if (!qty || qty <= 0) {
      alert("Invalid quantity");
      return;
    }

    const res = await api("createOrder", { bottles: qty });

    if (res.error === "ADDRESS_REQUIRED") {
      window.location.href = "address.html";
      return;
    }

    alert("Order placed successfully");
    window.location.href = "orders.html";
  } catch {
    alert("Order failed. Try again.");
  }
}
