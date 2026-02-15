const LS_PRODUCTS = "store_products_v2";

function loadProducts(){
  try{
    const data = JSON.parse(localStorage.getItem(LS_PRODUCTS) || "[]");
    return Array.isArray(data) ? data : [];
  }catch(e){
    return [];
  }
}

function escapeHtml(str){
  return String(str||"")
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}

document.addEventListener("DOMContentLoaded", () => {
  const box = document.getElementById("productBox");
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  if(!id){
    box.innerHTML = `<h3>❌ لا يوجد منتج</h3><p class="desc">ارجع للمنتجات واختر منتج.</p>`;
    return;
  }

  const p = loadProducts().find(x => x.id === id);

  if(!p || p.hidden){
    box.innerHTML = `<h3>❌ المنتج غير موجود</h3><p class="desc">قد يكون محذوف أو مخفي.</p>`;
    return;
  }

  box.innerHTML = `
    <img src="${escapeHtml(p.image)}" class="productImg big" alt="${escapeHtml(p.name)}">
    <span class="tag">${escapeHtml(p.category)}</span>
    <h2 style="margin:10px 0 6px">${escapeHtml(p.name)}</h2>
    <p class="price">السعر: ${Number(p.price).toFixed(2).replace(".00","")}€</p>

    <div class="noteBox">
      ✅ تسليم سريع • 🔒 دفع آمن • 💬 دعم مباشر
    </div>

    <div class="actions" style="margin-top:12px">
      <button class="btn buy addToCart"
        data-id="${escapeHtml(p.id)}"
        data-name="${escapeHtml(p.name)}"
        data-price="${Number(p.price)}">
        أضف للسلة
      </button>
      <a class="btn chat" href="cart.html">اذهب للسلة</a>
      <a class="btn chat" href="products.html">المنتجات</a>
    </div>
  `;
});
