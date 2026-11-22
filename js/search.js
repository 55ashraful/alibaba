/* ============================================================
   My Daraz — Search Page
   ============================================================ */

let searchState = { q: '', sort: 'relevance', minPrice: 0, maxPrice: 0, brand: '', onlyDiscount: false };

async function initSearchPage() {
    searchState.q = getQueryParam('q') || '';
    const input = document.getElementById('searchPageInput');
    if (input) input.value = searchState.q;

    if (!AppState.allProducts.length) {
        AppState.allProducts = await fetchProducts();
        AppState.allCategories = await fetchCategories();
    }

    // Populate brand filter
    const brands = [...new Set(AppState.allProducts.map(p => p.brand).filter(Boolean))];
    const brandFilter = document.getElementById('brand-filter');
    if (brandFilter) {
        brandFilter.innerHTML = brands.map(b => `<label class="filter-option"><input type="radio" name="brand" value="${b}" onchange="applyFilter('${b}', 'brand')"> ${b}</label>`).join('');
    }

    // Populate category filter
    const catFilter = document.getElementById('category-filter');
    if (catFilter) {
        catFilter.innerHTML = AppState.allCategories.map(c => {
            const cname = (AppState.language === 'en' && c.name_en) ? c.name_en : c.name;
            return `<label class="filter-option"><input type="radio" name="cat" value="${c.name}" onchange="applyFilter('${c.name}', 'category')"> ${cname}</label>`;
        }).join('');
    }

    performSearch();
    hideSplash();
}

function applyFilter(value, type) {
    if (type === 'brand') searchState.brand = value;
    if (type === 'category') searchState.category = value;
    performSearch();
}

function applyPriceFilter() {
    searchState.minPrice = parseInt(document.getElementById('minPrice').value) || 0;
    searchState.maxPrice = parseInt(document.getElementById('maxPrice').value) || 0;
    performSearch();
}

function applySort(value) {
    searchState.sort = value;
    performSearch();
}

function toggleDiscountFilter(el) {
    searchState.onlyDiscount = el.checked;
    performSearch();
}

function performSearch() {
    let results = AppState.allProducts.slice();
    const q = (searchState.q || '').toLowerCase().trim();

    if (q) {
        results = results.filter(p =>
            (p.name || '').toLowerCase().includes(q) ||
            (p.brand || '').toLowerCase().includes(q) ||
            (p.category || '').toLowerCase().includes(q) ||
            (p.category_en || '').toLowerCase().includes(q) ||
            (p.description || '').toLowerCase().includes(q)
        );
    }
    if (searchState.brand) results = results.filter(p => p.brand === searchState.brand);
    if (searchState.category) results = results.filter(p => p.category === searchState.category || p.category_en === searchState.category);
    if (searchState.minPrice > 0) results = results.filter(p => p.price >= searchState.minPrice);
    if (searchState.maxPrice > 0) results = results.filter(p => p.price <= searchState.maxPrice);
    if (searchState.onlyDiscount) results = results.filter(p => p.discount && p.discount > 0);

    switch (searchState.sort) {
        case 'price-asc': results.sort((a, b) => a.price - b.price); break;
        case 'price-desc': results.sort((a, b) => b.price - a.price); break;
        case 'rating': results.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
        case 'popular': results.sort((a, b) => (b.sold || 0) - (a.sold || 0)); break;
        case 'newest': results.sort((a, b) => (b.id || '').localeCompare(a.id || '')); break;
    }

    const grid = document.getElementById('search-results');
    const countEl = document.getElementById('search-count');
    if (countEl) countEl.textContent = bn(results.length);
    if (!results.length) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><div class="icon">🔍</div><h3>${t('common.empty')}</h3><p>"${q}" এর জন্য কোনো পণ্য পাওয়া যায়নি</p></div>`;
        return;
    }
    grid.innerHTML = results.map(p => productCardHTML(p)).join('');
}

function submitSearchForm(e) {
    e.preventDefault();
    searchState.q = document.getElementById('searchPageInput').value;
    performSearch();
}
