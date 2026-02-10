let price = 0;

(async () => {
  const settings = await api("getSettings");
  price = Number(settings.price);

  const qtyInput = document.getElementById("qty");
  const totalEl = document.getElementById("total");

  totalEl.innerText = qtyInput.value * price;
})();

document.getElementById("qty").addEventListener("input", e => {
  document.getElementById("total").innerText = e.target.value * price;
});

async function confirmOrder() {
  const qty = Number(document.getElementById("qty").value);

  const res = await api("createOrder", { bottles: qty });

  if (res.error === "ADDRESS_REQUIRED") {
    window.location.href = "address.html";
    return;
  }

  alert("Order placed successfully");
  window.location.href = "orders.html";
}
