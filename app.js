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
  }, 2200);
}

// ===== نسخ USDT (زر واحد لكل المنتجات) =====
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".copyBtn");
  if(!btn) return;

  // نبحث عن أقرب كارت/قسم
  const container = btn.closest(".card") || document;
  const input = container.querySelector(".usdtAddress");
  if(!input) return;

  const value = input.value;

  try{
    // طريقة حديثة
    if(navigator.clipboard && window.isSecureContext){
      await navigator.clipboard.writeText(value);
    }else{
      // طريقة قديمة احتياطية
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
