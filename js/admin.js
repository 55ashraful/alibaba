/* ============================================================
   My Daraz — Admin Dashboard (full control via localStorage)
   Sections:
     - Dashboard (stats + recent orders)
     - Products (add/edit/delete — full form)
     - Categories (add/edit/delete)
     - Orders (status change)
     - Payment Approvals (approve/reject Prepaid orders)
     - Users (list/delete)
     - Coupons (add/edit/delete)
     - Payment Accounts (bKash/Nagad/Rocket numbers shown to users)
     - Offer Banners (popup banners on home, 3 sec, X dismiss)
     - Coins (settings: coinValue, earnPerTk, welcomeBonus, etc.)
     - Settings (site info, contact, banners)
   ============================================================ */

let adminState = { section: 'dashboard', editingProduct: null, editingCategory: null, editingCoupon: null };

async function initAdminPage() {
    if (!AppState.user) {
        setTimeout(() => { window.location.href = baseUrl('login.html?next=admin.html'); }, 400);
        return;
    }
    if (!isUserAdmin()) {
        document.getElementById('admin-host').innerHTML = `
            <div class="empty-state">
                <div class="icon">🚫</div>
                <h3>Access Denied</h3>
                <p>আপনার অ্যাডমিন অনুমতি নেই। অ্যাডমিন হিসেবে লগইন করুন।</p>
                <p class="text-muted">Demo admin: admin@daraz.local / admin123</p>
                <a class="btn" href="${baseUrl('login.html')}">${t('nav.login')}</a>
            </div>
        `;
        hideSplash();
        return;
    }
    await loadAdminData();
    adminState.section = getQueryParam('section') || 'dashboard';
    renderAdminPage();
    hideSplash();
}

async function loadAdminData() {
    AppState.allProducts = await fetchProducts();
    AppState.allCategories = await fetchCategories();
}

function renderAdminPage() {
    const host = document.getElementById('admin-host');
    if (!host) return;
    const sections = [
        ['dashboard', '📊', 'Dashboard'],
        ['products', '📦', 'Products'],
        ['categories', '🏷', 'Categories'],
        ['orders', '🛒', 'Orders'],
        ['payments', '💳', 'Payment Approvals'],
        ['coupons', '🎟', 'Coupons'],
        ['accounts', '🏦', 'Payment Accounts'],
        ['offers', '🎁', 'Offer Banners'],
        ['coins', '🪙', 'Coins'],
        ['users', '👥', 'Users'],
        ['settings', '⚙', 'Settings']
    ];
    host.innerHTML = `
        <div class="admin-layout">
            <aside class="admin-sidebar">
                <div class="admin-brand">🛠 My Daraz Admin</div>
                ${sections.map(([id, icon, label]) => `
                    <a class="admin-nav-link ${adminState.section === id ? 'active' : ''}" onclick="switchAdminSection('${id}')"><span class="icon">${icon}</span>${label}</a>
                `).join('')}
                <a class="admin-nav-link" href="${baseUrl('index.html')}"><span class="icon">🏠</span>Back to Store</a>
            </aside>
            <div class="admin-mobile-nav">
                ${sections.map(([id, icon, label]) => `
                    <a class="amn-link ${adminState.section === id ? 'active' : ''}" onclick="switchAdminSection('${id}')" title="${label}">${icon}</a>
                `).join('')}
            </div>
            <main class="admin-main" id="admin-content"></main>
        </div>
    `;
    renderAdminContent();
}

function switchAdminSection(section) {
    adminState.section = section;
    renderAdminPage();
}

function renderAdminContent() {
    const content = document.getElementById('admin-content');
    if (!content) return;
    switch (adminState.section) {
        case 'dashboard': content.innerHTML = adminDashboardHTML(); break;
        case 'products': content.innerHTML = adminProductsHTML(); break;
        case 'categories': content.innerHTML = adminCategoriesHTML(); break;
        case 'orders': content.innerHTML = adminOrdersHTML(); break;
        case 'payments': content.innerHTML = adminPaymentsHTML(); break;
        case 'coupons': content.innerHTML = adminCouponsHTML(); break;
        case 'accounts': content.innerHTML = adminAccountsHTML(); break;
        case 'offers': content.innerHTML = adminOffersHTML(); break;
        case 'coins': content.innerHTML = adminCoinsHTML(); break;
        case 'users': content.innerHTML = adminUsersHTML(); break;
        case 'settings': content.innerHTML = adminSettingsHTML(); break;
    }
}

/* ---------- Dashboard ---------- */
function adminDashboardHTML() {
    const totalProducts = AppState.allProducts.length;
    const orders = LS.get('orders', []);
    const pendingPayments = getPaymentTransactions().filter(t => t.status === 'pending').length;
    const totalUsers = getDemoAccounts().length;
    const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
    return `
        <div class="admin-header"><h1>Dashboard</h1><span class="badge badge-green">Live</span></div>
        <div class="stat-grid">
            <div class="stat-card"><div class="stat-icon">📦</div><div class="stat-info"><div class="label">Products</div><div class="value">${bn(totalProducts)}</div></div></div>
            <div class="stat-card"><div class="stat-icon">🛒</div><div class="stat-info"><div class="label">Orders</div><div class="value">${bn(orders.length)}</div></div></div>
            <div class="stat-card"><div class="stat-icon">💳</div><div class="stat-info"><div class="label">Pending Payments</div><div class="value">${bn(pendingPayments)}</div></div></div>
            <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-info"><div class="label">Revenue</div><div class="value">${formatTk(totalRevenue)}</div></div></div>
        </div>
        <div class="admin-table-card">
            <h3>Recent Orders</h3>
            <table class="admin-table">
                <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                    ${orders.slice(-6).reverse().map(o => `
                        <tr>
                            <td>#${o.id}</td>
                            <td>${o.address?.name || o.userName || o.userId}</td>
                            <td>${bn((o.items || []).length)}</td>
                            <td>${formatTk(o.total || 0)}</td>
                            <td>${paymentLabel(o.payment, o.paymentMethod)}${o.paymentStatus ? ` <span class="badge ${o.paymentStatus === 'approved' ? 'badge-green' : o.paymentStatus === 'rejected' ? 'badge-red' : 'badge-orange'}">${o.paymentStatus}</span>` : ''}</td>
                            <td><span class="badge ${(o.status || 'Pending').toLowerCase()}">${o.status || 'Pending'}</span></td>
                            <td>${formatDate(o.orderDate)}</td>
                        </tr>
                    `).join('') || '<tr><td colspan="7" class="text-center text-muted">No orders yet</td></tr>'}
                </tbody>
            </table>
        </div>
        ${pendingPayments > 0 ? `
            <div class="admin-table-card">
                <h3>⚠️ Pending Payment Approvals</h3>
                <p class="text-muted">নিচের ${bn(pendingPayments)} টি Prepaid অর্ডার পেমেন্ট অ্যাপ্রুভালের অপেক্ষায় আছে।</p>
                <button class="btn mt-2" onclick="switchAdminSection('payments')">পেমেন্ট অ্যাপ্রুভ করুন →</button>
            </div>
        ` : ''}
    `;
}

function paymentLabel(payment, method) {
    if (payment === 'home') return '🏠 Home Delivery';
    if (payment === 'cod') return '💵 COD';
    if (payment === 'prepaid') return `📱 ${method ? method.toUpperCase() : 'Prepaid'}`;
    return payment || '—';
}

/* ---------- Products ---------- */
function adminProductsHTML() {
    return `
        <div class="admin-header">
            <h1>Products</h1>
            <button class="btn" onclick="openProductModal()">+ Add Product</button>
        </div>
        <div class="admin-table-card">
            <table class="admin-table">
                <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Discount</th><th>Actions</th></tr></thead>
                <tbody>
                    ${AppState.allProducts.map(p => `
                        <tr>
                            <td><img class="row-img" src="${p.imageUrl}" alt=""></td>
                            <td>${p.name}</td>
                            <td>${p.category}</td>
                            <td>${formatTk(p.price)}</td>
                            <td>${p.discount ? bn(p.discount) + '%' : '—'}</td>
                            <td>
                                <button class="action-btn edit" onclick="editProduct('${p.id}')">Edit</button>
                                <button class="action-btn delete" onclick="deleteProduct('${p.id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('') || '<tr><td colspan="6" class="text-center text-muted">No products</td></tr>'}
                </tbody>
            </table>
        </div>
        <div id="productModalHolder"></div>
    `;
}

function openProductModal(id = null) {
    const p = id ? AppState.allProducts.find(x => x.id === id) : null;
    adminState.editingProduct = p;
    const holder = document.getElementById('productModalHolder');
    holder.innerHTML = `
        <div class="modal active" id="productFormModal">
            <div class="modal-content modal-lg">
                <div class="modal-header">
                    <h2>${p ? 'Edit' : 'Add'} Product</h2>
                    <span class="modal-close" onclick="closeProductModal()">×</span>
                </div>
                <div class="admin-form-row two">
                    <div><label class="label">Name</label><input class="input" id="pName" value="${p?.name || ''}"></div>
                    <div><label class="label">Brand</label><input class="input" id="pBrand" value="${p?.brand || ''}"></div>
                </div>
                <div class="admin-form-row three">
                    <div><label class="label">Price (৳)</label><input class="input" type="number" id="pPrice" value="${p?.price || ''}"></div>
                    <div><label class="label">Old Price (৳)</label><input class="input" type="number" id="pOldPrice" value="${p?.oldPrice || ''}"></div>
                    <div><label class="label">Discount (%)</label><input class="input" type="number" id="pDiscount" value="${p?.discount || ''}"></div>
                </div>
                <div class="admin-form-row two">
                    <div>
                        <label class="label">Category</label>
                        <select class="select" id="pCategory">
                            ${AppState.allCategories.map(c => `<option ${p?.category === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
                        </select>
                    </div>
                    <div><label class="label">Image URL</label><input class="input" id="pImageUrl" value="${p?.imageUrl || ''}"></div>
                </div>
                <div><label class="label">Description</label><textarea class="textarea" id="pDesc" rows="3">${p?.description || ''}</textarea></div>
                <div style="margin-top:var(--sp-3);display:flex;gap:var(--sp-2);">
                    <button class="btn" onclick="saveProductFromModal()">${t('common.save')}</button>
                    <button class="btn btn-ghost" onclick="closeProductModal()">${t('common.cancel')}</button>
                </div>
            </div>
        </div>
    `;
}

function closeProductModal() {
    document.getElementById('productFormModal')?.remove();
    adminState.editingProduct = null;
}

function saveProductFromModal() {
    const name = document.getElementById('pName').value.trim();
    if (!name) { showToast('Name is required', 'warning'); return; }
    const cat = document.getElementById('pCategory').value;
    const catObj = AppState.allCategories.find(c => c.name === cat);
    const data = {
        name,
        brand: document.getElementById('pBrand').value.trim(),
        price: parseInt(document.getElementById('pPrice').value) || 0,
        oldPrice: parseInt(document.getElementById('pOldPrice').value) || 0,
        discount: parseInt(document.getElementById('pDiscount').value) || 0,
        category: cat,
        category_en: catObj?.name_en || cat,
        imageUrl: document.getElementById('pImageUrl').value.trim() || 'https://via.placeholder.com/200?text=Product',
        description: document.getElementById('pDesc').value.trim(),
        rating: adminState.editingProduct?.rating ?? 4.5,
        ratingCount: adminState.editingProduct?.ratingCount ?? 0,
        sold: adminState.editingProduct?.sold ?? 0,
        specs: adminState.editingProduct?.specs || {},
        images: adminState.editingProduct?.images || []
    };
    if (adminState.editingProduct) {
        const idx = AppState.allProducts.findIndex(p => p.id === adminState.editingProduct.id);
        AppState.allProducts[idx] = { ...adminState.editingProduct, ...data };
        showToast('Product updated', 'success');
    } else {
        const id = 'p' + Date.now();
        AppState.allProducts.push({ id, ...data });
        showToast('Product added', 'success');
    }
    saveProductsLocal(AppState.allProducts);
    closeProductModal();
    renderAdminContent();
}

function editProduct(id) { openProductModal(id); }

function deleteProduct(id) {
    if (!confirm('Delete this product?')) return;
    AppState.allProducts = AppState.allProducts.filter(p => p.id !== id);
    saveProductsLocal(AppState.allProducts);
    showToast('Product deleted', 'info');
    renderAdminContent();
}

/* ---------- Categories ---------- */
function adminCategoriesHTML() {
    return `
        <div class="admin-header"><h1>Categories</h1><button class="btn" onclick="openCategoryModal()">+ Add Category</button></div>
        <div class="admin-table-card">
            <table class="admin-table">
                <thead><tr><th>Image</th><th>Name (BN)</th><th>Name (EN)</th><th>ID</th><th>Products</th><th>Actions</th></tr></thead>
                <tbody>
                    ${AppState.allCategories.map(c => `
                        <tr>
                            <td><img class="row-img" src="${c.imageUrl}" alt=""></td>
                            <td>${c.name}</td>
                            <td>${c.name_en || c.id}</td>
                            <td><code>${c.id}</code></td>
                            <td>${bn(AppState.allProducts.filter(p => p.category === c.name || p.category_en === c.name_en).length)}</td>
                            <td>
                                <button class="action-btn edit" onclick="editCategory('${c.id}')">Edit</button>
                                <button class="action-btn delete" onclick="deleteCategory('${c.id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div id="categoryModalHolder"></div>
    `;
}

function openCategoryModal(id = null) {
    const c = id ? AppState.allCategories.find(x => x.id === id) : null;
    adminState.editingCategory = c;
    document.getElementById('categoryModalHolder').innerHTML = `
        <div class="modal active" id="categoryFormModal">
            <div class="modal-content modal-sm">
                <div class="modal-header"><h2>${c ? 'Edit' : 'Add'} Category</h2><span class="modal-close" onclick="closeCategoryModal()">×</span></div>
                <div class="admin-form-row">
                    <div><label class="label">Name (Bengali)</label><input class="input" id="cName" value="${c?.name || ''}"></div>
                    <div><label class="label">Name (English)</label><input class="input" id="cNameEn" value="${c?.name_en || ''}"></div>
                    <div><label class="label">Image URL</label><input class="input" id="cImageUrl" value="${c?.imageUrl || ''}"></div>
                </div>
                <div style="margin-top:var(--sp-3);display:flex;gap:var(--sp-2);">
                    <button class="btn" onclick="saveCategoryFromModal()">${t('common.save')}</button>
                    <button class="btn btn-ghost" onclick="closeCategoryModal()">${t('common.cancel')}</button>
                </div>
            </div>
        </div>
    `;
}
function closeCategoryModal() {
    document.getElementById('categoryFormModal')?.remove();
    adminState.editingCategory = null;
}
function saveCategoryFromModal() {
    const name = document.getElementById('cName').value.trim();
    const name_en = document.getElementById('cNameEn').value.trim();
    const imageUrl = document.getElementById('cImageUrl').value.trim() || 'https://via.placeholder.com/100?text=Cat';
    if (!name) { showToast('Bengali name is required', 'warning'); return; }
    if (adminState.editingCategory) {
        const idx = AppState.allCategories.findIndex(c => c.id === adminState.editingCategory.id);
        AppState.allCategories[idx] = { ...AppState.allCategories[idx], name, name_en, imageUrl };
        showToast('Category updated', 'success');
    } else {
        const id = 'cat' + Date.now();
        AppState.allCategories.push({ id, name, name_en, imageUrl });
        showToast('Category added', 'success');
    }
    saveCategoriesLocal(AppState.allCategories);
    closeCategoryModal();
    renderAdminContent();
}
function editCategory(id) { openCategoryModal(id); }
function deleteCategory(id) {
    const productsInCat = AppState.allProducts.filter(p => {
        const c = AppState.allCategories.find(c => c.id === id);
        return c && (p.category === c.name || p.category_en === c.name_en);
    }).length;
    if (productsInCat > 0) {
        if (!confirm(`এই ক্যাটাগরিতে ${productsInCat} টি পণ্য আছে। তবুও ডিলিট করতে চান? (পণ্যগুলো থেকে যাবে)`)) return;
    } else {
        if (!confirm('Delete this category?')) return;
    }
    AppState.allCategories = AppState.allCategories.filter(c => c.id !== id);
    saveCategoriesLocal(AppState.allCategories);
    showToast('Category deleted', 'info');
    renderAdminContent();
}

/* ---------- Orders ---------- */
function adminOrdersHTML() {
    const orders = LS.get('orders', []);
    return `
        <div class="admin-header"><h1>Orders</h1></div>
        <div class="admin-table-card">
            <table class="admin-table">
                <thead><tr><th>Order ID</th><th>Customer</th><th>Phone</th><th>Payment</th><th>Total</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
                <tbody>
                    ${orders.length ? orders.slice().reverse().map(o => `
                        <tr>
                            <td>#${o.id}</td>
                            <td>${o.address?.name || o.userName || '—'}</td>
                            <td>${o.address?.phone || '—'}</td>
                            <td>${paymentLabel(o.payment, o.paymentMethod)}${o.paymentStatus ? ` <span class="badge ${o.paymentStatus === 'approved' ? 'badge-green' : o.paymentStatus === 'rejected' ? 'badge-red' : 'badge-orange'}">${o.paymentStatus}</span>` : ''}</td>
                            <td>${formatTk(o.total || 0)}</td>
                            <td><span class="badge ${(o.status || 'Pending').toLowerCase()}">${o.status || 'Pending'}</span></td>
                            <td>${formatDate(o.orderDate)}</td>
                            <td>
                                <select class="select" style="padding:4px;font-size:var(--font-size-xs);" onchange="updateOrderStatus('${o.id}', this.value)">
                                    <option ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                    <option ${o.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                                    <option ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                                    <option ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                                    <option ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                                </select>
                            </td>
                        </tr>
                    `).join('') : '<tr><td colspan="8" class="text-center text-muted">No orders yet</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

function updateOrderStatus(id, status) {
    const orders = LS.get('orders', []);
    const idx = orders.findIndex(o => o.id === id);
    if (idx >= 0) {
        orders[idx].status = status;
        LS.set('orders', orders);
        showToast(`Order ${id} marked as ${status}`, 'success');
        renderAdminContent();
    }
}

/* ---------- Payment Approvals ---------- */
function adminPaymentsHTML() {
    const txns = getPaymentTransactions();
    return `
        <div class="admin-header"><h1>Payment Approvals</h1></div>
        <div class="admin-table-card">
            <p class="text-muted" style="font-size:var(--font-size-sm);margin-bottom:var(--sp-3);">
                Prepaid অর্ডারগুলো এখানে দেখা যাচ্ছে। ইউজার যখন bKash/Nagad/Rocket এ Send Money করে TrxID দেয়, তখন অর্ডার Pending অবস্থায় থাকে। আপনি ভেরিফাই করে Approve করলে অর্ডার Confirmed হয়ে যাবে।
            </p>
            <table class="admin-table">
                <thead><tr><th>Order ID</th><th>Customer</th><th>Method</th><th>Amount</th><th>TrxID</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                    ${txns.length ? txns.map(t => `
                        <tr>
                            <td>#${t.orderId}</td>
                            <td>${t.userName || t.uid}</td>
                            <td>${(t.method || '').toUpperCase()}</td>
                            <td>${formatTk(t.amount)}</td>
                            <td><code>${t.txnId || '—'}</code></td>
                            <td><span class="badge ${t.status === 'approved' ? 'badge-green' : t.status === 'rejected' ? 'badge-red' : 'badge-orange'}">${t.status}</span></td>
                            <td>${formatDate(t.date)}</td>
                            <td>
                                ${t.status === 'pending' ? `
                                    <button class="action-btn" style="background:rgba(46,125,50,0.12);color:var(--success-green);" onclick="approvePayment('${t.id}')">Approve</button>
                                    <button class="action-btn delete" onclick="rejectPayment('${t.id}')">Reject</button>
                                ` : '—'}
                            </td>
                        </tr>
                    `).join('') : '<tr><td colspan="8" class="text-center text-muted">No payment transactions</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

function approvePayment(id) {
    setPaymentTransactionStatus(id, 'approved');
    showToast('Payment approved — order confirmed', 'success');
    renderAdminContent();
}
function rejectPayment(id) {
    if (!confirm('Reject this payment?')) return;
    setPaymentTransactionStatus(id, 'rejected');
    showToast('Payment rejected', 'info');
    renderAdminContent();
}

/* ---------- Users ---------- */
function adminUsersHTML() {
    const users = getDemoAccounts();
    const allCoins = getAllUserCoins();
    return `
        <div class="admin-header"><h1>Users</h1></div>
        <div class="admin-table-card">
            <table class="admin-table">
                <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Coins</th><th>Actions</th></tr></thead>
                <tbody>
                    ${users.map(u => `
                        <tr>
                            <td>${u.displayName}</td>
                            <td>${u.email}</td>
                            <td>${u.phone}</td>
                            <td><span class="badge ${u.role === 'admin' ? 'badge-orange' : 'badge-blue'}">${u.role}</span></td>
                            <td>🪙 ${bn(allCoins[u.uid] || 0)}</td>
                            <td>
                                <button class="action-btn edit" onclick="giveUserCoins('${u.uid}')">+ Coins</button>
                                <button class="action-btn delete" onclick="adminDeleteUser('${u.uid}')">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function adminDeleteUser(uid) {
    if (uid === AppState.user?.uid) { showToast("Can't delete yourself", 'warning'); return; }
    if (!confirm('Delete this user?')) return;
    const accounts = getDemoAccounts().filter(a => a.uid !== uid);
    saveDemoAccounts(accounts);
    showToast('User deleted', 'info');
    renderAdminContent();
}

function giveUserCoins(uid) {
    const amt = prompt(`কত কয়েন যোগ করতে চান? (User: ${getUserNameByUid(uid)})`, '50');
    if (amt === null) return;
    const n = parseInt(amt) || 0;
    if (n <= 0) { showToast('Invalid amount', 'warning'); return; }
    addUserCoins(uid, n, `Admin bonus from ${AppState.userData?.displayName || 'Admin'}`);
    showToast(`${bn(n)} কয়েন যোগ হয়েছে`, 'success');
    renderAdminContent();
}

/* ---------- Coupons ---------- */
function adminCouponsHTML() {
    const coupons = readStore(STORE.coupons, DEMO_COUPONS);
    return `
        <div class="admin-header"><h1>Coupons</h1><button class="btn" onclick="openCouponModal()">+ Add Coupon</button></div>
        <div class="admin-table-card">
            <table class="admin-table">
                <thead><tr><th>Code</th><th>Description</th><th>Type</th><th>Amount</th><th>Min Order</th><th>Valid Until</th><th>Actions</th></tr></thead>
                <tbody>
                    ${coupons.map(c => `
                        <tr>
                            <td><span class="badge badge-orange">${c.code}</span></td>
                            <td>${c.description || '—'}</td>
                            <td>${c.type}</td>
                            <td>${c.type === 'fixed' ? formatTk(c.amount) : bn(c.amount) + '%'}</td>
                            <td>${formatTk(c.minOrder)}</td>
                            <td>${formatDate(c.validUntil)}</td>
                            <td>
                                <button class="action-btn edit" onclick="editCoupon('${c.id}')">Edit</button>
                                <button class="action-btn delete" onclick="deleteCoupon('${c.id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('') || '<tr><td colspan="7" class="text-center text-muted">No coupons</td></tr>'}
                </tbody>
            </table>
        </div>
        <div id="couponModalHolder"></div>
    `;
}
function openCouponModal(id = null) {
    const coupons = readStore(STORE.coupons, DEMO_COUPONS);
    const c = id ? coupons.find(x => x.id === id) : null;
    adminState.editingCoupon = c;
    document.getElementById('couponModalHolder').innerHTML = `
        <div class="modal active" id="couponFormModal">
            <div class="modal-content modal-sm">
                <div class="modal-header"><h2>${c ? 'Edit' : 'Add'} Coupon</h2><span class="modal-close" onclick="closeCouponModal()">×</span></div>
                <div class="admin-form-row">
                    <div><label class="label">Code</label><input class="input" id="cpCode" value="${c?.code || ''}" style="text-transform:uppercase"></div>
                    <div><label class="label">Description</label><input class="input" id="cpDesc" value="${c?.description || ''}"></div>
                    <div class="admin-form-row two">
                        <div><label class="label">Type</label>
                            <select class="select" id="cpType">
                                <option value="fixed" ${c?.type === 'fixed' ? 'selected' : ''}>Fixed (৳)</option>
                                <option value="percent" ${c?.type === 'percent' ? 'selected' : ''}>Percent (%)</option>
                            </select>
                        </div>
                        <div><label class="label">Amount</label><input class="input" type="number" id="cpAmount" value="${c?.amount || ''}"></div>
                    </div>
                    <div class="admin-form-row two">
                        <div><label class="label">Min Order (৳)</label><input class="input" type="number" id="cpMinOrder" value="${c?.minOrder || 0}"></div>
                        <div><label class="label">Valid Until</label><input class="input" type="date" id="cpValidUntil" value="${c?.validUntil || '2026-12-31'}"></div>
                    </div>
                </div>
                <div style="margin-top:var(--sp-3);display:flex;gap:var(--sp-2);">
                    <button class="btn" onclick="saveCouponFromModal()">${t('common.save')}</button>
                    <button class="btn btn-ghost" onclick="closeCouponModal()">${t('common.cancel')}</button>
                </div>
            </div>
        </div>
    `;
}
function closeCouponModal() {
    document.getElementById('couponFormModal')?.remove();
    adminState.editingCoupon = null;
}
function saveCouponFromModal() {
    const code = document.getElementById('cpCode').value.trim().toUpperCase();
    if (!code) { showToast('Code is required', 'warning'); return; }
    const data = {
        code,
        description: document.getElementById('cpDesc').value.trim(),
        type: document.getElementById('cpType').value,
        amount: parseInt(document.getElementById('cpAmount').value) || 0,
        minOrder: parseInt(document.getElementById('cpMinOrder').value) || 0,
        validUntil: document.getElementById('cpValidUntil').value
    };
    const coupons = readStore(STORE.coupons, DEMO_COUPONS);
    if (adminState.editingCoupon) {
        const idx = coupons.findIndex(c => c.id === adminState.editingCoupon.id);
        coupons[idx] = { ...coupons[idx], ...data };
        showToast('Coupon updated', 'success');
    } else {
        coupons.push({ id: 'c' + Date.now(), ...data });
        showToast('Coupon added', 'success');
    }
    saveCouponsLocal(coupons);
    closeCouponModal();
    renderAdminContent();
}
function editCoupon(id) { openCouponModal(id); }
function deleteCoupon(id) {
    if (!confirm('Delete this coupon?')) return;
    const coupons = readStore(STORE.coupons, DEMO_COUPONS).filter(c => c.id !== id);
    saveCouponsLocal(coupons);
    showToast('Coupon deleted', 'info');
    renderAdminContent();
}

/* ---------- Payment Accounts ---------- */
function adminAccountsHTML() {
    const accs = readStore(STORE.payments, DEFAULT_PAYMENT_ACCOUNTS);
    return `
        <div class="admin-header"><h1>Payment Accounts</h1></div>
        <div class="admin-table-card">
            <p class="text-muted" style="font-size:var(--font-size-sm);margin-bottom:var(--sp-3);">
                এই অ্যাকাউন্ট নাম্বারগুলো Prepaid Delivery নির্বাচন করলে ইউজার প্যানেলে দেখাবে। ইউজার এই নাম্বারে Send Money করে TrxID দিয়ে অর্ডার কনফার্ম করবে।
            </p>
            ${['bkash','nagad','rocket'].map(m => {
                const label = { bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket' }[m];
                const color = { bkash: '#e2136e', nagad: '#ec1c24', rocket: '#8b2c8e' }[m];
                const a = accs[m] || { number: '', type: '', note: '' };
                return `
                    <div style="margin-bottom:var(--sp-3);padding:var(--sp-3);border-left:4px solid ${color};background:var(--bg-surface-alt);border-radius:var(--radius-sm);">
                        <h4 style="color:${color};">${label}</h4>
                        <div class="admin-form-row two">
                            <div><label class="label">Account Number</label><input class="input" id="acc_${m}_number" value="${a.number || ''}" placeholder="01XXXXXXXXX"></div>
                            <div><label class="label">Account Type</label><input class="input" id="acc_${m}_type" value="${a.type || 'Personal'}" placeholder="Personal / Merchant"></div>
                        </div>
                        <div><label class="label">Note (shown to user)</label><input class="input" id="acc_${m}_note" value="${a.note || `${label} Send Money`}" placeholder="${label} Send Money"></div>
                    </div>
                `;
            }).join('')}
            <button class="btn" onclick="savePaymentAccounts()">${t('common.save')} Accounts</button>
        </div>
    `;
}
function savePaymentAccounts() {
    const accs = {};
    ['bkash','nagad','rocket'].forEach(m => {
        accs[m] = {
            number: document.getElementById(`acc_${m}_number`).value.trim(),
            type: document.getElementById(`acc_${m}_type`).value.trim() || 'Personal',
            note: document.getElementById(`acc_${m}_note`).value.trim() || `${m} Send Money`
        };
    });
    writeStore(STORE.payments, accs);
    showToast('Payment accounts saved', 'success');
}

/* ---------- Offer Banners ---------- */
function adminOffersHTML() {
    const offers = readStore(STORE.offers, DEFAULT_OFFER_BANNERS);
    return `
        <div class="admin-header"><h1>Offer Banners</h1><button class="btn" onclick="openOfferModal()">+ Add Offer</button></div>
        <div class="admin-table-card">
            <p class="text-muted" style="font-size:var(--font-size-sm);margin-bottom:var(--sp-3);">
                এই অফার ব্যানারগুলো হোম পেজে পপআপ আকারে দেখাবে (Daraz এর মতো)। ইউজার পেজ খুললে স্বয়ংক্রিয়ভাবে পপআপ আসবে, কিছুক্ষণ পরে নিজে বন্ধ হবে, অথবা X চাপলে বন্ধ হবে।
            </p>
            <table class="admin-table">
                <thead><tr><th>Image</th><th>Title</th><th>Body</th><th>Duration</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                    ${offers.map(o => `
                        <tr>
                            <td>${o.imageUrl ? `<img class="row-img" src="${o.imageUrl}" alt="">` : '—'}</td>
                            <td>${o.title}</td>
                            <td style="max-width:240px;">${o.body}</td>
                            <td>${bn((o.durationMs || 3000) / 1000)}s</td>
                            <td><span class="badge ${o.active ? 'badge-green' : 'badge-orange'}">${o.active ? 'Active' : 'Inactive'}</span></td>
                            <td>
                                <button class="action-btn edit" onclick="editOffer('${o.id}')">Edit</button>
                                <button class="action-btn delete" onclick="deleteOffer('${o.id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('') || '<tr><td colspan="6" class="text-center text-muted">No offers</td></tr>'}
                </tbody>
            </table>
        </div>
        <div id="offerModalHolder"></div>
    `;
}
function openOfferModal(id = null) {
    const offers = readStore(STORE.offers, DEFAULT_OFFER_BANNERS);
    const o = id ? offers.find(x => x.id === id) : null;
    adminState.editingOffer = o;
    document.getElementById('offerModalHolder').innerHTML = `
        <div class="modal active" id="offerFormModal">
            <div class="modal-content modal-sm">
                <div class="modal-header"><h2>${o ? 'Edit' : 'Add'} Offer Banner</h2><span class="modal-close" onclick="closeOfferModal()">×</span></div>
                <div class="admin-form-row">
                    <div><label class="label">Title</label><input class="input" id="oTitle" value="${o?.title || ''}"></div>
                    <div><label class="label">Body / Message</label><textarea class="textarea" id="oBody" rows="3">${o?.body || ''}</textarea></div>
                    <div><label class="label">Image URL (optional)</label><input class="input" id="oImageUrl" value="${o?.imageUrl || ''}"></div>
                    <div class="admin-form-row two">
                        <div><label class="label">Link (page, optional)</label><input class="input" id="oLink" value="${o?.link || ''}" placeholder="flash-sale.html"></div>
                        <div><label class="label">Duration (seconds)</label><input class="input" type="number" id="oDuration" value="${(o?.durationMs || 3000) / 1000}"></div>
                    </div>
                    <div class="admin-form-row two">
                        <div><label class="label">Background Color</label><input class="input" type="color" id="oBgColor" value="${o?.bgColor || '#f85606'}" style="height:42px;padding:4px;"></div>
                        <div><label class="label">Active</label>
                            <select class="select" id="oActive">
                                <option value="true" ${o?.active !== false ? 'selected' : ''}>Active (show on home)</option>
                                <option value="false" ${o?.active === false ? 'selected' : ''}>Inactive (hide)</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div style="margin-top:var(--sp-3);display:flex;gap:var(--sp-2);">
                    <button class="btn" onclick="saveOfferFromModal()">${t('common.save')}</button>
                    <button class="btn btn-ghost" onclick="closeOfferModal()">${t('common.cancel')}</button>
                </div>
            </div>
        </div>
    `;
}
function closeOfferModal() {
    document.getElementById('offerFormModal')?.remove();
    adminState.editingOffer = null;
}
function saveOfferFromModal() {
    const title = document.getElementById('oTitle').value.trim();
    if (!title) { showToast('Title is required', 'warning'); return; }
    const data = {
        title,
        body: document.getElementById('oBody').value.trim(),
        imageUrl: document.getElementById('oImageUrl').value.trim(),
        link: document.getElementById('oLink').value.trim(),
        durationMs: (parseInt(document.getElementById('oDuration').value) || 3) * 1000,
        bgColor: document.getElementById('oBgColor').value,
        active: document.getElementById('oActive').value === 'true'
    };
    const offers = readStore(STORE.offers, DEFAULT_OFFER_BANNERS);
    if (adminState.editingOffer) {
        const idx = offers.findIndex(o => o.id === adminState.editingOffer.id);
        offers[idx] = { ...offers[idx], ...data };
        showToast('Offer updated', 'success');
    } else {
        offers.push({ id: 'ob' + Date.now(), ...data });
        showToast('Offer added', 'success');
    }
    writeStore(STORE.offers, offers);
    closeOfferModal();
    renderAdminContent();
}
function editOffer(id) { openOfferModal(id); }
function deleteOffer(id) {
    if (!confirm('Delete this offer?')) return;
    const offers = readStore(STORE.offers, DEFAULT_OFFER_BANNERS).filter(o => o.id !== id);
    writeStore(STORE.offers, offers);
    showToast('Offer deleted', 'info');
    renderAdminContent();
}

/* ---------- Coins ---------- */
function adminCoinsHTML() {
    const s = readStore(STORE.coins, DEFAULT_COINS_SETTINGS);
    const txns = getCoinTransactions().slice(0, 20);
    return `
        <div class="admin-header"><h1>Coins</h1></div>
        <div class="admin-table-card">
            <h3>Coins Settings</h3>
            <p class="text-muted" style="font-size:var(--font-size-sm);margin-bottom:var(--sp-3);">
                কয়েন সিস্টেম পুরোপুরি আপনার কন্ট্রোলে। ইউজার কয়েন জমা করবে (অর্ডার থেকে + আপনি দিলে), আর কয়েন দিয়ে প্রোডাক্টের দাম কমাতে পারবে।
            </p>
            <div class="admin-form-row two">
                <div><label class="label">Enable Coins System</label>
                    <select class="select" id="coinsEnabled">
                        <option value="true" ${s.enabled !== false ? 'selected' : ''}>Enabled</option>
                        <option value="false" ${s.enabled === false ? 'selected' : ''}>Disabled</option>
                    </select>
                </div>
                <div><label class="label">Coin Value (৳ per coin)</label><input class="input" type="number" id="coinsValue" value="${s.coinValue || 1}"></div>
            </div>
            <div class="admin-form-row two">
                <div><label class="label">Earn Rate (1 coin per ৳ spent)</label><input class="input" type="number" id="coinsEarnPerTk" value="${s.earnPerTk || 100}"></div>
                <div><label class="label">Max Redeem % of order total</label><input class="input" type="number" id="coinsMaxRedeem" value="${s.maxRedeemPercent || 50}"></div>
            </div>
            <div><label class="label">Welcome Bonus Coins (new users)</label><input class="input" type="number" id="coinsWelcome" value="${s.welcomeBonus || 0}"></div>
            <button class="btn mt-3" onclick="saveCoinsSettings()">${t('common.save')} Settings</button>
        </div>
        <div class="admin-table-card">
            <h3>Recent Coin Transactions</h3>
            <table class="admin-table">
                <thead><tr><th>User</th><th>Type</th><th>Amount</th><th>Reason</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                    ${txns.length ? txns.map(t => `
                        <tr>
                            <td>${t.userName || t.uid}</td>
                            <td><span class="badge ${t.type === 'in' ? 'badge-green' : 'badge-orange'}">${t.type === 'in' ? 'Earned' : 'Spent'}</span></td>
                            <td>🪙 ${bn(t.amount)}</td>
                            <td>${t.reason || '—'}</td>
                            <td>${t.status}</td>
                            <td>${formatDate(t.date)}</td>
                        </tr>
                    `).join('') : '<tr><td colspan="6" class="text-center text-muted">No transactions yet</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}
function saveCoinsSettings() {
    const data = {
        enabled: document.getElementById('coinsEnabled').value === 'true',
        coinValue: parseInt(document.getElementById('coinsValue').value) || 1,
        earnPerTk: parseInt(document.getElementById('coinsEarnPerTk').value) || 100,
        maxRedeemPercent: parseInt(document.getElementById('coinsMaxRedeem').value) || 50,
        welcomeBonus: parseInt(document.getElementById('coinsWelcome').value) || 0
    };
    writeStore(STORE.coins, data);
    showToast('Coins settings saved', 'success');
}

/* ---------- Settings ---------- */
function adminSettingsHTML() {
    const info = readStore(STORE.siteInfo, DEFAULT_SITE_INFO);
    const contact = readStore(STORE.contact, DEFAULT_CONTACT_INFO);
    return `
        <div class="admin-header"><h1>Settings</h1></div>
        <div class="admin-table-card">
            <h3>Site Information</h3>
            <div class="admin-form-row two">
                <div><label class="label">Site Name</label><input class="input" id="setSiteName" value="${info.siteName || 'My Daraz'}"></div>
                <div><label class="label">Footer Color</label><input class="input" type="color" id="setFooterColor" value="${info.footerColor || '#1c5520'}" style="height:42px;padding:4px;"></div>
            </div>
            <div><label class="label">Site Logo URL (optional)</label><input class="input" id="setSiteLogo" value="${info.siteLogoUrl || ''}"></div>
            <div><label class="label">Banner URLs (one per line)</label><textarea class="textarea" rows="4" id="setBanners">${(info.bannerUrl || []).join('\n')}</textarea></div>
            <button class="btn mt-3" onclick="saveSiteInfo()">${t('common.save')} Site Info</button>
        </div>
        <div class="admin-table-card">
            <h3>Contact Information</h3>
            <div class="admin-form-row two">
                <div><label class="label">Phone</label><input class="input" id="setPhone" value="${contact.phone || ''}"></div>
                <div><label class="label">Email</label><input class="input" id="setEmail" value="${contact.email || ''}"></div>
            </div>
            <div><label class="label">Address</label><input class="input" id="setAddress" value="${contact.address || ''}"></div>
            <div class="admin-form-row two">
                <div><label class="label">Facebook URL</label><input class="input" id="setFacebook" value="${contact.facebook || ''}"></div>
                <div><label class="label">YouTube URL</label><input class="input" id="setYoutube" value="${contact.youtube || ''}"></div>
            </div>
            <div class="admin-form-row two">
                <div><label class="label">TikTok URL</label><input class="input" id="setTiktok" value="${contact.tiktok || ''}"></div>
                <div><label class="label">Telegram URL</label><input class="input" id="setTelegram" value="${contact.telegram || ''}"></div>
            </div>
            <div><label class="label">WhatsApp URL</label><input class="input" id="setWhatsapp" value="${contact.whatsapp || ''}"></div>
            <button class="btn mt-3" onclick="saveContactInfo()">${t('common.save')} Contact</button>
        </div>
    `;
}
function saveSiteInfo() {
    const info = {
        siteName: document.getElementById('setSiteName').value.trim() || 'My Daraz',
        siteLogoUrl: document.getElementById('setSiteLogo').value.trim(),
        footerColor: document.getElementById('setFooterColor').value,
        bannerUrl: document.getElementById('setBanners').value.split('\n').map(s => s.trim()).filter(Boolean),
        footerLogo1Url: '',
        footerLogo2Url: ''
    };
    writeStore(STORE.siteInfo, info);
    showToast('Site info saved', 'success');
}
function saveContactInfo() {
    const contact = {
        phone: document.getElementById('setPhone').value.trim(),
        email: document.getElementById('setEmail').value.trim(),
        address: document.getElementById('setAddress').value.trim(),
        facebook: document.getElementById('setFacebook').value.trim(),
        youtube: document.getElementById('setYoutube').value.trim(),
        tiktok: document.getElementById('setTiktok').value.trim(),
        telegram: document.getElementById('setTelegram').value.trim(),
        whatsapp: document.getElementById('setWhatsapp').value.trim()
    };
    writeStore(STORE.contact, contact);
    showToast('Contact info saved', 'success');
}
