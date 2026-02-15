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

// عرض السلة في cart.html
function renderCart(){
  const list = document.getElementById("cartList");
  const totalEl = document.getElementById("cartTotal");
  if(!list || !totalEl) return;

  const cart = getCart();
  list.innerHTML = "";

  let total = 0;

  if(cart.length === 0){
    list.innerHTML = `
      <div class="card">
        <p class="desc">سلتك فارغة الآن. ارجع للمنتجات واضغط "أضف للسلة".</p>
      </div>
    `;
    totalEl.textContent = "0€";
    return;
  }

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

// أحداث
document.addEventListener("click", (e) => {
  // إضافة للسلة
  const addBtn = e.target.closest(".addToCart");
  if(addBtn){
    addItem({
      id: addBtn.dataset.id,
      name: addBtn.dataset.name,
      price: Number(addBtn.dataset.price)
    });

    // toast إن وجد
    if(typeof window.showToast === "function"){
      window.showToast("🛒 تمت الإضافة للسلة");
    }
    return;
  }

  // أزرار التحكم داخل السلة
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

function buildOrderText(){
  const cart = getCart();
  if(cart.length === 0) return "";

  const total = cart.reduce((s,it)=> s + Number(it.price)*it.qty, 0).toFixed(2);

  const lines = cart.map((it, i) => {
    const lineTotal = (Number(it.price) * it.qty).toFixed(2);
    return `${i+1}) ${it.name} × ${it.qty} = ${lineTotal}€`;
  });

  return `طلب جديد:\n${lines.join("\n")}\n\nالمجموع: ${total}€`;
}

document.addEventListener("click", (e) => {
  const link = e.target.closest("#sendOrder");
  if(!link) return;

  const cart = getCart();
  if(cart.length === 0){
    e.preventDefault();
    if(typeof window.showToast === "function") window.showToast("🛒 السلة فارغة");
    return;
  }

  const total = cart.reduce((s,it)=> s + Number(it.price)*it.qty, 0).toFixed(2);
  const text = buildOrderText();
  link.href = `order.html?items=${encodeURIComponent(text)}&total=${encodeURIComponent(total)}`;
});


window.addEventListener("DOMContentLoaded", renderCart);
