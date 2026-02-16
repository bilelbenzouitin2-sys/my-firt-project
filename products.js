// ================= PRODUCTS DB =================

const LS_PRODUCTS = "products_db_v2";

const DEFAULT_PRODUCTS = [
  { id:"netflix1", name:"Netflix - شهر", priceEUR:10, category:"اشتراك", image:"https://via.placeholder.com/400x220?text=Netflix" },
  { id:"spotify1", name:"Spotify - 3 أشهر", priceEUR:8, category:"اشتراك", image:"https://via.placeholder.com/400x220?text=Spotify" },
  { id:"coins1000", name:"حزمة عملات 1000", priceEUR:5, category:"عملات", image:"https://via.placeholder.com/400x220?text=Coins" },
  { id:"vip5000", name:"حزمة VIP 5000", priceEUR:18, category:"عملات", image:"https://via.placeholder.com/400x220?text=VIP" }
];

function loadProducts(){
  try {
    const saved = JSON.parse(localStorage.getItem(LS_PRODUCTS));
    if(saved && saved.length) return saved;
  } catch(e){}
  localStorage.setItem(LS_PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
  return DEFAULT_PRODUCTS;
}

function renderProducts(){
  const grid = document.getElementById("productsGrid");
  if(!grid) return;

  const products = loadProducts();

  grid.innerHTML = products.map(p => `
    <div class="card">
      <img src="${p.image}" style="width:100%;border-radius:12px;margin-bottom:10px;">
      <span class="tag">${p.category}</span>
      <h3>${p.name}</h3>
      <p>السعر: ${p.priceEUR}€</p>

      <div class="actions">
<button onclick='addToCart(${JSON.stringify({
  id: p.id,
  name: p.name,
  price: p.priceEUR
})})' class="btn buy">
  أضف للسلة
</button>
      </div>
    </div>
  `).join("");

  attachAddToCart();
}

function attachAddToCart(){
  const buttons = document.querySelectorAll(".addToCart");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {

      if(typeof window.addToCart !== "function"){
        alert("cart.js غير محمّل");
        return;
      }

      window.addToCart({
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: Number(btn.dataset.price)
      });

      alert("تمت الإضافة للسلة ✅");
    });
  });
}

document.addEventListener("DOMContentLoaded", renderProducts);
