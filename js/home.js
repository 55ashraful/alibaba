/* ============================================================
   My Daraz — Home Page Logic
   ============================================================ */

async function initHomePage() {
    const bannerWrapper = document.getElementById('banner-wrapper');
    const categoriesGrid = document.getElementById('categories-grid');
    const productSections = document.getElementById('product-sections-container');
    const flashSaleWrapper = document.getElementById('flash-sale-products');
    const quickIconsRow = document.getElementById('quick-icons');

    // Load site info
    const siteInfo = await fetchSiteInfo();
    document.querySelectorAll('[id$="SiteName"]').forEach(el => el.innerText = siteInfo.siteName || 'My Daraz');
    document.querySelectorAll('[id$="Logo"]').forEach(el => {
        if (siteInfo.siteLogoUrl) { el.src = siteInfo.siteLogoUrl; el.style.display = 'inline-block'; }
    });

    // Banner
    const banners = siteInfo.bannerUrl || [];
    if (bannerWrapper && banners.length) {
        bannerWrapper.innerHTML = banners.map(url => `<div class="swiper-slide"><img src="${url.trim()}" alt="Banner"></div>`).join('');
        // Initialize Swiper (loaded via CDN in HTML)
        if (typeof Swiper !== 'undefined') {
            new Swiper('#home-banner', { loop: true, autoplay: { delay: 3500 }, pagination: { el: '.swiper-pagination', clickable: true } });
        }
    }

    // Load categories + products
    const [categories, products] = await Promise.all([fetchCategories(), fetchProducts()]);
    AppState.allCategories = categories;
    AppState.allProducts = products;
    Bus.emit('categoriesLoaded');

    // Quick icons (top 8 categories)
    if (quickIconsRow) {
        quickIconsRow.innerHTML = categories.slice(0, 10).map(c => {
            const cname = (AppState.language === 'en' && c.name_en) ? c.name_en : c.name;
            return `<a class="quick-icon" href="${baseUrl('category.html?id=' + encodeURIComponent(c.id || c.name))}"><img src="${c.imageUrl}" alt="${cname}"><span>${cname}</span></a>`;
        }).join('');
    }

    // Categories grid
    if (categoriesGrid) {
        categoriesGrid.innerHTML = categories.map(c => {
            const cname = (AppState.language === 'en' && c.name_en) ? c.name_en : c.name;
            return `<div class="category-card" onclick="location.href='${baseUrl('category.html?id=' + encodeURIComponent(c.id || c.name))}'"><img src="${c.imageUrl}" alt="${cname}"><span>${cname}</span></div>`;
        }).join('');
    }

    // Flash sale row (products with discount >= 20%)
    if (flashSaleWrapper) {
        const flashProducts = products.filter(p => p.discount && p.discount >= 20).slice(0, 10);
        if (flashProducts.length) {
            flashSaleWrapper.innerHTML = flashProducts.map(p => productCardHTML(p)).join('');
            startFlashTimer();
        } else {
            document.getElementById('flash-sale-section')?.remove();
        }
    }

    // Product sections by category
    if (productSections) {
        let html = '';
        categories.forEach(cat => {
            const cname = (AppState.language === 'en' && cat.name_en) ? cat.name_en : cat.name;
            const catProducts = products.filter(p => p.category === cat.name || p.category === cat.name_en || p.category_en === cat.name_en);
            if (catProducts.length === 0) return;
            html += `
                <div class="section">
                    <div class="section-header">
                        <h2>${cname}</h2>
                        <a class="see-all" href="${baseUrl('category.html?id=' + encodeURIComponent(cat.id || cat.name))}">${t('common.seeAll')} ›</a>
                    </div>
                    <div class="products-grid">
                        ${catProducts.slice(0, 12).map(p => productCardHTML(p)).join('')}
                    </div>
                </div>
            `;
        });
        productSections.innerHTML = html || `<div class="empty-state"><div class="icon">📦</div><h3>কোনো পণ্য পাওয়া যায়নি</h3></div>`;
    }

    // Offer banner popup (admin-managed). Shows once per session, auto-dismiss after duration, X button.
    showOfferPopupIfNeeded();

    // Hide splash
    hideSplash();
}

/* ============================================================
   Offer popup — admin-controlled, shows on home page load.
   Behavior:
     - Only active offers are shown
     - Auto-dismisses after offer.durationMs (default 3 sec)
     - User can close with X button
     - Shows once per browser session (sessionStorage)
   ============================================================ */
function showOfferPopupIfNeeded() {
    const host = document.getElementById('offer-popup-host');
    if (!host) return;
    // Respect "shown this session" flag
    if (sessionStorage.getItem('md_offer_shown') === '1') return;

    fetchOfferBanners().then(offers => {
        const active = (offers || []).filter(o => o.active !== false);
        if (!active.length) return;
        // Show the first active offer
        const offer = active[0];
        sessionStorage.setItem('md_offer_shown', '1');
        const duration = offer.durationMs || 3000;
        host.innerHTML = `
            <div class="offer-popup-overlay" id="offerPopupOverlay">
                <div class="offer-popup" style="background:${offer.bgColor || '#f85606'};" onclick="event.stopPropagation()">
                    <span class="offer-popup-close" onclick="closeOfferPopup()">×</span>
                    <div class="offer-popup-body">
                        ${offer.imageUrl ? `<img src="${offer.imageUrl}" alt="" class="offer-popup-img">` : ''}
                        <div class="offer-popup-text">
                            <h3>${offer.title || ''}</h3>
                            <p>${offer.body || ''}</p>
                            ${offer.link ? `<a class="btn offer-popup-btn" href="${baseUrl(offer.link)}" onclick="closeOfferPopup()">দেখুন</a>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        const overlay = document.getElementById('offerPopupOverlay');
        if (overlay) {
            overlay.classList.add('show');
            // Auto-dismiss after duration
            window._offerPopupTimer = setTimeout(closeOfferPopup, duration);
        }
    });
}

function closeOfferPopup() {
    const host = document.getElementById('offer-popup-host');
    if (!host) return;
    const overlay = document.getElementById('offerPopupOverlay');
    if (overlay) overlay.classList.remove('show');
    if (window._offerPopupTimer) { clearTimeout(window._offerPopupTimer); window._offerPopupTimer = null; }
    setTimeout(() => { if (host) host.innerHTML = ''; }, 300);
}

function productCardHTML(p) {
    const hasExternalLink = p.link && p.link.startsWith('http');
    const inWish = isInWishlist(p.id);
    const inCompare = isInCompare(p.id);
    const rating = p.rating || 0;
    const ratingCount = p.ratingCount || 0;
    const sold = p.sold || 0;
    const cardHTML = `
        <div class="product-card" onclick="goToProduct('${p.id}')">
            ${p.discount ? `<div class="discount-badge">-${p.discount}%</div>` : ''}
            <button class="wishlist-btn ${inWish ? 'active' : ''}" onclick="event.stopPropagation(); quickToggleWish('${p.id}')" title="Wishlist">${inWish ? '❤' : '♡'}</button>
            <div class="product-img-wrap"><img src="${p.imageUrl}" alt="${p.name}" loading="lazy"></div>
            <div class="product-info">
                <h3>${p.name}</h3>
                <div class="price-row">
                    <span class="price">${formatTk(p.price)}</span>
                    ${p.oldPrice ? `<span class="old-price">${formatTk(p.oldPrice)}</span>` : ''}
                </div>
                <div class="product-rating">
                    <span class="stars">${starsHTML(rating)}</span>
                    <span class="rating-num">(${bn(ratingCount)})</span>
                    <span class="sold-info" style="margin-left:auto;">${bn(sold)} ${t('common.sold')}</span>
                </div>
                ${hasExternalLink
                    ? `<a class="add-cart-btn" href="${p.link}" target="_blank" onclick="event.stopPropagation()">${t('common.orderNow')} ↗</a>`
                    : `<button class="add-cart-btn" onclick="event.stopPropagation(); quickAddCart('${p.id}')">${t('common.addToCart')}</button>`
                }
            </div>
        </div>
    `;
    return cardHTML;
}

function starsHTML(rating) {
    const r = Math.round(rating);
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += i <= r ? '★' : '<span class="empty">★</span>';
    }
    return html;
}

function goToProduct(id) {
    window.location.href = baseUrl('product.html?id=' + encodeURIComponent(id));
}

// Quick action helpers that resolve a product from AppState
function quickAddCart(id) {
    const p = AppState.allProducts.find(x => x.id === id);
    if (p) addToCart(p);
}
function quickToggleWish(id) {
    const p = AppState.allProducts.find(x => x.id === id);
    if (p) toggleWishlist(p);
}

// Flash sale countdown timer
function startFlashTimer() {
    const timerEl = document.getElementById('flash-timer');
    if (!timerEl) return;
    // Set end time to next midnight
    let endTime = Number(LS.get('flash_end_time', 0));
    if (!endTime || endTime < Date.now()) {
        endTime = Date.now() + 6 * 3600 * 1000; // 6 hours from now
        LS.set('flash_end_time', endTime);
    }
    function tick() {
        const remaining = Math.max(0, endTime - Date.now());
        const h = Math.floor(remaining / 3600000);
        const m = Math.floor((remaining % 3600000) / 60000);
        const s = Math.floor((remaining % 60000) / 1000);
        timerEl.innerHTML = `
            <span class="timer-box">${bn(String(h).padStart(2,'0'))}</span>
            <span class="timer-sep">:</span>
            <span class="timer-box">${bn(String(m).padStart(2,'0'))}</span>
            <span class="timer-sep">:</span>
            <span class="timer-box">${bn(String(s).padStart(2,'0'))}</span>
        `;
        if (remaining > 0) setTimeout(tick, 1000);
    }
    tick();
}

// Free product (preserved from original)
async function loadFreeProductSection() {
    const data = await fetchFreeProduct();
    const titleEl = document.getElementById('free-title');
    const imgEl = document.getElementById('free-image');
    const claimedEl = document.getElementById('free-claimed-text');
    const oldEl = document.getElementById('free-old-price');
    const cutEl = document.getElementById('free-cut');
    const remEl = document.getElementById('free-remaining');
    const pctEl = document.getElementById('free-percent');
    const fillEl = document.getElementById('free-progress-fill');
    const btnEl = document.getElementById('free-btn');
    if (titleEl) titleEl.innerText = data.title || 'MY FREEBIE';
    if (imgEl) imgEl.src = data.imageUrl || '';
    if (claimedEl) claimedEl.innerHTML = `<span>${data.claimedText || '0'}</span> People claimed it for FREE`;
    if (oldEl) oldEl.innerText = formatTk(data.originalPrice || 0);
    if (cutEl) cutEl.innerText = data.amountCut || '0';
    if (remEl) remEl.innerText = formatTk(data.amountRemaining || 0);
    if (pctEl) pctEl.innerText = (data.progressPercentage || 0) + '% সম্পন্ন';
    if (fillEl) fillEl.style.width = (data.progressPercentage || 0) + '%';
    if (btnEl) btnEl.innerText = data.btnText || 'SHARE NOW';
}
function handleFreeBtn() { window.open(freeProductLink, '_blank'); }
