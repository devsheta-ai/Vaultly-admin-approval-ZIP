// ============================================================
// VAULTLY — Signup / Login with Admin Approval Gate
// Is file ko apne existing signup/login JS ki jagah use karo,
// ya isme se relevant hisse apne code me merge kar do.
// ============================================================
import { auth, db } from "../firebase-config/firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc, setDoc, getDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Vaultly "username-only" login ke liye hum username ko
// ek internal fake email me convert karte hain, kyunki
// Firebase Auth email/password maangta hai.
function usernameToEmail(username) {
  return `${username.trim().toLowerCase()}@vaultly.local`;
}

// ---------- CREATE VAULT (Signup) ----------
export async function createVault(username, password) {
  const email = usernameToEmail(username);

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;

  // Firestore me user document "pending" status ke saath banao
  await setDoc(doc(db, "users", uid), {
    username: username.trim(),
    uid: uid,
    status: "pending",       // pending | approved | rejected
    role: "user",
    createdAt: serverTimestamp()
  });

  // Turant sign out — jab tak admin approve na kare tab tak
  // login allow nahi karna
  await signOut(auth);

  return {
    success: true,
    message: "Vault ban gaya! Admin approval ka intezaar karo. Approve hone ke baad hi login hoga."
  };
}

// ---------- UNLOCK VAULT (Login) ----------
export async function unlockVault(username, password) {
  const email = usernameToEmail(username);

  const cred = await signInWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;

  const userSnap = await getDoc(doc(db, "users", uid));

  if (!userSnap.exists()) {
    await signOut(auth);
    throw new Error("User record nahi mila. Admin se contact karo.");
  }

  const userData = userSnap.data();

  if (userData.status === "pending") {
    await signOut(auth);
    return { approved: false, status: "pending", message: "Aapka vault admin approval ka intezaar kar raha hai." };
  }

  if (userData.status === "rejected") {
    await signOut(auth);
    return { approved: false, status: "rejected", message: "Aapka request reject ho chuka hai." };
  }

  // status === "approved" -> login allow
  return { approved: true, status: "approved", user: userData };
}
