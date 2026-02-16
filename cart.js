// ================= CART PAGE =================
const LS_CART = "cart_v1";

function getCart(){
  try { return JSON.parse(localStorage.getItem(LS_CART) || "[]"); }
  catch(e){ return []; }
}

function setCart(arr){
  localStorage.setItem(LS_CART, JSON.stringify(arr));
}

// تحويل البيانات القديمة (price) إلى الجديدة (priceEUR) تلقائياً
function normalizeCart(){
  const cart = getCart();

  let changed = false;

  cart.forEach(item => {
    if(item.priceEUR === undefined && item.price !== undefined){
      item.priceEUR = Number(item.price);
      changed = true;
    }
    if(item.qty === undefined) {
      item.qty = 1;
      changed = true;
    }
  });

  if(changed) setCart(cart);
  return cart;
}

function renderCart(){
  const list = document.getElementById("cartList");
  const totalEl = document.getElementById("cartTotal");
  if(!list || !totalEl) return;

  const cart = normalizeCart();

  if(cart.length === 0){
    list.innerHTML = `
      <div class="card">
        <h3>السلة فارغة</h3>
        <p>أضف منتجات أولاً من صفحة المنتجات.</p>
      </div>
    `;
    totalEl.textContent = "0€";
    return;
  }

  let total = 0;

  list.innerHTML = cart.map((item, index) => {
    const price = Number(item.priceEUR ?? item.price ?? 0);
    const qty = Number(item.qty || 1);
    const subtotal = price * qty;
    total += subtotal;

    return `
      <div class="card" style="margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
          <div>
            <strong>${item.name || "منتج"}</strong>
            <div style="margin-top:5px;font-size:13px;opacity:.85;">
              السعر: ${price}€ × ${qty} = <b>${subtotal}€</b>
            </div>
          </div>

          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <button type="button" onclick="changeQty(${index}, -1)" class="btn chat">-</button>
            <button type="button" onclick="changeQty(${index}, 1)" class="btn chat">+</button>
            <button type="button" onclick="removeItem(${index})" class="btn chat" style="border:1px solid #f3b0b0;color:#b00020;background:#fff;">
              حذف
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  totalEl.textContent = total + "€";
}

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

function removeItem(index){
  const cart = getCart();
  cart.splice(index, 1);
  setCart(cart);
  renderCart();
}

document.addEventListener("DOMContentLoaded", renderCart);
