const CART_KEY = "cart_v1";
const LS_COUPONS = "store_coupons_v1";
const ACTIVE_COUPON_KEY = "active_coupon_v1";

function loadCart(){
  try{
    const data = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  }catch(e){
    return [];
  }
}

function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount(){
  const cart = loadCart();
  const count = cart.reduce((s,i) => s + (i.qty||0), 0);
  const el = document.getElementById("cartCount");
  if(el) el.textContent = count;
}

function toast(msg){
  const t = document.getElementById("toast");
  if(!t){ return; }
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
  }, 1800);
}

function addToCart(id, name, price){
  const cart = loadCart();
  const idx = cart.findIndex(x => x.id === id);
  if(idx >= 0) cart[idx].qty += 1;
  else cart.push({ id, name, price: Number(price), qty: 1 });
  saveCart(cart);
  toast("✅ تمت الإضافة للسلة");
}

function removeItem(id){
  let cart = loadCart();
  cart = cart.filter(x => x.id !== id);
  saveCart(cart);
}

function changeQty(id, qty){
  const cart = loadCart();
  const it = cart.find(x => x.id === id);
  if(!it) return;
  it.qty = Math.max(1, Number(qty||1));
  saveCart(cart);
}

function renderCartPage(){
  const list = document.getElementById("cartList");
  if(!list) return;

  const cart = loadCart();

  if(cart.length === 0){
    list.innerHTML = `
      <div class="card">
        <h3>السلة فارغة</h3>
        <p class="desc">ارجع للمنتجات وأضف منتجات.</p>
        <a class="btn buy" href="products.html">الذهاب للمنتجات</a>
      </div>
    `;
    updateTotals();
    return;
  }

  list.innerHTML = cart.map(it => `
    <div class="card" style="margin-top:10px">
      <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center;">
        <div>
          <div style="font-weight:900">${it.name}</div>
          <div class="small" style="opacity:.8">السعر: ${Number(it.price).toFixed(2).replace(".00","")}€</div>
        </div>

        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <input type="number" min="1" value="${it.qty}" data-qty="${it.id}" class="admin-input" style="width:90px">
          <button class="btn chat danger" data-remove="${it.id}" type="button">حذف</button>
        </div>
      </div>
    </div>
  `).join("");

  list.querySelectorAll("[data-qty]").forEach(inp => {
    inp.addEventListener("change", () => {
      changeQty(inp.dataset.qty, inp.value);
      renderCartPage();
    });
  });

  list.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      removeItem(btn.dataset.remove);
      renderCartPage();
      toast("🗑 تم حذف المنتج");
    });
  });

  updateTotals();
}

function loadCoupons(){
  try{
    const data = JSON.parse(localStorage.getItem(LS_COUPONS) || "[]");
    return Array.isArray(data) ? data : [];
  }catch(e){
    return [];
  }
}

function setActiveCoupon(code){
  localStorage.setItem(ACTIVE_COUPON_KEY, (code||"").toUpperCase());
}

function getActiveCoupon(){
  return (localStorage.getItem(ACTIVE_COUPON_KEY) || "").toUpperCase();
}

function clearCoupon(){
  localStorage.removeItem(ACTIVE_COUPON_KEY);
}

function computeTotals(){
  const cart = loadCart();
  const sub = cart.reduce((s,it) => s + Number(it.price)*Number(it.qty||1), 0);

  const code = getActiveCoupon();
  let discount = 0;

  if(code){
    const coupons = loadCoupons();
    const c = coupons.find(x => (x.code||"").toUpperCase() === code && x.active);
    if(c){
      if(c.type === "percent"){
        discount = sub * (Number(c.value||0) / 100);
      }else if(c.type === "fixed"){
        discount = Number(c.value||0);
      }
    }
  }

  discount = Math.max(0, Math.min(discount, sub));
  const total = sub - discount;

  return { sub, discount, total, code };
}

function money(n){
  return `${Number(n).toFixed(2).replace(".00","")}€`;
}

function updateTotals(){
  const subEl = document.getElementById("subTotal");
  const disEl = document.getElementById("discount");
  const totEl = document.getElementById("total");
  const msgEl = document.getElementById("couponMsg");
  const inEl  = document.getElementById("couponInput");

  const { sub, discount, total, code } = computeTotals();

  if(subEl) subEl.textContent = money(sub);
  if(disEl) disEl.textContent = money(discount);
  if(totEl) totEl.textContent = money(total);

  if(inEl) inEl.value = code || "";

  if(msgEl){
    if(code && discount > 0) msgEl.textContent = `✅ تم تطبيق الكوبون (${code})`;
    else if(code) msgEl.textContent = `❌ الكوبون غير صالح أو غير فعال`;
    else msgEl.textContent = "";
  }
}

// Event delegation لإضافة للسلة من أي صفحة
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".addToCart");
  if(!btn) return;
  addToCart(btn.dataset.id, btn.dataset.name, btn.dataset.price);
});

// cart page coupon buttons
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderCartPage();

  const applyBtn = document.getElementById("applyCoupon");
  const clearBtn = document.getElementById("clearCoupon");
  const input = document.getElementById("couponInput");

  if(applyBtn && input){
    applyBtn.addEventListener("click", () => {
      const code = (input.value || "").trim().toUpperCase();
      setActiveCoupon(code);
      updateTotals();
      toast("🎟 تم تطبيق الكوبون");
    });
  }

  if(clearBtn){
    clearBtn.addEventListener("click", () => {
      clearCoupon();
      updateTotals();
      toast("🧼 تم إلغاء الكوبون");
    });
  }
});
