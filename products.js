// ================= PRODUCTS DB =================
const LS_PRODUCTS = "products_db_v2";
const LS_CART = "cart_v1";

const DEFAULT_PRODUCTS = [
  { id:"netflix1", name:"Netflix - شهر", priceEUR:10, category:"اشتراك", image:"https://via.placeholder.com/400x220?text=Netflix" },
  { id:"spotify1", name:"Spotify - 3 أشهر", priceEUR:8, category:"اشتراك", image:"https://via.placeholder.com/400x220?text=Spotify" },
  { id:"coins1000", name:"حزمة عملات 1000", priceEUR:5, category:"عملات", image:"https://via.placeholder.com/400x220?text=Coins" },
  { id:"vip5000", name:"حزمة VIP 5000", priceEUR:18, category:"عملات", image:"https://via.placeholder.com/400x220?text=VIP" }
];

function loadProducts(){
  try {
    const saved = JSON.parse(localStorage.getItem(LS_PRODUCTS));
    if (Array.isArray(saved) && saved.length) return saved;
  } catch(e){}
  localStorage.setItem(LS_PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
  return DEFAULT_PRODUCTS;
}

// ================= CART HELPERS =================
function getCart(){
  try { return JSON.parse(localStorage.getItem(LS_CART) || "[]"); }
  catch(e){ return []; }
}

function setCart(arr){
  localStorage.setItem(LS_CART, JSON.stringify(arr));
}

function updateCartCount(){
  const el = document.getElementById("cartCount");
  if(!el) return;
  const cart = getCart();
  const count = cart.reduce((sum, it) => sum + Number(it.qty || 1), 0);
  el.textContent = String(count);
}

function addToCartFromDataset(btn){
  const id = btn.dataset.id;
  const name = btn.dataset.name;
  const priceEUR = Number(btn.dataset.price || 0);

  if(!id || !name) return;

  const cart = getCart();
  const found = cart.find(it => it.id === id);

  if(found){
    found.qty = Number(found.qty || 1) + 1;
  } else {
    cart.push({ id, name, priceEUR, qty: 1 });
  }

  setCart(cart);
  updateCartCount();

  // تأثير بسيط (اختياري)
  btn.textContent = "✅ تمت الإضافة";
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = "أضف للسلة";
    btn.disabled = false;
  }, 800);
}

// ================= RENDER =================
function renderProducts(){
  const grid = document.getElementById("productsGrid");
  if(!grid) return;

  const products = loadProducts();

  grid.innerHTML = products.map(p => `
    <div class="card">
      <img src="${p.image}" alt="${p.name}" style="width:100%;border-radius:12px;margin-bottom:10px;">
      <span class="tag">${p.category}</span>
      <h3>${p.name}</h3>
      <p>السعر: ${p.priceEUR}€</p>

      <div class="actions">
        <button class="btn buy addToCart"
          data-id="${p.id}"
          data-name="${p.name}"
          data-price="${p.priceEUR}">
          أضف للسلة
        </button>

        <a class="btn chat" href="order.html?product=${encodeURIComponent(p.name)}">
          طلب الآن
        </a>
      </div>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  document.addEventListener("click", function(e){

  if(e.target.classList.contains("addToCart")){

    const id = e.target.dataset.id;
    const name = e.target.dataset.name;
    const priceEUR = Number(e.target.dataset.price);

    const LS_CART = "cart_v1";

    let cart = [];

    try {
      cart = JSON.parse(localStorage.getItem(LS_CART)) || [];
    } catch(e){
      cart = [];
    }

    const existing = cart.find(item => item.id === id);

    if(existing){
      existing.qty += 1;
    } else {
      cart.push({
        id,
        name,
        priceEUR,
        qty: 1
      });
    }

    localStorage.setItem(LS_CART, JSON.stringify(cart));

    alert("✅ تم إضافة المنتج للسلة");
  }

});

  updateCartCount();

  // Event Delegation: يشتغل حتى لو المنتجات ديناميكية
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".addToCart");
    if(!btn) return;
    addToCartFromDataset(btn);
  });
});
