// ================== BASE PRODUCTS (with multi-currency) ==================
const BASE_PRODUCTS = [
  {
    id: "netflix1",
    name: "Netflix - شهر",
    priceEUR: 10,
    oldPriceEUR: 12,
    category: "اشتراك",
    desc: "اشتراك لمدة شهر — التسليم بعد تأكيد الدفع.",
    image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?auto=format&fit=crop&w=900&q=60"
  },
  {
    id: "spotify1",
    name: "Spotify - 3 أشهر",
    priceEUR: 8,
    oldPriceEUR: 10,
    category: "اشتراك",
    desc: "اشتراك 3 أشهر — تسليم سريع ودعم مباشر.",
    image: "https://images.unsplash.com/photo-1616356601595-88b9b1b0d66a?auto=format&fit=crop&w=900&q=60"
  },
  {
    id: "coins1000",
    name: "حزمة عملات 1000",
    priceEUR: 5,
    oldPriceEUR: 6,
    category: "عملات",
    desc: "بعد الدفع أرسل ID وسيتم الشحن بسرعة.",
    image: "https://images.unsplash.com/photo-1621416538623-3d8a9d3a36d8?auto=format&fit=crop&w=900&q=60"
  },
  {
    id: "vip5000",
    name: "حزمة VIP 5000",
    priceEUR: 18,
    oldPriceEUR: 22,
    category: "عملات",
    desc: "حزمة VIP — تأكيد سريع + دعم بعد البيع.",
    image: "https://images.unsplash.com/photo-1622737133809-d95047b9e673?auto=format&fit=crop&w=900&q=60"
  }
];

// ================== STORAGE ==================
const LS_PRODUCTS = "products_db_v2";   // upgraded db
const LS_CART = "cart_v1";
const LS_SALES = "sales_counter_v1";
const LS_CURRENCY = "currency_pref_v1";
// ================== CURRENCY (AUTO RATES) ==================
const LS_CURRENCY = "currency_pref_v1";
const FX_CACHE_KEY = "fx_rates_cache_v1";

// العملات التي تريد عرضها
const CURRENCIES = {
  EUR: { symbol: "€" },
  TND: { symbol: "د.ت" },
  USD: { symbol: "$" }
};

function getCurrency(){
  return localStorage.getItem(LS_CURRENCY) || "EUR";
}
function setCurrency(code){
  localStorage.setItem(LS_CURRENCY, code);
}

// تحميل الكاش (إن وجد)
function loadFxCache(){
  try { return JSON.parse(localStorage.getItem(FX_CACHE_KEY) || "null"); }
  catch(e){ return null; }
}
function saveFxCache(obj){
  localStorage.setItem(FX_CACHE_KEY, JSON.stringify(obj));
}

// جلب أسعار الصرف من الإنترنت (Base: EUR)
async function refreshFxRatesIfNeeded(){
  const cache = loadFxCache();
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  // إذا عندنا كاش جديد (أقل من 24 ساعة) لا نعيد التحميل
  if(cache && cache.timestamp && (now - cache.timestamp) < ONE_DAY && cache.rates){
    return cache;
  }

  // تحميل جديد
  try{
    const res = await fetch("https://open.er-api.com/v6/latest/eur", { cache: "no-store" });
    const data = await res.json();

    // تأكد من نجاح الاستجابة
    if(data && data.result === "success" && data.base_code === "EUR" && data.rates){
      const obj = {
        timestamp: now,
        rates: data.rates
      };
      saveFxCache(obj);
      return obj;
    }
  }catch(err){
    // تجاهل
  }

  // في حال فشل التحميل: رجع آخر كاش لو موجود
  return cache || { timestamp: now, rates: { EUR: 1 } };
}

// نحصل على سعر عملة مقابل EUR
function rateFromEUR(code){
  const cache = loadFxCache();
  if(!cache || !cache.rates) return (code === "EUR" ? 1 : 0);

  // API يعطي rates بحيث: 1 EUR = rates[CODE]
  const r = cache.rates[code];
  if(!r) return (code === "EUR" ? 1 : 0);
  return Number(r);
}

// تحويل السعر من EUR إلى العملة المختارة وعرضه
function moneyFromEUR(eur){
  const code = getCurrency();
  const symbol = (CURRENCIES[code]?.symbol || "€");
  const rate = rateFromEUR(code) || 1;

  const v = Number(eur || 0) * rate;

  // تنسيق حسب العملة (TND نعطيها رقمين)
  const rounded = (code === "TND") ? v.toFixed(2) : v.toFixed(0);
  return { code, symbol, value: Number(rounded), text: `${rounded}${symbol}` };
}

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
  let totalEUR = 0;
  cart.forEach(it => {
    const qty = Number(it.qty || 1);
    const priceEUR = Number(it.priceEUR ?? it.price ?? 0);
    count += qty;
    totalEUR += qty * priceEUR;
  });
  const total = moneyFromEUR(totalEUR);
  return {count, totalEUR, total};
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
      sTotal.textContent = total.text;
    }else{
      bar.style.display = "none";
    }
  }
}

function uid(){
  return "p_" + Math.random().toString(16).slice(2,10) + Date.now().toString(16).slice(2);
}

// ================== SALES (best seller) ==================
function loadSales(){
  try { return JSON.parse(localStorage.getItem(LS_SALES) || "{}"); }
  catch(e){ return {}; }
}
function incSale(productId){
  const s = loadSales();
  s[productId] = Number(s[productId] || 0) + 1;
  localStorage.setItem(LS_SALES, JSON.stringify(s));
}
function topSellerId(){
  const s = loadSales();
  let topId = null;
  let topVal = -1;
  Object.keys(s).forEach(id => {
    const v = Number(s[id] || 0);
    if(v > topVal){
      topVal = v; topId = id;
    }
  });
  return { topId, topVal };
}

// ================== PRODUCTS DB ==================
function normalizeProduct(p){
  // دعم النسخ القديمة: price -> priceEUR
  const priceEUR = (p.priceEUR !== undefined) ? Number(p.priceEUR) : Number(p.price || 0);
  const oldPriceEUR = (p.oldPriceEUR !== undefined) ? p.oldPriceEUR : (p.oldPrice ?? null);

  return {
    id: p.id || uid(),
    name: p.name || "منتج",
    priceEUR: Number(priceEUR || 0),
    oldPriceEUR: (oldPriceEUR === "" || oldPriceEUR === undefined) ? null : (oldPriceEUR === null ? null : Number(oldPriceEUR)),
    category: p.category || "اشتراك",
    desc: p.desc || "",
    image: p.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=60",
    hidden: !!p.hidden
  };
}

function loadProductsDB(){
  try{
    const v = localStorage.getItem(LS_PRODUCTS);
    if(!v){
      const seed = BASE_PRODUCTS.map(normalizeProduct);
      localStorage.setItem(LS_PRODUCTS, JSON.stringify(seed));
      return seed;
    }
    const arr = JSON.parse(v || "[]");
    if(!Array.isArray(arr) || arr.length === 0){
      const seed = BASE_PRODUCTS.map(normalizeProduct);
      localStorage.setItem(LS_PRODUCTS, JSON.stringify(seed));
      return seed;
    }
    return arr.map(normalizeProduct);
  }catch(e){
    const seed = BASE_PRODUCTS.map(normalizeProduct);
    localStorage.setItem(LS_PRODUCTS, JSON.stringify(seed));
    return seed;
  }
}
function saveProductsDB(list){
  localStorage.setItem(LS_PRODUCTS, JSON.stringify(list.map(normalizeProduct)));
}
function resetProductsDB(){
  const seed = BASE_PRODUCTS.map(normalizeProduct);
  localStorage.setItem(LS_PRODUCTS, JSON.stringify(seed));
}

// ================== BADGE LOGIC ==================
function computeBadges(db){
  const { topId, topVal } = topSellerId();
  const out = db.map(p => ({...p}));

  // تمييز الأعلى مبيعاً (إذا عنده مبيعات)
  if(topId && topVal > 0){
    const idx = out.findIndex(x => x.id === topId);
    if(idx >= 0){
      out[idx].badge = "🔥 الأكثر مبيعًا";
      out[idx].badgeType = "hot";
    }
  }

  // تمييز المنتجات التي فيها خصم
  out.forEach(p => {
    if(p.oldPriceEUR && Number(p.oldPriceEUR) > Number(p.priceEUR)){
      // إذا ليس أفضل مبيعًا
      if(p.badge !== "🔥 الأكثر مبيعًا"){
        p.badge = "✅ عرض";
        p.badgeType = "sale";
      }
    }
  });

  return out;
}

function badgeClass(type){
  if(type === "hot") return "badge badgeHot";
  if(type === "sale") return "badge badgeSale";
  return "badge";
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

  grid.innerHTML = visible.map(p => {
    const price = moneyFromEUR(p.priceEUR);
    const old = p.oldPriceEUR ? moneyFromEUR(p.oldPriceEUR) : null;

    return `
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
            <div class="priceNow">${price.text}</div>
            ${old ? `<div class="priceOld">${old.text}</div>` : ``}
          </div>

          <div class="actionsPro">
            <button class="btn buy full addToCart"
              data-id="${p.id}"
              data-name="${p.name}"
              data-price-eur="${Number(p.priceEUR)}">
              ➕ أضف للسلة
            </button>

            <a class="btn chat full"
              href="order.html?product=${encodeURIComponent(p.name)}">
              🧾 طلب الآن
            </a>
          </div>
        </div>
      </div>
    `;
  }).join("");
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
        <input class="admin-field a-price" type="number" step="0.01" placeholder="السعر (EUR)" value="${Number(p.priceEUR || 0)}">
      </div>

      <div class="admin-split" style="margin-top:8px">
        <input class="admin-field a-old" type="number" step="0.01" placeholder="سعر قديم EUR (اختياري)" value="${p.oldPriceEUR ?? ""}">
        <input class="admin-field a-cat" placeholder="التصنيف (اشتراك/عملات)" value="${p.category}">
      </div>

      <input class="admin-field a-img" style="margin-top:8px" placeholder="رابط الصورة" value="${p.image}">
      <textarea class="admin-field a-desc" style="margin-top:8px;min-height:70px" placeholder="الوصف">${p.desc || ""}</textarea>

      <div class="admin-row" style="margin-top:10px;justify-content:space-between;">
        <label class="small" style="display:flex;gap:8px;align-items:center;">
          <input class="a-hide" type="checkbox" ${p.hidden ? "checked" : ""}>
          إخفاء المنتج
        </label>

        <button class="btn admin-danger a-del" type="button">🗑️ حذف</button>
      </div>

      <div class="small" style="opacity:.7;margin-top:8px">
        مبيعات (محلي): <b>${Number(loadSales()[p.id] || 0)}</b>
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
    p.priceEUR = Number(box.querySelector(".a-price")?.value || 0);

    const oldVal = box.querySelector(".a-old")?.value;
    p.oldPriceEUR = oldVal === "" ? null : Number(oldVal);

    p.category = box.querySelector(".a-cat")?.value?.trim() || p.category;
    p.image = box.querySelector(".a-img")?.value?.trim() || p.image;
    p.desc = box.querySelector(".a-desc")?.value || "";
    p.hidden = !!box.querySelector(".a-hide")?.checked;
  });

  return [...map.values()];
}

// ================== CURRENCY UI (inject small selector) ==================
function ensureCurrencyUI(){
  // نضيف اختيار العملة داخل heroCard إن لم يوجد
  const heroCard = document.querySelector(".heroCard");
  if(!heroCard) return;
  if(document.getElementById("currencySelect")) return;

  const wrap = document.createElement("div");
  wrap.className = "currencyRow";
  wrap.innerHTML = `
    <div class="currencyLabel">العملة:</div>
    <select id="currencySelect" class="currencySelect">
      <option value="EUR">EUR (€)</option>
      <option value="TND">TND (د.ت)</option>
      <option value="USD">USD ($)</option>
    </select>
  `;
  heroCard.appendChild(wrap);

  const sel = document.getElementById("currencySelect");
  if(sel){
    sel.value = getCurrency();
    sel.addEventListener("change", () => {
      setCurrency(sel.value);
      // إعادة عرض المنتجات بالعملة الجديدة
      const db = computeBadges(loadProductsDB());
      applyFilters(db);
      updateCartUI();
      if(typeof window.showToast === "function") window.showToast("💱 تم تغيير العملة");
    });
  }
}

// ================== INIT ==================
document.addEventListener("DOMContentLoaded", () => {
    // ✅ تحميل/تحديث أسعار الصرف مرة يوميًا
  refreshFxRatesIfNeeded().then(() => {
    // بعد التحميل، حدّث العرض (منتجات + سلة)
    const db = computeBadges(loadProductsDB());
    applyFilters(db);
    updateCartUI();
  });

  // Load DB
  let db = loadProductsDB();
  db = computeBadges(db);

  ensureCurrencyUI();

  // Render
  applyFilters(db);
  updateCartUI();

  // Search
  const input = document.getElementById("searchInput");
  if(input){
    input.addEventListener("input", () => {
      db = computeBadges(loadProductsDB());
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
      db = computeBadges(loadProductsDB());
      applyFilters(db);
    });
  });

  // Clicks (Add to cart + Admin delete)
  document.addEventListener("click", (e) => {
    const add = e.target.closest(".addToCart");
    if(add){
      const id = add.dataset.id;
      const name = add.dataset.name;
      const priceEUR = Number(add.dataset.priceEur || 0);

      // cart item stores EUR base, and we render currency dynamically
      const cart = getCart();
      const found = cart.find(x => x.id === id);
      if(found) found.qty = Number(found.qty || 1) + 1;
      else cart.push({id, name, priceEUR, qty: 1});
      setCart(cart);

      // زيادة عداد المبيعات (محلي)
      incSale(id);

      if(typeof window.showToast === "function") window.showToast(`✅ تمت إضافة "${name}" للسلة`);
      updateCartUI();

      // إعادة عرض المنتجات لتحديث "الأكثر مبيعًا"
      db = computeBadges(loadProductsDB());
      applyFilters(db);
      return;
    }

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
      db = computeBadges(loadProductsDB());
      applyFilters(db);
      return;
    }
  });

  // Reset all products
  const resetAll = document.getElementById("resetAll");
  if(resetAll){
    resetAll.addEventListener("click", () => {
      const ok = confirm("إعادة ضبط المنتجات للافتراضي في هذا المتصفح؟");
      if(!ok) return;
      resetProductsDB();
      db = computeBadges(loadProductsDB());
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
  if(adminModal) adminModal.addEventListener("click", (ev) => {
    if(ev.target === adminModal) closeAdmin();
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

      const cur = loadProductsDB();
      renderAdminList(cur);
    });
  }

  // Admin add product
  const adminAdd = document.getElementById("adminAdd");
  if(adminAdd){
    adminAdd.addEventListener("click", () => {
      const cur = loadProductsDB();
      cur.unshift(normalizeProduct({
        id: uid(),
        name: "منتج جديد",
        priceEUR: 0,
        oldPriceEUR: null,
        category: "اشتراك",
        desc: "وصف المنتج…",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=60",
        hidden: false
      }));
      saveProductsDB(cur);
      renderAdminList(cur);
      db = computeBadges(loadProductsDB());
      applyFilters(db);
      if(typeof window.showToast === "function") window.showToast("➕ تمت إضافة منتج جديد");
    });
  }

  // Admin save/reset
  const adminSave = document.getElementById("adminSave");
  const adminReset = document.getElementById("adminReset");

  if(adminSave){
    adminSave.addEventListener("click", () => {
      const cur = loadProductsDB();
      const updated = collectAdminEdits(cur);
      saveProductsDB(updated);
      db = computeBadges(loadProductsDB());
      applyFilters(db);
      if(typeof window.showToast === "function") window.showToast("✅ تم حفظ التعديلات");
    });
  }

  if(adminReset){
    adminReset.addEventListener("click", () => {
      const ok = confirm("إرجاع المنتجات للافتراضي؟");
      if(!ok) return;
      resetProductsDB();
      const cur = loadProductsDB();
      renderAdminList(cur);
      db = computeBadges(cur);
      applyFilters(db);
      if(typeof window.showToast === "function") window.showToast("♻️ تم الإرجاع");
    });
  }
});
