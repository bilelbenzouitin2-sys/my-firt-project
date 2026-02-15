// قائمة المنتجات
const PRODUCTS = [
  {
    id: "netflix1",
    name: "Netflix - شهر",
    price: 10,
    category: "اشتراك",
    image: "https://via.placeholder.com/300x180?text=Netflix"
  },
  {
    id: "spotify1",
    name: "Spotify - 3 أشهر",
    price: 8,
    category: "اشتراك",
    image: "https://via.placeholder.com/300x180?text=Spotify"
  },
  {
    id: "coins1000",
    name: "حزمة عملات 1000",
    price: 5,
    category: "عملات",
    image: "https://via.placeholder.com/300x180?text=Coins"
  },
  {
    id: "vip5000",
    name: "حزمة VIP 5000",
    price: 18,
    category: "عملات",
    image: "https://via.placeholder.com/300x180?text=VIP"
  }
];

// توليد الكروت
function renderProducts(list = PRODUCTS){
  const grid = document.getElementById("productsGrid");
  if(!grid) return;

  if(list.length === 0){
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
      <img src="${p.image}" alt="${p.name}" class="productImg">

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

document.addEventListener("DOMContentLoaded", () => {

  renderProducts(PRODUCTS);

  let currentFilter = "all";

  const input = document.getElementById("searchInput");
  const filterButtons = document.querySelectorAll(".filterBtn");

  function applyFilters(){

    const q = input.value.trim().toLowerCase();

    const filtered = PRODUCTS.filter(p => {

      const matchesSearch =
        !q || `${p.name} ${p.category}`.toLowerCase().includes(q);

      const matchesCategory =
        currentFilter === "all" || p.category === currentFilter;

      return matchesSearch && matchesCategory;
    });

    renderProducts(filtered);
  }

  if(input){
    input.addEventListener("input", applyFilters);
  }

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {

      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      currentFilter = btn.dataset.filter;
      applyFilters();
    });
  });

});
