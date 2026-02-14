// Toast
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
    setTimeout(() => toast.style.display = "none", 250);
  }, 2500);
}

// عداد طلبات + إشعار شراء (اختياري)
const ordersEl = document.getElementById("ordersToday");
const lastEl = document.getElementById("lastUpdate");

function timeNow(){
  const d=new Date();
  const h=String(d.getHours()).padStart(2,"0");
  const m=String(d.getMinutes()).padStart(2,"0");
  return `${h}:${m}`;
}

if(ordersEl && lastEl){
  let orders = Math.floor(Math.random()*20)+5;
  ordersEl.textContent = orders;
  lastEl.textContent = timeNow();

  setInterval(() => {
    orders += (Math.random()<0.7?1:2);
    ordersEl.textContent = orders;
    lastEl.textContent = timeNow();
  }, 25000);

  const products=["Netflix - شهر","Spotify - 3 أشهر","حزمة عملات 1000","حزمة VIP 5000"];
  setInterval(() => {
    const item = products[Math.floor(Math.random()*products.length)];
    const mins = Math.floor(Math.random()*9)+1;
    showToast(`🛒 تم شراء ${item} قبل ${mins} دقائق`);
  }, 22000);
}

// نسخ USDT (زر ذكي لكل المنتجات)
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".copyBtn");
  if(!btn) return;

  const card = btn.closest(".card") || document;
  const input = card.querySelector(".usdtAddress");
  if(!input) return;

  const value = input.value;

  try{
    // أفضل طريقة حديثة
    if(navigator.clipboard && window.isSecureContext){
      await navigator.clipboard.writeText(value);
    }else{
      // fallback
      input.select();
      input.setSelectionRange(0, 99999);
      document.execCommand("copy");
    }

    btn.classList.add("copy-success");
    const old = btn.textContent;
    btn.textContent = "تم النسخ ✓";
    showToast("✅ تم نسخ عنوان USDT");
    setTimeout(() => {
      btn.classList.remove("copy-success");
      btn.textContent = old || "نسخ العنوان";
    }, 2000);
  }catch(err){
    showToast("⚠️ لم يتم النسخ، جرّب مرة أخرى");
  }
});

// تمرير اسم المنتج إلى order.html
(function(){
  const params = new URLSearchParams(window.location.search);
  const product = params.get("product");
  const productInput = document.getElementById("productName");
  if(product && productInput){
    productInput.value = product;
  }
})();

