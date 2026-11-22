/* ============================================================
   My Daraz — Coins Page (replaces Wallet)
   ------------------------------------------------------------
   Users can:
     - See their coin balance
     - See how they earned / spent coins (history)
     - Understand how to earn more (admin-controlled earn rate)
   Users CANNOT:
     - Add money themselves (no top-up — that was wallet)
     - Withdraw — coins are non-cash, only for product discount
   ============================================================ */

let coinsSettings = { enabled: true, coinValue: 1, earnPerTk: 100, maxRedeemPercent: 50, welcomeBonus: 50 };

async function initCoinsPage() {
    if (!AppState.user) {
        showToast('Please login', 'warning');
        setTimeout(() => { window.location.href = baseUrl('login.html?next=coins.html'); }, 600);
        return;
    }
    coinsSettings = await fetchCoinsSettings();
    if (!coinsSettings.enabled) {
        document.getElementById('coins-host').innerHTML = `
            <div class="empty-state">
                <div class="icon">🚫</div>
                <h3>কয়েন সিস্টেম বর্তমানে বন্ধ আছে</h3>
                <p>অ্যাডমিন কয়েন সিস্টেম চালু করলে এই পেজ সক্রিয় হবে।</p>
                <a class="btn" href="${baseUrl('index.html')}">${t('nav.home')}</a>
            </div>
        `;
        hideSplash();
        return;
    }
    renderCoinsPage();
    hideSplash();
}

function renderCoinsPage() {
    const host = document.getElementById('coins-host');
    if (!host) return;
    const balance = getUserCoins(AppState.user.uid);
    const coinValueTk = coinsToTk(1, coinsSettings);
    const txns = getCoinTransactions().filter(t => t.uid === AppState.user.uid);

    host.innerHTML = `
        <div class="wallet-card coins-card">
            <div class="wc-label">${t('coins.balance')}</div>
            <div class="wc-balance">🪙 ${bn(balance)}</div>
            <div style="font-size:var(--font-size-sm);opacity:0.9;margin-bottom:var(--sp-2);">
                1 কয়েন = ৳${bn(coinValueTk)} · চেকআউটে সর্বোচ্চ ${bn(coinsSettings.maxRedeemPercent)}% ছাড় পাবেন
            </div>
            <div class="wc-actions">
                <a class="wc-btn" href="${baseUrl('index.html')}">🛍 কেনাকাটা করুন</a>
            </div>
        </div>

        <div class="coins-how-to-earn">
            <h3>💡 কিভাবে কয়েন জমা করবেন?</h3>
            <ul>
                <li>📦 প্রতিটি অর্ডার থেকে ৳${bn(coinsSettings.earnPerTk)} প্রতি 1 কয়েন পাবেন</li>
                <li>🎁 নতুন রেজিস্ট্রেশনে ${bn(coinsSettings.welcomeBonus)} কয়েন ওয়েলকাম বোনাস</li>
                <li>🎉 অ্যাডমিন বিশেষ অফারে কয়েন উপহার দিতে পারে</li>
            </ul>
        </div>

        <div class="wallet-tabs">
            <h3 style="margin-bottom:var(--sp-3);">${t('coins.history')}</h3>
            ${txns.length ? txns.map(tx => `
                <div class="txn-row">
                    <div class="txn-icon ${tx.type}">${tx.type === 'in' ? '↓' : '↑'}</div>
                    <div class="txn-info">
                        <h5>${tx.reason || (tx.type === 'in' ? 'Coins earned' : 'Coins spent')}</h5>
                        <p>${formatDate(tx.date, true)}</p>
                    </div>
                    <div class="txn-amount ${tx.type}">${tx.type === 'in' ? '+' : '−'}${bn(tx.amount)} 🪙</div>
                </div>
            `).join('') : `<p class="text-muted text-center">${t('coins.empty')}</p>`}
        </div>
    `;
}
