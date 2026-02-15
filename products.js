// ===== المنتجات الأساسية =====
const PRODUCTS = [
  {
    id: "netflix1",
    name: "Netflix - شهر",
    price: 10,
    category: "اشتراك",
    desc: "اشتراك لمدة شهر. التسليم بعد تأكيد الدفع.",
    image: "https://via.placeholder.com/640x360?text=Netflix"
  },
  {
    id: "spotify1",
    name: "Spotify - 3 أشهر",
    price: 8,
    category: "اشتراك",
    desc: "اشتراك 3 أشهر. التسليم خلال دقائق.",
    image: "https://via.placeholder.com/640x360?text=Spotify"
  },
  {
    id: "coins1000",
    name: "حزمة عملات 1000",
    price: 5,
    category: "عملات",
    desc: "أرسل معرفك/ID بعد الدفع وسيتم الشحن.",
    image: "https://via.placeholder.com/640x360?text=Coins+1000"
  },
  {
    id: "vip5000",
    name: "حزمة VIP 5000",
    price: 18,
    category: "عملات",
    desc: "تأكيد سريع + دعم بعد البيع.",
    image: "https://via.placeholder.com/640x360?text=VIP+5000"
  }
];

// ===== Admin Overrides =====
const OV_KEY = "admin_overrides_v2";

function loadOverrides(){
  try { return JSON.parse(localStorage.getItem(OV_KEY) || "{}"); }
  catch { return {}; }
}
function saveOverrides(obj){
  localStorage.setItem(OV_KEY, JSON.stringify(obj));
}
function resetOverrides(){
  localStorage.removeItem(OV_KEY);
}

function getEffectiveProducts(){
  const ov = loadOverrides();

  return PRODUCTS
    .map(p => {
      const o = ov[p.id] || {};
      return {
        ...p,
        name: (o.name ?? p.name),
        desc: (o.desc ?? p.desc),
        image: (o.image ?? p.image),
        category: (o.category ?? p.category),
        price: (o.price !== undefined) ? Number(o.price) : Number(p.price),
        hidden: !!o.hidden
      };
    })
    .filter(p => !p.hidden);
}

// ===== Render =====
function cardHTML(p){
  return `
  <article class="card productCard">
    <div class="productMedia">
      <img class="productImg" src="${p.image}" alt="${escapeHTML(p.name)}" loading="lazy" />
      <span class="tag tag--floating">${p.category}</span>
    </div>

    <div class="productBody">
      <h3 class="productTitle">${escapeHTML(p.name)}</h3>
      <p class="productDesc">${escapeHTML(p.desc)}</p>

      <div class="productMeta">
        <div class="priceBox">
          <span class="priceLabel">السعر</span>
          <span class="priceValue">${formatEUR(p.price)}</span>
        </div>
      </div>

      <div class="actions">
        <button class="btn buy addToCart"
          data-id="${p.id}"
          data-name="${escapeAttr(p.name)}"
          data-price="${p.price}">
          ➕ أضف للسلة
        </button>

        <a class="btn chat" href="product.html?id=${encodeURIComponent(p.id)}">
          👁️ صفحة المنتج
        </a>

        <a class="btn ghost" href="order.html?product=${encodeURIComponent(p.name)}">
          ⚡ طلب الآن
        </a>
      </div>
    </div>
  </article>`;
}

function renderProducts(list){
  const grid = document.getElementById("productsGrid");
  if(!grid) return;

  if(!list || list.length === 0){
    grid.innerHTML = `
      <div class="card emptyCard">
        <h3>لا توجد نتائج</h3>
        <p class="muted">جرّب كلمة بحث أخرى أو غيّر الفلتر.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map(cardHTML).join("");
}

function escapeHTML(s){
  return String(s).replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
}
function escapeAttr(s){
  return String(s).replace(/"/g, "&quot;");
}
function formatEUR(n){
  const x = Number(n || 0);
  return `${x}€`;
}

// ===== Filters/Search =====
document.addEventListener("DOMContentLoaded", () => {
  let currentFilter = "all";

  const input = document.getElementById("searchInput");
  const filterButtons = document.querySelectorAll(".filterBtn");

  function apply(){
    const q = (input?.value || "").trim().toLowerCase();
    const list = getEffectiveProducts();

    const filtered = list.filter(p => {
      const matchesCategory = currentFilter === "all" || p.category === currentFilter;
      const matchesSearch = !q || `${p.name} ${p.desc} ${p.category}`.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });

    renderProducts(filtered);
  }

  if(input) input.addEventListener("input", apply);

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      apply();
    });
  });

  apply();
});
