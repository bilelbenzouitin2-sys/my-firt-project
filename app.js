// ===== Toast (عام) =====
(function(){
  const toast = document.getElementById("toast");
  window.showToast = function(msg){
    if(!toast) return;
    toast.textContent = msg;
    toast.style.display = "block";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    toast.style.transition = "all .22s ease";

    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });

    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      setTimeout(() => (toast.style.display = "none"), 220);
    }, 2200);
  };
})();

// ===== عداد السلة في navbar =====
function updateCartCountUI(){
  const el = document.getElementById("cartCount");
  if(!el) return;

  try{
    const cart = JSON.parse(localStorage.getItem("cart_v1") || "[]");
    const count = cart.reduce((sum, it) => sum + Number(it.qty || 1), 0);
    el.textContent = count;
  }catch{
    el.textContent = "0";
  }
}

document.addEventListener("DOMContentLoaded", updateCartCountUI);
window.addEventListener("storage", updateCartCountUI);
