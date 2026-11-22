/* ============================================================
   My Daraz — Flash Sale Page
   ============================================================ */

async function initFlashSalePage() {
    if (!AppState.allProducts.length) {
        AppState.allProducts = await fetchProducts();
    }
    renderFlashSalePage();
    startFlashPageTimer();
    hideSplash();
}

function renderFlashSalePage() {
    const host = document.getElementById('flash-sale-host');
    if (!host) return;
    const flashProducts = AppState.allProducts.filter(p => p.discount && p.discount >= 15);
    if (!flashProducts.length) {
        host.innerHTML = `<div class="empty-state"><div class="icon">⚡</div><h3>কোনো flash sale নেই</h3></div>`;
        return;
    }
    // Group by discount tier
    const tiers = [
        { min: 50, title: 'Up to 50% OFF', icon: '🔥' },
        { min: 30, title: '30%+ Discount', icon: '⭐' },
        { min: 15, title: '15%+ Discount', icon: '✨' }
    ];
    let html = `
        <div class="flash-page-hero">
            <h1>⚡ ${t('flash.title')} ⚡</h1>
            <p>${t('flash.endsIn')}:</p>
            <div class="timer-row" id="flash-page-timer"></div>
        </div>
    `;
    tiers.forEach(tier => {
        const items = flashProducts.filter(p => p.discount >= tier.min);
        if (!items.length) return;
        html += `
            <div class="section">
                <div class="section-header">
                    <h2>${tier.icon} ${tier.title}</h2>
                    <span class="text-muted">${bn(items.length)} items</span>
                </div>
                <div class="products-grid">
                    ${items.map(p => productCardHTML(p)).join('')}
                </div>
            </div>
        `;
    });
    host.innerHTML = html;
}

function startFlashPageTimer() {
    const timerEl = document.getElementById('flash-page-timer');
    if (!timerEl) return;
    let endTime = Number(LS.get('flash_end_time', 0));
    if (!endTime || endTime < Date.now()) {
        endTime = Date.now() + 6 * 3600 * 1000;
        LS.set('flash_end_time', endTime);
    }
    function tick() {
        const remaining = Math.max(0, endTime - Date.now());
        const h = Math.floor(remaining / 3600000);
        const m = Math.floor((remaining % 3600000) / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        if (!document.getElementById('flash-page-timer')) return; // stop if page changed
        timerEl.innerHTML = `
            <span class="timer-box">${bn(String(h).padStart(2,'0'))}</span><span style="font-weight:700">:</span>
            <span class="timer-box">${bn(String(m).padStart(2,'0'))}</span><span style="font-weight:700">:</span>
            <span class="timer-box">${bn(String(s).padStart(2,'0'))}</span>
        `;
        if (remaining > 0) setTimeout(tick, 1000);
    }
    tick();
}
