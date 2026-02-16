// ================= PRODUCTS DB =================

const LS_PRODUCTS = "products_db_v2";
const LS_CART = "cart_v1";

const DEFAULT_PRODUCTS = [
  { id:"netflix1", name:"Netflix - شهر", priceEUR:10, category:"اشتراك", image:"https://via.placeholder.com/400x220?text=Netflix" },
  { id:"spotify1", name:"Spotify - 3 أشهر", priceEUR:8, category:"اشتراك", image:"https://via.placeholder.com/400x220?text=Spotify" },
  { id:"coins1000", name:"حزمة عملات 1000", priceEUR:5, category:"عملات", image:"https://via.placeholder.com/400x220?text=Coins" },
  { id:"vip5000", name:"حزمة VIP 5000", priceEUR:18, category:"عملات", image:"https://via.placeholder.com/400x220?text=VIP" }
];

// ================= LOAD PRODUCTS =================

function loadProducts(){
  try {
    const saved = JSON.parse(localStorage.getItem(LS_PRODUCTS));
    if(saved && saved.length) return saved;
  } catch(e){}
  localStorage.setItem(LS_PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
  return DEFAULT_PRODUCTS;
}

// ================= RENDER PRODUCTS =================

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
        <button class="btn buy addToCart"
          data-id="${p.id}"
          data-name="${p.name}"
          data-price="${p.priceEUR}">
          أضف للسلة
        </button>
      </div>
    </div>
  `).join("");
}

// ================= ADD TO CART =================

function addToCart(id, name, priceEUR){

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

// ================= EVENT LISTENER =================

document.addEventListener("click", function(e){

  if(e.target.classList.contains("addToCart")){
    const id = e.target.dataset.id;
    const name = e.target.dataset.name;
    const priceEUR = Number(e.target.dataset.price);

    addToCart(id, name, priceEUR);
  }

});

document.addEventListener("DOMContentLoaded", renderProducts);
