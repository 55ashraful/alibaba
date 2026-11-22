/* ============================================================
   My Daraz — Cart Logic (local + Firestore sync)
   ============================================================ */

// Cart structure: [{ id, name, imageUrl, price, qty, variant, link }]
// Persisted to localStorage. Synced to Firestore 'carts/{uid}' when user is logged in.

function getCart() { return AppState.cart || []; }

function saveCart() {
    LS.set('cart', AppState.cart);
    if (AppState.user && db) {
        const uid = AppState.user.uid;
        if (uid.startsWith('demo-')) return; // demo: only local
        try {
            db.collection('carts').doc(uid).set({
                items: AppState.cart,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true }).catch(() => {});
        } catch (e) {}
    }
    Bus.emit('cartChanged');
}

async function loadCart() {
    // From local
    AppState.cart = LS.get('cart', []);
    // From Firestore if logged in
    if (AppState.user && db) {
        const uid = AppState.user.uid;
        if (!uid.startsWith('demo-')) {
            try {
                const doc = await db.collection('carts').doc(uid).get();
                if (doc.exists && doc.data().items) {
                    // Prefer server version if newer
                    AppState.cart = doc.data().items;
                    LS.set('cart', AppState.cart);
                }
            } catch (e) {}
        }
    }
    Bus.emit('cartChanged');
}

function addToCart(product, qty = 1, variant = null) {
    if (!product) return;
    const existing = AppState.cart.find(c => c.id === product.id && (!variant || c.variant === variant));
    if (existing) {
        existing.qty += qty;
    } else {
        AppState.cart.push({
            id: product.id,
            name: product.name,
            imageUrl: product.imageUrl,
            price: Number(product.price) || 0,
            oldPrice: Number(product.oldPrice) || 0,
            discount: product.discount || 0,
            link: product.link || '',
            qty,
            variant
        });
    }
    saveCart();
    showToast(t('cart.addedSuccess'), 'success');
}

function removeFromCart(idx) {
    AppState.cart.splice(idx, 1);
    saveCart();
}

function updateCartQty(idx, qty) {
    if (idx < 0 || idx >= AppState.cart.length) return;
    if (qty < 1) qty = 1;
    AppState.cart[idx].qty = qty;
    saveCart();
}

function clearCart() {
    AppState.cart = [];
    saveCart();
}

function getCartTotal() {
    return AppState.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

function getCartCount() {
    return AppState.cart.reduce((sum, item) => sum + (item.qty || 1), 0);
}

function applyCouponToCart(code) {
    const total = getCartTotal();
    const result = validateCoupon(code, total);
    if (result.valid) {
        AppState.appliedCoupon = result.coupon;
        AppState.couponDiscount = result.discount;
        showToast(`Coupon applied! You saved ${formatTk(result.discount)}`, 'success');
    } else {
        AppState.appliedCoupon = null;
        AppState.couponDiscount = 0;
        showToast(result.message, 'error');
    }
    Bus.emit('cartChanged');
    return result;
}

function getFinalTotal() {
    const sub = getCartTotal();
    const discount = AppState.couponDiscount || 0;
    const shipping = sub >= 500 ? 0 : 60; // Free shipping over ৳500
    return Math.max(0, sub - discount) + shipping;
}

// Sync local cart count to header badge when cart changes externally
Bus.on('cartChanged', () => {
    // already handled by ui.js updateBadges, but ensure local persistence
    LS.set('cart', AppState.cart);
});
