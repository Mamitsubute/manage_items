const COUPON_STORAGE_KEY = 'item_app_applied_coupons';

function loadApplied() {
  try {
    const data = localStorage.getItem(COUPON_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveApplied(list) {
  localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(list));
}

function showMessage(text, type) {
  const el = document.getElementById('couponMessage');
  el.textContent = text;
  el.className = 'coupon-message ' + type;
}

function renderApplied() {
  const applied = loadApplied();
  const section = document.getElementById('appliedSection');
  const list = document.getElementById('appliedList');

  if (applied.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  list.innerHTML = applied.map(code =>
    `<li class="applied-item"><span class="applied-code">${escapeHtml(code)}</span><span class="applied-badge">適用済み</span></li>`
  ).join('');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.getElementById('applyBtn').addEventListener('click', () => {
  const input = document.getElementById('couponInput');
  const code = input.value.trim().toUpperCase();

  if (!code) {
    showMessage('クーポンコードを入力してください。', 'error');
    return;
  }

  if (!VALID_COUPONS.includes(code)) {
    showMessage('無効なクーポンコードです。', 'error');
    return;
  }

  const applied = loadApplied();
  if (applied.includes(code)) {
    showMessage('このクーポンはすでに適用済みです。', 'error');
    return;
  }

  applied.push(code);
  saveApplied(applied);
  input.value = '';
  showMessage('適用されました', 'success');
  renderApplied();
});

document.getElementById('couponInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('applyBtn').click();
});

renderApplied();
