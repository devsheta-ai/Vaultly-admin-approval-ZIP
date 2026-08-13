// ============================================================
// FIREBASE CONFIG — apna existing config yaha paste karo
// (Ye tumhare Vaultly project me pehle se hi kahin hoga,
//  wahi copy karke yaha daal do — dobara mat banao)
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "cloud-wallet-d3c62.firebaseapp.com",
  projectId: "cloud-wallet-d3c62",
  storageBucket: "cloud-wallet-d3c62.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
