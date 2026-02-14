(function(){
  const KEY = "theme-mode"; // light | dark

  function apply(mode){
    document.documentElement.setAttribute("data-theme", mode);
    localStorage.setItem(KEY, mode);

    const btn = document.getElementById("themeToggle");
    if(btn){
      btn.textContent = (mode === "dark") ? "☀️" : "🌙";
      btn.title = (mode === "dark") ? "الوضع الفاتح" : "الوضع الداكن";
    }
  }

  // 1) إذا المستخدم اختار سابقاً
  const saved = localStorage.getItem(KEY);

  // 2) أو اتبع نظام الجهاز
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initial = saved || (prefersDark ? "dark" : "light");

  // طبق
  apply(initial);

  // عند الضغط
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("#themeToggle");
    if(!btn) return;

    const current = document.documentElement.getAttribute("data-theme") || initial;
    const next = (current === "dark") ? "light" : "dark";
    apply(next);
  });
})();
