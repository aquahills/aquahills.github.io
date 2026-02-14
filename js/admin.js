let deleteUserId = null;

document.addEventListener("DOMContentLoaded", () => {

  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const menuBtn = document.getElementById("menuBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const sidebarLogoutBtn = document.getElementById("sidebarLogoutBtn");

  menuBtn.addEventListener("click", () => toggleSidebar());
  overlay.addEventListener("click", closeSidebar);

  logoutBtn.addEventListener("click", logout);
  sidebarLogoutBtn.addEventListener("click", logout);

  document.querySelectorAll(".sidebar button[data-section]")
    .forEach(btn => {
      btn.addEventListener("click", () => {
        closeSidebar();
        showSection(btn.dataset.section);
      });
    });

  document.getElementById("confirmDeleteBtn").addEventListener("click", confirmDelete);
  document.getElementById("cancelDeleteBtn").addEventListener("click", closeModal);

  firebase.auth().onAuthStateChanged(async user => {

    if (!user) {
      location.href = "login.html";
      return;
    }

    const doc = await db.collection("users").doc(user.uid).get();

    if (doc.data()?.role !== "admin") {
      location.href = "index.html";
      return;
    }

    showSection("dashboard");
  });

});


function toggleSidebar() {
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}

function closeSidebar() {
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
}

function logout() {
  firebase.auth().signOut().then(() => location.href = "index.html");
}

function showSection(section) {
  if (section === "dashboard") loadDashboard();
  if (section === "ordersSummary") loadOrdersSummary();
  if (section === "assignOrders") loadAssignOrders();
  if (section === "users") loadUsers();
  if (section === "settings") loadSettings();
}


/* DASHBOARD */

async function loadDashboard() {

  const orders = await db.collection("orders").get();
  const users = await db.collection("users").get();

  const active = orders.docs.filter(d => d.data().status !== "Delivered");

  contentArea.innerHTML = `
    <div class="admin-card">
      <div class="dashboard-grid">
        <div class="stat" onclick="showSection('users')">
          <h2>${users.size}</h2>
          <p>All Users</p>
        </div>
        <div class="stat" onclick="loadActiveOrders()">
          <h2>${active.length}</h2>
          <p>Active Orders</p>
        </div>
      </div>
    </div>
  `;
}


/* ASSIGN ORDERS */

async function loadAssignOrders() {

  const ordersSnap = await db.collection("orders")
    .where("status", "==", "Pending")
    .get();

  const deliverySnap = await db.collection("users")
    .where("role", "==", "delivery")
    .get();

  let rows = "";

  for (const doc of ordersSnap.docs) {

    const o = doc.data();
    if (o.assignedTo) continue;

    rows += `
      <tr>
        <td>${doc.id}</td>
        <td>${o.bottles}</td>
        <td>₹${o.total}</td>
        <td>
          <select id="agent_${doc.id}">
            ${deliverySnap.docs.map(u =>
              `<option value="${u.id}">
                ${u.data().name || u.data().email}
              </option>`
            ).join("")}
          </select>
        </td>
        <td>
          <button class="theme-btn success-btn"
            onclick="assignOrder('${doc.id}')">
            Assign
          </button>
        </td>
      </tr>
    `;
  }

  contentArea.innerHTML = `
    <div class="admin-card">
      <h2>Assign Pending Orders</h2>
      <div class="table-wrapper">
        <table>
          <tr>
            <th>Order ID</th>
            <th>Bottles</th>
            <th>Total</th>
            <th>Delivery Agent</th>
            <th>Action</th>
          </tr>
          ${rows || "<tr><td colspan='5'>No Unassigned Orders</td></tr>"}
        </table>
      </div>
    </div>
  `;
}

async function assignOrder(orderId) {
  const agent = document.getElementById("agent_" + orderId).value;
  await db.collection("orders").doc(orderId).update({ assignedTo: agent });
  loadAssignOrders();
}


/* USERS */

async function loadUsers() {

  const snap = await db.collection("users").get();
  let rows = "";

  snap.forEach(doc => {
    const u = doc.data();

    rows += `
      <tr data-id="${doc.id}">
        <td>${u.name || ""}</td>
        <td>${u.phone || ""}</td>
        <td>${u.email || ""}</td>
        <td>${u.role}</td>
        <td>
          <div class="action-group">
            <button class="theme-btn"
              onclick="enableEdit('${doc.id}')">
              Edit
            </button>
            <button class="theme-btn danger-btn"
              onclick="openDelete('${doc.id}')">
              Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  contentArea.innerHTML = `
    <div class="admin-card">
      <h2>All Users</h2>
      <div class="table-wrapper">
        <table>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
          ${rows}
        </table>
      </div>
    </div>
  `;
}


function openDelete(id) {
  deleteUserId = id;
  document.getElementById("deleteModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("deleteModal").style.display = "none";
  deleteUserId = null;
}

async function confirmDelete() {

  if (deleteUserId === firebase.auth().currentUser.uid) {
    alert("You cannot delete yourself.");
    return;
  }

  await db.collection("users").doc(deleteUserId).delete();
  closeModal();
  loadUsers();
}


/* SETTINGS */

async function loadSettings() {

  const doc = await db.collection("settings").doc("global").get();
  const price = doc.data()?.price || 75;

  contentArea.innerHTML = `
    <div class="admin-card">
      <h2>Bottle Pricing Per Unit</h2>

      <div class="pricing-controls">
        <input type="number" id="priceInput" value="${price}">
        <button class="theme-btn" onclick="savePrice()">Save</button>
      </div>
    </div>
  `;
}

async function savePrice() {

  await db.collection("settings").doc("global").update({
    price: Number(document.getElementById("priceInput").value)
  });

  alert("Price updated successfully.");
}
