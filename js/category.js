/* ============================================================
   My Daraz — Category Page
   ============================================================ */

async function initCategoryPage() {
    const id = getQueryParam('id') || getQueryParam('name');
    const title = document.getElementById('category-page-title');
    const grid = document.getElementById('category-products-grid');
    if (!grid) return;

    if (!AppState.allProducts.length) {
        AppState.allProducts = await fetchProducts();
        AppState.allCategories = await fetchCategories();
    }

    // Find category
    const cat = AppState.allCategories.find(c => c.id === id || c.name === id || c.name_en === id);
    const catName = cat ? (AppState.language === 'en' && cat.name_en ? cat.name_en : cat.name) : (id || '');
    const filterName = cat ? cat.name : id;

    if (title) title.textContent = catName;
    document.title = `${catName} — My Daraz`;

    const filtered = AppState.allProducts.filter(p => p.category === filterName || p.category_en === filterName || (cat && (p.category === cat.name || p.category_en === cat.name_en)));

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="empty-state"><div class="icon">📦</div><h3>${t('common.empty')}</h3><p>এই ক্যাটাগরিতে এখন কোনো পণ্য নেই</p></div>`;
        hideSplash();
        return;
    }

    grid.innerHTML = filtered.map(p => productCardHTML(p)).join('');
    hideSplash();
}
