/* ============================================================
   My Daraz — Product Detail Page
   ============================================================ */

let currentProduct = null;

async function initProductPage() {
    const id = getQueryParam('id');
    if (!id) {
        document.getElementById('product-detail-host').innerHTML = `<div class="empty-state"><div class="icon">❓</div><h3>Product not found</h3><a class="btn" href="${baseUrl('index.html')}">Go Home</a></div>`;
        hideSplash();
        return;
    }
    if (!AppState.allProducts.length) {
        AppState.allProducts = await fetchProducts();
    }
    currentProduct = AppState.allProducts.find(p => p.id === id) || await fetchProductById(id);
    if (!currentProduct) {
        document.getElementById('product-detail-host').innerHTML = `<div class="empty-state"><div class="icon">❓</div><h3>Product not found</h3></div>`;
        hideSplash();
        return;
    }
    renderProductDetail(currentProduct);
    await loadReviews(currentProduct.id);
    await loadRelatedProducts(currentProduct);
    hideSplash();
}

function renderProductDetail(p) {
    document.title = `${p.name} — My Daraz`;
    const host = document.getElementById('product-detail-host');
    const images = p.images && p.images.length ? p.images : [p.imageUrl];
    const inWish = isInWishlist(p.id);
    const inCompare = isInCompare(p.id);
    const inStock = (p.sold || 0) < 99999;
    host.innerHTML = `
        <div class="product-detail">
            <div class="product-gallery">
                <div class="main-img"><img id="mainProductImg" src="${images[0]}" alt="${p.name}"></div>
                <div class="thumb-row">
                    ${images.map((img, i) => `<div class="thumb ${i === 0 ? 'active' : ''}" onclick="swapMainImg(this, '${img}')"><img src="${img}" alt=""></div>`).join('')}
                </div>
            </div>
            <div class="product-info-block">
                <h1>${p.name}</h1>
                <div class="product-meta">
                    <span class="meta-item"><span class="stars">${starsHTML(p.rating || 0)}</span> <span class="rating-num">${bn(p.rating || 0)}</span></span>
                    <span class="divider-line"></span>
                    <span class="meta-item">${bn(p.ratingCount || 0)} ${t('common.reviews')}</span>
                    <span class="divider-line"></span>
                    <span class="meta-item">${bn(p.sold || 0)} ${t('common.sold')}</span>
                </div>
                <div class="price-block">
                    <span class="price price-lg">${formatTk(p.price)}</span>
                    ${p.oldPrice ? `<span class="old-price">${formatTk(p.oldPrice)}</span>` : ''}
                    ${p.discount ? `<span class="discount-tag">-${p.discount}%</span>` : ''}
                    <div class="price-note">Price inclusive of all taxes</div>
                </div>
                ${p.specs ? renderVariantBlock() : ''}
                <div class="action-row">
                    <div class="qty-control">
                        <button onclick="changeProductQty(-1)">−</button>
                        <input type="number" id="productQtyInput" value="1" min="1" readonly>
                        <button onclick="changeProductQty(1)">+</button>
                    </div>
                    ${p.link && p.link.startsWith('http')
                        ? `<a class="btn btn-lg buy-now-btn" href="${p.link}" target="_blank">${t('common.buyNow')} ↗</a>`
                        : `<button class="btn btn-lg buy-now-btn" onclick="buyNow()">${t('common.buyNow')}</button>`
                    }
                    <button class="btn btn-outline btn-lg" onclick="addCurrentToCart()">${t('common.addToCart')}</button>
                    <button class="btn btn-ghost btn-lg ${inWish ? 'text-danger' : ''}" onclick="toggleCurrentWish()" title="Wishlist">${inWish ? '❤' : '♡'}</button>
                    <button class="btn btn-ghost btn-lg" onclick="toggleCurrentCompare()" title="Compare">⚖</button>
                </div>
                <div class="delivery-info">
                    <div class="delivery-row">
                        <div class="icon">🚚</div>
                        <div class="content">
                            <h5>Delivery</h5>
                            <p>Standard delivery 2-4 days inside Dhaka, 3-7 days outside. Free shipping over ৳500.</p>
                        </div>
                    </div>
                    <div class="delivery-row">
                        <div class="icon">💳</div>
                        <div class="content">
                            <h5>Payment</h5>
                            <p>Cash on Delivery, bKash, Nagad, Rocket, Card, Wallet</p>
                        </div>
                    </div>
                    <div class="delivery-row">
                        <div class="icon">↩</div>
                        <div class="content">
                            <h5>Return Policy</h5>
                            <p>7 days easy return if product is damaged or different from order.</p>
                        </div>
                    </div>
                    <div class="delivery-row">
                        <div class="icon">✅</div>
                        <div class="content">
                            <h5>Warranty</h5>
                            <p>${inStock ? 'Brand warranty applicable' : 'Out of stock'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="product-tabs">
            <div class="tabs">
                <div class="tab active" onclick="switchProductTab(event, 'desc')">${t('product.description')}</div>
                <div class="tab" onclick="switchProductTab(event, 'spec')">${t('product.specifications')}</div>
                <div class="tab" onclick="switchProductTab(event, 'reviews')">${t('product.reviews')}</div>
            </div>
            <div class="tab-content active" id="tab-desc">
                <p>${p.description || 'No description available.'}</p>
            </div>
            <div class="tab-content" id="tab-spec">
                ${p.specs ? `<table class="spec-table">${Object.entries(p.specs).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>` : '<p>No specifications available.</p>'}
            </div>
            <div class="tab-content" id="tab-reviews">
                <div id="reviews-container">Loading reviews...</div>
                <button class="btn btn-outline mt-4" onclick="openReviewModal()">${t('product.writeReview')}</button>
            </div>
        </div>
        <div class="section related-section">
            <div class="section-header"><h2>${t('product.relatedProducts')}</h2></div>
            <div class="products-grid" id="related-grid">Loading...</div>
        </div>
    `;
}

function renderVariantBlock() {
    return `
        <div class="variant-block">
            <span class="label">${t('common.qty')} / Variant</span>
            <div class="variant-options">
                <span class="variant-opt active" onclick="selectVariant(event)">Standard</span>
                <span class="variant-opt" onclick="selectVariant(event)">Combo Pack</span>
                <span class="variant-opt" onclick="selectVariant(event)">Gift Wrap</span>
            </div>
        </div>
    `;
}

function selectVariant(e) {
    document.querySelectorAll('.variant-opt').forEach(el => el.classList.remove('active'));
    e.target.classList.add('active');
}

function swapMainImg(thumb, url) {
    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    thumb.classList.add('active');
    document.getElementById('mainProductImg').src = url;
}

function changeProductQty(delta) {
    const input = document.getElementById('productQtyInput');
    if (!input) return;
    let v = Math.max(1, parseInt(input.value) + delta);
    input.value = v;
}

function addCurrentToCart() {
    if (!currentProduct) return;
    const qty = parseInt(document.getElementById('productQtyInput').value) || 1;
    addToCart(currentProduct, qty);
}

function buyNow() {
    if (!currentProduct) return;
    const qty = parseInt(document.getElementById('productQtyInput').value) || 1;
    addToCart(currentProduct, qty);
    setTimeout(() => { window.location.href = baseUrl('checkout.html'); }, 400);
}

function toggleCurrentWish() {
    if (!currentProduct) return;
    toggleWishlist(currentProduct);
    renderProductDetail(currentProduct);
}

function toggleCurrentCompare() {
    if (!currentProduct) return;
    toggleCompare(currentProduct);
    renderProductDetail(currentProduct);
}

function switchProductTab(e, tab) {
    document.querySelectorAll('.product-tabs .tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.product-tabs .tab-content').forEach(c => c.classList.remove('active'));
    e.target.classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
}

async function loadReviews(productId) {
    const container = document.getElementById('reviews-container');
    if (!container) return;
    const reviews = await fetchProductReviews(productId);
    if (!reviews.length) {
        container.innerHTML = `<p class="text-muted">এখনো কোনো রিভিউ নেই। আপনি প্রথম রিভিউ দিন!</p>`;
        return;
    }
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    const dist = [5, 4, 3, 2, 1].map(star => {
        const count = reviews.filter(r => r.rating === star).length;
        return { star, count, pct: Math.round(count / reviews.length * 100) };
    });
    container.innerHTML = `
        <div class="review-summary">
            <div class="rating-overview">
                <div class="big-num">${bn(avg.toFixed(1))}</div>
                <div class="stars">${starsHTML(avg)}</div>
                <div class="text-muted" style="font-size:var(--font-size-xs);">${bn(reviews.length)} ${t('common.reviews')}</div>
            </div>
            <div class="rating-bars">
                ${dist.map(d => `
                    <div class="rating-bar-row">
                        <span class="label">${bn(d.star)}★</span>
                        <div class="bar"><div class="bar-fill" style="width:${d.pct}%"></div></div>
                        <span>${bn(d.count)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        ${reviews.map(r => `
            <div class="review-card">
                <div class="review-header">
                    <img src="${r.userPhoto || DEFAULT_AVATAR}" alt="">
                    <span class="name">${r.userName}</span>
                    <span class="stars">${starsHTML(r.rating)}</span>
                    <span class="date">${formatDate(r.date)}</span>
                </div>
                <div class="review-body">${r.comment}</div>
            </div>
        `).join('')}
    `;
}

async function loadRelatedProducts(product) {
    const grid = document.getElementById('related-grid');
    if (!grid) return;
    const related = AppState.allProducts
        .filter(p => (p.category === product.category || p.category_en === product.category_en) && p.id !== product.id)
        .slice(0, 10);
    if (!related.length) {
        grid.parentElement.remove();
        return;
    }
    grid.innerHTML = related.map(p => productCardHTML(p)).join('');
}

function openReviewModal() {
    if (!AppState.user) {
        showToast('Please login to write a review', 'warning');
        setTimeout(() => { window.location.href = baseUrl('login.html?next=product.html?id=' + currentProduct.id); }, 800);
        return;
    }
    openModal('reviewModal');
}

let selectedReviewRating = 5;
function setReviewRating(n) {
    selectedReviewRating = n;
    document.querySelectorAll('.stars-input span').forEach((s, i) => {
        s.classList.toggle('active', i < n);
    });
}

async function submitReviewForm() {
    const comment = document.getElementById('reviewComment').value.trim();
    if (!comment) { showToast('Please write a comment', 'warning'); return; }
    await submitReview(currentProduct.id, selectedReviewRating, comment);
    closeModal('reviewModal');
    document.getElementById('reviewComment').value = '';
    await loadReviews(currentProduct.id);
}
