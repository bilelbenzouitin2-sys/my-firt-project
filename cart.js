// ================= STORAGE KEYS =================
const LS_CART = "cart_v1";
const LS_COUPON = "cart_coupon_v1";

// ================= CART CORE =================
function getCart(){
  try { return JSON.parse(localStorage.getItem(LS_CART) || "[]"); }
  catch(e){ return []; }
}

function setCart(arr){
  localStorage.setItem(LS_CART, JSON.stringify(arr));
}

function saveCoupon(code){
  localStorage.setItem(LS_COUPON, code);
}

function getCoupon(){
  return localStorage.getItem(LS_COUPON) || "";
}

function clearCouponStorage(){
  localStorage.removeItem(LS_COUPON);
}

// ================= RENDER CART =================
function renderCart(){

  const list = document.getElementById("cartList");
  const subTotalEl = document.getElementById("subTotal");
  const discountEl = document.getElementById("discount");
  const totalEl = document.getElementById("total");

  if(!list || !subTotalEl || !discountEl || !totalEl) return;

  const cart = getCart();

  if(cart.length === 0){
    list.innerHTML = `
      <div class="card">
        <h3>السلة فارغة</h3>
        <p>أضف منتجات أولاً من صفحة المنتجات.</p>
      </div>
    `;
    subTotalEl.textContent = "0€";
    discountEl.textContent = "0€";
    totalEl.textContent = "0€";
    return;
  }

  let subTotal = 0;

  list.innerHTML = cart.map((item, index) => {

    const price = Number(item.price || item.priceEUR || 0);
    const qty = Number(item.qty || 1);
    const subtotal = price * qty;

    subTotal += subtotal;

    return `
      <div class="card" style="margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <strong>${item.name}</strong>
            <div style="margin-top:5px;font-size:13px;opacity:.8;">
              السعر: ${price}€ × ${qty}
            </div>
          </div>

          <div style="display:flex;gap:6px;">
            <button onclick="changeQty(${index}, -1)" class="btn chat">-</button>
            <button onclick="changeQty(${index}, 1)" class="btn chat">+</button>
            <button onclick="removeItem(${index})" class="btn admin-danger">حذف</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  // ================= COUPON =================
  let discount = 0;
  const coupon = getCoupon();

  if(coupon === "SAVE10"){
    discount = subTotal * 0.10;
  }

  const finalTotal = subTotal - discount;

  subTotalEl.textContent = subTotal.toFixed(2) + "€";
  discountEl.textContent = discount.toFixed(2) + "€";
  totalEl.textContent = finalTotal.toFixed(2) + "€";
}

// ================= CHANGE QTY =================
function changeQty(index, delta){
  const cart = getCart();
  if(!cart[index]) return;

  cart[index].qty = Number(cart[index].qty || 1) + delta;

  if(cart[index].qty <= 0){
    cart.splice(index, 1);
  }

  setCart(cart);
  renderCart();
}

// ================= REMOVE =================
function removeItem(index){
  const cart = getCart();
  cart.splice(index, 1);
  setCart(cart);
  renderCart();
}

// ================= COUPON EVENTS =================
document.addEventListener("DOMContentLoaded", () => {

  renderCart();

  const applyBtn = document.getElementById("applyCoupon");
  const clearBtn = document.getElementById("clearCoupon");
  const input = document.getElementById("couponInput");
  const msg = document.getElementById("couponMsg");

  if(applyBtn){
    applyBtn.addEventListener("click", () => {
      const code = input.value.trim().toUpperCase();

      if(code === "SAVE10"){
        saveCoupon(code);
        msg.textContent = "✅ تم تطبيق خصم 10%";
      } else {
        msg.textContent = "❌ الكوبون غير صالح";
      }

      renderCart();
    });
  }

  if(clearBtn){
    clearBtn.addEventListener("click", () => {
      clearCouponStorage();
      msg.textContent = "تم إلغاء الكوبون";
      renderCart();
    });
  }
});
