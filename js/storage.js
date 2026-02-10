function getPrice() {
  return localStorage.getItem("price") || 75;
}

function saveOrder(order) {
  let orders = JSON.parse(localStorage.getItem("orders") || "[]");
  orders.push(order);
  localStorage.setItem("orders", JSON.stringify(orders));
}

function getOrders(email) {
  let orders = JSON.parse(localStorage.getItem("orders") || "[]");
  return orders.filter(o => o.email === email);
}
