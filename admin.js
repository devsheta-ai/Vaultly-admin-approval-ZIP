// ============================================================
// VAULTLY — Admin Approval Panel Logic
// ============================================================
import { auth, db } from "../firebase-config/firebase-config.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection, query, where, onSnapshot,
  doc, updateDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

function usernameToEmail(username) {
  return `${username.trim().toLowerCase()}@vaultly.local`;
}

const loginGate   = document.getElementById("loginGate");
const panelWrap   = document.getElementById("panelWrap");
const userList    = document.getElementById("userList");
const errorMsg    = document.getElementById("errorMsg");
const loginBtn    = document.getElementById("adminLoginBtn");

loginBtn.addEventListener("click", async () => {
  errorMsg.textContent = "";
  const username = document.getElementById("adminUsername").value;
  const password = document.getElementById("adminPassword").value;

  try {
    const cred = await signInWithEmailAndPassword(auth, usernameToEmail(username), password);
    const snap = await getDoc(doc(db, "users", cred.user.uid));

    if (!snap.exists() || snap.data().role !== "admin") {
      errorMsg.textContent = "Ye account admin nahi hai.";
      await auth.signOut();
      return;
    }
    // role === admin -> panel dikhao, listener onAuthStateChanged sambhal lega
  } catch (err) {
    errorMsg.textContent = "Login fail: " + err.message;
  }
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    loginGate.style.display = "block";
    panelWrap.style.display = "none";
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists() || snap.data().role !== "admin") {
    loginGate.style.display = "block";
    panelWrap.style.display = "none";
    return;
  }

  loginGate.style.display = "none";
  panelWrap.style.display = "block";
  listenForPendingUsers();
});

function listenForPendingUsers() {
  const q = query(collection(db, "users"), where("status", "==", "pending"));

  onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      userList.innerHTML = `<div class="empty">Koi pending request nahi hai 🎉</div>`;
      return;
    }

    userList.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const uid = docSnap.id;

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div class="user-info">
          <div class="username">${data.username || "(no username)"}</div>
          <div class="meta">UID: ${uid}</div>
        </div>
        <div class="actions">
          <button class="approve-btn" data-uid="${uid}">Approve</button>
          <button class="reject-btn" data-uid="${uid}">Reject</button>
        </div>
      `;
      userList.appendChild(card);
    });

    userList.querySelectorAll(".approve-btn").forEach((btn) => {
      btn.addEventListener("click", () => setStatus(btn.dataset.uid, "approved"));
    });
    userList.querySelectorAll(".reject-btn").forEach((btn) => {
      btn.addEventListener("click", () => setStatus(btn.dataset.uid, "rejected"));
    });
  });
}

async function setStatus(uid, status) {
  await updateDoc(doc(db, "users", uid), { status });
}
