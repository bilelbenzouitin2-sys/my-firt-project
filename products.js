// قائمة المنتجات
const PRODUCTS = [
  {
    id: "netflix1",
    name: "Netflix - شهر",
    price: 10,
    category: "اشتراك"
  },
  {
    id: "spotify1",
    name: "Spotify - 3 أشهر",
    price: 8,
    category: "اشتراك"
  },
  {
    id: "coins1000",
    name: "حزمة عملات 1000",
    price: 5,
    category: "عملات"
  },
  {
    id: "vip5000",
    name: "حزمة VIP 5000",
    price: 18,
    category: "عملات"
  }
];

// توليد الكروت
function renderProducts(){
  const grid = document.getElementById("productsGrid");
  if(!grid) return;

  grid.innerHTML = PRODUCTS.map(p => `
    <div class="card">
      <span class="tag">${p.category}</span>
      <h3>${p.name}</h3>
      <p>السعر: ${p.price}€</p>

      <div class="actions">
        <button class="btn buy addToCart"
          data-id="${p.id}"
          data-name="${p.name}"
          data-price="${p.price}">
          أضف للسلة
        </button>

        <a class="btn chat"
           href="order.html?product=${encodeURIComponent(p.name)}">
           طلب الآن
        </a>
      </div>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", renderProducts);
