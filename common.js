/* ใช้ร่วมกันทั้ง 2 หน้า */
const CFG = window.SAPHAI_CONFIG;

async function startLiff(liffId) {
  await liff.init({ liffId });
  if (!liff.isLoggedIn()) {
    liff.login({ redirectUri: location.href });
    return new Promise(() => {}); // รอ redirect
  }
  const profile = await liff.getProfile();
  return profile; // { userId, displayName, pictureUrl }
}

async function api(action, data = {}) {
  // ไม่ใส่ Content-Type เพื่อไม่ให้ติด CORS preflight กับ Apps Script
  const res = await fetch(CFG.API_URL, {
    method: 'POST',
    body: JSON.stringify(Object.assign({ action, idToken: liff.getIDToken() }, data)),
  });
  let j;
  try { j = await res.json(); } catch (e) { throw new Error('เชื่อมต่อระบบไม่ได้ (' + res.status + ')'); }
  if (!j.ok) throw new Error(j.error || 'เกิดข้อผิดพลาด');
  return j;
}

function $(sel, root = document) { return root.querySelector(sel); }

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fmtQty(q) {
  const n = Number(q);
  return Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
}

function show(id) {
  document.querySelectorAll('[data-view]').forEach(el => { el.hidden = el.id !== id; });
  window.scrollTo(0, 0);
}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('on'), 3500);
}

function closeApp() {
  if (liff.isInClient()) liff.closeWindow(); else location.reload();
}

const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} },
};

/** ตัดคำนำหน้า "สั่งของสะใภ้ลาว" ออกเวลาแสดงผล */
function short(n) { return String(n || '').replace(/^สั่งของสะใภ้ลาว\s*/, '') || String(n || ''); }
