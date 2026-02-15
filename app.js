// ===== Toast =====
const toast = document.getElementById("toast");

function showToast(msg){
  if(!toast) return;
  toast.textContent = msg;
  toast.style.display = "block";
  toast.style.opacity = "0";
  toast.style.transform = "translateY(10px)";
  toast.style.transition = "all .25s ease";

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => (toast.style.display = "none"), 250);
  }, 2500);
}

// ===== عداد طلبات + إشعارات شراء =====
const ordersEl = document.getElementById("ordersToday");
const lastEl = document.getElementById("lastUpdate");

function timeNow(){
  const d = new Date();
  const h = String(d.getHours()).padStart(2,"0");
  const m = String(d.getMinutes()).padStart(2,"0");
  return `${h}:${m}`;
}

if(ordersEl && lastEl){
  let orders = Math.floor(Math.random() * 20) + 5; // 5..24
  ordersEl.textContent = orders;
  lastEl.textContent = timeNow();

  // يزيد الرقم بشكل عشوائي كل فترة
  setInterval(() => {
    orders += (Math.random() < 0.7 ? 1 : 2);
    ordersEl.textContent = orders;
    lastEl.textContent = timeNow();
  }, 25000);

  // إشعارات شراء (وهمية)
  const products = [
    "Netflix - شهر",
    "Spotify - 3 أشهر",
    "حزمة عملات 1000",
    "حزمة VIP 5000"
  ];

  setInterval(() => {
    const item = products[Math.floor(Math.random() * products.length)];
    const mins = Math.floor(Math.random() * 9) + 1; // 1..9
    showToast(`🛒 تم شراء ${item} قبل ${mins} دقائق`);
  }, 22000);
}

// ===== نسخ USDT (زر واحد لكل المنتجات) =====
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".copyBtn");
  if(!btn) return;

  const container = btn.closest(".card") || document;
  const input = container.querySelector(".usdtAddress");
  if(!input) return;

  const value = input.value;

  try{
    if(navigator.clipboard && window.isSecureContext){
      await navigator.clipboard.writeText(value);
    }else{
      input.select();
      input.setSelectionRange(0, 99999);
      document.execCommand("copy");
    }

    const oldText = btn.textContent;
    btn.textContent = "تم النسخ ✓";
    btn.classList.add("copy-success");
    showToast("✅ تم نسخ عنوان USDT");

    setTimeout(() => {
      btn.textContent = oldText || "نسخ العنوان";
      btn.classList.remove("copy-success");
    }, 2000);

  }catch(err){
    showToast("⚠️ لم يتم النسخ، جرّب مرة أخرى");
  }
});

// ===== تعبئة المنتج تلقائياً في order.html =====
(() => {
  const productInput = document.getElementById("product");
  if(!productInput) return;

  const params = new URLSearchParams(window.location.search);
  const product = params.get("product");
  if(product) productInput.value = product;
})();
// ===== تعبئة الطلب من السلة داخل order.html =====
(() => {
  const params = new URLSearchParams(window.location.search);
  const items = params.get("items");
  const total = params.get("total");

  // غيّر IDs حسب حقول order.html عندك
  const msgBox = document.getElementById("message") || document.getElementById("notes");
  const productBox = document.getElementById("product");

  if(items && msgBox){
    msgBox.value = items + (total ? `\n\nالمجموع: ${total}€` : "");
  }

  // إذا عندك خانة product وخانة message فقط:
  if(items && !msgBox && productBox){
    productBox.value = items;
  }
})();
// ===== تعبئة order.html من الرابط (منتج مفرد أو سلة كاملة) =====
(() => {
  const params = new URLSearchParams(window.location.search);

  const product = params.get("product"); // من صفحة منتج
  const items = params.get("items");     // من السلة
  const total = params.get("total");     // من السلة

  const productInput = document.getElementById("product");
  const notesBox = document.getElementById("notes");

  // لو جاء product فقط
  if(productInput && product){
    productInput.value = product;
  }

  // لو جاء items من السلة نضعه في الملاحظات (أفضل مكان)
  if(notesBox && items){
    notesBox.value = items + (total ? `\n\nالمجموع: ${total}€` : "");
  }
})();
// ===== إرسال السلة إلى Google Form =====
document.addEventListener("click", function(e){
  const btn = e.target.closest("#sendForm");
  if(!btn) return;

  e.preventDefault();

  // جلب السلة
  const cart = JSON.parse(localStorage.getItem("cart_items") || "[]");

  if(cart.length === 0){
    alert("السلة فارغة");
    return;
  }

  // تجهيز النص
  const lines = cart.map((it, i) => {
    const total = (Number(it.price) * it.qty).toFixed(2);
    return `${i+1}) ${it.name} × ${it.qty} = ${total}€`;
  });

  const totalPrice = cart.reduce((s,it)=> s + Number(it.price)*it.qty, 0).toFixed(2);

  const productText = cart.map(it => it.name).join(", ");
  const notesText = "تفاصيل الطلب:\n" + lines.join("\n") + "\n\nالمجموع: " + totalPrice + "€";

  // رابط Google Form الحقيقي
  const formURL = `https://docs.google.com/forms/d/e/1FAIpQLSexYxFzEsMCORrb6tH5v5jz1RhkT_n7j8iKV6nvRc7JShKdhw/viewform?usp=pp_url`
    + `&entry.138503007=${encodeURIComponent(productText)}`
    + `&entry.1501585959=${encodeURIComponent(notesText)}`;

  window.open(formURL, "_blank");
});



