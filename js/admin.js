let deleteUserId=null

function toggleSidebar(){sidebar.classList.toggle("active");overlay.classList.toggle("active")}
function closeSidebar(){sidebar.classList.remove("active");overlay.classList.remove("active")}
function navigate(s){closeSidebar();showSection(s)}

firebase.auth().onAuthStateChanged(async user=>{
if(!user)return location.href="login.html"
const doc=await db.collection("users").doc(user.uid).get()
if(doc.data()?.role!=="admin")return location.href="index.html"
showSection("dashboard")
})

function logout(){firebase.auth().signOut().then(()=>location.href="index.html")}

function showSection(s){
if(s==="dashboard")loadDashboard()
if(s==="users")loadUsers()
if(s==="activeOrders")loadActiveOrders()
if(s==="ordersSummary")loadOrdersSummary()
if(s==="settings")loadSettings()
if(s==="assignOrders")loadAssignOrders()
}

async function loadAssignOrders(){

const ordersSnap=await db.collection("orders")
.where("status","==","Pending")
.get()

const deliverySnap=await db.collection("users")
.where("role","==","delivery")
.get()

let rows=""

for(const doc of ordersSnap.docs){

const o=doc.data()
if(o.assignedTo) continue

rows+=`
<tr>
<td>${doc.id}</td>
<td>${o.bottles}</td>
<td>₹${o.total}</td>
<td>
<select id="agent_${doc.id}">
${deliverySnap.docs.map(u=>`<option value="${u.id}">${u.data().name||u.data().email}</option>`).join("")}
</select>
</td>
<td>
<button class="theme-btn success-btn" onclick="assignOrder('${doc.id}')">
Assign
</button>
</td>
</tr>`
}

contentArea.innerHTML=`
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
${rows||"<tr><td colspan='5'>No Unassigned Orders</td></tr>"}
</table>
</div>
</div>`
}

async function assignOrder(orderId){
const agent=document.getElementById("agent_"+orderId).value
await db.collection("orders").doc(orderId).update({assignedTo:agent})
loadAssignOrders()
}
/* DASHBOARD */
async function loadDashboard(){
const orders=await db.collection("orders").get()
const users=await db.collection("users").get()
const active=orders.docs.filter(d=>d.data().status!=="Delivered")

const delivered=orders.docs.filter(d=>d.data().status==="Delivered").length

contentArea.innerHTML=`
<div class="admin-card">
<div class="dashboard-grid">
<div class="stat" onclick="navigate('users')">
<div class="stat-icon"><i class="fa-solid fa-users"></i></div>
<h2>${users.size}</h2>
<p>All Users</p>
</div>
<div class="stat" onclick="navigate('activeOrders')">
<div class="stat-icon"><i class="fa-solid fa-truck-fast"></i></div>
<h2>${active.length}</h2>
<p>Active Orders</p>
</div>
<div class="stat" onclick="navigate('ordersSummary')">
<div class="stat-icon"><i class="fa-solid fa-circle-check"></i></div>
<h2>${delivered}</h2>
<p>Delivered Orders</p>
</div>
</div>
</div>`
}
/* ORDERS SUMMARY */
async function loadOrdersSummary(){
const orders=await db.collection("orders").get()
const users=await db.collection("users").get()

const map={}
orders.forEach(o=>{
const d=o.data()
if(!map[d.customerId])map[d.customerId]=[]
map[d.customerId].push(d)
})

let rows=""
users.forEach(u=>{
const userOrders=map[u.id]||[]
if(userOrders.length===0)return

const last=userOrders.sort((a,b)=>{
if(!a.createdAt||!b.createdAt)return 0
return b.createdAt.seconds-a.createdAt.seconds
})[0]

rows+=`
<tr>
<td>${u.data().name||""}</td>
<td>${userOrders.length}</td>
<td>${last?.createdAt?.toDate().toLocaleDateString()||""}</td>
<td>
<button class="theme-btn" onclick="showUserOrders('${u.id}')">
Show All Orders
</button>
</td>
</tr>`
})

contentArea.innerHTML=`
<div class="admin-card">
<h2>Orders Summary</h2>
<div class="table-wrapper">
<table>
<tr>
<th>Name</th>
<th>Orders Placed</th>
<th>Last Order</th>
<th>Action</th>
</tr>
${rows}
</table>
</div>
</div>`
}

  async function showUserOrders(id){
const snap=await db.collection("orders").where("customerId","==",id).get()

let rows=""
snap.forEach(doc=>{
const o=doc.data()

let formattedDate=""
if(o.createdAt){
formattedDate = o.createdAt.toDate().toLocaleString("en-IN", {
timeZone: "Asia/Kolkata",
year: "numeric",
month: "short",
day: "numeric",
hour: "2-digit",
minute: "2-digit"
})
}

rows+=`
<tr>
<td>${o.bottles}</td>
<td>₹${o.total}</td>
<td>${formattedDate}</td>
<td>${o.status}</td>
</tr>`
})


contentArea.innerHTML=`
<div class="admin-card">
<h2>User Orders</h2>
<div class="table-wrapper">
<table>
<tr>
<th>Bottles</th>
<th>Total</th>
<th>Date & Time (IST)</th>
<th>Status</th>
</tr>
${rows}
</table>
<div style="margin-top:20px;text-align:center;">
<button class="theme-btn" onclick="navigate('ordersSummary')">
Back
</button>
</div>
</div>
</div>`
}

/* USERS WITH INLINE EDIT */
async function loadUsers(){
const snap=await db.collection("users").get()

let rows=""
snap.forEach(doc=>{
const u=doc.data()
rows+=`
<tr data-id="${doc.id}">
<td>${u.name||""}</td>
<td>${u.phone||""}</td>
<td>${u.email||""}</td>
<td>${u.role}</td>
<td>
<div class="action-group">
<button class="theme-btn" onclick="enableEdit('${doc.id}')">Edit</button>
<button class="theme-btn danger-btn" onclick="openDelete('${doc.id}')">Delete</button>
</div>
</td>
</tr>`
})

contentArea.innerHTML=`
<div class="admin-card">
<h2>All Users</h2>

<div class="controls">
<input type="text" id="searchInput" placeholder="Search..." onkeyup="searchUsers()">
<select id="roleFilter" onchange="filterUsers()">
<option value="">All Roles</option>
<option value="admin">Admin</option>
<option value="customer">Customer</option>
<option value="delivery">Delivery</option>
</select>
</div>

<div class="table-wrapper">
<table id="usersTable">
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
</div>`
}

function searchUsers(){
const val=document.getElementById("searchInput").value.toLowerCase()
document.querySelectorAll("#usersTable tr").forEach((row,i)=>{
if(i===0)return
row.style.display=row.innerText.toLowerCase().includes(val)?"":"none"
})
}

function filterUsers(){
const value=document.getElementById("roleFilter").value
document.querySelectorAll("#usersTable tr").forEach((row,i)=>{
if(i===0)return
row.style.display=value===""||row.children[3].innerText===value?"":"none"
})
}

function enableEdit(id){
const row=document.querySelector(`tr[data-id='${id}']`)
const cells=row.children
const name=cells[0].innerText
const phone=cells[1].innerText
const email=cells[2].innerText
const role=cells[3].innerText

row.innerHTML=`
<td><input class="edit-input" id="name_${id}" value="${name}"></td>
<td><input class="edit-input" id="phone_${id}" value="${phone}"></td>
<td><input class="edit-input" id="email_${id}" value="${email}"></td>
<td>
<select id="role_${id}" class="edit-input">
<option ${role==="admin"?"selected":""}>admin</option>
<option ${role==="customer"?"selected":""}>customer</option>
<option ${role==="delivery"?"selected":""}>delivery</option>
</select>
</td>
<td>
<div class="action-group">
<button class="theme-btn success-btn" onclick="saveUser('${id}')">Save</button>
<button class="theme-btn" onclick="loadUsers()">Cancel</button>
</div>
</td>`
}

async function saveUser(id){
await db.collection("users").doc(id).update({
name:document.getElementById(`name_${id}`).value,
phone:document.getElementById(`phone_${id}`).value,
email:document.getElementById(`email_${id}`).value,
role:document.getElementById(`role_${id}`).value
})
loadUsers()
}

function openDelete(id){
deleteUserId=id
document.getElementById("deleteModal").style.display="flex"
}

function closeModal(){
document.getElementById("deleteModal").style.display="none"
deleteUserId=null
}

async function confirmDelete(){
if(deleteUserId === firebase.auth().currentUser.uid){
alert("You cannot delete yourself.");
return;
}
await db.collection("users").doc(deleteUserId).delete()
closeModal()
loadUsers()
}

/* ACTIVE ORDERS (unchanged logic) */
/* ACTIVE ORDERS */
async function loadActiveOrders(){

const snap = await db.collection("orders")
.where("status","in",["Pending","Assigned"])
.get()

let rows=""

for(const doc of snap.docs){

const o = doc.data()

const uDoc = await db.collection("users").doc(o.customerId).get()
const u = uDoc.data() || {}

// Get Assigned Delivery Agent
let assignedName = "Not Assigned"

if(o.assignedTo){
  const agentDoc = await db.collection("users").doc(o.assignedTo).get()
  const agentData = agentDoc.data()
  assignedName = agentData?.name || agentData?.email || "Assigned"
}

rows += `
<tr>
<td>${u.name||""}</td>
<td>${u.phone||""}</td>
<td>${o.bottles}</td>
<td>₹${o.total}</td>
<td>${assignedName}</td>
<td>
<button class="theme-btn success-btn" onclick="markDelivered('${doc.id}')">
Mark Delivered
</button>
</td>
</tr>`
}

contentArea.innerHTML = `
<div class="admin-card">
<h2>Active Orders</h2>
<div class="table-wrapper">
<table>
<tr>
<th>Name</th>
<th>Phone</th>
<th>Bottles</th>
<th>Total</th>
<th>Assigned To</th>
<th>Action</th>
</tr>
${rows}
</table>
</div>
</div>`
}


async function markDelivered(id){
await db.collection("orders").doc(id).update({status:"Delivered"})
loadActiveOrders()
}

/* SETTINGS */
async function loadSettings(){

const doc = await db.collection("settings").doc("global").get()
const price = doc.data()?.price || 75

contentArea.innerHTML=`
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
pointer-events:none;
">
₹
</span>

<input 
type="number" 
id="priceInput" 
value="${price}" 
style="width:200px;padding-left:30px;"
>
</div>

<button class="theme-btn" onclick="savePrice()">
Save
</button>

</div>

</div>`
}

async function savePrice(){

await db.collection("settings").doc("global").update({
price:Number(document.getElementById("priceInput").value)
})

const card = document.querySelector(".admin-card")

const msg = document.createElement("div")
msg.style.marginTop="20px"
msg.style.opacity="0.9"
msg.innerText="Price updated successfully."

card.appendChild(msg)

setTimeout(()=>{
msg.remove()
},2500)

}


/* SAVE FUNCTION (unchanged logic restored) */
async function savePrice(){

await db.collection("settings").doc("global").update({
price:Number(document.getElementById("priceInput").value)
})

const card = document.querySelector(".admin-card")

const msg = document.createElement("div")
msg.style.marginTop="20px"
msg.style.opacity="0.9"
msg.innerText="Price updated successfully."

card.appendChild(msg)

setTimeout(()=>{
msg.remove()
},2500)

}
  
function changeAdminPrice(change){
const priceEl = document.getElementById("priceValue")
let current = Number(priceEl.innerText)
current += change
if(current < 1) current = 1
priceEl.innerText = current
}

async function savePrice(){

await db.collection("settings").doc("global").update({
price:Number(priceInput.value)
})

const card = document.querySelector(".admin-card")

const msg = document.createElement("div")
msg.style.marginTop="20px"
msg.style.opacity="0.9"
msg.innerText="Price updated successfully."

card.appendChild(msg)

setTimeout(()=>{
msg.remove()
},2500)

}

/* ===========================
   ADMIN REAL-TIME ORDER NOTIFICATIONS
   FIXED SOUND + VIBRATION
   USING CUSTOM SOUND assets/notify.wav
=========================== */

let unreadCount = 0;
let audioUnlocked = false;

// Use your custom sound
let notificationSound = new Audio("assets/notify.mp3");
notificationSound.preload = "auto";
notificationSound.volume = 1.0;

// Unlock audio on first user interaction
function unlockAudio() {
  if (audioUnlocked) return;
  notificationSound.play().then(() => {
    notificationSound.pause();
    notificationSound.currentTime = 0;
    audioUnlocked = true;
  }).catch(()=>{});
}

document.addEventListener("click", unlockAudio);
document.addEventListener("touchstart", unlockAudio);

function attachBadgeToAssignButton() {

  const sidebarButtons = document.querySelectorAll(".sidebar button");
  let assignBtn = null;

  sidebarButtons.forEach(btn => {
    if (btn.innerText.trim() === "Assign Orders") {
      assignBtn = btn;
    }
  });

  if (!assignBtn) return;

  assignBtn.style.position = "relative";

  let badge = document.createElement("div");
  badge.id = "assignOrderBadge";
  badge.style.position = "absolute";
  badge.style.top = "-6px";
  badge.style.right = "-6px";
  badge.style.background = "red";
  badge.style.color = "white";
  badge.style.borderRadius = "50%";
  badge.style.minWidth = "22px";
  badge.style.height = "22px";
  badge.style.fontSize = "12px";
  badge.style.display = "flex";
  badge.style.alignItems = "center";
  badge.style.justifyContent = "center";
  badge.style.fontWeight = "600";
  badge.style.padding = "0 5px";
  badge.style.display = "none";

  assignBtn.appendChild(badge);
}

function updateBadge(){
  const badge = document.getElementById("assignOrderBadge");
  if(!badge) return;

  if(unreadCount > 0){
    badge.style.display = "flex";
    badge.innerText = unreadCount > 9 ? "9+" : unreadCount;
  }else{
    badge.style.display = "none";
  }
}

function clearUnread(){
  unreadCount = 0;
  updateBadge();
}

firebase.auth().onAuthStateChanged(async user => {

  if (!user) return;

  const userDoc = await db.collection("users").doc(user.uid).get();
  if (userDoc.data()?.role !== "admin") return;

  attachBadgeToAssignButton();

  if (Notification.permission !== "granted") {
    await Notification.requestPermission();
  }

  db.collection("orders")
    .where("status", "==", "Pending")
    .onSnapshot(snapshot => {

      // Count only unassigned orders
      const unassigned = snapshot.docs.filter(doc => {
        const data = doc.data();
        return !data.assignedTo;
      });

      unreadCount = unassigned.length;
      updateBadge();

      snapshot.docChanges().forEach(change => {

        if (change.type === "added") {

          const data = change.doc.data();
          if (data.assignedTo) return;

          // 🔊 FORCE PLAY SOUND
          try {
            notificationSound.currentTime = 0;
            notificationSound.play();
          } catch(e) {}

          // 📳 STRONG VIBRATION PATTERN
          if (navigator.vibrate) {
            navigator.vibrate([400,150,400,150,400]);
          }

          // 🔔 System Notification
          if (Notification.permission === "granted") {

            const notification = new Notification("New Order Received", {
              body: "A new order needs assignment",
              icon: "assets/logo.png",
              requireInteraction: true
            });

            notification.onclick = function () {
              window.focus();
              showSection("assignOrders");
              clearUnread();
              notification.close();
            };
          }
        }

      });

    });

});

// Clear unread when opening Assign Orders manually
const originalLoadAssignOrders = loadAssignOrders;
loadAssignOrders = async function(){
  clearUnread();
  await originalLoadAssignOrders();
};

  // ===== REGISTER ADMIN FOR PUSH =====
firebase.auth().onAuthStateChanged(async (user) => {

  if (!user) return;

  const doc = await db.collection("users").doc(user.uid).get();
  if (doc.data()?.role !== "admin") return;

  const messaging = firebase.messaging();

  await Notification.requestPermission();

  const token = await messaging.getToken({
    vapidKey: "BHYtt5LCQct0BbqHgb0nQvmpaN4gdyn7ChppNJ4EViM0W8jJjDjQA_u-9X8Jz1xX4N7vLCR-DsPGTxjlpxbsyeg"
  });

  if (token) {
    await db.collection("users").doc(user.uid).update({
      fcmToken: token
    });
  }
});
