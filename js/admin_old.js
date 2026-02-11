document.getElementById("price").value = getPrice();

function updatePrice() {
  localStorage.setItem("price", document.getElementById("price").value);
  alert("Price updated");
}
