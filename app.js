const STORAGE_KEY = 'item_app_products';

// --- State ---
let products = loadProducts();
let deleteTargetId = null;

// --- localStorage ---
function loadProducts() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : getSampleData();
  } catch {
    return getSampleData();
  }
}

function saveProducts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function getSampleData() {
  return [
    { id: 1, name: 'ノートPC', category: '電子機器', price: 128000, stock: 5 },
    { id: 2, name: 'ワイヤレスマウス', category: '電子機器', price: 4800, stock: 20 },
    { id: 3, name: 'USBハブ', category: 'アクセサリ', price: 2980, stock: 0 },
    { id: 4, name: 'デスクチェア', category: '家具', price: 35000, stock: 3 },
  ];
}

function nextId() {
  return products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
}

// --- Render ---
function getSearchQuery() {
  return document.getElementById('searchInput').value.trim().toLowerCase();
}

function filteredProducts() {
  const q = getSearchQuery();
  if (!q) return products;
  return products.filter(p =>
    p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  );
}

function stockBadge(stock) {
  if (stock === 0) return `<span class="stock-badge stock-zero">在庫なし</span>`;
  if (stock <= 3) return `<span class="stock-badge stock-low">${stock}</span>`;
  return `<span class="stock-badge stock-ok">${stock}</span>`;
}

function render() {
  const list = filteredProducts();
  const tbody = document.getElementById('tableBody');
  const table = document.getElementById('itemTable');
  const empty = document.getElementById('emptyMessage');
  const count = document.getElementById('itemCount');

  count.textContent = `${list.length}`;

  if (list.length === 0) {
    table.style.display = 'none';
    empty.style.display = 'block';
    return;
  }

  table.style.display = 'table';
  empty.style.display = 'none';

  tbody.innerHTML = list.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${escapeHtml(p.name)}</td>
      <td>${escapeHtml(p.category)}</td>
      <td class="price-cell">¥${p.price.toLocaleString()}</td>
      <td>${stockBadge(p.stock)}</td>
      <td>
        <div class="actions">
          <button class="btn btn-secondary btn-sm" onclick="openEditModal(${p.id})">編集</button>
          <button class="btn btn-danger btn-sm" onclick="openDeleteModal(${p.id})">削除</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// --- Modal helpers ---
function openModal() {
  document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('itemForm').reset();
  document.getElementById('editId').value = '';
}

// --- Add ---
function openAddModal() {
  document.getElementById('modalTitle').textContent = '商品を追加';
  document.getElementById('submitBtn').textContent = '追加';
  closeModal();
  openModal();
}

// --- Edit ---
function openEditModal(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  document.getElementById('modalTitle').textContent = '商品を編集';
  document.getElementById('submitBtn').textContent = '更新';
  document.getElementById('editId').value = id;
  document.getElementById('name').value = product.name;
  document.getElementById('category').value = product.category;
  document.getElementById('price').value = product.price;
  document.getElementById('stock').value = product.stock;

  openModal();
}

// --- Delete ---
function openDeleteModal(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  deleteTargetId = id;
  document.getElementById('deleteMessage').textContent =
    `「${product.name}」を削除してもよいですか？この操作は元に戻せません。`;
  document.getElementById('deleteModal').style.display = 'flex';
}

function closeDeleteModal() {
  deleteTargetId = null;
  document.getElementById('deleteModal').style.display = 'none';
}

function deleteProduct() {
  if (deleteTargetId === null) return;
  products = products.filter(p => p.id !== deleteTargetId);
  saveProducts();
  closeDeleteModal();
  render();
}

// --- Form submit ---
document.getElementById('itemForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const id = document.getElementById('editId').value;
  const name = document.getElementById('name').value.trim();
  const category = document.getElementById('category').value.trim();
  const price = parseInt(document.getElementById('price').value, 10);
  const stock = parseInt(document.getElementById('stock').value, 10);

  if (!name || !category || isNaN(price) || isNaN(stock)) return;

  if (id) {
    // Update
    const idx = products.findIndex(p => p.id === parseInt(id, 10));
    if (idx !== -1) {
      products[idx] = { id: parseInt(id, 10), name, category, price, stock };
    }
  } else {
    // Create
    products.push({ id: nextId(), name, category, price, stock });
  }

  saveProducts();
  closeModal();
  render();
});

// --- Event listeners ---
document.getElementById('openAddModal').addEventListener('click', openAddModal);
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('cancelDelete').addEventListener('click', closeDeleteModal);
document.getElementById('confirmDelete').addEventListener('click', deleteProduct);
document.getElementById('searchInput').addEventListener('input', render);

// Close modal on overlay click
document.getElementById('modal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal')) closeModal();
});
document.getElementById('deleteModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('deleteModal')) closeDeleteModal();
});

// --- Init ---
render();
