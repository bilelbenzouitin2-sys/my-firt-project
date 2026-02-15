function getCart(){
  try{ return JSON.parse(localStorage.getItem("cart_items") || "[]"); }
  catch(e){ return []; }
}
function saveCart(items){
  localStorage.setItem("cart_items", JSON.stringify(items));
}
function addItem(item){
  const cart = getCart();
  const found = cart.find(x => x.id === item.id);
  if(found) found.qty += 1;
  else cart.push({ ...item, qty: 1 });
  saveCart(cart);
}

function renderCart(){
  const list = document.getElementById("cartList");
  const totalEl = document.getElementById("cartTotal");
  if(!list || !totalEl) return;

  const cart = getCart();
  list.innerHTML = "";

  let total = 0;
  cart.forEach((it, idx) => {
    total += (Number(it.price) * it.qty);

    const row = document.createElement("div");
    row.className = "card";
    row.style.marginBottom = "12px";
    row.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center;">
        <div>
          <div style="font-weight:700">${it.name}</div>
          <div class="small">السعر: ${it.price}€ — الكمية: ${it.qty}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <button class="btn chat" data-act="minus" data-idx="${idx}">-</button>
          <button class="btn chat" data-act="plus" data-idx="${idx}">+</button>
          <button class="btn buy" data-act="remove" data-idx="${idx}">حذف</button>
        </div>
      </div>
    `;
    list.appendChild(row);
  });

  totalEl.textContent = total.toFixed(2) + "€";
}

document.addEventListener("click", (e) => {
  // إضافة للسلة من أي صفحة
  const addBtn = e.target.closest(".addToCart");
  if(addBtn){
    addItem({
      id: addBtn.dataset.id,
      name: addBtn.dataset.name,
      price: Number(addBtn.dataset.price)
    });
    if(typeof showToast === "function") showToast("🛒 تمت الإضافة للسلة");
    return;
  }

  // أزرار السلة داخل cart.html
  const actBtn = e.target.closest("[data-act]");
  if(!actBtn) return;

  const act = actBtn.dataset.act;
  const idx = Number(actBtn.dataset.idx);
  const cart = getCart();
  if(!cart[idx]) return;

  if(act === "plus") cart[idx].qty += 1;
  if(act === "minus") cart[idx].qty = Math.max(1, cart[idx].qty - 1);
  if(act === "remove") cart.splice(idx, 1);

  saveCart(cart);
  renderCart();
});

window.addEventListener("DOMContentLoaded", renderCart);
