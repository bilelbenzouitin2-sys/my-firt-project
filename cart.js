const CART_KEY = "cart_v1";

function loadCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
  catch { return []; }
}
function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(item){
  const cart = loadCart();
  const idx = cart.findIndex(x => x.id === item.id);
  if(idx >= 0){
    cart[idx].qty = Number(cart[idx].qty || 1) + 1;
  }else{
    cart.push({ ...item, qty: 1 });
  }
  saveCart(cart);
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".addToCart");
  if(!btn) return;

  const id = btn.dataset.id;
  const name = btn.dataset.name;
  const price = Number(btn.dataset.price || 0);

  addToCart({ id, name, price });

  window.showToast?.("✅ تمت الإضافة للسلة");
  // تحديث العداد إن وجد
  if(typeof updateCartCountUI === "function") updateCartCountUI();
});
