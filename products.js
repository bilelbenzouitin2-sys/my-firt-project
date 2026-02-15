// ====== تخزين المنتجات ======
const LS_PRODUCTS = "store_products_v2";

// افتراضي (يتزرع أول مرة فقط)
const DEFAULT_PRODUCTS = [
  { id:"netflix1", name:"Netflix - شهر", price:10, category:"اشتراك", image:"https://via.placeholder.com/800x480?text=Netflix", hidden:false },
  { id:"spotify1", name:"Spotify - 3 أشهر", price:8, category:"اشتراك", image:"https://via.placeholder.com/800x480?text=Spotify", hidden:false },
  { id:"coins1000", name:"حزمة عملات 1000", price:5, category:"عملات", image:"https://via.placeholder.com/800x480?text=Coins", hidden:false },
  { id:"vip5000", name:"حزمة VIP 5000", price:18, category:"عملات", image:"https://via.placeholder.com/800x480?text=VIP", hidden:false },
];

function seedProductsIfEmpty(){
  const raw = localStorage.getItem(LS_PRODUCTS);
  if(!raw){
    localStorage.setItem(LS_PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
  }
}

function loadProducts(){
  try{
    const data = JSON.parse(localStorage.getItem(LS_PRODUCTS) || "[]");
    if(!Array.isArray(data) || data.length === 0) return DEFAULT_PRODUCTS;
    return data;
  }catch(e){
    return DEFAULT_PRODUCTS;
  }
}

function getVisibleProducts(){
  return loadProducts().filter(p => !p.hidden);
}

function escapeHtml(str){
  return String(str||"")
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

// ====== عرض المنتجات ======
function renderProducts(list){
  const grid = document.getElementById("productsGrid");
  if(!grid) return;

  if(!list || list.length === 0){
    grid.innerHTML = `
      <div class="card">
        <h3>لا توجد نتائج</h3>
        <p class="desc">جرّب كلمة بحث أخرى.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map(p => `
    <div class="card">
      <img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" class="productImg">
      <span class="tag">${escapeHtml(p.category)}</span>
      <h3>${escapeHtml(p.name)}</h3>
      <p class="price">السعر: ${Number(p.price).toFixed(2).replace(".00","")}€</p>

      <div class="actions">
        <button class="btn buy addToCart"
          data-id="${escapeHtml(p.id)}"
          data-name="${escapeHtml(p.name)}"
          data-price="${Number(p.price)}">
          أضف للسلة
        </button>

        <a class="btn chat" href="product.html?id=${encodeURIComponent(p.id)}">
          صفحة المنتج
        </a>

        <a class="btn chat" href="cart.html">
          فتح السلة
        </a>
      </div>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  seedProductsIfEmpty();

  let currentFilter = "all";
  const input = document.getElementById("searchInput");
  const filterButtons = document.querySelectorAll(".filterBtn");

  function applyFilters(){
    const q = (input?.value || "").trim().toLowerCase();
    const products = getVisibleProducts();

    const filtered = products.filter(p => {
      const text = `${p.name} ${p.category}`.toLowerCase();
      const matchesSearch = !q || text.includes(q);
      const matchesCategory = currentFilter === "all" || p.category === currentFilter;
      return matchesSearch && matchesCategory;
    });

    renderProducts(filtered);
  }

  applyFilters();

  if(input) input.addEventListener("input", applyFilters);

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      applyFilters();
    });
  });

  // تحديث تلقائي عند الرجوع من admin.html
  window.addEventListener("focus", applyFilters);
});
