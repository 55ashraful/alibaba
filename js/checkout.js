/* ============================================================
   My Daraz — Checkout Page Logic
   ------------------------------------------------------------
   Three payment options:
     1. Home Delivery  — pay cash at home on delivery
     2. Cash on Delivery (COD) — pay cash when courier arrives
     3. Prepaid Delivery — send money via bKash/Nagad/Rocket
        (admin-set account numbers are shown to the user).
        User pastes the transaction ID and confirms. Order is
        then "pending" until the admin approves the payment.
   ============================================================ */

let checkoutState = {
    address: null,
    payment: 'home',           // 'home' | 'cod' | 'prepaid'
    prepaidMethod: 'bkash',   // 'bkash' | 'nagad' | 'rocket'
    txnId: '',
    useCoins: false,
    coinsToUse: 0,
    addresses: []
};

let checkoutAccounts = { bkash: { number: '' }, nagad: { number: '' }, rocket: { number: '' } };
let checkoutCoinsSettings = { enabled: true, coinValue: 1, earnPerTk: 100, maxRedeemPercent: 50 };

async function initCheckoutPage() {
    if (!AppState.user) {
        showToast('Please login to checkout', 'warning');
        setTimeout(() => { window.location.href = baseUrl('login.html?next=checkout.html'); }, 600);
        return;
    }
    await loadCart();
    if (!AppState.cart.length) {
        window.location.href = baseUrl('cart.html');
        return;
    }
    await loadAddresses();
    checkoutAccounts = await fetchPaymentAccounts();
    checkoutCoinsSettings = await fetchCoinsSettings();
    // Default prepaid method to first account that has a number
    if (!checkoutAccounts.bkash?.number && checkoutAccounts.nagad?.number) checkoutState.prepaidMethod = 'nagad';
    if (!checkoutAccounts.bkash?.number && !checkoutAccounts.nagad?.number && checkoutAccounts.rocket?.number) checkoutState.prepaidMethod = 'rocket';
    // Default-select the first saved address
    if (!checkoutState.address && checkoutState.addresses.length) {
        checkoutState.address = checkoutState.addresses[0];
    }
    renderCheckoutPage();
    hideSplash();
}

async function loadAddresses() {
    if (db && !AppState.user.uid.startsWith('demo-')) {
        try {
            const doc = await db.collection('addresses').doc(AppState.user.uid).get();
            if (doc.exists) {
                checkoutState.addresses = doc.data().list || [];
                return;
            }
        } catch (e) {}
    }
    checkoutState.addresses = LS.get('addresses', [
        { id: 'a1', name: AppState.userData.displayName || 'User', phone: AppState.userData.phone || '01700000000', text: 'House 12, Road 5, Gulshan-1, Dhaka 1212', label: 'Home' }
    ]);
}

function saveAddresses() {
    LS.set('addresses', checkoutState.addresses);
    if (db && !AppState.user.uid.startsWith('demo-')) {
        try {
            db.collection('addresses').doc(AppState.user.uid).set({ list: checkoutState.addresses }, { merge: true }).catch(() => {});
        } catch (e) {}
    }
}

function getCheckoutTotals() {
    const subtotal = getCartTotal();
    const couponDiscount = AppState.couponDiscount || 0;
    const shipping = subtotal >= 500 ? 0 : 60;
    const afterCoupon = Math.max(0, subtotal - couponDiscount);
    const maxCoins = Math.min(
        getUserCoins(AppState.user?.uid || ''),
        Math.floor(afterCoupon * ((checkoutCoinsSettings.maxRedeemPercent || 50) / 100))
    );
    let coins = 0;
    if (checkoutState.useCoins) {
        const input = parseInt(document.getElementById('coinUseInput')?.value) || 0;
        coins = Math.max(0, Math.min(input, maxCoins));
    }
    const coinDiscount = coinsToTk(coins, checkoutCoinsSettings);
    const total = Math.max(0, afterCoupon - coinDiscount) + shipping;
    return { subtotal, couponDiscount, shipping, afterCoupon, maxCoins, coins, coinDiscount, total };
}

function renderCheckoutPage() {
    const host = document.getElementById('checkout-host');
    if (!host) return;
    const totals = getCheckoutTotals();
    const userCoins = getUserCoins(AppState.user?.uid || '');
    const acc = checkoutAccounts[checkoutState.prepaidMethod] || { number: '', type: '', note: '' };

    host.innerHTML = `
        <div class="checkout-page">
            <div>
                <div class="checkout-block">
                    <h3><span class="step-num">1</span> ${t('checkout.address')}</h3>
                    <div class="address-list" id="address-list">
                        ${checkoutState.addresses.map(a => `
                            <div class="address-card ${checkoutState.address && checkoutState.address.id === a.id ? 'selected' : !checkoutState.address && a.id === checkoutState.addresses[0].id ? 'selected' : ''}" onclick="selectAddress('${a.id}')">
                                <div class="ac-name">${a.name}</div>
                                <div class="ac-phone">${a.phone}</div>
                                <div class="ac-text">${a.text}</div>
                                <div class="ac-actions">
                                    <span class="link" onclick="event.stopPropagation(); editAddress('${a.id}')">${t('common.edit')}</span>
                                    <span class="link" onclick="event.stopPropagation(); deleteAddress('${a.id}')">${t('common.delete')}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn btn-outline btn-sm mt-3" onclick="openAddressModal()">+ ${t('checkout.addAddress')}</button>
                </div>

                <div class="checkout-block">
                    <h3><span class="step-num">2</span> ${t('checkout.payment')}</h3>
                    <div class="payment-method-list">
                        ${renderPaymentOption('home', '🏠', 'Home Delivery', 'পেমেন্ট হবে ডেলিভারির সময় বাসায়')}
                        ${renderPaymentOption('cod', '💵', 'Cash on Delivery (COD)', 'কুরিয়ার হাতে টাকা বুঝিয়ে দিন')}
                        ${renderPaymentOption('prepaid', '📱', 'Prepaid Delivery', 'bKash / Nagad / Rocket এ সেন্ড মানি করুন')}
                    </div>

                    ${checkoutState.payment === 'prepaid' ? renderPrepaidPanel(acc) : ''}
                </div>

                ${checkoutCoinsSettings.enabled ? renderCoinsPanel(userCoins, totals) : ''}

                <div class="checkout-block">
                    <h3><span class="step-num">3</span> ${t('checkout.review')}</h3>
                    ${AppState.cart.map(item => `
                        <div class="cart-item">
                            <div class="ci-img"><img src="${item.imageUrl}" alt=""></div>
                            <div class="ci-info">
                                <h4>${item.name}</h4>
                                <div class="ci-price-row">
                                    <span class="ci-price">${formatTk(item.price)}</span>
                                    <span class="text-muted">× ${bn(item.qty)}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="cart-summary">
                <h3>${t('checkout.title')}</h3>
                <div class="summary-row"><span>${t('common.subtotal')}</span><span>${formatTk(totals.subtotal)}</span></div>
                <div class="summary-row"><span>${t('common.shipping')}</span><span>${totals.shipping === 0 ? t('common.free') : formatTk(totals.shipping)}</span></div>
                ${totals.couponDiscount > 0 ? `<div class="summary-row text-success"><span>Discount (${AppState.appliedCoupon?.code || ''})</span><span>−${formatTk(totals.couponDiscount)}</span></div>` : ''}
                ${totals.coinDiscount > 0 ? `<div class="summary-row text-success"><span>🪙 Coin discount (${bn(totals.coins)} coins)</span><span>−${formatTk(totals.coinDiscount)}</span></div>` : ''}
                <div class="summary-row total"><span>${t('cart.total')}</span><span class="amount">${formatTk(totals.total)}</span></div>

                ${checkoutState.payment === 'prepaid' ? `
                    <div class="prepaid-notice">
                        ⏳ অর্ডারটি <strong>Pending</strong> অবস্থায় থাকবে।
                        অ্যাডমিন পেমেন্ট ভেরিফাই করে <strong>Approve</strong> করলে কনফার্ম হবে।
                    </div>` : ''}

                <button class="btn btn-block checkout-btn" onclick="placeFinalOrder()">${t('checkout.placeOrder')}</button>
            </div>
        </div>
    `;
}

function renderPaymentOption(id, icon, name, desc) {
    return `
        <div class="payment-method ${checkoutState.payment === id ? 'selected' : ''}" onclick="selectPayment('${id}')">
            <span class="icon">${icon}</span>
            <div class="name">${name}<div class="desc">${desc}</div></div>
            <span class="radio"></span>
        </div>
    `;
}

function renderPrepaidPanel(acc) {
    const methods = [
        { id: 'bkash',  label: 'bKash',  color: '#e2136e' },
        { id: 'nagad',  label: 'Nagad',  color: '#ec1c24' },
        { id: 'rocket', label: 'Rocket', color: '#8b2c8e' }
    ];
    return `
        <div class="prepaid-panel">
            <div class="prepaid-method-tabs">
                ${methods.map(m => `
                    <button type="button" class="prepaid-tab ${checkoutState.prepaidMethod === m.id ? 'active' : ''}" style="${checkoutState.prepaidMethod === m.id ? `background:${m.color};color:#fff;border-color:${m.color};` : ''}" onclick="selectPrepaidMethod('${m.id}')">${m.label}</button>
                `).join('')}
            </div>
            ${acc && acc.number ? `
                <div class="prepaid-account-box">
                    <div class="pa-row">
                        <span class="pa-label">${(checkoutAccounts[checkoutState.prepaidMethod]?.note) || 'Send Money'}</span>
                        <span class="pa-type">Type: ${acc.type || 'Personal'}</span>
                    </div>
                    <div class="pa-number-row">
                        <span class="pa-number" id="prepaidNumber">${acc.number}</span>
                        <button type="button" class="btn btn-sm" onclick="copyPrepaidNumber()">📋 Copy</button>
                    </div>
                </div>
                <p class="prepaid-instruction">
                    1. উপরের নাম্বারে <strong>Send Money</strong> করুন<br>
                    2. ট্রানজেকশন আইডি (TrxID) কপি করুন<br>
                    3. নিচে TrxID বসিয়ে অর্ডার কনফার্ম করুন
                </p>
                <div class="admin-form-row">
                    <label class="label">Transaction ID (TrxID)</label>
                    <input class="input" id="txnIdInput" placeholder="যেমন: 9AB3CD12XY" value="${checkoutState.txnId || ''}" oninput="checkoutState.txnId = this.value">
                </div>
            ` : `
                <div class="prepaid-account-box">
                    <p class="text-muted">⚠️ অ্যাডমিন এখনো ${methods.find(m => m.id === checkoutState.prepaidMethod)?.label} অ্যাকাউন্ট যোগ করেননি। অন্য একটি মেথড নির্বাচন করুন অথবা Home Delivery / COD ব্যবহার করুন।</p>
                </div>
            `}
        </div>
    `;
}

function renderCoinsPanel(userCoins, totals) {
    if (userCoins <= 0) {
        return `
            <div class="checkout-block coins-block">
                <h3><span class="step-num">🪙</span> Coins</h3>
                <p class="text-muted" style="font-size:var(--font-size-sm);">আপনার কাছে ${bn(userCoins)} কয়েন আছে। অর্ডার করলে কয়েন পাবেন যা পরবর্তী অর্ডারে ছাড় হিসেবে ব্যবহার করতে পারবেন।</p>
            </div>
        `;
    }
    const coinValueTk = coinsToTk(1, checkoutCoinsSettings);
    const maxCoins = totals.maxCoins;
    return `
        <div class="checkout-block coins-block">
            <h3><span class="step-num">🪙</span> Coins</h3>
            <div class="coins-summary">
                <div>আপনার ব্যালেন্স: <strong>${bn(userCoins)} 🪙</strong></div>
                <div>1 কয়েন = ৳${bn(coinValueTk)}</div>
            </div>
            <label class="filter-option" style="display:flex;align-items:center;gap:8px;margin:var(--sp-2) 0;cursor:pointer;">
                <input type="checkbox" id="useCoinsCheckbox" ${checkoutState.useCoins ? 'checked' : ''} onchange="toggleUseCoins(this.checked)" style="accent-color:var(--daraz-orange);">
                <span>কয়েন ব্যবহার করে দাম কমান</span>
            </label>
            ${checkoutState.useCoins ? `
                <div class="coin-use-row">
                    <input type="number" id="coinUseInput" class="input" min="0" max="${maxCoins}" value="${Math.min(checkoutState.coinsToUse || maxCoins, maxCoins)}" oninput="onCoinsInputChange()" style="max-width:160px;">
                    <span class="text-muted" style="font-size:var(--font-size-sm);">সর্বোচ্চ ${bn(maxCoins)} কয়েন (৳${bn(coinsToTk(maxCoins, checkoutCoinsSettings))} ছাড়)</span>
                </div>
            ` : ''}
        </div>
    `;
}

function toggleUseCoins(checked) {
    checkoutState.useCoins = checked;
    renderCheckoutPage();
}
function onCoinsInputChange() {
    // Just re-render the summary numbers without rebuilding the input (keeps focus)
    const totals = getCheckoutTotals();
    const totalEl = document.querySelector('.cart-summary .summary-row.total .amount');
    if (totalEl) totalEl.textContent = formatTk(totals.total);
    // Also update the coin discount line if present
    let coinLine = document.querySelector('.cart-summary .coin-discount-line');
    if (totals.coinDiscount > 0) {
        if (!coinLine) {
            coinLine = document.createElement('div');
            coinLine.className = 'summary-row text-success coin-discount-line';
            const totalRow = document.querySelector('.cart-summary .summary-row.total');
            totalRow.parentNode.insertBefore(coinLine, totalRow);
        }
        coinLine.innerHTML = `<span>🪙 Coin discount (${bn(totals.coins)} coins)</span><span>−${formatTk(totals.coinDiscount)}</span>`;
    } else if (coinLine) {
        coinLine.remove();
    }
}
function selectPrepaidMethod(id) {
    checkoutState.prepaidMethod = id;
    checkoutState.txnId = (document.getElementById('txnIdInput')?.value) || '';
    renderCheckoutPage();
}
function copyPrepaidNumber() {
    const num = document.getElementById('prepaidNumber')?.textContent || '';
    if (navigator.clipboard) navigator.clipboard.writeText(num);
    showToast(`নাম্বার কপি হয়েছে: ${num}`, 'success');
}

function selectAddress(id) {
    checkoutState.address = checkoutState.addresses.find(a => a.id === id);
    renderCheckoutPage();
}

function selectPayment(id) {
    checkoutState.payment = id;
    renderCheckoutPage();
}

function openAddressModal() {
    document.getElementById('addrModalName').value = AppState.userData.displayName || '';
    document.getElementById('addrModalPhone').value = AppState.userData.phone || '';
    document.getElementById('addrModalText').value = '';
    openModal('addressModal');
}

function saveAddressFromModal() {
    const name = document.getElementById('addrModalName').value.trim();
    const phone = document.getElementById('addrModalPhone').value.trim();
    const text = document.getElementById('addrModalText').value.trim();
    const label = document.getElementById('addrModalLabel').value || 'Home';
    if (!name || !phone || !text) { showToast('Please fill all fields', 'warning'); return; }
    const id = 'a' + Date.now();
    checkoutState.addresses.push({ id, name, phone, text, label });
    saveAddresses();
    checkoutState.address = checkoutState.addresses.find(a => a.id === id);
    closeModal('addressModal');
    renderCheckoutPage();
}

function editAddress(id) {
    const a = checkoutState.addresses.find(x => x.id === id);
    if (!a) return;
    document.getElementById('addrModalName').value = a.name;
    document.getElementById('addrModalPhone').value = a.phone;
    document.getElementById('addrModalText').value = a.text;
    document.getElementById('addrModalLabel').value = a.label || 'Home';
    document.getElementById('addrModalSaveBtn').onclick = () => updateAddressFromModal(id);
    openModal('addressModal');
}

function updateAddressFromModal(id) {
    const idx = checkoutState.addresses.findIndex(a => a.id === id);
    if (idx < 0) return;
    checkoutState.addresses[idx] = {
        ...checkoutState.addresses[idx],
        name: document.getElementById('addrModalName').value.trim(),
        phone: document.getElementById('addrModalPhone').value.trim(),
        text: document.getElementById('addrModalText').value.trim(),
        label: document.getElementById('addrModalLabel').value || 'Home'
    };
    saveAddresses();
    closeModal('addressModal');
    document.getElementById('addrModalSaveBtn').onclick = saveAddressFromModal;
    renderCheckoutPage();
}

function deleteAddress(id) {
    if (!confirm('Delete this address?')) return;
    checkoutState.addresses = checkoutState.addresses.filter(a => a.id !== id);
    saveAddresses();
    renderCheckoutPage();
}

async function placeFinalOrder() {
    if (!checkoutState.address) {
        showToast('Please select a delivery address', 'warning');
        return;
    }
    const totals = getCheckoutTotals();

    if (checkoutState.payment === 'prepaid') {
        const acc = checkoutAccounts[checkoutState.prepaidMethod];
        if (!acc || !acc.number) {
            showToast('এই মেথডের জন্য অ্যাডমিন অ্যাকাউন্ট সেট করেননি। অন্য মেথড বাছুন।', 'warning');
            return;
        }
        checkoutState.txnId = (document.getElementById('txnIdInput')?.value || '').trim();
        if (!checkoutState.txnId) {
            showToast('ট্রানজেকশন আইডি (TrxID) দিন', 'warning');
            return;
        }
    }

    const btn = document.querySelector('.checkout-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Placing order...'; }

    const order = await placeOrder({
        items: AppState.cart,
        address: checkoutState.address,
        payment: checkoutState.payment,
        paymentMethod: checkoutState.payment === 'prepaid' ? checkoutState.prepaidMethod : null,
        txnId: checkoutState.payment === 'prepaid' ? checkoutState.txnId : null,
        coupon: AppState.appliedCoupon ? { coupon: AppState.appliedCoupon, discount: AppState.couponDiscount } : null,
        coinsUsed: totals.coins,
        coinDiscount: totals.coinDiscount
    });

    if (!order) {
        if (btn) { btn.disabled = false; btn.textContent = t('checkout.placeOrder'); }
        return;
    }

    // If prepaid, log a payment transaction for admin approval
    if (checkoutState.payment === 'prepaid') {
        logPaymentTransaction({
            orderId: order.id,
            uid: AppState.user.uid,
            userName: AppState.userData?.displayName || '',
            method: checkoutState.prepaidMethod,
            amount: totals.total,
            txnId: checkoutState.txnId
        });
    }

    clearCart();
    AppState.appliedCoupon = null;
    AppState.couponDiscount = 0;
    showOrderConfirmation(order);
    return order;
}

function showOrderConfirmation(order) {
    const host = document.getElementById('checkout-host');
    const isPrepaid = order.payment === 'prepaid';
    host.innerHTML = `
        <div class="order-confirm">
            <div class="check-icon">${isPrepaid ? '⏳' : '✓'}</div>
            <h2>${t('checkout.success')}</h2>
            <p>${isPrepaid
                ? 'আপনার অর্ডারটি <strong>Pending</strong> অবস্থায় আছে। অ্যাডমিন পেমেন্ট ভেরিফাই করে কনফার্ম করলে আপনাকে নোটিফিকেশন দেওয়া হবে।'
                : 'আপনার অর্ডারটি সফলভাবে প্লেস করা হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।'}</p>
            <div class="order-id-box">
                <div class="label">Order ID</div>
                <div class="id">${order.id}</div>
            </div>
            ${isPrepaid ? `<div class="order-prepaid-info">
                <strong>পেমেন্ট মেথড:</strong> ${order.paymentMethod}<br>
                <strong>TrxID:</strong> ${order.txnId}<br>
                <strong>পরিমাণ:</strong> ${formatTk(order.total)}<br>
                <strong>স্ট্যাটাস:</strong> <span class="badge badge-orange">Pending Approval</span>
            </div>` : ''}
            <div style="display:flex;gap:var(--sp-2);justify-content:center;flex-wrap:wrap;margin-top:var(--sp-4);">
                <a class="btn" href="${baseUrl('orders.html')}">${t('nav.orders')}</a>
                <a class="btn btn-outline" href="${baseUrl('index.html')}">${t('nav.home')}</a>
            </div>
        </div>
    `;
}
