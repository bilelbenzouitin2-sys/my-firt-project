// ================= CART (ONE SOURCE OF TRUTH) =================
const LS_CART = "cart_v1";

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
        <p>ارجع للمنتجات وأضف منتجات.</p>
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
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
          <div>
            <strong>${item.name}</strong>
            <div style="margin-top:6px;font-size:13px;opacity:.8;">
              ${price}€ × ${qty} = <b>${subtotal}€</b>
            </div>
          </div>

          <div style="display:flex;gap:6px;align-items:center;">
            <button class="btn chat" onclick="changeQty(${index}, -1)">-</button>
            <button class="btn chat" onclick="changeQty(${index}, 1)">+</button>
            <button class="btn chat" onclick="removeItem(${index})">حذف</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  totalEl.textContent = total + "€";
}

window.changeQty = function(index, delta){
  const cart = getCart();
  if(!cart[index]) return;

  cart[index].qty = Number(cart[index].qty || 1) + delta;
  if(cart[index].qty <= 0) cart.splice(index, 1);

  setCart(cart);
  renderCart();
};

window.removeItem = function(index){
  const cart = getCart();
  cart.splice(index, 1);
  setCart(cart);
  renderCart();
};

document.addEventListener("DOMContentLoaded", () => {
  renderCart();

  const clearBtn = document.getElementById("clearCart");
  if(clearBtn){
    clearBtn.addEventListener("click", () => {
      localStorage.removeItem(LS_CART);
      renderCart();
      toast("🧹 تم تفريغ السلة");
    });
  }
});
