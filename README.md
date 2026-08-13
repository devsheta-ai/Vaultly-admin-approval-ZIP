# Vaultly — Admin Approval System

Ye zip file me wo sab code hai jisse naye users signup karne ke baad
"pending" state me rahenge, aur admin approve kiye bina unka vault
open nahi hoga.

## Folder structure

```
vaultly-admin-approval/
├── firebase-config/
│   ├── firebase-config.js   → apna Firebase config yaha daalo
│   └── firestore.rules      → security rules (Firebase console me paste karo)
├── public/
│   ├── auth.js              → signup/login logic (pending check ke saath)
│   └── demo-integration.html → dikhata hai ki apne form ke saath kaise jode
└── admin/
    ├── admin.html           → admin approval panel (UI)
    └── admin.js             → admin panel ki logic
```

## Setup Steps

### 1. Firebase config bharo
`firebase-config/firebase-config.js` kholo aur apna existing Vaultly
project ka config (apiKey, authDomain, etc.) paste karo. Ye wahi
config hoga jo tumhare current Vaultly code me kahin already hoga —
Firebase Console > Project Settings > General > "Your apps" se milega.

### 2. `auth.js` ko apne signup/login se jodo
`public/auth.js` me do functions hain:
- `createVault(username, password)` — naya user "pending" status ke saath banata hai
- `unlockVault(username, password)` — login karta hai, agar approved nahi hai toh andar nahi jaane deta

Apne existing "Create Vault" aur "Unlock Vault" button ke click handlers
me inhe call karo. `public/demo-integration.html` me example diya hai
(comments hata ke apne form ke IDs daal do).

### 3. Ek admin account banao
Firebase Console > Authentication me jaake khud ka ek account
create kar lo (ya apna already bana hua username use karo), phir
Firestore me uska document dhoondo aur manually ye field add karo:

```
role: "admin"
status: "approved"
```

Isse woh account admin ban jayega.

### 4. Admin panel deploy karo
`admin/` folder ko apne Firebase Hosting me ek subfolder ki tarah
daal do, jaise:

```
cloud-wallet-d3c62.web.app/admin/admin.html
```

Wahan jaake admin username/password se login karo — pending users
ki list dikhegi, "Approve" / "Reject" button se decide kar sakte ho.

### 5. Firestore Security Rules laga do (zaroori hai!)
`firebase-config/firestore.rules` ki content copy karo aur
Firebase Console > Firestore Database > Rules me paste karke Publish
karo. Isse normal user khud ko approve nahi kar payega — sirf
`role: "admin"` wala account hi status change kar sakega.

## Flow kaise kaam karega

1. Naya user "Create Vault" kare → Firestore me `status: "pending"` ke saath entry ban jaati hai, user turant sign-out ho jaata hai
2. User "Unlock Vault" try kare → agar `status !== "approved"` hai toh andar nahi jaane dega, "pending" message dikhega
3. Admin apna panel kholta hai (`/admin/admin.html`) → pending list me naam dikhta hai → Approve dabata hai
4. Ab wahi user dobara login kare toh `status: "approved"` hone ki wajah se dashboard khul jayega

## Note

- Ye code tumhare Vaultly ke exact HTML/CSS se match nahi karega (kyunki tumhara live source code mere paas nahi tha) — isliye logic-only files di hain jo tum apne existing UI ke saath jod sakte ho.
- Agar apna asli `index.html` / signup form ka code share karo, toh main ise directly usi file me merge karke de sakta hoon.
