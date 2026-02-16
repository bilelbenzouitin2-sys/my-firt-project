// ================= CART SYSTEM =================

const LS_CART = "cart_v1";

function getCart(){
  try {
    return JSON.parse(localStorage.getItem(LS_CART) || "[]");
  } catch(e){
    return [];
  }
}

function setCart(cart){
  localStorage.setItem(LS_CART, JSON.stringify(cart));
}

// ===== إضافة للسلة =====
window.addToCart = function(product){
  const cart = getCart();

  const existing = cart.find(i => i.id === product.id);

  if(existing){
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      priceEUR: Number(product.price),
      qty: 1
    });
  }

  setCart(cart);

  alert("تمت إضافة المنتج للسلة");
};

// ===== عرض السلة =====
function renderCart(){
  const list = document.getElementById("cartList");
  const totalEl = document.getElementById("cartTotal");

  if(!list || !totalEl) return;

  const cart = getCart();

  if(cart.length === 0){
    list.innerHTML = `
      <div class="card">
        <h3>السلة فارغة</h3>
      </div>
    `;
    totalEl.textContent = "0€";
    return;
  }

  let total = 0;

  list.innerHTML = cart.map((item, index) => {
    const subtotal = item.priceEUR * item.qty;
    total += subtotal;

    return `
      <div class="card">
        <strong>${item.name}</strong>
        <div>السعر: ${item.priceEUR}€ × ${item.qty}</div>
        <div style="margin-top:6px">
          <button onclick="changeQty(${index}, -1)">-</button>
          <button onclick="changeQty(${index}, 1)">+</button>
          <button onclick="removeItem(${index})">حذف</button>
        </div>
      </div>
    `;
  }).join("");

  totalEl.textContent = total + "€";
}

window.changeQty = function(index, delta){
  const cart = getCart();
  if(!cart[index]) return;

  cart[index].qty += delta;

  if(cart[index].qty <= 0){
    cart.splice(index, 1);
  }

  setCart(cart);
  renderCart();
};

window.removeItem = function(index){
  const cart = getCart();
  cart.splice(index, 1);
  setCart(cart);
  renderCart();
};

document.addEventListener("DOMContentLoaded", renderCart);
