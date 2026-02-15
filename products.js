// ===== Products Data =====
const PRODUCTS = [
  {
    id: "netflix1",
    name: "Netflix - شهر",
    price: 10,
    oldPrice: 12,
    category: "اشتراك",
    desc: "اشتراك لمدة شهر — التسليم بعد تأكيد الدفع.",
    badge: "🔥 الأكثر طلبًا",
    badgeType: "hot",
    image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=900&q=60"
  },
  {
    id: "spotify1",
    name: "Spotify - 3 أشهر",
    price: 8,
    oldPrice: 10,
    category: "اشتراك",
    desc: "اشتراك 3 أشهر — تسليم سريع ودعم مباشر.",
    badge: "✅ عرض",
    badgeType: "sale",
    image: "https://images.unsplash.com/photo-1616356601595-88b9b1b0d66a?auto=format&fit=crop&w=900&q=60"
  },
  {
    id: "coins1000",
    name: "حزمة عملات 1000",
    price: 5,
    oldPrice: 6,
    category: "عملات",
    desc: "بعد الدفع أرسل ID وسيتم الشحن بسرعة.",
    badge: "⚡ سريع",
    badgeType: "sale",
    image: "https://images.unsplash.com/photo-1621416538623-3d8a9d3a36d8?auto=format&fit=crop&w=900&q=60"
  },
  {
    id: "vip5000",
    name: "حزمة VIP 5000",
    price: 18,
    oldPrice: 22,
    category: "عملات",
    desc: "حزمة VIP — تأكيد سريع + دعم بعد البيع.",
    badge: "🔥 VIP",
    badgeType: "hot",
    image: "https://images.unsplash.com/photo-1622737133809-d95047b9e673?auto=format&fit=crop&w=900&q=60"
  }
];

// ===== Filters State =====
let currentFilter = "all";

// ===== Helpers =====
function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return [...document.querySelectorAll(sel)]; }

function getCart(){
  try { return JSON.parse(localStorage.getItem("cart_v1") || "[]"); }
  catch(e){ return []; }
}
function setCart(arr){
  localStorage.setItem("cart_v1", JSON.stringify(arr));
}

function calcCart(){
  const cart = getCart();
  let count = 0;
  let total = 0;
  cart.forEach(it => {
    const qty = Number(it.qty || 1);
    const price = Number(it.price || 0);
    count += qty;
    total += qty * price;
  });
  return {count, total};
}

function updateCartUI(){
  const {count, total} = calcCart();

  const cartCount = document.getElementById("cartCount");
  if(cartCount) cartCount.textContent = count;

  const bar = document.getElementById("stickyCartBar");
  const sCount = document.getElementById("stickyCount");
  const sTotal = document.getElementById("stickyTotal");
  if(bar && sCount && sTotal){
    if(count > 0){
      bar.style.display = "block";
      sCount.textContent = count;
      sTotal.textContent = `${total.toFixed(0)}€`;
    }else{
      bar.style.display = "none";
    }
  }
}

function showSkeleton(){
  const grid = document.getElementById("productsGrid");
  if(!grid) return;
  grid.innerHTML = Array.from({length: 6}).map(() => `
    <div class="skeleton">
      <div class="skImg"></div>
      <div class="skBody">
        <div class="skLine w80"></div>
        <div class="skLine w60"></div>
        <div class="skLine w40"></div>
        <div class="skLine w80"></div>
      </div>
    </div>
  `).join("");
}

function badgeClass(type){
  if(type === "hot") return "badge badgeHot";
  if(type === "sale") return "badge badgeSale";
  return "badge";
}

// ===== Render =====
function renderProducts(list){
  const grid = document.getElementById("productsGrid");
  if(!grid) return;

  if(!list || list.length === 0){
    grid.innerHTML = `
      <div class="productCard">
        <div class="productBody">
          <h3 class="productTitle">لا توجد نتائج</h3>
          <p class="productDesc">جرّب كلمة بحث أخرى أو اختر قسمًا مختلفًا.</p>
        </div>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map(p => `
    <div class="productCard">
      <img class="productImg" src="${p.image}" alt="${p.name}" loading="lazy">

      <div class="productBody">
        <div class="productTop">
          <span class="${badgeClass(p.badgeType)}">${p.badge || p.category}</span>
          <span class="badge">${p.category}</span>
        </div>

        <h3 class="productTitle">${p.name}</h3>
        <p class="productDesc">${p.desc || ""}</p>

        <div class="productPriceRow">
          <div class="priceNow">${p.price}€</div>
          ${p.oldPrice ? `<div class="priceOld">${p.oldPrice}€</div>` : ``}
        </div>

        <div class="actionsPro">
          <button class="btn buy full addToCart"
            data-id="${p.id}"
            data-name="${p.name}"
            data-price="${p.price}">
            ➕ أضف للسلة
          </button>

          <a class="btn chat full"
             href="order.html?product=${encodeURIComponent(p.name)}">
             🧾 طلب الآن
          </a>
        </div>
      </div>
    </div>
  `).join("");
}

// ===== Apply Search + Filter =====
function applyFilters(){
  const input = document.getElementById("searchInput");
  const q = (input?.value || "").trim().toLowerCase();

  let list = [...PRODUCTS];

  if(currentFilter !== "all"){
    list = list.filter(p => p.category === currentFilter);
  }
  if(q){
    list = list.filter(p => (`${p.name} ${p.category} ${p.desc || ""}`).toLowerCase().includes(q));
  }

  renderProducts(list);
}

// ===== Events =====
document.addEventListener("DOMContentLoaded", () => {
  // إحصائية بسيطة
  const stat = document.getElementById("statOrders");
  if(stat){
    const n = Math.floor(Math.random()*80) + 120;
    stat.textContent = `+${n}`;
  }

  showSkeleton();
  setTimeout(() => {
    renderProducts(PRODUCTS);
  }, 250);

  // بحث
  const input = document.getElementById("searchInput");
  if(input){
    input.addEventListener("input", applyFilters);
  }

  // فلترة Chips
  const btns = qsa(".filterBtn");
  btns.forEach(btn => {
    btn.addEventListener("click", () => {
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      applyFilters();
    });
  });

  // إضافة للسلة (Event Delegation)
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".addToCart");
    if(!b) return;

    const id = b.dataset.id;
    const name = b.dataset.name;
    const price = Number(b.dataset.price || 0);

    const cart = getCart();
    const found = cart.find(x => x.id === id);
    if(found){
      found.qty = Number(found.qty || 1) + 1;
    }else{
      cart.push({id, name, price, qty: 1});
    }
    setCart(cart);

    if(typeof window.showToast === "function"){
      window.showToast(`✅ تمت إضافة "${name}" للسلة`);
    }else{
      alert("تمت الإضافة للسلة");
    }

    updateCartUI();
  });

  updateCartUI();
});
