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
// ===== Admin Overrides (localStorage) =====
const LS_KEY = "admin_overrides_v1";

function loadOverrides(){
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); }
  catch(e){ return {}; }
}

function saveOverrides(obj){
  localStorage.setItem(LS_KEY, JSON.stringify(obj));
}

function resetOverrides(){
  localStorage.removeItem(LS_KEY);
}

// دمج المنتجات الأصلية مع التعديلات
function getEffectiveProducts(){
  const ov = loadOverrides();
  return PRODUCTS
    .map(p => {
      const o = ov[p.id] || {};
      return {
        ...p,
        price: (o.price !== undefined) ? Number(o.price) : p.price,
        hidden: (o.hidden !== undefined) ? !!o.hidden : false
      };
    })
    .filter(p => !p.hidden);
}

// توليد الكروت
function renderProducts(list = getEffectiveProducts()){
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

  renderProducts(getEffectiveProducts());


  let currentFilter = "all";

  const input = document.getElementById("searchInput");
  const filterButtons = document.querySelectorAll(".filterBtn");

  function applyFilters(){

    const q = (input?.value || "").trim().toLowerCase();


    const filtered = getEffectiveProducts().filter(p => { ... })


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
    // ===== Admin UI =====
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

  // إظهار زر الإدارة عند Alt + A
  document.addEventListener("keydown", (e) => {
    if(e.altKey && (e.key === "a" || e.key === "A")){
      if(adminOpen) adminOpen.style.display = "inline-block";
      if(typeof window.showToast === "function") window.showToast("⚙️ تم إظهار زر الإدارة");
    }
  });

  function openAdmin(){
    if(!adminModal) return;
    adminModal.style.display = "flex";
    // رجّع لحالة تسجيل الدخول
    if(adminLogin) adminLogin.style.display = "block";
    if(adminPanel) adminPanel.style.display = "none";
    if(adminPass) adminPass.value = "";
  }

  function closeAdmin(){
    if(adminModal) adminModal.style.display = "none";
  }

  function renderAdminList(){
    if(!adminList) return;

    const ov = loadOverrides();
    adminList.innerHTML = PRODUCTS.map(p => {
      const o = ov[p.id] || {};
      const priceVal = (o.price !== undefined) ? o.price : p.price;
      const hiddenVal = (o.hidden === true);

      return `
        <div class="admin-item" data-id="${p.id}">
          <h4>${p.name}</h4>
          <div class="admin-row">
            <input class="admin-price" type="number" step="0.01" value="${priceVal}">
            <label class="small" style="display:flex;gap:6px;align-items:center;">
              <input class="admin-hidden" type="checkbox" ${hiddenVal ? "checked" : ""}>
              إخفاء المنتج
            </label>
          </div>
          <div class="small" style="opacity:.7;margin-top:6px;">التصنيف: ${p.category}</div>
        </div>
      `;
    }).join("");
  }

  if(adminOpen) adminOpen.addEventListener("click", openAdmin);
  if(adminClose) adminClose.addEventListener("click", closeAdmin);
  if(adminModal) adminModal.addEventListener("click", (e) => {
    if(e.target === adminModal) closeAdmin();
  });

  // كلمة السر (غيّرها كما تريد)
  const ADMIN_PASSWORD = "1234";

  if(adminEnter) adminEnter.addEventListener("click", () => {
    const v = (adminPass?.value || "").trim();
    if(v !== ADMIN_PASSWORD){
      if(typeof window.showToast === "function") window.showToast("❌ كلمة السر غير صحيحة");
      else alert("كلمة السر غير صحيحة");
      return;
    }
    if(adminLogin) adminLogin.style.display = "none";
    if(adminPanel) adminPanel.style.display = "block";
    renderAdminList();
  });

  if(adminSave) adminSave.addEventListener("click", () => {
    const ov = loadOverrides();

    document.querySelectorAll(".admin-item").forEach(box => {
      const id = box.dataset.id;
      const price = box.querySelector(".admin-price")?.value;
      const hidden = box.querySelector(".admin-hidden")?.checked;

      ov[id] = {
        price: Number(price),
        hidden: !!hidden
      };
    });

    saveOverrides(ov);

    // تحديث العرض في الصفحة
    applyFilters(); // لأن عندك بحث/فلترة
    if(typeof window.showToast === "function") window.showToast("✅ تم حفظ التعديلات");
  });

  if(adminReset) adminReset.addEventListener("click", () => {
    resetOverrides();
    renderAdminList();
    applyFilters();
    if(typeof window.showToast === "function") window.showToast("♻️ تم إرجاع الافتراضي");
  });


});
