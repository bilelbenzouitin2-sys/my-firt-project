const OV_KEY = "admin_overrides_v2";
const SESSION_KEY = "admin_session_v1";

// غيّر كلمة السر هنا:
const ADMIN_PASSWORD = "1234";

function loadOverrides(){
  try { return JSON.parse(localStorage.getItem(OV_KEY) || "{}"); }
  catch { return {}; }
}
function saveOverrides(obj){
  localStorage.setItem(OV_KEY, JSON.stringify(obj));
}
function resetOverrides(){
  localStorage.removeItem(OV_KEY);
}

function isLoggedIn(){
  return sessionStorage.getItem(SESSION_KEY) === "1";
}
function setLoggedIn(v){
  sessionStorage.setItem(SESSION_KEY, v ? "1" : "0");
}

function el(id){ return document.getElementById(id); }

function renderAdminList(){
  const list = el("adminList");
  if(!list) return;

  const ov = loadOverrides();

  list.innerHTML = PRODUCTS.map(p => {
    const o = ov[p.id] || {};
    const name = (o.name ?? p.name);
    const desc = (o.desc ?? p.desc ?? "");
    const image = (o.image ?? p.image ?? "");
    const category = (o.category ?? p.category);
    const price = (o.price !== undefined) ? o.price : p.price;
    const hidden = !!o.hidden;

    return `
      <div class="admin-item" data-id="${p.id}">
        <div class="admin-itemHead">
          <div>
            <div class="admin-itemTitle">${name}</div>
            <div class="muted small">ID: ${p.id} — التصنيف: ${category}</div>
          </div>
          <label class="switch">
            <input class="admin-hidden" type="checkbox" ${hidden ? "checked" : ""}>
            <span class="slider"></span>
            <span class="switchText">${hidden ? "مخفي" : "ظاهر"}</span>
          </label>
        </div>

        <div class="admin-grid">
          <div>
            <label class="small muted">الاسم</label>
            <input class="admin-input admin-name" type="text" value="${escapeAttr(name)}" />
          </div>

          <div>
            <label class="small muted">السعر (€)</label>
            <input class="admin-input admin-price" type="number" step="0.01" value="${price}" />
          </div>

          <div>
            <label class="small muted">التصنيف</label>
            <select class="admin-input admin-category">
              <option ${category==="اشتراك"?"selected":""}>اشتراك</option>
              <option ${category==="عملات"?"selected":""}>عملات</option>
            </select>
          </div>

          <div style="grid-column:1/-1">
            <label class="small muted">الوصف</label>
            <textarea class="admin-input admin-desc" rows="2">${escapeHTML(desc)}</textarea>
          </div>

          <div style="grid-column:1/-1">
            <label class="small muted">رابط الصورة</label>
            <input class="admin-input admin-image" type="text" value="${escapeAttr(image)}" />
            <div class="small muted" style="margin-top:6px">نصيحة: ضع رابط صورة حقيقية بدل placeholder.</div>
          </div>
        </div>
      </div>
    `;
  }).join("");

  // تحديث نص الـ switch
  list.querySelectorAll(".admin-hidden").forEach(chk => {
    chk.addEventListener("change", () => {
      const text = chk.closest(".switch")?.querySelector(".switchText");
      if(text) text.textContent = chk.checked ? "مخفي" : "ظاهر";
    });
  });
}

function escapeHTML(s){
  return String(s).replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
}
function escapeAttr(s){
  return String(s).replace(/"/g, "&quot;");
}

document.addEventListener("DOMContentLoaded", () => {
  const loginBox = el("adminLoginBox");
  const panel = el("adminPanel");

  function showLogin(){
    if(loginBox) loginBox.style.display = "block";
    if(panel) panel.style.display = "none";
  }
  function showPanel(){
    if(loginBox) loginBox.style.display = "none";
    if(panel) panel.style.display = "block";
    renderAdminList();
  }

  // auto session
  if(isLoggedIn()) showPanel(); else showLogin();

  el("adminEnter")?.addEventListener("click", () => {
    const v = (el("adminPass")?.value || "").trim();
    if(v !== ADMIN_PASSWORD){
      window.showToast?.("❌ كلمة السر غير صحيحة");
      return;
    }
    setLoggedIn(true);
    window.showToast?.("✅ تم تسجيل الدخول");
    showPanel();
  });

  el("adminLogout")?.addEventListener("click", () => {
    setLoggedIn(false);
    window.showToast?.("تم تسجيل الخروج");
    showLogin();
  });

  el("adminSave")?.addEventListener("click", () => {
    const ov = loadOverrides();

    document.querySelectorAll(".admin-item").forEach(box => {
      const id = box.dataset.id;

      const name = box.querySelector(".admin-name")?.value?.trim();
      const price = box.querySelector(".admin-price")?.value;
      const category = box.querySelector(".admin-category")?.value;
      const desc = box.querySelector(".admin-desc")?.value?.trim();
      const image = box.querySelector(".admin-image")?.value?.trim();
      const hidden = !!box.querySelector(".admin-hidden")?.checked;

      ov[id] = {
        name,
        price: Number(price),
        category,
        desc,
        image,
        hidden
      };
    });

    saveOverrides(ov);
    window.showToast?.("💾 تم حفظ التغييرات");
  });

  el("adminReset")?.addEventListener("click", () => {
    resetOverrides();
    renderAdminList();
    window.showToast?.("♻️ تم إرجاع الافتراضي");
  });
});
