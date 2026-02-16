// ================= PRODUCTS DB (NO SERVER) =================
const LS_PRODUCTS = "products_db_v2";


const DEFAULT_PRODUCTS = [
  { id:"netflix1", name:"Netflix - شهر", priceEUR:10, category:"اشتراك", image:"https://via.placeholder.com/400x220?text=Netflix" },
  { id:"spotify1", name:"Spotify - 3 أشهر", priceEUR:8, category:"اشتراك", image:"https://via.placeholder.com/400x220?text=Spotify" },
  { id:"coins1000", name:"حزمة عملات 1000", priceEUR:5, category:"عملات", image:"https://via.placeholder.com/400x220?text=Coins" },
  { id:"vip5000", name:"حزمة VIP 5000", priceEUR:18, category:"عملات", image:"https://via.placeholder.com/400x220?text=VIP" }
];

function toast(msg){
  const t = document.getElementById("toast");
  if(!t) return alert(msg);
  t.textContent = msg;
  t.style.opacity = "1";
  t.style.transform = "translateY(0)";
  t.style.transition = "all .2s ease";
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateY(10px)";
  }, 1800);
}

function loadProducts(){
  try {
    const saved = JSON.parse(localStorage.getItem(LS_PRODUCTS));
    if(Array.isArray(saved) && saved.length) return saved;
  } catch(e){}
  localStorage.setItem(LS_PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
  return DEFAULT_PRODUCTS;
}

function saveProducts(list){
  localStorage.setItem(LS_PRODUCTS, JSON.stringify(list));
}

function getCart(){
  try { return JSON.parse(localStorage.getItem(LS_CART) || "[]"); }
  catch(e){ return []; }
}
function setCart(cart){
  localStorage.setItem(LS_CART, JSON.stringify(cart));
}
function updateCartCount(){
  const el = document.getElementById("cartCount");
  if(!el) return;
  const cart = getCart();
  const count = cart.reduce((s,i)=> s + Number(i.qty||1), 0);
  el.textContent = String(count);
}

// ===== إضافة للسلة (موحّد) =====
function addToCartById(id){
  const products = loadProducts();
  const p = products.find(x => x.id === id);
  if(!p) return;

  const cart = getCart();
  const exists = cart.find(i => i.id === p.id);

  if(exists){
    exists.qty = Number(exists.qty || 1) + 1;
  }else{
    cart.push({ id: p.id, name: p.name, priceEUR: Number(p.priceEUR), qty: 1 });
  }

  setCart(cart);
  updateCartCount();
  toast("✅ تمت الإضافة للسلة");
}

// ===== عرض المنتجات =====
function renderProducts(list){
  const grid = document.getElementById("productsGrid");
  if(!grid) return;

  if(!list.length){
    grid.innerHTML = `
      <div class="card">
        <h3>لا توجد نتائج</h3>
        <p class="desc">جرّب بحث آخر.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = list.map(p => `
    <div class="card">
      <img src="${p.image}" alt="${p.name}" style="width:100%;border-radius:12px;margin-bottom:10px;">
      <span class="tag">${p.category}</span>
      <h3>${p.name}</h3>
      <p>السعر: ${p.priceEUR}€</p>

      <div class="actions">
        <button class="btn buy addToCart" data-id="${p.id}" type="button">أضف للسلة</button>
        <a class="btn chat" href="cart.html">اذهب للسلة</a>
      </div>
    </div>
  `).join("");
}

// ===== فلاتر + بحث =====
function setupFilters(){
  const input = document.getElementById("searchInput");
  const buttons = document.querySelectorAll(".filterBtn");
  let currentFilter = "all";

  function apply(){
    const all = loadProducts();
    const q = (input?.value || "").trim().toLowerCase();

    const filtered = all.filter(p => {
      const matchesSearch = !q || `${p.name} ${p.category}`.toLowerCase().includes(q);
      const matchesCat = currentFilter === "all" || p.category === currentFilter;
      return matchesSearch && matchesCat;
    });

    renderProducts(filtered);
  }

  if(input) input.addEventListener("input", apply);

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      apply();
    });
  });

  apply();
}

// ===== Admin Panel =====
const ADMIN_PASSWORD = "1234";

function setupAdmin(){
  const adminOpen = document.getElementById("adminOpen");
  const adminModal = document.getElementById("adminModal");
  const adminClose = document.getElementById("adminClose");
  const adminLogin = document.getElementById("adminLogin");
  const adminPanel = document.getElementById("adminPanel");
  const adminPass = document.getElementById("adminPass");
  const adminEnter = document.getElementById("adminEnter");
  const adminList = document.getElementById("adminList");
  const adminSave = document.getElementById("adminSave");
  const adminReset = document.getElementById("adminReset");

  // إظهار زر الإدارة Alt + A
  document.addEventListener("keydown", (e) => {
    if(e.altKey && (e.key === "a" || e.key === "A")){
      if(adminOpen) adminOpen.style.display = "inline-block";
      toast("⚙️ تم إظهار زر الإدارة");
    }
  });

  function open(){
    if(!adminModal) return;
    adminModal.style.display = "flex";
    if(adminLogin) adminLogin.style.display = "block";
    if(adminPanel) adminPanel.style.display = "none";
    if(adminPass) adminPass.value = "";
  }
  function close(){
    if(adminModal) adminModal.style.display = "none";
  }

  function renderAdminList(){
    if(!adminList) return;
    const products = loadProducts();

    adminList.innerHTML = products.map(p => `
      <div class="admin-item" data-id="${p.id}">
        <h4>${p.name}</h4>
        <div class="admin-row">
          <input class="admin-price" type="number" step="0.01" value="${p.priceEUR}">
          <select class="admin-cat">
            <option value="اشتراك" ${p.category==="اشتراك"?"selected":""}>اشتراك</option>
            <option value="عملات" ${p.category==="عملات"?"selected":""}>عملات</option>
          </select>
        </div>
        <div class="small" style="opacity:.7;margin-top:6px;">ID: ${p.id}</div>
      </div>
    `).join("");
  }

  if(adminOpen) adminOpen.addEventListener("click", open);
  if(adminClose) adminClose.addEventListener("click", close);
  if(adminModal) adminModal.addEventListener("click", (e)=>{ if(e.target===adminModal) close(); });

  if(adminEnter) adminEnter.addEventListener("click", () => {
    const v = (adminPass?.value || "").trim();
    if(v !== ADMIN_PASSWORD){
      toast("❌ كلمة السر غير صحيحة");
      return;
    }
    if(adminLogin) adminLogin.style.display = "none";
    if(adminPanel) adminPanel.style.display = "block";
    renderAdminList();
    toast("✅ تم فتح لوحة الإدارة");
  });

  if(adminSave) adminSave.addEventListener("click", () => {
    const products = loadProducts();

    document.querySelectorAll(".admin-item").forEach(box => {
      const id = box.dataset.id;
      const price = Number(box.querySelector(".admin-price")?.value || 0);
      const cat = box.querySelector(".admin-cat")?.value || "اشتراك";

      const p = products.find(x => x.id === id);
      if(p){
        p.priceEUR = price;
        p.category = cat;
      }
    });

    saveProducts(products);
    setupFilters(); // يعيد العرض
    toast("💾 تم حفظ التعديلات");
  });

  if(adminReset) adminReset.addEventListener("click", () => {
    saveProducts(DEFAULT_PRODUCTS);
    setupFilters();
    renderAdminList();
    toast("♻️ رجعنا الافتراضي");
  });
}

// ===== ربط زر الإضافة للسلة (Event Delegation) =====
function bindAddToCartClicks(){
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".addToCart");
    if(!btn) return;
    const id = btn.dataset.id;
    if(!id) return;
    addToCartById(id);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  setupFilters();
  bindAddToCartClicks();
  setupAdmin();
});
