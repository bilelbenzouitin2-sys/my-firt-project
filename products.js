// ================== BASE PRODUCTS ==================
const BASE_PRODUCTS = [
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

// ================== STORAGE ==================
const LS_PRODUCTS = "products_db_v1";   // products with admin edits (full objects)
const LS_CART = "cart_v1";

// ================== STATE ==================
let currentFilter = "all";

// ================== HELPERS ==================
function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return [...document.querySelectorAll(sel)]; }

function getCart(){
  try { return JSON.parse(localStorage.getItem(LS_CART) || "[]"); }
  catch(e){ return []; }
}
function setCart(arr){
  localStorage.setItem(LS_CART, JSON.stringify(arr));
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

function badgeClass(type){
  if(type === "hot") return "badge badgeHot";
  if(type === "sale") return "badge badgeSale";
  return "badge";
}

function uid(){
  return "p_" + Math.random().toString(16).slice(2,10) + Date.now().toString(16).slice(2);
}

// ================== PRODUCTS DB ==================
function loadProductsDB(){
  try{
    const v = localStorage.getItem(LS_PRODUCTS);
    if(!v){
      localStorage.setItem(LS_PRODUCTS, JSON.stringify(BASE_PRODUCTS));
      return [...BASE_PRODUCTS];
    }
    const arr = JSON.parse(v || "[]");
    if(!Array.isArray(arr) || arr.length === 0){
      localStorage.setItem(LS_PRODUCTS, JSON.stringify(BASE_PRODUCTS));
      return [...BASE_PRODUCTS];
    }
    return arr;
  }catch(e){
    localStorage.setItem(LS_PRODUCTS, JSON.stringify(BASE_PRODUCTS));
    return [...BASE_PRODUCTS];
  }
}
function saveProductsDB(list){
  localStorage.setItem(LS_PRODUCTS, JSON.stringify(list));
}
function resetProductsDB(){
  localStorage.setItem(LS_PRODUCTS, JSON.stringify(BASE_PRODUCTS));
}

// ================== RENDER PRODUCTS ==================
function renderProducts(list){
  const grid = document.getElementById("productsGrid");
  if(!grid) return;

  const visible = (list || []).filter(p => !p.hidden);

  if(visible.length === 0){
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

  grid.innerHTML = visible.map(p => `
    <div class="productCard">
      <img class="productImg" src="${p.image}" alt="${p.name}" loading="lazy">
      <div class="productBody">
        <div class="productTop">
          <span class="${badgeClass(p.badgeType)}">${p.badge || "⭐"}</span>
          <span class="badge">${p.category}</span>
        </div>

        <h3 class="productTitle">${p.name}</h3>
        <p class="productDesc">${p.desc || ""}</p>

        <div class="productPriceRow">
          <div class="priceNow">${Number(p.price || 0)}€</div>
          ${p.oldPrice ? `<div class="priceOld">${Number(p.oldPrice)}€</div>` : ``}
        </div>

        <div class="actionsPro">
          <button class="btn buy full addToCart"
            data-id="${p.id}"
            data-name="${p.name}"
            data-price="${Number(p.price || 0)}">
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

// ================== FILTERS ==================
function applyFilters(db){
  const input = document.getElementById("searchInput");
  const q = (input?.value || "").trim().toLowerCase();

  let list = [...db];

  if(currentFilter !== "all"){
    list = list.filter(p => p.category === currentFilter);
  }
  if(q){
    list = list.filter(p => (`${p.name} ${p.category} ${p.desc || ""}`).toLowerCase().includes(q));
  }

  renderProducts(list);
}

// ================== ADMIN UI ==================
function openAdmin(){
  const modal = document.getElementById("adminModal");
  if(modal) modal.style.display = "flex";

  const login = document.getElementById("adminLogin");
  const panel = document.getElementById("adminPanel");
  if(login) login.style.display = "block";
  if(panel) panel.style.display = "none";

  const pass = document.getElementById("adminPass");
  if(pass) pass.value = "";
}

function closeAdmin(){
  const modal = document.getElementById("adminModal");
  if(modal) modal.style.display = "none";
}

function renderAdminList(db){
  const list = document.getElementById("adminList");
  if(!list) return;

  list.innerHTML = db.map(p => `
    <div class="admin-item" data-id="${p.id}">
      <h4>${p.name}</h4>

      <div class="admin-split">
        <input class="admin-field a-name" placeholder="الاسم" value="${p.name}">
        <input class="admin-field a-price" type="number" step="0.01" placeholder="السعر" value="${Number(p.price || 0)}">
      </div>

      <div class="admin-split" style="margin-top:8px">
        <input class="admin-field a-old" type="number" step="0.01" placeholder="سعر قديم (اختياري)" value="${p.oldPrice ?? ""}">
        <input class="admin-field a-cat" placeholder="التصنيف (اشتراك/عملات)" value="${p.category}">
      </div>

      <input class="admin-field a-img" style="margin-top:8px" placeholder="رابط الصورة" value="${p.image}">
      <input class="admin-field a-badge" style="margin-top:8px" placeholder="Badge (مثال: 🔥 VIP)" value="${p.badge || ""}">
      <input class="admin-field a-btype" style="margin-top:8px" placeholder='badgeType (hot/sale/none)' value="${p.badgeType || ""}">

      <textarea class="admin-field a-desc" style="margin-top:8px;min-height:70px" placeholder="الوصف">${p.desc || ""}</textarea>

      <div class="admin-row" style="margin-top:10px;justify-content:space-between;">
        <label class="small" style="display:flex;gap:8px;align-items:center;">
          <input class="a-hide" type="checkbox" ${p.hidden ? "checked" : ""}>
          إخفاء المنتج
        </label>

        <button class="btn admin-danger a-del" type="button">🗑️ حذف</button>
      </div>
    </div>
  `).join("");
}

function collectAdminEdits(db){
  const map = new Map(db.map(p => [p.id, {...p}]));

  qsa(".admin-item").forEach(box => {
    const id = box.dataset.id;
    const p = map.get(id);
    if(!p) return;

    p.name = box.querySelector(".a-name")?.value?.trim() || p.name;
    p.price = Number(box.querySelector(".a-price")?.value || 0);

    const oldVal = box.querySelector(".a-old")?.value;
    p.oldPrice = oldVal === "" ? null : Number(oldVal);

    p.category = box.querySelector(".a-cat")?.value?.trim() || p.category;
    p.image = box.querySelector(".a-img")?.value?.trim() || p.image;

    p.badge = box.querySelector(".a-badge")?.value?.trim() || "";
    p.badgeType = box.querySelector(".a-btype")?.value?.trim() || "";

    p.desc = box.querySelector(".a-desc")?.value || "";
    p.hidden = !!box.querySelector(".a-hide")?.checked;
  });

  return [...map.values()];
}

// ================== INIT ==================
document.addEventListener("DOMContentLoaded", () => {
  // Fake stats
  const stat = document.getElementById("statOrders");
  if(stat){
    const n = Math.floor(Math.random()*80) + 120;
    stat.textContent = `+${n}`;
  }

  // Load DB
  let db = loadProductsDB();

  // Render
  renderProducts(db);
  updateCartUI();

  // Search
  const input = document.getElementById("searchInput");
  if(input){
    input.addEventListener("input", () => {
      db = loadProductsDB();
      applyFilters(db);
    });
  }

  // Filter buttons
  const btns = qsa(".filterBtn");
  btns.forEach(btn => {
    btn.addEventListener("click", () => {
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      db = loadProductsDB();
      applyFilters(db);
    });
  });

  // Add to cart (delegation)
  document.addEventListener("click", (e) => {
    const add = e.target.closest(".addToCart");
    if(add){
      const id = add.dataset.id;
      const name = add.dataset.name;
      const price = Number(add.dataset.price || 0);

      const cart = getCart();
      const found = cart.find(x => x.id === id);
      if(found) found.qty = Number(found.qty || 1) + 1;
      else cart.push({id, name, price, qty: 1});

      setCart(cart);

      if(typeof window.showToast === "function") window.showToast(`✅ تمت إضافة "${name}" للسلة`);
      else alert("تمت الإضافة للسلة");

      updateCartUI();
      return;
    }

    // Admin delete
    const del = e.target.closest(".a-del");
    if(del){
      const item = del.closest(".admin-item");
      const id = item?.dataset?.id;
      if(!id) return;

      const ok = confirm("هل تريد حذف هذا المنتج؟");
      if(!ok) return;

      const cur = loadProductsDB().filter(p => p.id !== id);
      saveProductsDB(cur);
      renderAdminList(cur);
      applyFilters(cur);
      return;
    }
  });

  // Reset all (local)
  const resetAll = document.getElementById("resetAll");
  if(resetAll){
    resetAll.addEventListener("click", () => {
      const ok = confirm("إعادة ضبط المنتجات للافتراضي في هذا المتصفح؟");
      if(!ok) return;
      resetProductsDB();
      db = loadProductsDB();
      applyFilters(db);
      if(typeof window.showToast === "function") window.showToast("♻️ تم إعادة الضبط");
    });
  }

  // Admin modal open/close
  const adminOpen = document.getElementById("adminOpen");
  const adminClose = document.getElementById("adminClose");
  const adminModal = document.getElementById("adminModal");

  if(adminOpen) adminOpen.addEventListener("click", openAdmin);
  if(adminClose) adminClose.addEventListener("click", closeAdmin);
  if(adminModal) adminModal.addEventListener("click", (e) => {
    if(e.target === adminModal) closeAdmin();
  });

  // Admin login
  const ADMIN_PASSWORD = "1234"; // غيّرها كما تريد

  const adminEnter = document.getElementById("adminEnter");
  if(adminEnter){
    adminEnter.addEventListener("click", () => {
      const v = (qs("#adminPass")?.value || "").trim();
      if(v !== ADMIN_PASSWORD){
        if(typeof window.showToast === "function") window.showToast("❌ كلمة السر غير صحيحة");
        else alert("كلمة السر غير صحيحة");
        return;
      }
      qs("#adminLogin").style.display = "none";
      qs("#adminPanel").style.display = "block";

      db = loadProductsDB();
      renderAdminList(db);
    });
  }

  // Admin add product
  const adminAdd = document.getElementById("adminAdd");
  if(adminAdd){
    adminAdd.addEventListener("click", () => {
      db = loadProductsDB();
      db.unshift({
        id: uid(),
        name: "منتج جديد",
        price: 0,
        oldPrice: null,
        category: "اشتراك",
        desc: "وصف المنتج…",
        badge: "🆕 جديد",
        badgeType: "sale",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=60",
        hidden: false
      });
      saveProductsDB(db);
      renderAdminList(db);
      applyFilters(db);
      if(typeof window.showToast === "function") window.showToast("➕ تمت إضافة منتج جديد");
    });
  }

  // Admin save/reset
  const adminSave = document.getElementById("adminSave");
  const adminReset = document.getElementById("adminReset");

  if(adminSave){
    adminSave.addEventListener("click", () => {
      db = loadProductsDB();
      const updated = collectAdminEdits(db);
      saveProductsDB(updated);
      applyFilters(updated);
      if(typeof window.showToast === "function") window.showToast("✅ تم حفظ التعديلات");
      else alert("تم الحفظ");
    });
  }

  if(adminReset){
    adminReset.addEventListener("click", () => {
      const ok = confirm("إرجاع المنتجات للافتراضي؟");
      if(!ok) return;
      resetProductsDB();
      db = loadProductsDB();
      renderAdminList(db);
      applyFilters(db);
      if(typeof window.showToast === "function") window.showToast("♻️ تم الإرجاع");
    });
  }
});
