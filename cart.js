// ================= CART PAGE =================

const LS_CART = "cart_v1";

function getCart(){
  try { return JSON.parse(localStorage.getItem(LS_CART) || "[]"); }
  catch(e){ return []; }
}

function setCart(arr){
  localStorage.setItem(LS_CART, JSON.stringify(arr));
}

function renderCart(){
  const list = document.getElementById("cartList");
  const totalEl = document.getElementById("cartTotal");

  if(!list || !totalEl) return;

  const cart = getCart();

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
    const price = Number(item.priceEUR || 0);
    const qty = Number(item.qty || 1);
    const subtotal = price * qty;
    total += subtotal;

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
