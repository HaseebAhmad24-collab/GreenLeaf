import { 
  initializeApp 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

import { 
  getFirestore, collection, getDocs, addDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 🔹 Firebase Config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "greenleaf-98174.firebaseapp.com",
  projectId: "greenleaf-98174",
  storageBucket: "greenleaf-98174.appspot.com",
  messagingSenderId: "40600634205",
  appId: "1:40600634205:web:111289f55c51959ee2deb4"
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔹 Elements
const productList = document.getElementById("product-list");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");

let cart = [];

// =============================
// Load Products from Firestore
// =============================
async function loadProducts() {
  productList.innerHTML = "<p>Loading...</p>";

  const querySnapshot = await getDocs(collection(db, "products"));
  productList.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const p = doc.data();
    productList.innerHTML += `
      <div class="product-card">
        <img src="${p.img}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>PKR ${p.price}</p>
        <button onclick="addToCart('${doc.id}', '${p.name}', ${p.price}, '${p.img}')">Add to Cart</button>
      </div>
    `;
  });
}

// =============================
// Cart Functions
// =============================
window.addToCart = function (id, name, price, img) {
  const exists = cart.find(item => item.id === id);
  if (exists) {
    exists.qty++;
  } else {
    cart.push({ id, name, price, img, qty: 1 });
  }
  updateCart();
};

function updateCart() {
  cartItems.innerHTML = "";
  let total = 0, count = 0;

  cart.forEach(item => {
    total += item.price * item.qty;
    count += item.qty;

    cartItems.innerHTML += `
      <div class="cart-item">
        <span>${item.name}</span>
        <span>x${item.qty}</span>
        <span>PKR ${item.price * item.qty}</span>
      </div>`;
  });

  cartCount.innerText = count;
  cartTotal.innerText = total;
}

// =============================
// Modals Controls
// =============================
document.getElementById("cart-btn").onclick = () => 
  document.getElementById("cart-modal").style.display = "flex";

document.getElementById("close-cart").onclick = () => 
  document.getElementById("cart-modal").style.display = "none";

document.getElementById("checkout-btn").onclick = () => {
  document.getElementById("cart-modal").style.display = "none";
  document.getElementById("checkout-modal").style.display = "flex";
};

document.getElementById("checkout-nav").onclick = () => 
  document.getElementById("checkout-modal").style.display = "flex";

document.getElementById("close-checkout").onclick = () => 
  document.getElementById("checkout-modal").style.display = "none";

// =============================
// Checkout – Save Order
// =============================
document.getElementById("checkout-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get form data
  const name = document.getElementById("name").value;
  const address = document.getElementById("address").value;
  const phone = document.getElementById("phone").value;
  const payment = document.querySelector('input[name="payment"]:checked').value;

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Save to Firestore (orders)
  try {
    await addDoc(collection(db, "orders"), {
      name,
      address,
      phone,
      payment,
      total,
      items: cart,
      status: "Pending",
      createdAt: serverTimestamp()
    });

    alert("🎉 Order Placed Successfully!");
    document.getElementById("checkout-modal").style.display = "none";
    cart = [];
    updateCart();
  } catch (error) {
    console.error("Error saving order: ", error);
    alert("❌ Something went wrong. Please try again.");
  }
});

// Initialize Products
loadProducts();
