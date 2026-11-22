/* ============================================================
   My Daraz — Common init (runs on every page)
   ============================================================ */

// Async bootstrap — runs after DOM is parsed and all scripts loaded.
async function bootstrapPage() {
    // Restore local state (cart, wishlist, compare, notifications) before auth resolves
    AppState.cart = LS.get('cart', []);
    AppState.wishlist = LS.get('wishlist', []);
    AppState.compare = LS.get('compare', []);
    AppState.notifications = LS.get('notifications', []);

    // Init theme + language (already set early)
    document.documentElement.setAttribute('data-theme', AppState.theme);
    document.documentElement.lang = AppState.language === 'bn' ? 'bn' : 'en';

    // Wait for auth to resolve (Firebase listener OR demo fallback OR 4s timeout)
    await initAuth();

    // Render header, footer, side menu
    await initUI();
    await renderFooter();

    // Populate side menu categories lazily
    if (!AppState.allCategories.length) {
        fetchCategories().then(cats => {
            AppState.allCategories = cats;
            Bus.emit('categoriesLoaded');
        });
    }

    // Initialize chat widget
    initChatWidget();

    // Hide splash after 1.5s as a fallback (in case init stalls)
    setTimeout(hideSplash, 1500);
}

// Wire up auth state listener for re-render
Bus.on('authChanged', async () => {
    // After auth resolves, sync cart/wishlist from Firestore
    if (AppState.user) {
        await loadCart();
        await loadWishlist();
        await loadNotifications();
    }
});

// Run bootstrap
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapPage);
} else {
    bootstrapPage();
}

// Persist cart/wishlist/compare changes to LS explicitly
Bus.on('cartChanged', () => LS.set('cart', AppState.cart));
Bus.on('wishlistChanged', () => LS.set('wishlist', AppState.wishlist));
Bus.on('compareChanged', () => LS.set('compare', AppState.compare));
Bus.on('notificationsChanged', () => LS.set('notifications', AppState.notifications));
