let deleteUserId = null;
let unreadCount = 0;
let audioUnlocked = false;

const notificationSound = new Audio("assets/notify.mp3");
notificationSound.preload = "auto";
notificationSound.volume = 1.0;

/* ===========================
   BASIC NAVIGATION
=========================== */

function toggleSidebar(){
  sidebar.classList.toggle("active");
  overlay.classList.toggle("active");
}

function closeSidebar(){
  sidebar.classList.remove("active");
  overlay.classList.remove("active");
}

function navigate(s){
  closeSidebar();
  showSection(s);
}

function logout(){
  firebase.auth().signOut().then(()=>location.href="index.html");
}

/* ===========================
   AUTH PROTECTION
=========================== */

firebase.auth().onAuthStateChanged(async user=>{
  if(!user) return location.href="login.html";

  const doc = await db.collection("users").doc(user.uid).get();
  if(doc.data()?.role!=="admin") return location.href="index.html";

  showSection("dashboard");
});

/* ===========================
   SECTION ROUTER
=========================== */

function showSection(s){
  if(s==="dashboard") loadDashboard();
  if(s==="users") loadUsers();
  if(s==="activeOrders") loadActiveOrders();
  if(s==="ordersSummary") loadOrdersSummary();
  if(s==="settings") loadSettings();
  if(s==="assignOrders") loadAssignOrders();
}

/* ===========================
   DASHBOARD
=========================== */

async function loadDashboard(){
  const orders = await db.collection("orders").get();
  const users = await db.collection("users").get();
  const active = orders.docs.filter(d=>d.data().status!=="Delivered");

  contentArea.innerHTML = `
  <div class="admin-card">
    <div class="dashboard-grid">
      <div class="stat" onclick="navigate('users')">
        <h2>👥 ${users.size}</h2>
        <p>All Users</p>
      </div>
      <div class="stat" onclick="navigate('activeOrders')">
        <h2>📦 ${active.length}</h2>
        <p>Active Orders</p>
      </div>
    </div>
  </div>`;
}

/* ===========================
   ASSIGN ORDERS
=========================== */

async function loadAssignOrders(){

  const ordersSnap = await db.collection("orders")
  .where("status","==","Pending")
  .get();

  const deliverySnap = await db.collection("users")
  .where("role","==","delivery")
  .get();

  let rows="";

  for(const doc of ordersSnap.docs){

    const o = doc.data();
    if(o.assignedTo) continue;

    rows += `
    <tr>
      <td>${doc.id}</td>
      <td>${o.bottles}</td>
      <td>₹${o.total}</td>
      <td>
        <select id="agent_${doc.id}">
          ${deliverySnap.docs.map(u=>`
            <option value="${u.id}">
              ${u.data().name||u.data().email}
            </option>
          `).join("")}
        </select>
      </td>
      <td>
        <button class="theme-btn success-btn"
        onclick="assignOrder('${doc.id}')">
        Assign
        </button>
      </td>
    </tr>`;
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
  </div>`;
}

async function assignOrder(orderId){
  const agent=document.getElementById("agent_"+orderId).value;
  await db.collection("orders").doc(orderId).update({assignedTo:agent});
  loadAssignOrders();
}

/* ===========================
   SETTINGS (single savePrice)
=========================== */

async function loadSettings(){

  const doc = await db.collection("settings").doc("global").get();
  const price = doc.data()?.price || 75;

  contentArea.innerHTML = `
  <div class="admin-card">
    <h2>Bottle Pricing Per Unit</h2>

    <div style="display:flex;gap:15px;margin-top:20px;justify-content:center;align-items:center;">

      <div style="position:relative;">
        <span style="
        position:absolute;
        left:15px;
        top:50%;
        transform:translateY(-50%);
        color:#062c5c;
        font-weight:600;
        pointer-events:none;">
        ₹
        </span>

        <input type="number" id="priceInput"
        value="${price}" style="width:200px;padding-left:30px;">
      </div>

      <button class="theme-btn" onclick="savePrice()">
        Save
      </button>

    </div>
  </div>`;
}

async function savePrice(){

  await db.collection("settings").doc("global").update({
    price:Number(document.getElementById("priceInput").value)
  });

  const card=document.querySelector(".admin-card");
  const msg=document.createElement("div");
  msg.style.marginTop="20px";
  msg.style.opacity="0.9";
  msg.innerText="Price updated successfully.";
  card.appendChild(msg);

  setTimeout(()=>msg.remove(),2500);
}
