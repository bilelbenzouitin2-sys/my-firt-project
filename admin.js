// ===== Keys =====
const LS_PRODUCTS = "store_products_v2";
const LS_COUPONS  = "store_coupons_v1";

// ===== Password =====
const ADMIN_PASSWORD = "1234"; // غيّرها

// ===== Defaults =====
const DEFAULT_PRODUCTS = [
  { id:"netflix1", name:"Netflix - شهر", price:10, category:"اشتراك", image:"https://via.placeholder.com/800x480?text=Netflix", hidden:false },
  { id:"spotify1", name:"Spotify - 3 أشهر", price:8, category:"اشتراك", image:"https://via.placeholder.com/800x480?text=Spotify", hidden:false },
  { id:"coins1000", name:"حزمة عملات 1000", price:5, category:"عملات", image:"https://via.placeholder.com/800x480?text=Coins", hidden:false },
  { id:"vip5000", name:"حزمة VIP 5000", price:18, category:"عملات", image:"https://via.placeholder.com/800x480?text=VIP", hidden:false },
];

const DEFAULT_COUPONS = [
  // type: "percent" أو "fixed"
  { code:"SAVE10", type:"percent", value:10, active:true },
  { code:"WELCOME2", type:"fixed", value:2, active:true },
];

function $(id){ return document.getElementById(id); }

function loadJSON(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    if(!raw) return fallback;
    const data = JSON.parse(raw);
    return data ?? fallback;
  }catch(e){
    return fallback;
  }
}

function saveJSON(key, value){
  localStorage.setItem(key, JSON.stringify(value));
}

function seedIfEmpty(){
  if(!localStorage.getItem(LS_PRODUCTS)) saveJSON(LS_PRODUCTS, DEFAULT_PRODUCTS);
  if(!localStorage.getItem(LS_COUPONS))  saveJSON(LS_COUPONS,  DEFAULT_COUPONS);
}

function escapeHtml(str){
  return String(str||"")
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

function toast(msg){
  const t = $("toast");
  if(!t){ alert(msg); return; }
  t.textContent = msg;
  t.style.display = "block";
  t.style.opacity = "0";
  t.style.transform = "translateY(10px)";
  t.style.transition = "all .25s ease";
  requestAnimationFrame(() => {
    t.style.opacity = "1";
    t.style.transform = "translateY(0)";
  });
  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateY(10px)";
    setTimeout(() => t.style.display = "none", 250);
  }, 2200);
}

// ===== State =====
let products = [];
let coupons  = [];

// ===== Tabs =====
function setupTabs(){
  document.querySelectorAll(".adminTab").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".adminTab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const tab = btn.dataset.tab;
      $("productsTab").style.display = (tab === "productsTab") ? "block" : "none";
      $("couponsTab").style.display  = (tab === "couponsTab")  ? "block" : "none";
    });
  });
}

// ===== Render Products =====
function renderProducts(){
  const list = $("adminList");
  if(!list) return;

  list.innerHTML = products.map(p => `
    <div class="admin-item dragItem" draggable="true" data-id="${escapeHtml(p.id)}">
      <div class="admin-item-head">
        <div>
          <h4 style="margin:0">${escapeHtml(p.name)}</h4>
          <div class="small" style="opacity:.75">ID: <b>${escapeHtml(p.id)}</b> • ${escapeHtml(p.category)}</div>
        </div>

        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <label class="small" style="display:flex;gap:8px;align-items:center;">
            <input class="p-hidden" type="checkbox" ${p.hidden ? "checked":""}>
            إخفاء
          </label>
          <button class="btn chat danger delProduct" type="button">🗑 حذف</button>
        </div>
      </div>

      <div class="admin-row">
        <input class="p-name" value="${escapeHtml(p.name)}" placeholder="اسم المنتج">
        <input class="p-price" type="number" step="0.01" value="${Number(p.price)}" placeholder="السعر">

        <select class="p-cat">
          <option value="اشتراك" ${p.category==="اشتراك"?"selected":""}>اشتراك</option>
          <option value="عملات" ${p.category==="عملات"?"selected":""}>عملات</option>
        </select>

        <input class="p-img" value="${escapeHtml(p.image || "")}" placeholder="رابط الصورة">
      </div>

      <div class="small" style="opacity:.75;margin-top:10px">
        ↕️ اسحب هذا المنتج لترتيبه.
      </div>
    </div>
  `).join("");

  setupDragDrop();
}

function collectProductsFromUI(){
  const items = [...document.querySelectorAll(".dragItem")];
  products = items.map(box => ({
    id: box.dataset.id,
    name: box.querySelector(".p-name").value.trim() || "منتج",
    price: Number(box.querySelector(".p-price").value || 0),
    category: box.querySelector(".p-cat").value,
    image: box.querySelector(".p-img").value.trim() || "https://via.placeholder.com/800x480?text=Product",
    hidden: box.querySelector(".p-hidden").checked
  }));
}

// ===== Drag & Drop =====
let draggedId = null;

function setupDragDrop(){
  document.querySelectorAll(".dragItem").forEach(el => {
    el.addEventListener("dragstart", () => {
      draggedId = el.dataset.id;
      el.classList.add("dragging");
    });
    el.addEventListener("dragend", () => {
      el.classList.remove("dragging");
      draggedId = null;
    });

    el.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    el.addEventListener("drop", (e) => {
      e.preventDefault();
      const targetId = el.dataset.id;
      if(!draggedId || draggedId === targetId) return;

      // ترتيب: انقل dragged قبل target
      const from = products.findIndex(p => p.id === draggedId);
      const to   = products.findIndex(p => p.id === targetId);
      if(from < 0 || to < 0) return;

      const item = products.splice(from, 1)[0];
      products.splice(to, 0, item);
      renderProducts();
    });
  });
}

// ===== Render Coupons =====
function renderCoupons(){
  const list = $("couponList");
  if(!list) return;

  list.innerHTML = coupons.map((c, idx) => `
    <div class="admin-item" data-idx="${idx}">
      <div class="admin-item-head">
        <div>
          <h4 style="margin:0">CODE: ${escapeHtml(c.code)}</h4>
          <div class="small" style="opacity:.75">
            النوع: <b>${c.type === "percent" ? "نسبة %" : "مبلغ ثابت"}</b>
          </div>
        </div>

        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <label class="small" style="display:flex;gap:8px;align-items:center;">
            <input class="c-active" type="checkbox" ${c.active ? "checked":""}>
            فعال
          </label>
          <button class="btn chat danger delCoupon" type="button">🗑 حذف</button>
        </div>
      </div>

      <div class="admin-row">
        <input class="c-code" value="${escapeHtml(c.code)}" placeholder="CODE">
        <select class="c-type">
          <option value="percent" ${c.type==="percent"?"selected":""}>percent</option>
          <option value="fixed" ${c.type==="fixed"?"selected":""}>fixed</option>
        </select>
        <input class="c-value" type="number" step="0.01" value="${Number(c.value)}" placeholder="value">
        <div></div>
      </div>

      <div class="small" style="opacity:.75;margin-top:10px">
        percent = خصم % • fixed = خصم مبلغ €
      </div>
    </div>
  `).join("");
}

function collectCouponsFromUI(){
  const boxes = [...document.querySelectorAll("#couponList .admin-item")];
  coupons = boxes.map(box => ({
    code: (box.querySelector(".c-code").value || "").trim().toUpperCase(),
    type: box.querySelector(".c-type").value,
    value: Number(box.querySelector(".c-value").value || 0),
    active: box.querySelector(".c-active").checked
  })).filter(c => c.code.length > 0);
}

// ===== Events =====
document.addEventListener("DOMContentLoaded", () => {
  seedIfEmpty();
  setupTabs();

  $("adminEnter").addEventListener("click", () => {
    const v = ($("adminPass").value || "").trim();
    if(v !== ADMIN_PASSWORD){
      toast("❌ كلمة السر غير صحيحة");
      return;
    }
    $("loginBox").style.display = "none";
    $("panelBox").style.display = "block";

    products = loadJSON(LS_PRODUCTS, DEFAULT_PRODUCTS);
    coupons  = loadJSON(LS_COUPONS,  DEFAULT_COUPONS);

    renderProducts();
    renderCoupons();
    toast("✅ تم فتح الإدارة");
  });

  // Products buttons
  $("addNew").addEventListener("click", () => {
    const id = "p" + Date.now();
    products.unshift({
      id,
      name:"منتج جديد",
      price: 1,
      category:"اشتراك",
      image:"https://via.placeholder.com/800x480?text=New",
      hidden:false
    });
    renderProducts();
    toast("➕ تم إضافة منتج");
  });

  $("saveProducts").addEventListener("click", () => {
    collectProductsFromUI();
    saveJSON(LS_PRODUCTS, products);
    toast("💾 تم حفظ المنتجات");
  });

  $("resetProducts").addEventListener("click", () => {
    saveJSON(LS_PRODUCTS, DEFAULT_PRODUCTS);
    products = DEFAULT_PRODUCTS.slice();
    renderProducts();
    toast("♻️ تم الرجوع للافتراضي");
  });

  $("exportJson").addEventListener("click", () => {
    collectProductsFromUI();
    const box = $("jsonBox");
    box.classList.add("show");
    box.value = JSON.stringify(products, null, 2);
    toast("⬇️ تم تصدير JSON");
  });

  $("importJson").addEventListener("click", () => {
    const box = $("jsonBox");
    box.classList.add("show");
    const raw = (box.value || "").trim();
    if(!raw){ toast("الصق JSON أولًا"); return; }
    try{
      const data = JSON.parse(raw);
      if(!Array.isArray(data)) throw new Error("not array");
      products = data;
      renderProducts();
      toast("⬆️ تم الاستيراد (لا تنس الحفظ)");
    }catch(e){
      toast("❌ JSON غير صالح");
    }
  });

  // Coupons buttons
  $("addCoupon").addEventListener("click", () => {
    coupons.unshift({ code:"NEWCODE", type:"percent", value:5, active:true });
    renderCoupons();
    toast("➕ تم إضافة كوبون");
  });

  $("saveCoupons").addEventListener("click", () => {
    collectCouponsFromUI();
    saveJSON(LS_COUPONS, coupons);
    toast("💾 تم حفظ الكوبونات");
  });

  $("resetCoupons").addEventListener("click", () => {
    saveJSON(LS_COUPONS, DEFAULT_COUPONS);
    coupons = DEFAULT_COUPONS.slice();
    renderCoupons();
    toast("♻️ كوبونات افتراضية");
  });

  // Delete handlers
  document.addEventListener("click", (e) => {
    const delP = e.target.closest(".delProduct");
    if(delP){
      const box = delP.closest(".dragItem");
      const id = box.dataset.id;
      if(confirm("حذف هذا المنتج؟")){
        products = products.filter(p => p.id !== id);
        renderProducts();
        toast("🗑 تم حذف المنتج (لا تنس الحفظ)");
      }
      return;
    }

    const delC = e.target.closest(".delCoupon");
    if(delC){
      const box = delC.closest(".admin-item");
      const idx = Number(box.dataset.idx);
      if(confirm("حذف هذا الكوبون؟")){
        coupons.splice(idx, 1);
        renderCoupons();
        toast("🗑 تم حذف الكوبون (لا تنس الحفظ)");
      }
    }
  });
});
