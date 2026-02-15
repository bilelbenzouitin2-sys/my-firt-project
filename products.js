const PRODUCTS = [
  { id: "netflix1", name: "Netflix - شهر", price: 10, category: "اشتراك" },
  { id: "spotify1", name: "Spotify - 3 أشهر", price: 8, category: "اشتراك" },
  { id: "coins1000", name: "حزمة عملات 1000", price: 5, category: "عملات" },
  { id: "vip5000", name: "حزمة VIP 5000", price: 18, category: "عملات" }
];

const LS_KEY = "admin_data";

function loadAdmin(){
  return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
}

function saveAdmin(data){
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

function resetAdmin(){
  localStorage.removeItem(LS_KEY);
}

function getProducts(){
  const admin = loadAdmin();
  return PRODUCTS.map(p=>{
    if(admin[p.id]){
      return {...p, ...admin[p.id]};
    }
    return p;
  }).filter(p=>!p.hidden);
}

function renderProducts(list = getProducts()){
  const grid = document.getElementById("productsGrid");
  if(!grid) return;

  if(list.length === 0){
    grid.innerHTML = `<div class="card"><h3>لا توجد نتائج</h3></div>`;
    return;
  }

  grid.innerHTML = list.map(p=>`
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

document.addEventListener("DOMContentLoaded", () => {

  renderProducts();

  const input = document.getElementById("searchInput");
  const buttons = document.querySelectorAll(".filterBtn");
  let currentFilter = "all";

  function applyFilters(){
    const q = input.value.trim().toLowerCase();
    const list = getProducts().filter(p=>{
      const matchesSearch = !q || p.name.toLowerCase().includes(q);
      const matchesCat = currentFilter === "all" || p.category === currentFilter;
      return matchesSearch && matchesCat;
    });
    renderProducts(list);
  }

  input.addEventListener("input", applyFilters);

  buttons.forEach(btn=>{
    btn.addEventListener("click", ()=>{
      buttons.forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      applyFilters();
    });
  });

  // ===== Admin =====
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

  document.addEventListener("keydown", (e)=>{
    if(e.altKey && (e.key==="a" || e.key==="A")){
      adminOpen.style.display = "inline-block";
    }
  });

  adminOpen.onclick = ()=> adminModal.style.display="flex";
  adminClose.onclick = ()=> adminModal.style.display="none";
  adminModal.onclick = e=>{ if(e.target===adminModal) adminModal.style.display="none"; };

  const PASSWORD = "1234";

  adminEnter.onclick = ()=>{
    if(adminPass.value !== PASSWORD){
      alert("كلمة السر خطأ");
      return;
    }
    adminLogin.style.display="none";
    adminPanel.style.display="block";
    renderAdmin();
  };

  function renderAdmin(){
    const admin = loadAdmin();
    adminList.innerHTML = PRODUCTS.map(p=>{
      const data = admin[p.id] || {};
      return `
        <div style="margin-bottom:15px;">
          <strong>${p.name}</strong><br>
          <input data-id="${p.id}" class="priceInput" type="number" value="${data.price || p.price}">
          <label>
            <input type="checkbox" data-id="${p.id}" class="hideInput" ${data.hidden ? "checked":""}>
            إخفاء
          </label>
        </div>
      `;
    }).join("");
  }

  adminSave.onclick = ()=>{
    const newData = {};
    document.querySelectorAll(".priceInput").forEach(input=>{
      const id = input.dataset.id;
      const price = Number(input.value);
      const hidden = document.querySelector(`.hideInput[data-id="${id}"]`).checked;
      newData[id] = {price, hidden};
    });
    saveAdmin(newData);
    renderProducts();
    alert("تم الحفظ");
  };

  adminReset.onclick = ()=>{
    resetAdmin();
    renderProducts();
    renderAdmin();
  };

});
