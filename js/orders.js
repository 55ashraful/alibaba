/* ============================================================
   My Daraz — Orders + Order Detail
   ============================================================ */

async function initOrdersPage() {
    if (!AppState.user) {
        showToast('Please login', 'warning');
        setTimeout(() => { window.location.href = baseUrl('login.html?next=orders.html'); }, 600);
        return;
    }
    const orders = await fetchUserOrders();
    const host = document.getElementById('orders-host');
    if (!host) return;
    if (!orders.length) {
        host.innerHTML = `<div class="empty-state"><div class="icon">📦</div><h3>${t('common.empty')}</h3><p>আপনার কোনো অর্ডার নেই</p><a class="btn" href="${baseUrl('index.html')}">${t('nav.home')}</a></div>`;
        hideSplash();
        return;
    }
    // Filter by status if query param
    const statusFilter = getQueryParam('status');
    const filtered = statusFilter ? orders.filter(o => (o.status || 'Pending').toLowerCase() === statusFilter.toLowerCase()) : orders;
    host.innerHTML = filtered.map(o => orderCardHTML(o)).join('');
    hideSplash();
}

function orderCardHTML(o) {
    const total = o.total || (o.items || []).reduce((s, i) => s + i.price * i.qty, 0);
    const status = o.status || 'Pending';
    const statusClass = status.toLowerCase();
    const firstItem = (o.items && o.items[0]) || {};
    const totalItems = (o.items || []).reduce((s, i) => s + i.qty, 0);
    const payLabel = orderPaymentLabel(o);
    return `
        <div class="order-card">
            <div class="oc-header">
                <div>
                    <div class="oc-id">Order #${o.id}</div>
                    <div class="oc-id">${formatDate(o.orderDate, true)}</div>
                </div>
                <span class="oc-status ${statusClass}">${status}</span>
            </div>
            <div class="oc-body">
                <img src="${firstItem.imageUrl || ''}" alt="">
                <div class="oc-info">
                    <h4>${firstItem.name || 'Order'}${totalItems > 1 ? ` + ${bn(totalItems - 1)} more` : ''}</h4>
                    <p>${bn(totalItems)} item(s) · ${payLabel}</p>
                    ${o.paymentStatus && o.paymentStatus !== 'approved' ? `<p style="font-size:var(--font-size-xs);color:var(--warning-amber);">⏳ Payment: ${o.paymentStatus}</p>` : ''}
                </div>
            </div>
            <div class="oc-footer">
                <span class="total">${t('cart.total')}: ${formatTk(total)}</span>
                <div class="actions">
                    <a class="btn btn-sm btn-outline" href="${baseUrl('order-detail.html?id=' + o.id)}">${t('common.viewAll')}</a>
                    ${status === 'Pending' ? `<button class="btn btn-sm btn-danger" onclick="cancelOrder('${o.id}')">Cancel</button>` : ''}
                </div>
            </div>
        </div>
    `;
}

function orderPaymentLabel(o) {
    if (!o || !o.payment) return 'COD';
    if (o.payment === 'home') return '🏠 Home Delivery';
    if (o.payment === 'cod') return '💵 COD';
    if (o.payment === 'prepaid') return `📱 ${o.paymentMethod ? o.paymentMethod.toUpperCase() : 'Prepaid'}`;
    return o.payment.toUpperCase();
}

async function cancelOrder(id) {
    if (!confirm('Cancel this order?')) return;
    if (db && !AppState.user.uid.startsWith('demo-')) {
        try {
            await db.collection('orders').doc(id).update({ status: 'Cancelled' });
        } catch (e) {
            // Update local
            const orders = LS.get('orders', []);
            const idx = orders.findIndex(o => o.id === id);
            if (idx >= 0) { orders[idx].status = 'Cancelled'; LS.set('orders', orders); }
        }
    } else {
        const orders = LS.get('orders', []);
        const idx = orders.findIndex(o => o.id === id);
        if (idx >= 0) { orders[idx].status = 'Cancelled'; LS.set('orders', orders); }
    }
    showToast('Order cancelled', 'info');
    initOrdersPage();
}

// Order detail page
async function initOrderDetailPage() {
    const id = getQueryParam('id');
    if (!id) { window.location.href = baseUrl('orders.html'); return; }
    if (!AppState.user) {
        setTimeout(() => { window.location.href = baseUrl('login.html?next=order-detail.html?id=' + id); }, 600);
        return;
    }
    let order = null;
    if (db && !AppState.user.uid.startsWith('demo-')) {
        try {
            const doc = await db.collection('orders').doc(id).get();
            if (doc.exists) order = { id: doc.id, ...doc.data() };
        } catch (e) {}
    }
    if (!order) {
        order = LS.get('orders', []).find(o => o.id === id);
    }
    if (!order) {
        document.getElementById('order-detail-host').innerHTML = `<div class="empty-state"><div class="icon">❓</div><h3>Order not found</h3></div>`;
        hideSplash();
        return;
    }
    renderOrderDetail(order);
    hideSplash();
}

function renderOrderDetail(o) {
    const host = document.getElementById('order-detail-host');
    if (!host) return;
    document.title = `Order #${o.id} — My Daraz`;
    const status = o.status || 'Pending';
    host.innerHTML = `
        <div class="checkout-block">
            <div class="oc-header">
                <div>
                    <div class="oc-id">Order #${o.id}</div>
                    <div class="oc-id">${formatDate(o.orderDate, true)}</div>
                </div>
                <span class="oc-status ${status.toLowerCase()}">${status}</span>
            </div>
        </div>
        <div class="checkout-block">
            <h3>📦 Order Tracking</h3>
            ${o.payment === 'prepaid' && o.paymentStatus !== 'approved' ? `
                <div class="prepaid-waiting-box">
                    <p style="margin:0;color:var(--warning-amber);font-weight:600;">⏳ পেমেন্ট অ্যাপ্রুভালের অপেক্ষায়</p>
                    <p style="font-size:var(--font-size-sm);color:var(--text-muted);margin-top:4px;">অ্যাডমিন আপনার ${o.paymentMethod ? o.paymentMethod.toUpperCase() : ''} পেমেন্ট (TrxID: ${o.txnId || '—'}) ভেরিফাই করে অ্যাপ্রুভ করলে অর্ডার প্রসেস শুরু হবে।</p>
                </div>
            ` : ''}
            <div class="tracking-progress">
                ${renderTrackingStep('Order Placed', formatDate(o.orderDate, true), status !== 'Cancelled', ['Pending','Confirmed','Shipped','Delivered'].includes(status))}
                ${renderTrackingStep('Confirmed', 'Order confirmed by seller', ['Confirmed','Shipped','Delivered'].includes(status), false)}
                ${renderTrackingStep('Shipped', 'On the way to your address', ['Shipped','Delivered'].includes(status), false)}
                ${renderTrackingStep('Out for Delivery', 'Courier is on the way', false, false)}
                ${renderTrackingStep('Delivered', 'Order delivered', status === 'Delivered', false)}
            </div>
        </div>
        <div class="checkout-block">
            <h3>📋 Order Items</h3>
            ${(o.items || []).map(item => `
                <div class="cart-item">
                    <div class="ci-img"><img src="${item.imageUrl}" alt=""></div>
                    <div class="ci-info">
                        <h4>${item.name}</h4>
                        <div class="ci-price-row">
                            <span class="ci-price">${formatTk(item.price)}</span>
                            <span class="text-muted">× ${bn(item.qty)}</span>
                            <a class="link" style="margin-left:auto;color:var(--daraz-orange);font-size:var(--font-size-xs);" href="${baseUrl('product.html?id=' + item.id)}">Buy again</a>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="checkout-block">
            <h3>📍 Delivery Address</h3>
            ${o.address ? `
                <p><strong>${o.address.name}</strong> — ${o.address.phone}</p>
                <p class="text-muted">${o.address.text}</p>
            ` : '<p class="text-muted">No address</p>'}
        </div>
        <div class="checkout-block">
            <h3>💰 Payment Summary</h3>
            <div class="summary-row"><span>${t('common.subtotal')}</span><span>${formatTk(o.subtotal || 0)}</span></div>
            <div class="summary-row"><span>${t('common.shipping')}</span><span>${o.shipping ? formatTk(o.shipping) : t('common.free')}</span></div>
            ${o.discount > 0 ? `<div class="summary-row text-success"><span>Discount</span><span>−${formatTk(o.discount)}</span></div>` : ''}
            ${o.coinDiscount > 0 ? `<div class="summary-row text-success"><span>🪙 Coin discount (${bn(o.coinsUsed || 0)} coins)</span><span>−${formatTk(o.coinDiscount)}</span></div>` : ''}
            <div class="summary-row total"><span>${t('cart.total')}</span><span class="amount">${formatTk(o.total || 0)}</span></div>
            <p class="text-muted mt-2">Payment: ${orderPaymentLabel(o)}</p>
            ${o.payment === 'prepaid' ? `
                <div class="prepaid-status-box">
                    <p><strong>Method:</strong> ${o.paymentMethod ? o.paymentMethod.toUpperCase() : '—'}</p>
                    <p><strong>TrxID:</strong> <code>${o.txnId || '—'}</code></p>
                    <p><strong>Status:</strong>
                        <span class="badge ${o.paymentStatus === 'approved' ? 'badge-green' : o.paymentStatus === 'rejected' ? 'badge-red' : 'badge-orange'}">
                            ${o.paymentStatus || 'pending'}
                        </span>
                    </p>
                    ${o.paymentStatus === 'pending' ? '<p style="font-size:var(--font-size-xs);color:var(--warning-amber);">⏳ অ্যাডমিন অ্যাপ্রুভ করার অপেক্ষায়</p>' : ''}
                </div>
            ` : ''}
        </div>
        <div style="display:flex;gap:var(--sp-2);flex-wrap:wrap;">
            <a class="btn" href="${baseUrl('orders.html')}">${t('nav.orders')}</a>
            ${status === 'Delivered' ? `<button class="btn btn-outline" onclick="leaveReview()">Leave a Review</button>` : ''}
            ${status === 'Pending' ? `<button class="btn btn-danger" onclick="cancelOrder('${o.id}');location.href='${baseUrl('orders.html')}'">Cancel Order</button>` : ''}
        </div>
    `;
}

function renderTrackingStep(title, subtitle, done, current) {
    const cls = current ? 'current' : (done ? 'done' : '');
    const icon = done ? '✓' : (current ? '⋯' : '○');
    return `<div class="tracking-step ${cls}"><div class="ts-dot">${icon}</div><div class="ts-info"><h5>${title}</h5><p>${subtitle}</p></div></div>`;
}

function leaveReview() {
    showToast('Visit product page to leave a review', 'info');
}
