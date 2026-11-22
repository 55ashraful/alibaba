/* ============================================================
   My Daraz — Coupons Page
   ============================================================ */

async function initCouponsPage() {
    const coupons = await fetchCoupons();
    const host = document.getElementById('coupons-host');
    if (!host) return;
    if (!coupons.length) {
        host.innerHTML = `<div class="empty-state"><div class="icon">🎟</div><h3>${t('common.empty')}</h3></div>`;
        hideSplash();
        return;
    }
    host.innerHTML = coupons.map(c => {
        const isPercent = c.type === 'percent';
        const amountStr = isPercent ? `${c.amount}%` : formatTk(c.amount);
        const typeStr = isPercent ? 'OFF' : 'DISCOUNT';
        const expired = c.validUntil && new Date(c.validUntil) < new Date();
        return `
            <div class="coupon-card ${expired ? 'expired' : ''}">
                <div class="coupon-amount">
                    <div class="amt">${amountStr}</div>
                    <div class="type">${typeStr}</div>
                </div>
                <div class="coupon-info">
                    <h5>${c.description || 'Discount coupon'}</h5>
                    <p>Min order: ${formatTk(c.minOrder || 0)}</p>
                    <p>Valid until: ${formatDate(c.validUntil)}</p>
                    <p>Code: <span class="code">${c.code}</span></p>
                </div>
                <button class="coupon-claim" ${expired ? 'disabled' : ''} onclick="copyCouponCode('${c.code}')">${expired ? 'Expired' : t('common.copy')}</button>
            </div>
        `;
    }).join('');
    hideSplash();
}

function copyCouponCode(code) {
    navigator.clipboard?.writeText(code);
    showToast(`${t('common.copied')} ${code}`, 'success');
}
