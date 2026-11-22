/* ============================================================
   My Daraz — Compare Page
   ============================================================ */

async function initComparePage() {
    if (AppState.compare.length === 0) {
        // Try loading from LS (already done by store.js init), but ensure it's loaded
        AppState.compare = LS.get('compare', []);
    }
    renderComparePage();
    hideSplash();
}

function renderComparePage() {
    const host = document.getElementById('compare-host');
    if (!host) return;
    if (!AppState.compare.length) {
        host.innerHTML = `
            <div class="empty-state">
                <div class="icon">⚖</div>
                <h3>${t('compare.empty')}</h3>
                <p>তুলনা করতে পণ্যের উপর ⚖ আইকনে ক্লিক করুন (সর্বোচ্চ ৪টি)</p>
                <a class="btn" href="${baseUrl('index.html')}">${t('nav.home')}</a>
            </div>
        `;
        return;
    }
    const cols = AppState.compare.length;
    const specs = ['price', 'brand', 'category', 'rating', 'ratingCount'];
    const specLabels = {
        price: t('compare.price'),
        brand: t('compare.brand'),
        category: t('compare.category'),
        rating: t('compare.rating'),
        ratingCount: t('common.reviews')
    };

    let html = `<div class="compare-page"><div class="compare-table" style="--cols:${cols}">`;
    // Header row with product cards
    html += `<div class="compare-row header"><div class="compare-cell label-cell">Product</div>`;
    AppState.compare.forEach(p => {
        const cname = (AppState.language === 'en' && p.category_en) ? p.category_en : p.category;
        html += `
            <div class="compare-cell">
                <div class="product-mini">
                    <img src="${p.imageUrl}" alt="${p.name}">
                    <div class="name">${p.name}</div>
                    <div class="price">${formatTk(p.price)}</div>
                    <span class="remove-btn" onclick="removeFromCompare('${p.id}');renderComparePage()">✕ Remove</span>
                </div>
            </div>
        `;
    });
    html += `</div>`;

    // Spec rows
    specs.forEach(spec => {
        html += `<div class="compare-row"><div class="compare-cell label-cell">${specLabels[spec]}</div>`;
        AppState.compare.forEach(p => {
            let val = '';
            if (spec === 'price') val = formatTk(p.price);
            else if (spec === 'rating') val = `${bn(p.rating || 0)} ★`;
            else if (spec === 'ratingCount') val = bn(p.ratingCount || 0);
            else if (spec === 'category') {
                val = (AppState.language === 'en' && p.category_en) ? p.category_en : (p.category || '');
            } else val = p[spec] || '—';
            html += `<div class="compare-cell text-center">${val}</div>`;
        });
        html += `</div>`;
    });

    // Add to cart row
    html += `<div class="compare-row"><div class="compare-cell label-cell"></div>`;
    AppState.compare.forEach(p => {
        html += `<div class="compare-cell text-center"><button class="btn btn-sm" onclick="compareAddCart('${p.id}')">${t('common.addToCart')}</button></div>`;
    });
    html += `</div>`;

    html += `</div></div>`;
    host.innerHTML = html;
}

function compareAddCart(id) {
    const p = AppState.compare.find(x => x.id === id);
    if (p) addToCart(p);
}
