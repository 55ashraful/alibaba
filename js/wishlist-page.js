/* ============================================================
   My Daraz — Wishlist Page
   ============================================================ */

async function initWishlistPage() {
    await loadWishlist();
    renderWishlistPage();
    hideSplash();
}

function renderWishlistPage() {
    const host = document.getElementById('wishlist-host');
    if (!host) return;
    if (!AppState.wishlist.length) {
        host.innerHTML = `
            <div class="empty-state">
                <div class="icon">❤</div>
                <h3>${t('nav.wishlist')} ${t('common.empty')}</h3>
                <p>পছন্দের পণ্য সেভ করতে ❤ আইকনে ক্লিক করুন</p>
                <a class="btn" href="${baseUrl('index.html')}">${t('nav.home')}</a>
            </div>
        `;
        return;
    }
    host.innerHTML = `
        <div class="wishlist-page">
            <div class="wishlist-grid">
                ${AppState.wishlist.map(p => `
                    <div class="product-card">
                        ${p.discount ? `<div class="discount-badge">-${p.discount}%</div>` : ''}
                        <button class="wishlist-btn active" onclick="removeFromWishlist('${p.id}');renderWishlistPage()" title="Remove">❤</button>
                        <div class="product-img-wrap" onclick="location.href='${baseUrl('product.html?id=' + p.id)}'"><img src="${p.imageUrl}" alt="${p.name}"></div>
                        <div class="product-info">
                            <h3>${p.name}</h3>
                            <div class="price-row">
                                <span class="price">${formatTk(p.price)}</span>
                                ${p.oldPrice ? `<span class="old-price">${formatTk(p.oldPrice)}</span>` : ''}
                            </div>
                            <button class="add-cart-btn" onclick="wishAddCart('${p.id}')">${t('common.addToCart')}</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function wishAddCart(id) {
    const p = AppState.wishlist.find(x => x.id === id);
    if (p) addToCart(p);
}
