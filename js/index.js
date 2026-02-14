document.addEventListener("DOMContentLoaded", () => {

  const loginBtn = document.getElementById("loginNavBtn");
  const mainActionBtn = document.getElementById("mainActionBtn");
  const ordersBtn = document.getElementById("ordersBtn");
  const homeBtn = document.getElementById("homeNavBtn");

  firebase.auth().onAuthStateChanged(async (user) => {

    homeBtn.style.display = "none";

    if (user) {

      loginBtn.textContent = "Logout";
      loginBtn.onclick = () => firebase.auth().signOut().then(() => location.reload());

      const userDoc = await db.collection("users").doc(user.uid).get();

      if (!userDoc.exists) return;

      const role = (userDoc.data().role || "customer").toLowerCase();

      if (role === "admin") {

        mainActionBtn.textContent = "Admin Controls";
        mainActionBtn.onclick = () => location.href = "admin.html";

        ordersBtn.style.display = "none";

      } else if (role === "delivery") {

        mainActionBtn.textContent = "Assigned Orders";
        mainActionBtn.onclick = () => loadAssignedOrders(user.uid);

        ordersBtn.style.display = "none";

      } else {

        mainActionBtn.textContent = "Order Now";
        mainActionBtn.onclick = () => location.href = "order.html";

        ordersBtn.onclick = () => location.href = "orders.html";
      }

    } else {

      loginBtn.textContent = "Login";
      loginBtn.onclick = () => location.href = "login.html";

      mainActionBtn.textContent = "Order Now";
      mainActionBtn.onclick = () => location.href = "order.html";

      ordersBtn.onclick = () => location.href = "orders.html";
    }

  });

});


async function loadAssignedOrders(uid) {

  if (!uid) return;

  const homeBtn = document.getElementById("homeNavBtn");
  homeBtn.style.display = "inline-block";
  homeBtn.onclick = () => location.reload();

  document.getElementById("heroSection").style.display = "none";
  document.querySelector(".carousel-container").style.display = "none";

  try {

    const snap = await db.collection("orders")
      .where("assignedTo", "==", uid)
      .get();

    let rows = "";

    for (const doc of snap.docs) {

      const o = doc.data();

      if (o.status === "Delivered") continue;

      const userDoc = await db.collection("users").doc(o.customerId).get();
      const u = userDoc.data() || {};
      const addr = u.address || {};

      const fullAddress = `
        ${addr.house || ""}, 
        ${addr.street || ""}, 
        ${addr.city || ""} - ${addr.pincode || ""}
      `;

      rows += `
        <tr>
          <td>${u.name || ""}</td>
          <td>${u.phone || ""}</td>
          <td>${o.bottles}</td>
          <td>${fullAddress}</td>
          <td>
            <button class="success-btn" onclick="markDelivered('${doc.id}')">
              Mark Delivered
            </button>
          </td>
        </tr>
      `;
    }

    document.getElementById("mainContent").innerHTML = `
      <div class="dashboard-card">
        <h2 style="margin-bottom:25px;">Assigned Orders</h2>

        <div class="table-wrapper">
          <table>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Bottles</th>
              <th>Address</th>
              <th>Action</th>
            </tr>
            ${rows || "<tr><td colspan='5'>No Orders Assigned</td></tr>"}
          </table>
        </div>
      </div>
    `;

  } catch (error) {

    document.getElementById("mainContent").innerHTML = `
      <div class="dashboard-card">
        <h2>Unable to load assigned orders</h2>
        <p>Please try again.</p>
      </div>
    `;
  }

}


async function markDelivered(id) {
  await db.collection("orders").doc(id).update({ status: "Delivered" });
  location.reload();
}
