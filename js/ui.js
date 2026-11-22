/* ============================================================
   My Daraz — UI Components (Header, Footer, Side Menu, Toast, Modal)
   Injected dynamically on every page so we don't repeat markup.
   ============================================================ */

// Toast notifications
function showToast(message, type = 'info', duration = 2800) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    const icon = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' }[type] || 'ℹ';
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 250);
    }, duration);
}

// Modal helpers
function openModal(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.add('active'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.remove('active'); document.body.style.overflow = ''; }
}
// Close on overlay click
document.addEventListener('click', e => {
    if (e.target.classList && e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Build header HTML — injected on every page
function renderHeader() {
    const headerHost = document.getElementById('app-header');
    if (!headerHost) return;
    const langLabel = AppState.language === 'bn' ? 'EN' : 'বাংলা';
    headerHost.innerHTML = `
        <div class="topbar">
            <div class="container">
                <div class="topbar-left">
                    <a href="${baseUrl('about.html')}">${t('nav.about')}</a>
                    <a href="${baseUrl('contact.html')}">${t('nav.contact')}</a>
                    <a href="${baseUrl('faq.html')}">${t('nav.faq')}</a>
                </div>
                <div class="topbar-right">
                    <a href="${baseUrl('orders.html')}">${t('nav.orders')}</a>
                    <a href="${baseUrl('coins.html')}">${t('nav.coins')}</a>
                    <a href="${baseUrl('coupons.html')}">${t('nav.coupons')}</a>
                </div>
            </div>
        </div>
        <header class="app-header">
            <span class="header-menu-btn" onclick="toggleSideMenu(true)" aria-label="Menu">☰</span>
            <a href="${baseUrl('index.html')}" class="header-logo-link">
                <span class="logo-text" id="headerSiteName">My Daraz</span>
                <img id="headerLogo" class="header-logo" alt="">
            </a>
            <form class="header-search" onsubmit="handleHeaderSearch(event)">
                <input type="text" id="headerSearchInput" placeholder="${t('common.search')}">
                <button type="submit">🔍</button>
            </form>
            <div class="header-actions">
                <a href="${baseUrl('notifications.html')}" class="header-action" title="${t('nav.notifications')}">
                    <span class="icon">🔔</span>
                    <span class="label">${t('nav.notifications')}</span>
                    <span class="badge-count hidden" id="notifBadge">0</span>
                </a>
                <a href="${baseUrl('compare.html')}" class="header-action" title="${t('nav.compare')}">
                    <span class="icon">⚖</span>
                    <span class="label">${t('nav.compare')}</span>
                    <span class="badge-count hidden" id="compareBadge">0</span>
                </a>
                <a href="${baseUrl('wishlist.html')}" class="header-action" title="${t('nav.wishlist')}">
                    <span class="icon">❤</span>
                    <span class="label">${t('nav.wishlist')}</span>
                    <span class="badge-count hidden" id="wishlistBadge">0</span>
                </a>
                <a href="${baseUrl('cart.html')}" class="header-action" title="${t('nav.cart')}">
                    <span class="icon">🛒</span>
                    <span class="label">${t('nav.cart')}</span>
                    <span class="badge-count hidden" id="cartBadge">0</span>
                </a>
                <div id="headerUserSlot"></div>
            </div>
        </header>
        <div class="mobile-search-row">
            <form class="search-form" onsubmit="handleHeaderSearch(event)" style="flex:1">
                <input type="text" id="mobileSearchInput" placeholder="${t('common.search')}">
                <button type="submit">🔍</button>
            </form>
        </div>
    `;
}

function renderHeaderUser() {
    const slot = document.getElementById('headerUserSlot');
    if (!slot) return;
    if (AppState.user) {
        const photo = (AppState.userData && AppState.userData.photoURL) || AppState.user.photoURL || DEFAULT_AVATAR;
        slot.innerHTML = `<img class="header-user-avatar" src="${photo}" alt="Profile" onclick="location.href='${baseUrl('profile.html')}'">`;
    } else {
        slot.innerHTML = `<div class="header-user-login" onclick="location.href='${baseUrl('login.html')}'" title="${t('nav.login')}">👤</div>`;
    }
}

// Build side menu — injected dynamically
function renderSideMenu() {
    const host = document.getElementById('side-menu-host');
    if (!host) return;
    const user = AppState.user;
    const data = AppState.userData || {};
    const displayName = user ? (data.displayName || user.displayName || 'User') : null;
    const email = user ? (data.email || user.email || '') : '';
    const photo = user ? (data.photoURL || user.photoURL || DEFAULT_AVATAR) : DEFAULT_AVATAR;
    host.innerHTML = `
        <div class="side-menu" id="sideMenu">
            <div class="side-menu-header">
                <span class="side-menu-close" onclick="toggleSideMenu(false)">×</span>
                <div class="user-row ${user ? '' : 'guest'}" onclick="${user ? '' : `location.href='${baseUrl('login.html')}'`}">
                    <img src="${photo}" alt="avatar">
                    <div>
                        <div class="user-name">${displayName || 'Guest — Login'}</div>
                        ${user ? `<div class="user-email">${email}</div>` : ''}
                    </div>
                </div>
            </div>
            <div class="side-menu-section">
                <h4>Account</h4>
                <a class="side-menu-link" href="${baseUrl('index.html')}"><span class="icon">🏠</span>${t('nav.home')}<span class="chevron">›</span></a>
                ${user ? `
                    <a class="side-menu-link" href="${baseUrl('orders.html')}"><span class="icon">📦</span>${t('nav.orders')}<span class="chevron">›</span></a>
                    <a class="side-menu-link" href="${baseUrl('wishlist.html')}"><span class="icon">❤</span>${t('nav.wishlist')}<span class="chevron">›</span></a>
                    <a class="side-menu-link" href="${baseUrl('coins.html')}"><span class="icon">🪙</span>${t('nav.coins')}<span class="chevron">›</span></a>
                    <a class="side-menu-link" href="${baseUrl('coupons.html')}"><span class="icon">🎟</span>${t('nav.coupons')}<span class="chevron">›</span></a>
                    <a class="side-menu-link" href="${baseUrl('profile.html')}"><span class="icon">👤</span>${t('nav.profile')}<span class="chevron">›</span></a>
                ` : `
                    <a class="side-menu-link" href="${baseUrl('login.html')}"><span class="icon">🔑</span>${t('nav.login')}<span class="chevron">›</span></a>
                    <a class="side-menu-link" href="${baseUrl('register.html')}"><span class="icon">📝</span>${t('nav.register')}<span class="chevron">›</span></a>
                `}
            </div>
            <div class="side-menu-section">
                <h4>Shop</h4>
                <a class="side-menu-link" href="${baseUrl('flash-sale.html')}"><span class="icon">⚡</span>${t('nav.flashSale')}<span class="chevron">›</span></a>
                <a class="side-menu-link" href="${baseUrl('compare.html')}"><span class="icon">⚖</span>${t('nav.compare')}<span class="chevron">›</span></a>
                <a class="side-menu-link" href="${baseUrl('notifications.html')}"><span class="icon">🔔</span>${t('nav.notifications')}<span class="chevron">›</span></a>
                ${isUserAdmin() ? `<a class="side-menu-link" href="${baseUrl('admin.html')}"><span class="icon">🛠</span>${t('nav.admin')}<span class="chevron">›</span></a>` : ''}
            </div>
            <div class="side-menu-divider"></div>
            <div class="side-menu-section">
                <h4>Categories</h4>
                <div id="sideMenuCategories"></div>
            </div>
            <div class="side-menu-divider"></div>
            <div class="side-menu-section">
                <h4>Settings</h4>
                <div class="side-menu-toggles">
                    <div class="toggle-row">
                        <span>🌙</span>
                        <span>Dark</span>
                        <label class="switch">
                            <input type="checkbox" class="theme-toggle-input" ${AppState.theme === 'dark' ? 'checked' : ''} onchange="toggleTheme()">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="toggle-row">
                        <span>🌐</span>
                        <button class="btn btn-sm btn-outline" onclick="toggleLanguage()">${AppState.language === 'bn' ? 'English' : 'বাংলা'}</button>
                    </div>
                </div>
                ${user ? `<a class="side-menu-link" href="javascript:void(0)" onclick="logoutUser()"><span class="icon">🚪</span>${t('nav.logout')}</a>` : ''}
            </div>
            <div class="side-menu-divider"></div>
            <div class="side-menu-section">
                <h4>Help</h4>
                <a class="side-menu-link" href="${baseUrl('about.html')}"><span class="icon">ℹ</span>${t('nav.about')}<span class="chevron">›</span></a>
                <a class="side-menu-link" href="${baseUrl('contact.html')}"><span class="icon">📞</span>${t('nav.contact')}<span class="chevron">›</span></a>
                <a class="side-menu-link" href="${baseUrl('faq.html')}"><span class="icon">❓</span>${t('nav.faq')}<span class="chevron">›</span></a>
                <a class="side-menu-link" href="${baseUrl('privacy.html')}"><span class="icon">🔒</span>${t('nav.privacy')}<span class="chevron">›</span></a>
                <a class="side-menu-link" href="${baseUrl('terms.html')}"><span class="icon">📋</span>${t('nav.terms')}<span class="chevron">›</span></a>
            </div>
        </div>
        <div class="side-menu-overlay" id="sideMenuOverlay" onclick="toggleSideMenu(false)"></div>
    `;
    // Populate dynamic categories once available
    if (AppState.allCategories && AppState.allCategories.length) {
        const catHost = document.getElementById('sideMenuCategories');
        if (catHost) {
            catHost.innerHTML = AppState.allCategories.map(c => {
                const cname = (AppState.language === 'en' && c.name_en) ? c.name_en : c.name;
                return `<a class="side-menu-link" href="${baseUrl('category.html?id=' + encodeURIComponent(c.id))}"><span class="icon">▸</span>${cname}<span class="chevron">›</span></a>`;
            }).join('');
        }
    }
}

function toggleSideMenu(open) {
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('sideMenuOverlay');
    if (!menu || !overlay) return;
    if (open) {
        menu.classList.add('open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        menu.classList.remove('open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Footer
async function renderFooter() {
    const host = document.getElementById('app-footer');
    if (!host) return;
    const info = await fetchSiteInfo();
    const contact = await fetchContactInfo();
    const year = new Date().getFullYear();
    host.style.background = info.footerColor || '#1c5520';
    host.innerHTML = `
        <div class="footer-top">
            <div class="footer-col">
                <h4>${t('footer.customerService')}</h4>
                <a href="${baseUrl('faq.html')}">${t('nav.faq')}</a>
                <a href="${baseUrl('contact.html')}">${t('nav.contact')}</a>
                <a href="${baseUrl('orders.html')}">${t('nav.orders')}</a>
                <a href="${baseUrl('terms.html')}">${t('nav.terms')}</a>
                <a href="${baseUrl('privacy.html')}">${t('nav.privacy')}</a>
            </div>
            <div class="footer-col">
                <h4>${t('footer.about')}</h4>
                <a href="${baseUrl('about.html')}">${t('nav.about')}</a>
                <a href="${baseUrl('flash-sale.html')}">${t('nav.flashSale')}</a>
                <a href="${baseUrl('coupons.html')}">${t('nav.coupons')}</a>
                <a href="${baseUrl('coins.html')}">${t('nav.coins')}</a>
            </div>
            <div class="footer-col">
                <h4>${t('footer.payment')}</h4>
                <div class="footer-payment-row" style="border:none;margin:0;padding:0;justify-content:flex-start;">
                    <span class="pay-chip">bKash</span>
                    <span class="pay-chip">Nagad</span>
                    <span class="pay-chip">Rocket</span>
                    <span class="pay-chip">Visa</span>
                    <span class="pay-chip">Mastercard</span>
                    <span class="pay-chip">COD</span>
                </div>
            </div>
            <div class="footer-col">
                <h4>${t('footer.followUs')}</h4>
                <div class="footer-socials">
                    ${contact.facebook ? `<a href="${contact.facebook}" target="_blank" title="Facebook">f</a>` : ''}
                    ${contact.youtube ? `<a href="${contact.youtube}" target="_blank" title="YouTube">▶</a>` : ''}
                    ${contact.tiktok ? `<a href="${contact.tiktok}" target="_blank" title="TikTok">♪</a>` : ''}
                    ${contact.telegram ? `<a href="${contact.telegram}" target="_blank" title="Telegram">✈</a>` : ''}
                    ${contact.whatsapp ? `<a href="${contact.whatsapp}" target="_blank" title="WhatsApp">✆</a>` : ''}
                </div>
                <div style="margin-top:var(--sp-3);font-size:var(--font-size-xs);">
                    <div class="footer-contact-item"><span class="icon">📞</span><span>${contact.phone || ''}</span></div>
                    <div class="footer-contact-item"><span class="icon">✉</span><span>${contact.email || ''}</span></div>
                    <div class="footer-contact-item"><span class="icon">📍</span><span>${contact.address || ''}</span></div>
                </div>
            </div>
            <div class="footer-col">
                <h4>${t('footer.download')}</h4>
                <div class="footer-app-badges">
                    <a href="#" onclick="return false"><img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" style="background:#000;border-radius:4px;padding:2px 6px;height:36px;width:auto;max-width:160px;"></a>
                    <a href="#" onclick="return false"><img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" style="height:36px;width:auto;max-width:160px;"></a>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            ${t('footer.rights').replace('2026', String(year))}
        </div>
    `;
}

// Search submit handler
function handleHeaderSearch(e) {
    e.preventDefault();
    const q = (document.getElementById('headerSearchInput') || document.getElementById('mobileSearchInput') || {}).value || '';
    if (q.trim()) {
        window.location.href = baseUrl('search.html?q=' + encodeURIComponent(q.trim()));
    }
}

// Update cart/wishlist/compare/notif badge counts
function updateBadges() {
    const setBadge = (id, count) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (count > 0) {
            el.textContent = count > 99 ? '99+' : count;
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    };
    setBadge('cartBadge', AppState.cart.reduce((a, b) => a + (b.qty || 1), 0));
    setBadge('wishlistBadge', AppState.wishlist.length);
    setBadge('compareBadge', AppState.compare.length);
    const unread = AppState.notifications.filter(n => !n.read).length;
    setBadge('notifBadge', unread);
}

// Initialize the UI shell on every page
async function initUI() {
    renderHeader();
    renderHeaderUser();
    renderSideMenu();
    applyI18n();
    updateBadges();
    // Apply theme already done at top of file, but re-sync switch state
    applyTheme(AppState.theme);
}

// Wire up listeners
Bus.on('authChanged', () => {
    renderHeaderUser();
    renderSideMenu();
    updateBadges();
});
Bus.on('cartChanged', updateBadges);
Bus.on('wishlistChanged', updateBadges);
Bus.on('compareChanged', updateBadges);
Bus.on('notificationsChanged', updateBadges);
Bus.on('languageChanged', () => {
    renderHeader();
    renderHeaderUser();
    renderSideMenu();
    applyI18n();
});
Bus.on('categoriesLoaded', () => {
    renderSideMenu();
});

// Hide splash
function hideSplash() {
    const splash = document.getElementById('splash-screen');
    if (splash) {
        splash.classList.add('hidden');
        setTimeout(() => splash.remove(), 500);
    }
}
