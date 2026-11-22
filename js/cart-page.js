/* ============================================================
   My Daraz — Cart Page Logic
   ============================================================ */

async function initCartPage() {
    await loadCart();
    renderCartPage();
    hideSplash();
}

function renderCartPage() {
    const host = document.getElementById('cart-host');
    if (!host) return;
    if (!AppState.cart.length) {
        host.innerHTML = `
            <div class="empty-state">
                <div class="icon">🛒</div>
                <h3>${t('cart.empty')}</h3>
                <p>${t('cart.emptyHint')}</p>
                <a class="btn" href="${baseUrl('index.html')}">${t('nav.home')}</a>
            </div>
        `;
        return;
    }
    const subtotal = getCartTotal();
    const discount = AppState.couponDiscount || 0;
    const shipping = subtotal >= 500 ? 0 : 60;
    const total = Math.max(0, subtotal - discount) + shipping;
    host.innerHTML = `
        <div class="cart-page">
            <div class="cart-items">
                ${AppState.cart.map((item, idx) => `
                    <div class="cart-item">
                        <div class="ci-img"><img src="${item.imageUrl}" alt=""></div>
                        <div class="ci-info">
                            <h4>${item.name}</h4>
                            ${item.variant ? `<div class="ci-variant">${item.variant}</div>` : ''}
                            <div class="ci-price-row">
                                <div>
                                    <span class="ci-price">${formatTk(item.price)}</span>
                                    ${item.oldPrice ? `<span class="old-price">${formatTk(item.oldPrice)}</span>` : ''}
                                </div>
                                <div class="ci-actions">
                                    <div class="qty-control">
                                        <button onclick="cartChangeQty(${idx}, -1)">−</button>
                                        <input type="number" value="${item.qty}" min="1" readonly>
                                        <button onclick="cartChangeQty(${idx}, 1)">+</button>
                                    </div>
                                    <span class="icon-btn" onclick="cartRemove(${idx})" title="${t('cart.removeItem')}">🗑</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="cart-summary">
                <h3>${t('cart.title')}</h3>
                <div class="coupon-input-row">
                    <input type="text" id="cartCouponInput" class="input" placeholder="${t('cart.coupon')}">
                    <button class="btn btn-sm" onclick="applyCartCoupon()">${t('common.apply')}</button>
                </div>
                ${AppState.appliedCoupon ? `<p class="text-success" style="font-size:var(--font-size-xs);">✓ Coupon "${AppState.appliedCoupon.code}" applied (saved ${formatTk(AppState.couponDiscount)})</p>` : ''}
                <div class="summary-row"><span>${t('common.subtotal')} (${bn(AppState.cart.length)} items)</span><span>${formatTk(subtotal)}</span></div>
                <div class="summary-row"><span>${t('common.shipping')}</span><span>${shipping === 0 ? t('common.free') : formatTk(shipping)}</span></div>
                ${discount > 0 ? `<div class="summary-row text-success"><span>Discount</span><span>−${formatTk(discount)}</span></div>` : ''}
                <div class="summary-row total"><span>${t('cart.total')}</span><span class="amount">${formatTk(total)}</span></div>
                <button class="btn btn-block checkout-btn" onclick="goToCheckout()">${t('cart.checkout')}</button>
                <a class="btn btn-ghost btn-block mt-2" href="${baseUrl('index.html')}">${t('common.back')}</a>
            </div>
        </div>
    `;
}

function cartChangeQty(idx, delta) {
    const newQty = (AppState.cart[idx].qty || 1) + delta;
    if (newQty < 1) {
        cartRemove(idx);
        return;
    }
    updateCartQty(idx, newQty);
    renderCartPage();
}

function cartRemove(idx) {
    if (!confirm('Remove this item?')) return;
    removeFromCart(idx);
    renderCartPage();
}

function applyCartCoupon() {
    const code = document.getElementById('cartCouponInput').value.trim();
    if (!code) return;
    applyCouponToCart(code);
    renderCartPage();
}

function goToCheckout() {
    if (!AppState.user) {
        showToast('Please login to checkout', 'warning');
        setTimeout(() => { window.location.href = baseUrl('login.html?next=checkout.html'); }, 800);
        return;
    }
    window.location.href = baseUrl('checkout.html');
}
